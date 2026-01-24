import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserProfile {
    id: number
    email: string
    name: string
    gender: string
    age: number
    goal: string
    target_calories: number
}

interface UserState {
    user: UserProfile | null
    isAuthenticated: boolean
    isLoading: boolean
    setUser: (user: UserProfile) => void
    logout: () => void
    setLoading: (loading: boolean) => void
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isLoading: true, // Start loading by default to check session
            setUser: (user) => set({ user, isAuthenticated: true, isLoading: false }),
            logout: () => set({ user: null, isAuthenticated: false, isLoading: false }),
            setLoading: (loading) => set({ isLoading: loading })
        }),
        {
            name: 'fitday-user-storage',
            partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }), // Don't persist loading state
        }
    )
)
