/**
 * ILOS Authentication Routes
 * ==========================
 * Banking-grade authentication API endpoints
 */

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth/AuthController');
const { authenticate, authorize, requireAdmin } = require('../middleware/auth');
const { authLimiter, strictLimiter, applicationLimiters } = require('../middleware/rateLimiter');
const { body, validationResult } = require('express-validator');

/**
 * Validation middleware
 */
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: errors.array()
        });
    }
    next();
};

/**
 * Login validation rules
 */
const loginValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email is required'),
    body('password')
        .isLength({ min: 1 })
        .withMessage('Password is required'),
    body('mfaToken')
        .optional()
        .isLength({ min: 6, max: 6 })
        .isNumeric()
        .withMessage('MFA token must be 6 digits'),
    body('rememberMe')
        .optional()
        .isBoolean()
        .withMessage('Remember me must be boolean')
];

/**
 * Password change validation rules
 */
const passwordChangeValidation = [
    body('currentPassword')
        .isLength({ min: 1 })
        .withMessage('Current password is required'),
    body('newPassword')
        .isLength({ min: 8 })
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('New password must meet security requirements'),
    body('confirmPassword')
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error('Password confirmation does not match');
            }
            return true;
        })
];

/**
 * MFA token validation
 */
const mfaValidation = [
    body('mfaToken')
        .isLength({ min: 6, max: 6 })
        .isNumeric()
        .withMessage('MFA token must be 6 digits')
];

/**
 * Profile update validation
 */
const profileUpdateValidation = [
    body('firstName')
        .optional()
        .isLength({ min: 2, max: 50 })
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('First name must contain only letters and spaces'),
    body('lastName')
        .optional()
        .isLength({ min: 2, max: 50 })
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Last name must contain only letters and spaces'),
    body('phone')
        .optional()
        .matches(/^(\+92|0)?[0-9]{10}$/)
        .withMessage('Phone number must be valid Pakistani format')
];

// =============================================================================
// PUBLIC ROUTES (No Authentication Required)
// =============================================================================

/**
 * @route   POST /api/auth/login
 * @desc    User login
 * @access  Public
 */
router.post('/login', 
    authLimiter,
    loginValidation,
    validateRequest,
    AuthController.login
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh',
    authLimiter,
    body('refreshToken').notEmpty().withMessage('Refresh token is required'),
    validateRequest,
    AuthController.refreshToken
);

/**
 * @route   GET /api/auth/health
 * @desc    Authentication service health check
 * @access  Public
 */
router.get('/health', (req, res) => {
    res.json({
        success: true,
        service: 'ILOS Authentication Service',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        status: 'healthy'
    });
});

// =============================================================================
// PROTECTED ROUTES (Authentication Required)
// =============================================================================

/**
 * @route   POST /api/auth/logout
 * @desc    User logout (current session)
 * @access  Private
 */
router.post('/logout',
    authenticate,
    AuthController.logout
);

/**
 * @route   POST /api/auth/logout-all
 * @desc    Logout from all devices
 * @access  Private
 */
router.post('/logout-all',
    authenticate,
    strictLimiter,
    AuthController.logoutAll
);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile',
    authenticate,
    AuthController.getProfile
);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile',
    authenticate,
    applicationLimiters.admin,
    profileUpdateValidation,
    validateRequest,
    AuthController.updateProfile
);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post('/change-password',
    authenticate,
    strictLimiter,
    passwordChangeValidation,
    validateRequest,
    AuthController.changePassword
);

/**
 * @route   POST /api/auth/setup-mfa
 * @desc    Setup MFA for user account
 * @access  Private
 */
router.post('/setup-mfa',
    authenticate,
    strictLimiter,
    AuthController.setupMFA
);

/**
 * @route   POST /api/auth/enable-mfa
 * @desc    Enable MFA after verification
 * @access  Private
 */
router.post('/enable-mfa',
    authenticate,
    strictLimiter,
    mfaValidation,
    validateRequest,
    AuthController.enableMFA
);

/**
 * @route   POST /api/auth/disable-mfa
 * @desc    Disable MFA (requires admin approval in production)
 * @access  Private - Admin Only
 */
router.post('/disable-mfa',
    authenticate,
    requireAdmin,
    strictLimiter,
    body('userId').isInt().withMessage('Valid user ID is required'),
    body('reason').isLength({ min: 10 }).withMessage('Detailed reason is required'),
    validateRequest,
    async (req, res) => {
        // Implementation for disabling MFA (admin only)
        res.status(501).json({
            error: 'NOT_IMPLEMENTED',
            message: 'MFA disable functionality requires admin approval workflow'
        });
    }
);

/**
 * @route   GET /api/auth/sessions
 * @desc    Get user's active sessions
 * @access  Private
 */
