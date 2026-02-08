import { query, mutate } from './database'

export type SubscriptionPlan = 'free' | 'premium'

export interface UserSubscription {
    plan_type: SubscriptionPlan
    ai_credits: number
    subscription_end_date: string | null
}

const PREMIUM_CREDITS = 999999 // Unlimited effectively

export const SubscriptionService = {
    async getUserSubscription(userId: number): Promise<UserSubscription> {
        const res = await query('SELECT plan_type, ai_credits, subscription_end_date FROM users WHERE id = ?', [userId])
        const user = res.data?.[0] as any

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
        const sub = await this.getUserSubscription(userId)

        if (sub.plan_type === 'premium') {
            return { allowed: true, remaining: PREMIUM_CREDITS }
        }

        if (sub.ai_credits > 0) {
            await mutate('UPDATE users SET ai_credits = ai_credits - 1 WHERE id = ?', [userId])
            return { allowed: true, remaining: sub.ai_credits - 1 }
        }

        return { allowed: false, remaining: 0 }
    },

    async upgradeToPremium(userId: number) {
        // Set plan to premium and give unlimited credits
        // In a real app, verify payment here
        await mutate(`
            UPDATE users 
            SET plan_type = 'premium', 
                ai_credits = 1000,
                subscription_end_date = date('now', '+1 month') 
            WHERE id = ?
        `, [userId])
    }
}
