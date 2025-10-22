/**
 * ILOS Authentication Controller
 * ==============================
 * Handles all authentication operations for banking system
 */

const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const User = require('../../models/auth/User');
const JwtService = require('../../services/auth/JwtService');
const securityConfig = require('../../config/security');
const { logSecurityEvent } = require('../../middleware/auth');

class AuthController {
    /**
     * User login
     */
    static async login(req, res) {
        try {
            const { email, password, mfaToken, rememberMe = false } = req.body;

            // Input validation
            if (!email || !password) {
                return res.status(400).json({
                    error: 'MISSING_CREDENTIALS',
                    message: 'Email and password are required'
                });
            }

            // Find user
            const user = await User.findByEmail(email);
            if (!user) {
                await logSecurityEvent(req, 'LOGIN_FAILED', {
                    reason: 'USER_NOT_FOUND',
                    email: email,
                    riskScore: 3
                });

                return res.status(401).json({
                    error: 'INVALID_CREDENTIALS',
                    message: 'Invalid email or password'
                });
            }

            // Check if account is locked
            if (user.isLocked()) {
                await logSecurityEvent(req, 'LOGIN_BLOCKED', {
                    reason: 'ACCOUNT_LOCKED',
                    userId: user.id,
                    email: email,
                    riskScore: 7
                });

                return res.status(423).json({
                    error: 'ACCOUNT_LOCKED',
                    message: 'Account is temporarily locked due to multiple failed login attempts',
                    lockedUntil: user.locked_until
                });
            }

            // Check if account is active
            if (!user.is_active) {
                await logSecurityEvent(req, 'LOGIN_BLOCKED', {
                    reason: 'ACCOUNT_INACTIVE',
                    userId: user.id,
                    email: email,
                    riskScore: 5
                });

                return res.status(401).json({
                    error: 'ACCOUNT_INACTIVE',
                    message: 'Account is inactive. Please contact administrator.'
                });
            }

            // Verify password
            const passwordValid = await user.verifyPassword(password);
            if (!passwordValid) {
                // Record failed login attempt
                await user.recordFailedLogin();
                
                await logSecurityEvent(req, 'LOGIN_FAILED', {
                    reason: 'INVALID_PASSWORD',
                    userId: user.id,
                    email: email,
                    riskScore: 4
                });

                return res.status(401).json({
                    error: 'INVALID_CREDENTIALS',
                    message: 'Invalid email or password'
                });
            }

            // Check MFA if enabled
            if (user.mfa_enabled) {
                if (!mfaToken) {
                    return res.status(200).json({
                        mfaRequired: true,
                        message: 'MFA token required',
                        tempToken: await JwtService.generateTempToken(user.id)
                    });
                }

                const mfaValid = user.verifyMFA(mfaToken);
                if (!mfaValid) {
                    await logSecurityEvent(req, 'MFA_FAILED', {
                        userId: user.id,
                        email: email,
                        riskScore: 6
                    });

                    return res.status(401).json({
                        error: 'INVALID_MFA_TOKEN',
                        message: 'Invalid MFA token'
                    });
                }
            }

            // Generate session data
            const sessionData = {
                ip_address: req.ip || req.connection?.remoteAddress,
                user_agent: req.headers['user-agent'],
                device_info: {
                    platform: req.headers['x-platform'] || 'web',
                    version: req.headers['x-app-version'] || '1.0.0'
                },
                login_method: user.mfa_enabled ? 'mfa' : 'password',
                risk_score: AuthController.calculateLoginRiskScore(req, user),
                location_data: {
                    country: req.headers['cf-ipcountry'] || null,
                    timezone: req.headers['x-timezone'] || null
                }
            };

            // Generate JWT tokens
            const tokens = await JwtService.generateTokenPair(user, sessionData);

            // Update user login success
            await user.recordSuccessfulLogin();

            // Log successful login
            await logSecurityEvent(req, 'LOGIN_SUCCESS', {
                userId: user.id,
                email: email,
                sessionId: tokens.sessionId,
                loginMethod: sessionData.login_method,
                riskScore: sessionData.risk_score
            });

            // Return success response
            res.json({
                success: true,
                message: 'Login successful',
                user: user.toSafeObject(),
                tokens: {
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                    expiresIn: tokens.expiresIn,
                    tokenType: tokens.tokenType
                },
                session: {
                    sessionId: tokens.sessionId,
                    expiresAt: new Date(Date.now() + (tokens.expiresIn * 1000)).toISOString()
                }
            });

        } catch (error) {
            console.error('Login error:', error);
            
            await logSecurityEvent(req, 'LOGIN_ERROR', {
                error: error.message,
                email: req.body?.email,
                riskScore: 8
            });

            res.status(500).json({
                error: 'LOGIN_ERROR',
                message: 'Internal server error during login'
            });
        }
    }

