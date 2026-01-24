// lib/auth.ts - Security & Session Utils

/**
 * SECURITY: Hash password with salt using Web Crypto API
 */
export async function hashPassword(password: string, salt: string) {
  const enc = new TextEncoder();

  // OPTIONAL: Add a server-side "pepper" from env vars
  const pepper = process.env.APP_SECRET || "";

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password + pepper),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );

  // Use the unique user salt for the PBKDF2 derivation
  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: enc.encode(salt), // CRITICAL FIX: Use the actual user salt
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

/**
 * SECURITY: Verify password against stored hash
 */
export async function verifyPassword(password: string, storedPassword: string): Promise<boolean> {
  try {
    // Extract salt from stored password (format: salt:hash)
    const [salt, hash] = storedPassword.split(':');

    if (!salt || !hash) {
      return false;
    }

    // Hash the provided password with the same salt
    const hashedPassword = await hashPassword(password, salt);

    // Compare the hashes
    return hashedPassword === hash;
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
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

export async function logoutUser() {
  if (typeof window !== 'undefined') {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error("Logout failed", e);
    }
    localStorage.removeItem('fitday_user'); // Clean up just in case
    window.location.href = '/login';
  }
}