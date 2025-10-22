/**
 * ILOS Production Security Configuration
 * ====================================
 * Centralized security configuration for banking-grade production environment
 */

require('dotenv').config();

const securityConfig = {
    // JWT Configuration
    jwt: {
        accessSecret: process.env.JWT_ACCESS_SECRET,
        refreshSecret: process.env.JWT_REFRESH_SECRET,
        accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
        issuer: 'ilos-banking-system',
        audience: 'ilos-banking-client'
    },

    // Password Security
    password: {
        saltRounds: parseInt(process.env.PASSWORD_SALT_ROUNDS) || 12,
        minLength: parseInt(process.env.PASSWORD_MIN_LENGTH) || 8,
        maxLength: 128,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        preventReuse: 12 // Last 12 passwords
    },

    // Rate Limiting
    rateLimiting: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
        max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
        authMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 5,
        strictMax: parseInt(process.env.STRICT_RATE_LIMIT_MAX) || 10,
        skipSuccessfulRequests: true,
        skipFailedRequests: false
    },

    // Account Security
    account: {
        lockoutThreshold: parseInt(process.env.LOCKOUT_THRESHOLD) || 5,
        lockoutDuration: parseInt(process.env.LOCKOUT_DURATION) || 1800000, // 30 minutes
        sessionTimeout: parseInt(process.env.SESSION_TIMEOUT) || 3600000, // 1 hour
        maxConcurrentSessions: 3
    },

    // MFA Configuration
    mfa: {
        issuer: process.env.MFA_ISSUER || 'ILOS-Banking-System',
        serviceName: process.env.MFA_SERVICE_NAME || 'ILOS-UBL-Banking',
        windowSize: 2, // Allow 2 windows of 30 seconds each
        tokenLength: 6
    },

    // Session Configuration
    session: {
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            maxAge: parseInt(process.env.SESSION_TIMEOUT) || 3600000,
            sameSite: 'strict'
        }
    },

    // CORS Configuration
    cors: {
        origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000', 'http://localhost:3001','http://127.0.0.1:3000','http://127.0.0.1:3001'],
        credentials: true,
        optionsSuccessStatus: 200,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: [
            'Content-Type', 
            'Authorization', 
            'X-Requested-With',
            'X-API-Key',
            'X-Session-ID',
            'X-Department',
            'X-User-Role'
        ]
    },

    // Security Headers
    headers: {
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", "data:", "https:"],
                connectSrc: ["'self'"],
                fontSrc: ["'self'"],
                objectSrc: ["'none'"],
                mediaSrc: ["'self'"],
                frameSrc: ["'none'"],
                manifestSrc: ["'self'"]
            }
        },
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true
        },
        referrerPolicy: 'strict-origin-when-cross-origin'
    },

    // Database Security
    database: {
        connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 20,
        idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT) || 10000,
        connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 60000,
        ssl: process.env.NODE_ENV === 'production',
        encryptionKey: process.env.ENCRYPTION_KEY
    },

    // Logging Configuration
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        securityLevel: process.env.SECURITY_LOG_LEVEL || 'warn',
        auditLevel: process.env.AUDIT_LOG_LEVEL || 'info',
        format: 'combined',
        colorize: process.env.NODE_ENV !== 'production'
    },

    // Validation Rules
    validation: {
        cnic: /^[0-9]{5}-[0-9]{7}-[0-9]$/,
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        phone: /^(\+92|0)?[0-9]{10}$/,
        amounts: {
            min: 1000,
            max: 100000000 // 100M PKR
        }
    },

    // Department Configuration
    departments: [
        'PB',           // Personal Banking
        'SPU',          // Special Processing Unit
        'COPS',         // Central Operations
        'EAMVU',        // External Agency Management & Vendor Unit
        'CIU',          // Credit Investigation Unit
        'RRU',          // Risk Review Unit
        'RISK',         // Risk Management
        'COMPLIANCE',   // Compliance Department
        'ADMIN'         // System Administration
    ],

    // User Roles
    roles: {
        SUPER_ADMIN: {
            level: 100,
            permissions: ['*']
        },
        ADMIN: {
            level: 90,
            permissions: ['read', 'write', 'delete', 'approve']
        },
        BRANCH_MANAGER: {
            level: 80,
            permissions: ['read', 'write', 'approve']
        },
        DEPARTMENT_HEAD: {
            level: 70,
            permissions: ['read', 'write', 'review']
        },
        SENIOR_OFFICER: {
            level: 60,
            permissions: ['read', 'write']
        },
        OFFICER: {
            level: 50,
            permissions: ['read', 'write']
        },
        JUNIOR_OFFICER: {
            level: 40,
            permissions: ['read']
        },
        VIEWER: {
            level: 10,
            permissions: ['read']
        }
    }
};

// Validation function
securityConfig.validate = function() {
    const required = [
        'JWT_ACCESS_SECRET',
        'JWT_REFRESH_SECRET', 
        'ENCRYPTION_KEY',
        'SESSION_SECRET'
    ];

    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
        throw new Error(`Missing required security environment variables: ${missing.join(', ')}`);
    }

    console.log('✅ Security configuration validated successfully');
    return true;
};

module.exports = securityConfig;
