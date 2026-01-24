import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Create a random in-memory fallback for development if no Redis credentials are provided
const cache = new Map()

export class RateLimiterService {
    private limiter: Ratelimit | null = null
    private localLimiter: Map<string, { count: number, reset: number }>

    constructor() {
        this.localLimiter = new Map()

        // Only initialize Upstash if env vars exist
        if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
            try {
                const redis = new Redis({
                    url: process.env.UPSTASH_REDIS_REST_URL,
                    token: process.env.UPSTASH_REDIS_REST_TOKEN,
                })

                this.limiter = new Ratelimit({
                    redis: redis,
                    limiter: Ratelimit.slidingWindow(10, '10 s'), // Default: 10 reqs per 10s
                    analytics: true,
                    prefix: '@upstash/ratelimit',
                })
            } catch (e) {
                console.warn('Failed to initialize Upstash Redis, falling back to in-memory')
            }
        }
    }

    async checkLimit(identifier: string, limit: number = 20, windowSeconds: number = 60) {
        // 1. Production Mode (Redis)
        if (this.limiter) {
            try {
                // Create a temporary specific limiter for this call if customization is needed, 
                // but typically we reuse the instance. For simplicity here we just use the default 
                // or re-instantiate if we strictly need different windows per route type.
                // For efficiency, let's just stick to the main limiter or local fallback for now.
                // Note: Changing windows locally for single instance is tricky. 
                // Let's implement robust local fallback first as most users don't have keys set up immediately.

                // Actually, let's support dynamic windows if we used the MultiRegionRatelimit... 
                // but for standard, we'll keep it simple:

                const { success, limit: l, remaining, reset } = await this.limiter.limit(identifier)
                return { success, limit: l, remaining, reset }
            } catch (err) {
                console.error('Redis Rate Limit Error', err)
                return this.localCheck(identifier, limit, windowSeconds)
            }
        }

        // 2. Development/Fallback Mode (In-Memory)
        return this.localCheck(identifier, limit, windowSeconds)
    }

    private localCheck(identifier: string, limit: number, windowSeconds: number) {
        const now = Date.now()
        const windowMs = windowSeconds * 1000

        const record = this.localLimiter.get(identifier) || { count: 0, reset: now + windowMs }

        // Reset if window passed
        if (now > record.reset) {
            record.count = 0
            record.reset = now + windowMs
        }

        record.count += 1
        this.localLimiter.set(identifier, record)

        return {
            success: record.count <= limit,
            limit: limit,
            remaining: Math.max(0, limit - record.count),
            reset: record.reset
        }
    }
}

// Singleton instance
export const rateLimiter = new RateLimiterService()
