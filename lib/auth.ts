// lib/auth.ts - Backward compatibility wrapper for the new auth-utils system
import { hashPassword as newHashPassword, verifyPassword as newVerifyPassword, generateSalt as newGenerateSalt } from './auth-utils'

/**
 * BACKWARD COMPATIBILITY LAYER
 * 
 * These functions wrap the new auth utilities to ensure 
 * existing code continues to work seamlessly.
 */

export async function hashPassword(password: string, salt: string) {
  return await newHashPassword(password, salt)
}

export async function verifyPassword(password: string, storedPassword: string) {
  return await newVerifyPassword(password, storedPassword)
}

export function generateSalt() {
  return newGenerateSalt()
}

/**
 * Client-side user session persistence
 * (Saves to localStorage for UI state)
 */
export function saveUserSession(user: any) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('fitday_user', JSON.stringify(user))
  }
}

export function getUserSession() {
  if (typeof window !== 'undefined') {
    try {
      const data = localStorage.getItem('fitday_user')
      return data ? JSON.parse(data) : null
    } catch {
      return null
    }
  }
  return null
}

export async function logoutUser() {
  if (typeof window !== 'undefined') {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (e) {
      console.error("Logout failed", e)
    }
    localStorage.removeItem('fitday_user')
    window.location.href = '/login'
  }
}