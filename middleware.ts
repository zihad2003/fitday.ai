import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/lib/session'

// Define protected routes
const protectedRoutes = ['/dashboard', '/profile', '/checklist', '/workout']
const publicRoutes = ['/login', '/register', '/']

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname
    const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))
    const isPublicRoute = publicRoutes.includes(path)

    // 1. CSRF Protection: Verify Origin for mutations
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
        const origin = request.headers.get('origin')
        const host = request.headers.get('host')
        if (origin && host && !origin.includes(host)) {
            return new NextResponse(JSON.stringify({ success: false, error: 'CSRF Validation Failed' }), { status: 403, headers: { 'Content-Type': 'application/json' } })
        }
    }

    // 2. Rate Limiting (API Routes Only)
    if (path.startsWith('/api')) {
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('cf-connecting-ip') || '127.0.0.1'
        const isAuthRoute = path.startsWith('/api/auth')

        // Stricter limits for auth routes (5 reqs/min), generous for others (100 reqs/min)
        const limit = isAuthRoute ? 5 : 100
        const window = 60

        try {
            // Import dynamically to avoid edge runtime issues if complex node modules used, though upstash is edge safe
            const { rateLimiter } = await import('@/lib/rate-limit')
            const result = await rateLimiter.checkLimit(ip, limit, window)

            if (!result.success) {
                return new NextResponse(JSON.stringify({ success: false, error: 'Too Many Requests' }), {
                    status: 429,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-RateLimit-Limit': result.limit.toString(),
                        'X-RateLimit-Remaining': result.remaining.toString()
                    }
                })
            }
        } catch (e) {
            console.error('Rate limit check failed', e)
            // Fail open if rate limiter errors
        }
    }

    // 3. Auth: Get session from cookie
    const cookie = request.cookies.get('session')?.value
    const session = cookie ? await decrypt(cookie) : null

    // Redirect to login if accessing protected route without session
    if (isProtectedRoute && !session?.user) {
        return NextResponse.redirect(new URL('/login', request.nextUrl))
    }

    // Redirect to dashboard if accessing public route (like login) while authenticated
    // (Optional, good UX)
    if (isPublicRoute && session?.user && path !== '/') {
        return NextResponse.redirect(new URL('/dashboard', request.nextUrl))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
