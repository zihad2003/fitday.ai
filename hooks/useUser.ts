import { useQuery } from '@tanstack/react-query'
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'next/navigation'

interface UserProfile {
    id: number
    email: string
    name: string
    gender: string
    age: number
    height_cm: number
    weight_kg: number
    goal: string
    activity_level: string
    target_calories: number
}

interface ApiResponse {
    success: boolean
    data?: UserProfile
    error?: string
}

export function useUser() {
    const router = useRouter()
    const { user, setUser, logout, setLoading } = useUserStore()

    const query = useQuery({
        queryKey: ['user', 'session'],
        queryFn: async (): Promise<UserProfile> => {
            const res = await fetch('/api/auth/me')

            if (!res.ok) {
                if (res.status === 401) {
                    logout()
                    router.push('/login')
                }
                throw new Error('Failed to fetch user session')
            }

            const data = (await res.json()) as ApiResponse

            if (!data.success || !data.data) {
                logout()
                router.push('/login')
                throw new Error('Invalid session')
            }

            setUser(data.data)
            return data.data
        },
        retry: 1,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })

    return {
        user: query.data || user,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    }
}
