/**
 * ILOS Input Validation Middleware
 * ================================
 * Banking-grade input validation and sanitization
 */

const { body, param, query, validationResult } = require('express-validator');
const xss = require('xss');
const securityConfig = require('../config/security');

/**
 * XSS Protection and Sanitization
 */
const sanitizeInput = (req, res, next) => {
    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
        req.body = sanitizeObject(req.body);
    }

    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
        req.query = sanitizeObject(req.query);
    }

    // Sanitize URL parameters
    if (req.params && typeof req.params === 'object') {
        req.params = sanitizeObject(req.params);
    }

    next();
};

/**
 * Recursively sanitize object properties
 */
const sanitizeObject = (obj) => {
    const sanitized = {};
    
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            // XSS protection
            sanitized[key] = xss(value, {
                whiteList: {}, // No HTML tags allowed
                stripIgnoreTag: true,
                stripIgnoreTagBody: ['script']
            }).trim();
        } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            sanitized[key] = sanitizeObject(value);
        } else if (Array.isArray(value)) {
            sanitized[key] = value.map(item => 
                typeof item === 'string' ? xss(item).trim() : item
            );
        } else {
            sanitized[key] = value;
        }
    }
    
    return sanitized;
};

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        const errorDetails = errors.array().map(error => ({
            field: error.path || error.param,
            message: error.msg,
            value: error.value
        }));

        // Log validation failures for security monitoring
        console.warn(`Validation failed for ${req.method} ${req.path}:`, errorDetails);

        return res.status(400).json({
            error: 'VALIDATION_ERROR',
            message: 'Invalid input data provided',
            details: errorDetails
        });
    }
    
    next();
};

/**
 * Common validation rules
 */
