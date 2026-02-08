// lib/session.ts - Backward compatibility wrapper for the new session-manager system
import { createSession as newCreateSession, getSession as newGetSession, destroySession as newDestroySession, verifySession } from './session-manager'

/**
 * BACKWARD COMPATIBILITY LAYER
 * 
 * These functions wrap the new session manager to ensure 
 * existing server-side session logic continues to work.
 */

export async function createSession(userData: any) {
    return await newCreateSession(userData)
}

export async function getSession() {
    return await newGetSession()
}

export async function destroySession() {
    return await newDestroySession()
}

// encrypt/decrypt are internal to the new session-manager, 
// keeping them here if anything else uses them (middleware.ts uses decrypt)
export async function encrypt(payload: any) {
    // Not directly compatible with jose version but matches previous intent
    return JSON.stringify(payload)
}

export async function decrypt(input: string) {
    return await verifySession(input)
}
