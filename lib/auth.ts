// lib/auth.ts - Security & Session Utils
export const runtime = 'edge';

/**
 * SECURITY: Hash password with salt using Web Crypto API
 */
export async function hashPassword(password: string, salt: string) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password + salt),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );

  // Using a fixed application salt for PBKDF2 + user specific salt
  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: enc.encode("fitday_secure_app_salt"),
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    256
  );

  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export function generateSalt() {
  return crypto.randomUUID();
}

/**
 * Session Management
 */
export function saveUserSession(user: any) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('fitday_user', JSON.stringify(user));
  }
}

export function getUserSession() {
  if (typeof window !== 'undefined') {
    try {
      const data = localStorage.getItem('fitday_user');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }
  return null;
}

export function logoutUser() {
  if (typeof window !== 'undefined') localStorage.removeItem('fitday_user');
  window.location.href = '/login';
}