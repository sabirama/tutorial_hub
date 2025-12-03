import bcrypt from 'bcrypt';

// Salt rounds - higher is more secure but slower
const SALT_ROUNDS = 12;

export class AuthUtils {
    
    /**
     * Hash a password
     * @param {string} password - Plain text password
     * @returns {Promise<string>} Hashed password
     */
    static async hashPassword(password) {
        try {
            if (!password || typeof password !== 'string') {
                throw new Error('Password must be a non-empty string');
            }
            
            if (password.length < 6) {
                throw new Error('Password must be at least 6 characters long');
            }
            
            const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
            return hashedPassword;
        } catch (error) {
            console.error('Password hashing error:', error);
            throw new Error('Failed to hash password');
        }
    }
    
    /**
     * Compare plain text password with hashed password
     * @param {string} password - Plain text password
     * @param {string} hashedPassword - Hashed password from database
     * @returns {Promise<boolean>} True if passwords match
     */
    static async verifyPassword(password, hashedPassword) {
        try {
            if (!password || !hashedPassword) {
                throw new Error('Password and hashed password are required');
            }
            
            const isMatch = await bcrypt.compare(password, hashedPassword);
            return isMatch;
        } catch (error) {
            console.error('Password verification error:', error);
            throw new Error('Failed to verify password');
        }
    }
    
    /**
     * Check if password meets strength requirements
     * @param {string} password - Password to validate
     * @returns {Object} Validation result
     */
    static validatePasswordStrength(password) {
        const requirements = {
            minLength: password.length >= 8,
            hasUpperCase: /[A-Z]/.test(password),
            hasLowerCase: /[a-z]/.test(password),
            hasNumbers: /\d/.test(password),
            hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };
        
        const isValid = Object.values(requirements).every(Boolean);
        const score = Object.values(requirements).filter(Boolean).length;
        
        return {
            isValid,
            score,
            requirements,
            suggestions: !isValid ? [
                !requirements.minLength && 'At least 8 characters',
                !requirements.hasUpperCase && 'One uppercase letter',
                !requirements.hasLowerCase && 'One lowercase letter',
                !requirements.hasNumbers && 'One number',
                !requirements.hasSpecialChar && 'One special character'
            ].filter(Boolean) : []
        };
    }
    
    /**
     * Generate a random temporary password
     * @param {number} length - Length of password (default: 12)
     * @returns {string} Random password
     */
    static generateTempPassword(length = 12) {
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        let password = '';
        
        // Ensure at least one of each required character type
        password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
        password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
        password += '0123456789'[Math.floor(Math.random() * 10)];
        password += '!@#$%^&*'[Math.floor(Math.random() * 8)];
        
        // Fill the rest randomly
        for (let i = password.length; i < length; i++) {
            password += charset[Math.floor(Math.random() * charset.length)];
        }
        
        // Shuffle the password
        return password.split('').sort(() => Math.random() - 0.5).join('');
    }
}

export default AuthUtils;