/**
 * Gamification Service
 * Handles streaks and achievement logic
 */

import { getDb } from './db'

export class GamificationService {
    /**
     * Update user streak based on activity
     */
    static async updateStreak(userId: number) {
        const db = getDb()
        const today = new Date().toISOString().split('T')[0]
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

        // Get current streak data
        const streakData = await db.prepare("SELECT * FROM user_streaks WHERE user_id = ?").bind(userId).first() as any

        if (!streakData) {
            // First time tracking streak
            await db.prepare(`
                INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_activity_date)
                VALUES (?, 1, 1, ?)
            `).bind(userId, today).run()
            return { current: 1, longest: 1 }
        }

        if (streakData.last_activity_date === today) {
            // Already updated today
            return { current: streakData.current_streak, longest: streakData.longest_streak }
        }

        let newStreak = 1
        if (streakData.last_activity_date === yesterday) {
            newStreak = streakData.current_streak + 1
        }

        const newLongest = Math.max(newStreak, streakData.longest_streak)

        await db.prepare(`
            UPDATE user_streaks SET 
                current_streak = ?, 
                longest_streak = ?, 
                last_activity_date = ?, 
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
        `).bind(newStreak, newLongest, today, userId).run()

        // Check for streak-based achievements
        await this.checkAchievements(userId, 'streak_days', newStreak)

        return { current: newStreak, longest: newLongest }
    }

    /**
     * Check and award achievements
     */
    static async checkAchievements(userId: number, type: string, value: number) {
        const db = getDb()

        // Find achievements of this type that the user doesn't have yet
        const { results: pendingAchievements } = await db.prepare(`
            SELECT * FROM achievement_library 
            WHERE requirement_type = ? AND requirement_value <= ?
            AND id NOT IN (SELECT achievement_id FROM user_achievements WHERE user_id = ?)
        `).bind(type, value, userId).all()

        for (const ach of pendingAchievements as any[]) {
            await db.prepare(`
                INSERT OR IGNORE INTO user_achievements (user_id, achievement_id)
                VALUES (?, ?)
            `).bind(userId, ach.id).run()

            // In a real app, we'd trigger a notification here
            console.log(`User ${userId} earned achievement: ${ach.name}`)
        }
    }

    /**
     * Fetch user progress summary
     */
    static async getProgressSummary(userId: number) {
        const db = getDb()
        const streak = await db.prepare("SELECT current_streak, longest_streak FROM user_streaks WHERE user_id = ?").bind(userId).first() as any
        const { results: achievements } = await db.prepare(`
            SELECT al.*, ua.earned_at
            FROM user_achievements ua
            JOIN achievement_library al ON ua.achievement_id = al.id
            WHERE ua.user_id = ?
            ORDER BY ua.earned_at DESC
        `).bind(userId).all()

        return {
            streak: streak || { current_streak: 0, longest_streak: 0 },
            achievements
        }
    }
}
