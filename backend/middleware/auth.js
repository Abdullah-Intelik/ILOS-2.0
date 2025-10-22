/**
 * ILOS Authentication Middleware
 * ==============================
 * Banking-grade authentication and authorization middleware
 */

const JwtService = require('../services/auth/JwtService');
const User = require('../models/auth/User');
const securityConfig = require('../config/security');

/**
 * Authentication middleware - validates JWT tokens
 */
const authenticate = async (req, res, next) => {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'AUTHENTICATION_REQUIRED',
                message: 'Bearer token required in Authorization header'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        const payload = JwtService.verifyAccessToken(token);
        JwtService.validateTokenClaims(payload);

        // Get user from database to ensure they're still active
        const user = await User.findById(payload.userId);
        if (!user || !user.is_active) {
            return res.status(401).json({
                error: 'USER_INACTIVE',
                message: 'User account is inactive'
            });
        }

        // Check if user is locked
        if (user.isLocked()) {
            return res.status(423).json({
                error: 'ACCOUNT_LOCKED',
                message: 'Account is temporarily locked due to failed login attempts'
            });
        }

        // Attach user and token data to request
        req.user = user;
        req.token = payload;
        req.sessionId = payload.sessionId;

        // Log access attempt for audit
        await logSecurityEvent(req, 'API_ACCESS', {
            success: true,
            endpoint: req.path,
            method: req.method
        });

        next();
    } catch (error) {
        // Log failed authentication attempt
        await logSecurityEvent(req, 'AUTH_FAILED', {
            success: false,
            error: error.message,
            endpoint: req.path,
            method: req.method
        });

        if (error.message === 'TOKEN_EXPIRED') {
            return res.status(401).json({
                error: 'TOKEN_EXPIRED',
                message: 'Access token has expired. Please refresh your token.'
            });
        }

        return res.status(401).json({
            error: 'AUTHENTICATION_FAILED',
            message: 'Invalid or expired token'
        });
    }
};

/**
 * Authorization middleware - checks user permissions
 */
const authorize = (requiredPermissions = [], options = {}) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    error: 'AUTHENTICATION_REQUIRED',
                    message: 'Authentication required before authorization'
                });
            }

            const user = req.user;
            const { 
                requireAllPermissions = false,
                allowedRoles = [],
                allowedDepartments = [],
                requireSameDepartment = false 
            } = options;

            // Super admin has all access
            if (user.role === 'SUPER_ADMIN') {
                return next();
            }

            // Check role-based access
            if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
                await logSecurityEvent(req, 'AUTHORIZATION_FAILED', {
                    reason: 'INSUFFICIENT_ROLE',
                    userRole: user.role,
                    requiredRoles: allowedRoles
                });

                return res.status(403).json({
                    error: 'INSUFFICIENT_ROLE',
                    message: 'Your role does not have access to this resource'
                });
            }

            // Check department-based access
            if (allowedDepartments.length > 0 && !allowedDepartments.includes(user.department)) {
                await logSecurityEvent(req, 'AUTHORIZATION_FAILED', {
                    reason: 'DEPARTMENT_ACCESS_DENIED',
                    userDepartment: user.department,
                    allowedDepartments: allowedDepartments
                });

                return res.status(403).json({
                    error: 'DEPARTMENT_ACCESS_DENIED',
                    message: 'Your department does not have access to this resource'
                });
            }

            // Check same department requirement (for viewing specific records)
            if (requireSameDepartment && req.params.department && 
                req.params.department !== user.department) {
                await logSecurityEvent(req, 'AUTHORIZATION_FAILED', {
                    reason: 'CROSS_DEPARTMENT_ACCESS_DENIED',
                    userDepartment: user.department,
                    requestedDepartment: req.params.department
                });

                return res.status(403).json({
                    error: 'CROSS_DEPARTMENT_ACCESS_DENIED',
                    message: 'You can only access data from your own department'
                });
            }

            // Check specific permissions
            if (requiredPermissions.length > 0) {
                const userPermissions = user.getPermissions();
                
                let hasAccess = false;
                if (requireAllPermissions) {
                    // User must have ALL required permissions
                    hasAccess = requiredPermissions.every(permission => 
                        userPermissions.includes(permission) || userPermissions.includes('*')
                    );
                } else {
                    // User needs at least ONE of the required permissions
                    hasAccess = requiredPermissions.some(permission => 
                        userPermissions.includes(permission) || userPermissions.includes('*')
                    );
                }

                if (!hasAccess) {
                    await logSecurityEvent(req, 'AUTHORIZATION_FAILED', {
                        reason: 'INSUFFICIENT_PERMISSIONS',
                        userPermissions: userPermissions,
                        requiredPermissions: requiredPermissions
                    });

                    return res.status(403).json({
                        error: 'INSUFFICIENT_PERMISSIONS',
                        message: 'You do not have the required permissions for this action'
                    });
                }
            }

            // Log successful authorization
            await logSecurityEvent(req, 'AUTHORIZATION_SUCCESS', {
                permissions: requiredPermissions,
                userRole: user.role,
                userDepartment: user.department
            });

            next();
        } catch (error) {
            console.error('Authorization error:', error);
            
            await logSecurityEvent(req, 'AUTHORIZATION_ERROR', {
                error: error.message,
                stack: error.stack
            });

            return res.status(500).json({
                error: 'AUTHORIZATION_ERROR',
                message: 'Internal authorization error'
            });
        }
    };
};

