import { getDb } from './db'

export type SubscriptionPlan = 'free' | 'premium'

export interface UserSubscription {
    plan_type: SubscriptionPlan
    ai_credits: number
    subscription_end_date: string | null
}

const PREMIUM_COST_BDT = 299 // 299 Taka ~ $2.50
const PREMIUM_CREDITS = 999999 // Unlimited effectively

export const SubscriptionService = {
    async getUserSubscription(userId: number): Promise<UserSubscription> {
        const db = getDb()
        const user = await db.prepare('SELECT plan_type, ai_credits, subscription_end_date FROM users WHERE id = ?').bind(userId).first()

        if (!user) {
            return { plan_type: 'free', ai_credits: 0, subscription_end_date: null }
        }

        return {
            plan_type: (user.plan_type as SubscriptionPlan) || 'free',
            ai_credits: (user.ai_credits as number) ?? 3,
            subscription_end_date: (user.subscription_end_date as string) || null
        }
    },

    async consumeCredit(userId: number): Promise<{ allowed: boolean, remaining: number }> {
        const db = getDb()
        const sub = await this.getUserSubscription(userId)

        if (sub.plan_type === 'premium') {
            return { allowed: true, remaining: PREMIUM_CREDITS }
        }

        if (sub.ai_credits > 0) {
            await db.prepare('UPDATE users SET ai_credits = ai_credits - 1 WHERE id = ?').bind(userId).run()
            return { allowed: true, remaining: sub.ai_credits - 1 }
        }

        return { allowed: false, remaining: 0 }
    },

    async upgradeToPremium(userId: number) {
        const db = getDb()
        // Set plan to premium and give unlimited credits
        // In a real app, verify payment here
        await db.prepare(`
            UPDATE users 
            SET plan_type = 'premium', 
                ai_credits = 1000,
                subscription_end_date = date('now', '+1 month') 
            WHERE id = ?
        `).bind(userId).run()
    }
}
