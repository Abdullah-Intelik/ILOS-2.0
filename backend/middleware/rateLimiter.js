/**
 * ILOS Rate Limiting Middleware (Fixed)
 * ====================================== 
 * Advanced rate limiting for banking API protection with IPv6 support
 */

const rateLimit = require('express-rate-limit');
const securityConfig = require('../config/security');

/**
 * Create rate limiter with custom configuration
 */
const createRateLimiter = (options = {}) => {
    const {
        windowMs = securityConfig.rateLimiting.windowMs,
        max = securityConfig.rateLimiting.max,
        message = 'Too many requests',
        skipSuccessfulRequests = securityConfig.rateLimiting.skipSuccessfulRequests,
        skipFailedRequests = securityConfig.rateLimiting.skipFailedRequests,
        keyGenerator = null,
        onLimitReached = null
    } = options;

    return rateLimit({
        windowMs,
        max,
        message: {
            error: 'RATE_LIMIT_EXCEEDED',
            message: message,
            retryAfter: Math.ceil(windowMs / 1000)
        },
        standardHeaders: true,
        legacyHeaders: false,
        skipSuccessfulRequests,
        skipFailedRequests,
        // Use default key generator or custom one (no IPv6 issues)
        keyGenerator: keyGenerator,
        handler: (req, res) => {
            // Log rate limit exceeded event
            logRateLimitEvent(req, {
                windowMs,
                max,
                endpoint: req.path,
                method: req.method
            });

            if (onLimitReached) {
                onLimitReached(req, res);
            }

            res.status(429).json({
                error: 'RATE_LIMIT_EXCEEDED',
                message: message,
                retryAfter: Math.ceil(windowMs / 1000)
            });
        }
    });
};

/**
 * General API rate limiter (using default key generator)
 */
const apiLimiter = createRateLimiter({
    max: securityConfig.rateLimiting.max,
    message: 'Too many API requests. Please try again later.',
    skipSuccessfulRequests: true
});

/**
 * Strict rate limiter for authentication endpoints
 */
const authLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: securityConfig.rateLimiting.authMax,
    message: 'Too many authentication attempts. Please try again later.',
    skipSuccessfulRequests: false,
    skipFailedRequests: false
});

/**
 * Very strict rate limiter for sensitive operations
 */
const strictLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: securityConfig.rateLimiting.strictMax,
    message: 'Too many sensitive operations. Please try again later.',
    skipSuccessfulRequests: false,
    skipFailedRequests: false
});

/**
 * Application-specific rate limiters
 */
const applicationLimiters = {
    // Loan application submission
    loanSubmission: createRateLimiter({
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 10,
        message: 'Too many loan applications. Please try again later.'
    }),

    // Document upload
    documentUpload: createRateLimiter({
        windowMs: 10 * 60 * 1000, // 10 minutes
        max: 50,
        message: 'Too many document uploads. Please try again later.'
    }),

    // External API calls
    externalApi: createRateLimiter({
        windowMs: 60 * 1000, // 1 minute
        max: 30,
        message: 'Too many external API requests. Please try again later.'
    }),

    // Blockchain operations
    blockchain: createRateLimiter({
        windowMs: 5 * 60 * 1000, // 5 minutes
        max: 20,
        message: 'Too many blockchain operations. Please try again later.'
    }),

    // Admin operations
    admin: createRateLimiter({
        windowMs: 60 * 1000, // 1 minute
        max: 100,
        message: 'Too many admin operations. Please try again later.'
    })
};

/**
 * Smart rate limiter that adjusts based on user behavior
 */
const smartRateLimiter = (req, res, next) => {
    const user = req.user;
    
    if (!user) {
        return apiLimiter(req, res, next);
    }

    // Adjust limits based on user role and history
    let maxRequests = securityConfig.rateLimiting.max;
    
    // Higher limits for trusted roles
    if (user.role === 'SUPER_ADMIN') {
        maxRequests = maxRequests * 3;
    } else if (['ADMIN', 'BRANCH_MANAGER'].includes(user.role)) {
        maxRequests = maxRequests * 2;
    }

    // Lower limits for new users or those with recent security issues
    const accountAge = Date.now() - new Date(user.created_at).getTime();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    
    if (accountAge < oneWeek) {
        maxRequests = Math.floor(maxRequests * 0.5); // 50% for new accounts
    }

    if (user.failed_login_attempts > 0) {
        maxRequests = Math.floor(maxRequests * 0.7); // 70% for users with recent failures
    }

    const dynamicLimiter = createRateLimiter({
        max: maxRequests,
        message: `Rate limit adjusted based on your account status: ${maxRequests} requests per window`
    });

    return dynamicLimiter(req, res, next);
};

/**
 * IP-based rate limiter for public endpoints
 */
const ipLimiter = createRateLimiter({
    max: 50,
    message: 'Too many requests from your IP address'
});

/**
 * Log rate limit events for security monitoring
 */
const logRateLimitEvent = async (req, limitData) => {
    try {
        const db = require('../db1');
        
        const query = `
            INSERT INTO security_audit_log (
                user_id, event_type, event_description, event_data,
                ip_address, user_agent, request_method, request_path,
                risk_score
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `;

        const values = [
            req.user?.id || null,
            'RATE_LIMIT_EXCEEDED',
            `Rate limit exceeded: ${limitData.max} requests per ${limitData.windowMs}ms`,
            JSON.stringify({
                ...limitData,
                userAgent: req.headers['user-agent'],
                referer: req.headers.referer
            }),
            req.ip || req.connection?.remoteAddress,
            req.headers['user-agent'],
            req.method,
            req.path,
            5 // Medium risk score for rate limiting
        ];

        await db.query(query, values);
    } catch (error) {
        console.error('Error logging rate limit event:', error);
    }
};

// Progressive and department limiters (simplified without custom key generators)
const progressiveLimiter = createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 20,
    message: 'Please slow down your requests',
    skipSuccessfulRequests: true
});

const departmentLimiter = (departmentLimits = {}) => {
    return (req, res, next) => {
        const userDepartment = req.user?.department;
        if (!userDepartment) {
            return next();
        }

        const departmentLimit = departmentLimits[userDepartment] || securityConfig.rateLimiting.max;
        
        const limiter = createRateLimiter({
            max: departmentLimit,
            message: `Too many requests for ${userDepartment} department`
        });

        return limiter(req, res, next);
    };
};

module.exports = {
    apiLimiter,
    authLimiter,
    strictLimiter,
    progressiveLimiter,
    departmentLimiter,
    applicationLimiters,
    smartRateLimiter,
    ipLimiter,
    createRateLimiter
};
