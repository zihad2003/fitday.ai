// lib/auth.ts - Robust Session Management

/**
 * ইউজার সেশন লোকাল স্টোরেজে সেভ করে
 * @param user - ইউজার অবজেক্ট
 */
export function saveUserSession(user: any) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('fitday_user', JSON.stringify(user))
    } catch (error) {
      console.warn('Error saving session:', error)
    }
  }
}

/**
 * সেভ করা সেশন ডাটা নিয়ে আসে (Error Handling সহ)
 * @returns ইউজার অবজেক্ট অথবা null
 */
export function getUserSession() {
  if (typeof window !== 'undefined') {
    try {
      const data = localStorage.getItem('fitday_user')
      
      // ডাটা না থাকলে বা "undefined" স্ট্রিং থাকলে null রিটার্ন করবে
      if (!data || data === 'undefined') return null

      // JSON পার্স করার চেষ্টা করবে
      return JSON.parse(data)
    } catch (error) {
      // ডাটা ভুল থাকলে এখানে ধরবে এবং লাল স্ক্রিন এড়াতে console.warn ব্যবহার করা হলো
      console.warn('Session data corrupted. Clearing storage.')
      
      // ভুল ডাটা মুছে ফেলবে
      localStorage.removeItem('fitday_user')
      return null
    }
  }
  return null
}

/**
 * ইউজারকে লগআউট করে এবং লগিন পেজে পাঠায়
 */
export function logoutUser() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('fitday_user')
    } catch (error) {
      console.warn('Error clearing session:', error)
    }
    // লগআউট হওয়ার পর লগিন পেজে রিডাইরেক্ট
    window.location.href = '/login'
  }
}