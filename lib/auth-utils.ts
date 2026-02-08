// lib/auth-utils.ts - Clean Authentication Utilities
import { User } from '@/lib/types'

/**
 * AUTHENTICATION UTILITIES
 * 
 * Simple, secure password hashing and verification
 * Using PBKDF2 with 100,000 iterations
 */

/**
 * Generate a random salt
 */
export function generateSalt(): string {
    return crypto.randomUUID()
}

/**
 * Hash a password with salt
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
    const encoder = new TextEncoder()
    const pepper = process.env.APP_SECRET || 'fitday-default-secret'

    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password + pepper),
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
    )

    const hashBuffer = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: encoder.encode(salt),
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        256
    )

    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Verify password against stored hash
 * 
 * @param password - Plain text password
 * @param storedHash - Stored hash in format "salt:hash"
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
    try {
        const [salt, hash] = storedHash.split(':')
        if (!salt || !hash) {
            console.error('[Auth] Invalid password hash format')
            return false
        }

        const computedHash = await hashPassword(password, salt)
        return computedHash === hash
    } catch (error) {
        console.error('[Auth] Password verification error:', error)
        return false
    }
}

/**
 * Create password hash for storage
 * 
 * @param password - Plain text password
 * @returns Hash in format "salt:hash"
 */
export async function createPasswordHash(password: string): Promise<string> {
    const salt = generateSalt()
    const hash = await hashPassword(password, salt)
    return `${salt}:${hash}`
}

/**
 * Remove sensitive fields from user object
 */
export function sanitizeUser(user: User): User {
    const { password_hash, ...safeUser } = user
    return safeUser as User
}
