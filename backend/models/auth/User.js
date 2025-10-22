/**
 * ILOS User Model
 * ===============
 * User authentication and authorization model for banking system
 */

const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');
const db = require('../../db1');
const securityConfig = require('../../config/security');

class User {
    constructor(userData) {
        Object.assign(this, userData);
    }

    /**
     * Create new user account
     */
    static async create(userData) {
        const {
            email,
            password,
            firstName,
            lastName,
            employeeId,
            department,
            role,
            phone,
            cnic,
            branchCode,
            createdBy
        } = userData;

        // Validate password strength
        if (!this.validatePassword(password)) {
            throw new Error('Password does not meet security requirements');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, securityConfig.password.saltRounds);

        const query = `
            INSERT INTO users (
                email, password_hash, first_name, last_name, employee_id,
                department, role, phone, cnic, branch_code, created_by,
                is_active, mfa_enabled, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
            RETURNING id, email, first_name, last_name, employee_id, department, role, is_active, created_at
        `;

        const values = [
            email.toLowerCase(),
            hashedPassword,
            firstName,
            lastName,
            employeeId,
            department,
            role,
            phone,
            cnic,
            branchCode,
            createdBy,
            true,  // is_active
            false  // mfa_enabled
        ];

        const result = await db.query(query, values);
        return new User(result.rows[0]);
    }

    /**
     * Find user by email
     */
    static async findByEmail(email) {
        const query = `
            SELECT id, email, password_hash, first_name, last_name, employee_id,
                   department, role, phone, cnic, branch_code, is_active, 
                   mfa_enabled, mfa_secret, failed_login_attempts, locked_until,
                   last_login_at, created_at, updated_at
            FROM users 
            WHERE email = $1
        `;
        
        const result = await db.query(query, [email.toLowerCase()]);
        return result.rows.length > 0 ? new User(result.rows[0]) : null;
    }

    /**
     * Find user by ID
     */
    static async findById(id) {
        const query = `
            SELECT id, email, first_name, last_name, employee_id,
                   department, role, phone, cnic, branch_code, is_active, 
                   mfa_enabled, last_login_at, created_at, updated_at
            FROM users 
            WHERE id = $1 AND is_active = true
        `;
        
        const result = await db.query(query, [id]);
        return result.rows.length > 0 ? new User(result.rows[0]) : null;
    }

    /**
     * Verify password
     */
    async verifyPassword(password) {
        return await bcrypt.compare(password, this.password_hash);
    }

    /**
     * Update password
     */
    async updatePassword(newPassword) {
        if (!User.validatePassword(newPassword)) {
            throw new Error('Password does not meet security requirements');
        }

        const hashedPassword = await bcrypt.hash(newPassword, securityConfig.password.saltRounds);
        
        const query = `
            UPDATE users 
            SET password_hash = $1, password_updated_at = NOW(), updated_at = NOW()
            WHERE id = $2
        `;
        
        await db.query(query, [hashedPassword, this.id]);
    }

    /**
     * Setup MFA
     */
    async setupMFA() {
        const secret = speakeasy.generateSecret({
            name: `${securityConfig.mfa.serviceName} (${this.email})`,
            issuer: securityConfig.mfa.issuer,
            length: 32
        });

        const query = `
            UPDATE users 
            SET mfa_secret = $1, updated_at = NOW()
            WHERE id = $2
        `;

        await db.query(query, [secret.base32, this.id]);

        return {
            secret: secret.base32,
            qrCode: secret.otpauth_url
        };
    }

    /**
     * Enable MFA
     */
    async enableMFA(token) {
        if (!this.mfa_secret) {
            throw new Error('MFA secret not set. Please setup MFA first.');
        }

        const verified = speakeasy.totp.verify({
            secret: this.mfa_secret,
            encoding: 'base32',
            token: token,
            window: securityConfig.mfa.windowSize
        });

        if (!verified) {
            throw new Error('Invalid MFA token');
        }

        const query = `
            UPDATE users 
            SET mfa_enabled = true, updated_at = NOW()
            WHERE id = $1
        `;

        await db.query(query, [this.id]);
        this.mfa_enabled = true;
    }

    /**
     * Verify MFA token
     */
    verifyMFA(token) {
        if (!this.mfa_enabled || !this.mfa_secret) {
            return false;
        }

        return speakeasy.totp.verify({
            secret: this.mfa_secret,
            encoding: 'base32',
            token: token,
            window: securityConfig.mfa.windowSize
        });
    }

    /**
     * Handle failed login attempt
     */
    async recordFailedLogin() {
        const query = `
            UPDATE users 
            SET failed_login_attempts = COALESCE(failed_login_attempts, 0) + 1,
                last_failed_login_at = NOW(),
                locked_until = CASE 
                    WHEN COALESCE(failed_login_attempts, 0) + 1 >= $1 
                    THEN NOW() + INTERVAL '${securityConfig.account.lockoutDuration} milliseconds'
                    ELSE locked_until
                END,
                updated_at = NOW()
            WHERE id = $2
        `;

        await db.query(query, [securityConfig.account.lockoutThreshold, this.id]);
    }

    /**
     * Handle successful login
     */
    async recordSuccessfulLogin() {
        const query = `
            UPDATE users 
            SET failed_login_attempts = 0,
                locked_until = NULL,
                last_login_at = NOW(),
                updated_at = NOW()
            WHERE id = $1
        `;

        await db.query(query, [this.id]);
    }

    /**
     * Check if account is locked
     */
    isLocked() {
        return this.locked_until && new Date(this.locked_until) > new Date();
    }

    /**
     * Get user permissions based on role
     */
    getPermissions() {
        const roleConfig = securityConfig.roles[this.role];
        return roleConfig ? roleConfig.permissions : ['read'];
    }

    /**
     * Check if user has permission
     */
    hasPermission(permission) {
        const permissions = this.getPermissions();
        return permissions.includes('*') || permissions.includes(permission);
    }

    /**
     * Check if user belongs to department
     */
    belongsToDepartment(department) {
        return this.department === department || this.role === 'SUPER_ADMIN';
    }

    /**
     * Validate password strength
     */
    static validatePassword(password) {
        const config = securityConfig.password;
        
        if (password.length < config.minLength || password.length > config.maxLength) {
            return false;
        }

        if (config.requireUppercase && !/[A-Z]/.test(password)) {
            return false;
        }

        if (config.requireLowercase && !/[a-z]/.test(password)) {
            return false;
        }

        if (config.requireNumbers && !/\d/.test(password)) {
            return false;
        }

        if (config.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            return false;
        }

        return true;
    }

    /**
     * Get safe user data (without sensitive fields)
     */
    toSafeObject() {
        const safe = { ...this };
        delete safe.password_hash;
        delete safe.mfa_secret;
        return safe;
    }
}

module.exports = User;