/**
 * Department access middleware - ensures user can only access their department data
 */
const requireDepartmentAccess = (departmentParam = 'department') => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    error: 'AUTHENTICATION_REQUIRED',
                    message: 'Authentication required'
                });
            }

            const requestedDepartment = req.params[departmentParam] || req.body[departmentParam];
            const userDepartment = req.user.department;

            // Super admin can access all departments
            if (req.user.role === 'SUPER_ADMIN') {
                return next();
            }

            // Check if user is accessing their own department
            if (!requestedDepartment || requestedDepartment !== userDepartment) {
                await logSecurityEvent(req, 'DEPARTMENT_ACCESS_VIOLATION', {
                    userDepartment: userDepartment,
                    requestedDepartment: requestedDepartment,
                    endpoint: req.path
                });

                return res.status(403).json({
                    error: 'DEPARTMENT_ACCESS_DENIED',
                    message: `You can only access ${userDepartment} department data`
                });
            }

            next();
        } catch (error) {
            console.error('Department access error:', error);
            return res.status(500).json({
                error: 'DEPARTMENT_ACCESS_ERROR',
                message: 'Internal department access error'
            });
        }
    };
};

/**
 * Optional authentication - for endpoints that work with or without auth
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            
            try {
                const payload = JwtService.verifyAccessToken(token);
                JwtService.validateTokenClaims(payload);
                
                const user = await User.findById(payload.userId);
                if (user && user.is_active && !user.isLocked()) {
                    req.user = user;
                    req.token = payload;
                    req.sessionId = payload.sessionId;
                }
            } catch (error) {
                // Ignore authentication errors for optional auth
                console.log('Optional auth failed:', error.message);
            }
        }
        
        next();
    } catch (error) {
        // Continue without authentication for optional auth
        next();
    }
};

/**
 * Admin only access
 */
const requireAdmin = authorize([], {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN']
});

/**
 * Manager level access (Manager and above)
 */
const requireManager = authorize([], {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER', 'DEPARTMENT_HEAD']
});

/**
 * Officer level access (Officer and above)
 */
const requireOfficer = authorize([], {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER', 'DEPARTMENT_HEAD', 'SENIOR_OFFICER', 'OFFICER']
});

/**
 * Log security events for audit trail
 */
const logSecurityEvent = async (req, eventType, eventData = {}) => {
    try {
        const db = require('../db1');
        
        const query = `
            INSERT INTO security_audit_log (
                user_id, event_type, event_description, event_data,
                ip_address, user_agent, request_method, request_path,
                response_status, risk_score
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `;

        const values = [
            req.user?.id || null,
            eventType,
            eventData.message || null,
            JSON.stringify(eventData),
            req.ip || req.connection?.remoteAddress,
            req.headers['user-agent'],
            req.method,
            req.path,
            eventData.responseStatus || null,
            eventData.riskScore || 0
        ];

        await db.query(query, values);
    } catch (error) {
        console.error('Error logging security event:', error);
        // Don't throw - logging failure shouldn't break the request
    }
};

module.exports = {
    authenticate,
    authorize,
    requireDepartmentAccess,
    optionalAuth,
    requireAdmin,
    requireManager,
    requireOfficer,
    logSecurityEvent
};
