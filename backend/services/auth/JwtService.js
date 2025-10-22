/**
 * ILOS JWT Authentication Service
 * ===============================
 * JWT token generation, validation, and management for banking-grade security
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const securityConfig = require('../../config/security');
const db = require('../../db1');

class JwtService {
    /**
     * Generate access and refresh token pair
     */
    static async generateTokenPair(user, sessionData = {}) {
        const sessionId = crypto.randomUUID();
        const deviceId = this.generateDeviceId(sessionData);
        
        // Access token payload
        const accessPayload = {
            userId: user.id,
            email: user.email,
            employeeId: user.employee_id,
            department: user.department,
            role: user.role,
            sessionId: sessionId,
            deviceId: deviceId,
            permissions: user.getPermissions(),
            type: 'access'
        };

        // Refresh token payload (minimal data)
        const refreshPayload = {
            userId: user.id,
            sessionId: sessionId,
            deviceId: deviceId,
            type: 'refresh'
        };

        const accessToken = jwt.sign(
            accessPayload,
            securityConfig.jwt.accessSecret,
            {
                expiresIn: securityConfig.jwt.accessExpiresIn,
                issuer: securityConfig.jwt.issuer,
                audience: securityConfig.jwt.audience,
                subject: user.id.toString(),
                jwtid: crypto.randomUUID()
            }
        );

        const refreshToken = jwt.sign(
            refreshPayload,
            securityConfig.jwt.refreshSecret,
            {
                expiresIn: securityConfig.jwt.refreshExpiresIn,
                issuer: securityConfig.jwt.issuer,
                audience: securityConfig.jwt.audience,
                subject: user.id.toString(),
                jwtid: crypto.randomUUID()
            }
        );

        // Store session in database
        await this.storeSession({
            user_id: user.id,
            session_token: this.hashToken(accessToken),
            refresh_token: this.hashToken(refreshToken),
            ip_address: sessionData.ip_address,
            user_agent: sessionData.user_agent,
            device_info: sessionData.device_info,
            login_method: sessionData.login_method || 'password',
            risk_score: sessionData.risk_score || 0,
            location_data: sessionData.location_data,
            expires_at: new Date(Date.now() + this.parseExpiration(securityConfig.jwt.refreshExpiresIn))
        });

        return {
            accessToken,
            refreshToken,
            sessionId,
            expiresIn: this.parseExpiration(securityConfig.jwt.accessExpiresIn) / 1000,
            tokenType: 'Bearer'
        };
    }

    /**
     * Verify access token
     */
    static verifyAccessToken(token) {
        try {
            return jwt.verify(token, securityConfig.jwt.accessSecret, {
                issuer: securityConfig.jwt.issuer,
                audience: securityConfig.jwt.audience
            });
        } catch (error) {
            throw this.createJwtError(error);
        }
    }

    /**
     * Verify refresh token
     */
    static verifyRefreshToken(token) {
        try {
            return jwt.verify(token, securityConfig.jwt.refreshSecret, {
                issuer: securityConfig.jwt.issuer,
                audience: securityConfig.jwt.audience
            });
        } catch (error) {
            throw this.createJwtError(error);
        }
    }

    /**
     * Refresh access token using refresh token
     */
    static async refreshAccessToken(refreshToken, sessionData = {}) {
        // Verify refresh token
        const refreshPayload = this.verifyRefreshToken(refreshToken);
        
        // Check if session exists and is valid
        const session = await this.getSession(refreshPayload.sessionId);
        if (!session || !session.is_active) {
            throw new Error('INVALID_SESSION');
        }

        // Get user data
        const User = require('../../models/auth/User');
        const user = await User.findById(refreshPayload.userId);
        if (!user || !user.is_active) {
            throw new Error('USER_NOT_FOUND');
        }

        // Generate new access token
        const accessPayload = {
            userId: user.id,
            email: user.email,
            employeeId: user.employee_id,
            department: user.department,
            role: user.role,
            sessionId: refreshPayload.sessionId,
            deviceId: refreshPayload.deviceId,
            permissions: user.getPermissions(),
            type: 'access'
        };

        const accessToken = jwt.sign(
            accessPayload,
            securityConfig.jwt.accessSecret,
            {
                expiresIn: securityConfig.jwt.accessExpiresIn,
                issuer: securityConfig.jwt.issuer,
                audience: securityConfig.jwt.audience,
                subject: user.id.toString(),
                jwtid: crypto.randomUUID()
            }
        );

        // Update session activity
        await this.updateSessionActivity(refreshPayload.sessionId, {
            last_activity_at: new Date(),
            ip_address: sessionData.ip_address,
            user_agent: sessionData.user_agent
        });

        return {
            accessToken,
            expiresIn: this.parseExpiration(securityConfig.jwt.accessExpiresIn) / 1000,
            tokenType: 'Bearer'
        };
    }

    /**
     * Revoke session (logout)
     */
    static async revokeSession(sessionId) {
        const query = `
            UPDATE user_sessions 
            SET is_active = false, logout_time = NOW()
            WHERE session_id = $1
        `;
        await db.query(query, [sessionId]);
    }

    /**
     * Revoke all user sessions
     */
    static async revokeAllUserSessions(userId) {
        const query = `
            UPDATE user_sessions 
            SET is_active = false, logout_time = NOW()
            WHERE user_id = $1 AND is_active = true
        `;
        await db.query(query, [userId]);
    }

    /**
     * Store session in database
     */
    static async storeSession(sessionData) {
        const query = `
            INSERT INTO user_sessions (
                user_id, session_token, refresh_token, ip_address, user_agent,
                device_info, login_method, risk_score, location_data, expires_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id
        `;

        const values = [
            sessionData.user_id,
            sessionData.session_token,
            sessionData.refresh_token,
            sessionData.ip_address,
            sessionData.user_agent,
            sessionData.device_info,
            sessionData.login_method,
            sessionData.risk_score,
            sessionData.location_data,
            sessionData.expires_at
        ];

        const result = await db.query(query, values);
        return result.rows[0].id;
    }

    /**
     * Get session by session ID
     */
    static async getSession(sessionId) {
        const query = `
            SELECT * FROM user_sessions 
            WHERE session_id = $1 AND is_active = true AND expires_at > NOW()
        `;
        const result = await db.query(query, [sessionId]);
        return result.rows[0] || null;
    }

    /**
     * Update session activity
     */
    static async updateSessionActivity(sessionId, updateData) {
        const fields = Object.keys(updateData);
        const values = Object.values(updateData);
        const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
        
        const query = `
            UPDATE user_sessions 
            SET ${setClause}
            WHERE session_id = $${fields.length + 1}
        `;
        
        await db.query(query, [...values, sessionId]);
    }

    /**
     * Clean up expired sessions
     */
    static async cleanupExpiredSessions() {
        const query = `
            UPDATE user_sessions 
            SET is_active = false 
            WHERE expires_at < NOW() AND is_active = true
        `;
        const result = await db.query(query);
        return result.rowCount;
    }

    /**
     * Get active sessions for user
     */
    static async getUserActiveSessions(userId) {
        const query = `
            SELECT id, ip_address, user_agent, device_info, created_at, last_activity_at
            FROM user_sessions 
            WHERE user_id = $1 AND is_active = true AND expires_at > NOW()
            ORDER BY last_activity_at DESC
        `;
        const result = await db.query(query, [userId]);
        return result.rows;
    }

    /**
     * Generate device ID based on request data
     */
    static generateDeviceId(sessionData) {
        const deviceString = `${sessionData.user_agent || ''}|${sessionData.ip_address || ''}`;
        return crypto.createHash('sha256').update(deviceString).digest('hex').substring(0, 16);
    }

    /**
     * Hash token for storage
     */
    static hashToken(token) {
        return crypto.createHash('sha256').update(token).digest('hex');
    }

    /**
     * Parse JWT expiration string to milliseconds
     */
    static parseExpiration(expiration) {
        const unit = expiration.slice(-1);
        const value = parseInt(expiration.slice(0, -1));
        
        switch (unit) {
            case 's': return value * 1000;
            case 'm': return value * 60 * 1000;
            case 'h': return value * 60 * 60 * 1000;
            case 'd': return value * 24 * 60 * 60 * 1000;
            default: return 3600000; // 1 hour default
        }
    }

    /**
     * Create standardized JWT error
     */
    static createJwtError(error) {
        switch (error.name) {
            case 'TokenExpiredError':
                return new Error('TOKEN_EXPIRED');
            case 'JsonWebTokenError':
                return new Error('INVALID_TOKEN');
            case 'NotBeforeError':
                return new Error('TOKEN_NOT_ACTIVE');
            default:
                return new Error('TOKEN_VERIFICATION_FAILED');
        }
    }

    /**
     * Validate token structure and claims
     */
    static validateTokenClaims(payload) {
        const required = ['userId', 'email', 'department', 'role', 'sessionId', 'type'];
        const missing = required.filter(field => !payload[field]);
        
        if (missing.length > 0) {
            throw new Error(`Missing required token claims: ${missing.join(', ')}`);
        }

        if (!securityConfig.departments.includes(payload.department)) {
            throw new Error('Invalid department in token');
        }

        if (!Object.keys(securityConfig.roles).includes(payload.role)) {
            throw new Error('Invalid role in token');
        }

        return true;
        return true;
    }

    /**
     * Generate temporary token for MFA verification
     */
    static async generateTempToken(userId) {
        const tempPayload = {
            userId: userId,
            type: "temp_mfa",
            purpose: "mfa_verification"
        };

        return jwt.sign(
            tempPayload,
            securityConfig.jwt.accessSecret,
            {
                expiresIn: "5m", // 5 minutes for MFA verification
                issuer: securityConfig.jwt.issuer,
                audience: securityConfig.jwt.audience,
                subject: userId.toString()
            }
        );
    }
}

module.exports = JwtService;