const validationRules = {
    // User fields
    email: body('email')
        .isEmail()
        .normalizeEmail()
        .isLength({ max: 255 })
        .withMessage('Valid email address is required'),

    password: body('password')
        .isLength({ min: securityConfig.password.minLength })
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage(`Password must be at least ${securityConfig.password.minLength} characters with uppercase, lowercase, number, and special character`),

    cnic: body('cnic')
        .matches(securityConfig.validation.cnic)
        .withMessage('CNIC must be in format 12345-1234567-1'),

    phone: body('phone')
        .matches(securityConfig.validation.phone)
        .withMessage('Phone number must be valid Pakistani format'),

    name: (field) => body(field)
        .isLength({ min: 2, max: 50 })
        .matches(/^[a-zA-Z\s\-'\.]+$/)
        .withMessage(`${field} must contain only letters, spaces, hyphens, apostrophes, and periods`),

    employeeId: body('employeeId')
        .isLength({ min: 3, max: 20 })
        .matches(/^[A-Z0-9]+$/)
        .withMessage('Employee ID must contain only uppercase letters and numbers'),

    department: body('department')
        .isIn(securityConfig.departments)
        .withMessage(`Department must be one of: ${securityConfig.departments.join(', ')}`),

    role: body('role')
        .isIn(Object.keys(securityConfig.roles))
        .withMessage(`Role must be one of: ${Object.keys(securityConfig.roles).join(', ')}`),

    // Application fields
    losId: param('losId')
        .isInt({ min: 1 })
        .withMessage('LOS ID must be a positive integer'),

    amount: (field) => body(field)
        .isFloat({ min: securityConfig.validation.amounts.min, max: securityConfig.validation.amounts.max })
        .withMessage(`${field} must be between ${securityConfig.validation.amounts.min} and ${securityConfig.validation.amounts.max}`),

    // Pagination
    page: query('page')
        .optional()
        .isInt({ min: 1, max: 1000 })
        .withMessage('Page must be between 1 and 1000'),

    limit: query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),

    // Date fields
    date: (field) => body(field)
        .optional()
        .isISO8601()
        .withMessage(`${field} must be a valid ISO 8601 date`),

    // Blockchain fields
    hash: body('hash')
        .optional()
        .matches(/^[a-fA-F0-9]{64}$/)
        .withMessage('Hash must be a valid SHA-256 hex string'),

    // File upload
    fileName: body('fileName')
        .optional()
        .isLength({ min: 1, max: 255 })
        .matches(/^[a-zA-Z0-9\-_\.]+$/)
        .withMessage('File name must contain only alphanumeric characters, hyphens, underscores, and periods'),

    // Search and filter
    searchTerm: query('search')
        .optional()
        .isLength({ min: 1, max: 100 })
        .trim()
        .escape()
        .withMessage('Search term must be 1-100 characters'),

    // MFA
    mfaToken: body('mfaToken')
        .isLength({ min: 6, max: 6 })
        .isNumeric()
        .withMessage('MFA token must be exactly 6 digits')
};

/**
 * Application-specific validation schemas
 */
const applicationValidation = {
    // Cash Plus application
    cashPlus: [
        validationRules.name('customer_name'),
        validationRules.cnic,
        validationRules.phone,
        validationRules.amount('amount_requested'),
        body('tenure')
            .isInt({ min: 6, max: 60 })
            .withMessage('Tenure must be between 6 and 60 months'),
        body('purpose_of_loan')
            .isLength({ min: 10, max: 500 })
            .withMessage('Purpose of loan must be 10-500 characters')
    ],

    // Auto loan application
    autoLoan: [
        validationRules.name('applicant_full_name'),
        validationRules.cnic.optional(),
        validationRules.amount('price_value'),
        body('vehicle_manufacturer')
            .isLength({ min: 2, max: 50 })
            .matches(/^[a-zA-Z\s]+$/)
            .withMessage('Vehicle manufacturer must contain only letters and spaces'),
        body('vehicle_model')
            .isLength({ min: 2, max: 50 })
            .withMessage('Vehicle model is required'),
        body('year_of_manufacture')
            .isInt({ min: 2000, max: new Date().getFullYear() + 1 })
            .withMessage('Year of manufacture must be valid')
    ],

    // Ameen Drive application
    ameenDrive: [
        validationRules.name('applicant_full_name'),
        body('applicant_cnic')
            .matches(/^[0-9]{5}-[0-9]{7}-[0-9]$/)
            .withMessage('CNIC must be in format 12345-1234567-1'),
        validationRules.amount('price_value'),
        body('vehicle_manufacturer')
            .isLength({ min: 2, max: 50 })
            .withMessage('Vehicle manufacturer is required'),
        body('loan_period')
            .isInt({ min: 12, max: 84 })
            .withMessage('Loan period must be between 12 and 84 months')
    ]
};

/**
 * File upload validation
 */
const fileUploadValidation = {
    validateFileType: (allowedTypes) => (req, res, next) => {
        if (!req.file) {
            return res.status(400).json({
                error: 'FILE_REQUIRED',
                message: 'File is required'
            });
        }

        if (!allowedTypes.includes(req.file.mimetype)) {
            return res.status(400).json({
                error: 'INVALID_FILE_TYPE',
                message: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`
            });
        }

        next();
    },

    validateFileSize: (maxSizeBytes) => (req, res, next) => {
        if (req.file && req.file.size > maxSizeBytes) {
            return res.status(400).json({
                error: 'FILE_TOO_LARGE',
                message: `File size must be less than ${Math.round(maxSizeBytes / 1024 / 1024)}MB`
            });
        }

        next();
    }
};

/**
 * SQL Injection Protection
 */
const sqlInjectionProtection = (req, res, next) => {
    const suspiciousPatterns = [
        /('|(\\')|(--|#|\/\*|;\s*$))/i,
        /(union|select|insert|update|delete|drop|create|alter|exec|execute)/i,
        /(\bor\b|\band\b).*([=<>]|like)/i
    ];

    const checkForSqlInjection = (obj, path = '') => {
        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'string') {
                for (const pattern of suspiciousPatterns) {
                    if (pattern.test(value)) {
                        console.warn(`🚨 Potential SQL injection detected in ${path}${key}: ${value}`);
                        return true;
                    }
                }
            } else if (typeof value === 'object' && value !== null) {
                if (checkForSqlInjection(value, `${path}${key}.`)) {
                    return true;
                }
            }
        }
        return false;
    };

    // Check body, query, and params
    const sources = [
        { data: req.body, name: 'body' },
        { data: req.query, name: 'query' }, 
        { data: req.params, name: 'params' }
    ];

    for (const source of sources) {
        if (source.data && checkForSqlInjection(source.data)) {
            return res.status(400).json({
                error: 'SECURITY_VIOLATION',
                message: 'Suspicious input detected'
            });
        }
    }

    next();
};

/**
 * Request size limits
 */
const requestSizeLimits = {
    json: '10mb',
    urlencoded: '10mb',
    fileUpload: '50mb'
};

/**
 * Content type validation
 */
const validateContentType = (allowedTypes) => (req, res, next) => {
    if (!allowedTypes.includes(req.headers['content-type']?.split(';')[0])) {
        return res.status(400).json({
            error: 'INVALID_CONTENT_TYPE',
            message: `Content type not allowed. Allowed: ${allowedTypes.join(', ')}`
        });
    }
    next();
};

module.exports = {
    sanitizeInput,
    handleValidationErrors,
    validationRules,
    applicationValidation,
    fileUploadValidation,
    sqlInjectionProtection,
    requestSizeLimits,
    validateContentType
};