router.get('/sessions',
    authenticate,
    async (req, res) => {
        try {
            const JwtService = require('../services/auth/JwtService');
            const sessions = await JwtService.getUserActiveSessions(req.user.id);
            
            res.json({
                success: true,
                activeSessions: sessions.length,
                sessions: sessions.map(session => ({
                    id: session.id,
                    ipAddress: session.ip_address,
                    userAgent: session.user_agent,
                    deviceInfo: session.device_info,
                    createdAt: session.created_at,
                    lastActivity: session.last_activity_at,
                    isCurrent: session.id === req.sessionId
                }))
            });
        } catch (error) {
            console.error('Get sessions error:', error);
            res.status(500).json({
                error: 'SESSIONS_ERROR',
                message: 'Error retrieving sessions'
            });
        }
    }
);

/**
 * @route   DELETE /api/auth/sessions/:sessionId
 * @desc    Revoke specific session
 * @access  Private
 */
router.delete('/sessions/:sessionId',
    authenticate,
    strictLimiter,
    async (req, res) => {
        try {
            const { sessionId } = req.params;
            const JwtService = require('../services/auth/JwtService');
            
            // Note: In production, add validation to ensure user owns the session
            await JwtService.revokeSession(sessionId);
            
            res.json({
                success: true,
                message: 'Session revoked successfully'
            });
        } catch (error) {
            console.error('Revoke session error:', error);
            res.status(500).json({
                error: 'SESSION_REVOKE_ERROR',
                message: 'Error revoking session'
            });
        }
    }
);

// =============================================================================
// ADMIN ROUTES (Admin Access Required)
// =============================================================================

/**
 * @route   GET /api/auth/admin/users
 * @desc    Get all users (admin only)
 * @access  Private - Admin Only
 */
router.get('/admin/users',
    authenticate,
    requireAdmin,
    applicationLimiters.admin,
    async (req, res) => {
        try {
            const { page = 1, limit = 50, department, role, active } = req.query;
            // Implementation for getting users with pagination and filters
            res.status(501).json({
                error: 'NOT_IMPLEMENTED',
                message: 'User management endpoints are under development'
            });
        } catch (error) {
            console.error('Admin get users error:', error);
            res.status(500).json({
                error: 'ADMIN_ERROR',
                message: 'Error retrieving users'
            });
        }
    }
);

/**
 * @route   POST /api/auth/admin/create-user
 * @desc    Create new user (admin only)
 * @access  Private - Admin Only
 */
router.post('/admin/create-user',
    authenticate,
    requireAdmin,
    strictLimiter,
    [
        body('email').isEmail().normalizeEmail(),
        body('firstName').isLength({ min: 2, max: 50 }),
        body('lastName').isLength({ min: 2, max: 50 }),
        body('employeeId').isLength({ min: 3, max: 20 }),
        body('department').isIn(['PB', 'SPU', 'COPS', 'EAMVU', 'CIU', 'RRU', 'RISK', 'COMPLIANCE', 'ADMIN']),
        body('role').isIn(['ADMIN', 'BRANCH_MANAGER', 'DEPARTMENT_HEAD', 'SENIOR_OFFICER', 'OFFICER', 'JUNIOR_OFFICER', 'VIEWER']),
        body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    ],
    validateRequest,
    async (req, res) => {
        try {
            // Implementation for creating users
            res.status(501).json({
                error: 'NOT_IMPLEMENTED',
                message: 'User creation endpoint is under development'
            });
        } catch (error) {
            console.error('Admin create user error:', error);
            res.status(500).json({
                error: 'USER_CREATION_ERROR',
                message: 'Error creating user'
            });
        }
    }
);

/**
 * @route   GET /api/auth/admin/audit-logs
 * @desc    Get security audit logs (admin only)
 * @access  Private - Admin Only
 */
router.get('/admin/audit-logs',
    authenticate,
    requireAdmin,
    applicationLimiters.admin,
    async (req, res) => {
        try {
            const { 
                page = 1, 
                limit = 100, 
                eventType, 
                userId, 
                startDate, 
                endDate,
                riskScore 
            } = req.query;

            const db = require('../db1');
            
            let query = `
                SELECT sal.*, u.email as user_email, u.first_name, u.last_name
                FROM security_audit_log sal
                LEFT JOIN users u ON sal.user_id = u.id
                WHERE 1=1
            `;
            
            const params = [];
            let paramCount = 0;

            if (eventType) {
                paramCount++;
                query += ` AND sal.event_type = $${paramCount}`;
                params.push(eventType);
            }

            if (userId) {
                paramCount++;
                query += ` AND sal.user_id = $${paramCount}`;
                params.push(parseInt(userId));
            }

            if (startDate) {
                paramCount++;
                query += ` AND sal.created_at >= $${paramCount}`;
                params.push(startDate);
            }

            if (endDate) {
                paramCount++;
                query += ` AND sal.created_at <= $${paramCount}`;
                params.push(endDate);
            }

            if (riskScore) {
                paramCount++;
                query += ` AND sal.risk_score >= $${paramCount}`;
                params.push(parseInt(riskScore));
            }

            query += ` ORDER BY sal.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
            params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

            const result = await db.query(query, params);

            res.json({
                success: true,
                auditLogs: result.rows,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: result.rows.length
                }
            });

        } catch (error) {
            console.error('Admin audit logs error:', error);
            res.status(500).json({
                error: 'AUDIT_LOGS_ERROR',
                message: 'Error retrieving audit logs'
            });
        }
    }
);

module.exports = router;
