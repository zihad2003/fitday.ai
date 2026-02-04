import { getRequestContext } from '@cloudflare/next-on-pages'

/**
 * Get Database Connection (D1)
 * Bangladesh's first AI biometric database
 */
export function getDb() {
    try {
        // 1. Try process.env (Standard Next.js dev with local vars)
        const envDB = (process.env as any).FITNESS_DB;
        if (envDB) return envDB;

        // 2. Try getRequestContext (Cloudflare Pages dev/prod)
        try {
            const ctx = getRequestContext();
            if (ctx && ctx.env && (ctx.env as any).FITNESS_DB) {
                return (ctx.env as any).FITNESS_DB;
            }
        } catch (err) { }

        // 3. Fallback/Mock for local dev if bindings are missing
        if (process.env.NODE_ENV !== 'production') {
            console.warn("⚠️ Database binding (FITNESS_DB) missing. Using limited mock interface.");
            return {
                prepare: (query: string) => ({
                    bind: (...params: any[]) => ({
                        run: async () => ({ success: true }),
                        all: async () => ({ results: [] }),
                        first: async () => null,
                    }),
                }),
            };
        }

        throw new Error("Database configuration error: FITNESS_DB not bound");
    } catch (e: any) {
        console.error("DB Initialization Error:", e.message);
        throw e;
    }
}