    /**
     * User logout
     */
    static async logout(req, res) {
        try {
            const { sessionId } = req;

            if (sessionId) {
                // Revoke the session
                await JwtService.revokeSession(sessionId);
            }

            await logSecurityEvent(req, 'LOGOUT_SUCCESS', {
                userId: req.user?.id,
                sessionId: sessionId
            });

            res.json({
                success: true,
                message: 'Logout successful'
            });

        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({
                error: 'LOGOUT_ERROR',
                message: 'Error during logout'
            });
        }
    }

    /**
     * Logout from all devices
     */
    static async logoutAll(req, res) {
        try {
            const userId = req.user.id;

            // Revoke all user sessions
            await JwtService.revokeAllUserSessions(userId);

            await logSecurityEvent(req, 'LOGOUT_ALL_SUCCESS', {
                userId: userId
            });

            res.json({
                success: true,
                message: 'Logged out from all devices successfully'
            });

        } catch (error) {
            console.error('Logout all error:', error);
            res.status(500).json({
                error: 'LOGOUT_ALL_ERROR',
                message: 'Error during logout from all devices'
            });
        }
    }

    /**
     * Refresh access token
     */
    static async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(400).json({
                    error: 'MISSING_REFRESH_TOKEN',
                    message: 'Refresh token is required'
                });
            }

            const sessionData = {
                ip_address: req.ip || req.connection?.remoteAddress,
                user_agent: req.headers['user-agent']
            };

            const newTokens = await JwtService.refreshAccessToken(refreshToken, sessionData);

            res.json({
                success: true,
                tokens: newTokens
            });

        } catch (error) {
            console.error('Token refresh error:', error);

            let errorCode = 'TOKEN_REFRESH_ERROR';
            let message = 'Error refreshing token';

            if (error.message === 'TOKEN_EXPIRED') {
                errorCode = 'REFRESH_TOKEN_EXPIRED';
                message = 'Refresh token has expired. Please login again.';
            } else if (error.message === 'INVALID_SESSION') {
                errorCode = 'INVALID_SESSION';
                message = 'Session is invalid. Please login again.';
            }

            await logSecurityEvent(req, 'TOKEN_REFRESH_FAILED', {
                error: error.message,
                riskScore: 5
            });

            res.status(401).json({
                error: errorCode,
                message: message
            });
        }
    }

    /**
     * Setup MFA for user
     */
    static async setupMFA(req, res) {
        try {
            const user = req.user;

            if (user.mfa_enabled) {
                return res.status(400).json({
                    error: 'MFA_ALREADY_ENABLED',
                    message: 'MFA is already enabled for this account'
                });
            }

            const mfaSetup = await user.setupMFA();
            const qrCodeUrl = await QRCode.toDataURL(mfaSetup.qrCode);

            await logSecurityEvent(req, 'MFA_SETUP_INITIATED', {
                userId: user.id
            });

            res.json({
                success: true,
                message: 'MFA setup initiated. Please scan the QR code with your authenticator app.',
                mfaSetup: {
                    secret: mfaSetup.secret,
                    qrCode: qrCodeUrl,
                    manualEntryKey: mfaSetup.secret,
                    issuer: securityConfig.mfa.issuer,
                    accountName: user.email
                }
            });

        } catch (error) {
            console.error('MFA setup error:', error);
            res.status(500).json({
                error: 'MFA_SETUP_ERROR',
                message: 'Error setting up MFA'
            });
        }
    }

    /**
     * Enable MFA after verification
     */
    static async enableMFA(req, res) {
        try {
            const { mfaToken } = req.body;
            const user = req.user;

            if (!mfaToken) {
                return res.status(400).json({
                    error: 'MISSING_MFA_TOKEN',
                    message: 'MFA token is required'
                });
            }

            await user.enableMFA(mfaToken);

            await logSecurityEvent(req, 'MFA_ENABLED', {
                userId: user.id,
                riskScore: -2 // Negative risk score for security improvement
            });

            res.json({
                success: true,
                message: 'MFA has been successfully enabled for your account'
            });

        } catch (error) {
            console.error('MFA enable error:', error);
            
            if (error.message === 'Invalid MFA token') {
                return res.status(400).json({
                    error: 'INVALID_MFA_TOKEN',
                    message: 'Invalid MFA token. Please try again.'
                });
            }

            res.status(500).json({
                error: 'MFA_ENABLE_ERROR',
                message: 'Error enabling MFA'
            });
        }
    }

    /**
     * Change password
     */
    static async changePassword(req, res) {
        try {
            const { currentPassword, newPassword, confirmPassword } = req.body;
            const user = req.user;

            // Validate input
            if (!currentPassword || !newPassword || !confirmPassword) {
                return res.status(400).json({
                    error: 'MISSING_REQUIRED_FIELDS',
                    message: 'Current password, new password, and confirmation are required'
                });
            }

            if (newPassword !== confirmPassword) {
                return res.status(400).json({
                    error: 'PASSWORD_MISMATCH',
                    message: 'New password and confirmation do not match'
                });
            }

            // Verify current password
            const currentPasswordValid = await user.verifyPassword(currentPassword);
            if (!currentPasswordValid) {
                await logSecurityEvent(req, 'PASSWORD_CHANGE_FAILED', {
                    userId: user.id,
                    reason: 'INVALID_CURRENT_PASSWORD',
                    riskScore: 6
                });

                return res.status(401).json({
                    error: 'INVALID_CURRENT_PASSWORD',
                    message: 'Current password is incorrect'
                });
            }

            // Update password
            await user.updatePassword(newPassword);

            // Revoke all sessions except current one
            await JwtService.revokeAllUserSessions(user.id);

            await logSecurityEvent(req, 'PASSWORD_CHANGED', {
                userId: user.id,
                riskScore: -1 // Slight negative risk for security improvement
            });

            res.json({
                success: true,
                message: 'Password changed successfully. Please login again on other devices.'
            });

        } catch (error) {
            console.error('Password change error:', error);

            if (error.message === 'Password does not meet security requirements') {
                return res.status(400).json({
                    error: 'WEAK_PASSWORD',
                    message: 'Password does not meet security requirements',
                    requirements: {
                        minLength: securityConfig.password.minLength,
                        requireUppercase: securityConfig.password.requireUppercase,
                        requireLowercase: securityConfig.password.requireLowercase,
                        requireNumbers: securityConfig.password.requireNumbers,
                        requireSpecialChars: securityConfig.password.requireSpecialChars
                    }
                });
            }

            res.status(500).json({
                error: 'PASSWORD_CHANGE_ERROR',
                message: 'Error changing password'
            });
        }
    }

    /**
     * Get current user profile
     */
    static async getProfile(req, res) {
        try {
            const user = req.user;
            const activeSessions = await JwtService.getUserActiveSessions(user.id);

            res.json({
                success: true,
                user: user.toSafeObject(),
                activeSessions: activeSessions.length,
                sessionDetails: activeSessions
            });

        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({
                error: 'PROFILE_ERROR',
                message: 'Error retrieving profile'
            });
        }
    }

    /**
     * Update user profile
     */
    static async updateProfile(req, res) {
        try {
            const { firstName, lastName, phone } = req.body;
            const user = req.user;

            // Update user profile (implement based on your needs)
            // This is a basic example - you may want to add more fields

            await logSecurityEvent(req, 'PROFILE_UPDATED', {
                userId: user.id,
                updatedFields: Object.keys(req.body)
            });

            res.json({
                success: true,
                message: 'Profile updated successfully'
            });

        } catch (error) {
            console.error('Profile update error:', error);
            res.status(500).json({
                error: 'PROFILE_UPDATE_ERROR',
                message: 'Error updating profile'
            });
        }
    }

    /**
     * Calculate login risk score based on various factors
     */
    static calculateLoginRiskScore(req, user) {
        let riskScore = 0;

        // Check for new IP address
        const currentIp = req.ip || req.connection?.remoteAddress;
        // This would typically check against user's login history
        // For now, we'll use a basic implementation

        // Check for unusual user agent
        const userAgent = req.headers['user-agent'];
        if (!userAgent || userAgent.length < 10) {
            riskScore += 2;
        }

        // Check for failed login attempts
        if (user.failed_login_attempts > 0) {
            riskScore += user.failed_login_attempts;
        }

        // Check account age (new accounts are riskier)
        const accountAge = Date.now() - new Date(user.created_at).getTime();
        const oneWeek = 7 * 24 * 60 * 60 * 1000;
        if (accountAge < oneWeek) {
            riskScore += 3;
        }

        // Check for missing security headers
        if (!req.headers['x-forwarded-for'] && !req.headers['x-real-ip']) {
            riskScore += 1;
        }

        return Math.min(riskScore, 10); // Cap at 10
    }
}

module.exports = AuthController;
