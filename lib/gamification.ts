/**
 * Gamification Service
 * Handles streaks and achievement logic
 */

import { query, mutate } from './database'

export class GamificationService {
    /**
     * Update user streak based on activity
     */
    static async updateStreak(userId: number) {
        const today = new Date().toISOString().split('T')[0]
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

        // Get current streak data
        const streakRes = await query('SELECT * FROM user_streaks WHERE user_id = ?', [userId])
        const streakData = streakRes.data?.[0] as any

        if (!streakData) {
            // First time tracking streak
            await mutate(`
                INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_activity_date)
                VALUES (?, 1, 1, ?)
            `, [userId, today])
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

        await mutate(`
            UPDATE user_streaks SET 
                current_streak = ?, 
                longest_streak = ?, 
                last_activity_date = ?, 
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
        `, [newStreak, newLongest, today, userId])

        // Check for streak-based achievements
        try {
            await this.checkAchievements(userId, 'streak_days', newStreak)
        } catch (e) {
            console.error("Failed to check achievements", e)
        }

        return { current: newStreak, longest: newLongest }
    }

    /**
     * Check and award achievements
     */
    static async checkAchievements(userId: number, type: string, value: number) {
        // Find achievements of this type that the user doesn't have yet
        const pendingRes = await query(`
            SELECT * FROM achievement_library 
            WHERE requirement_type = ? AND requirement_value <= ?
            AND id NOT IN (SELECT achievement_id FROM user_achievements WHERE user_id = ?)
        `, [type, value, userId])

        const pendingAchievements = pendingRes.data || []

        for (const ach of pendingAchievements as any[]) {
            await mutate(`
                INSERT OR IGNORE INTO user_achievements (user_id, achievement_id)
                VALUES (?, ?)
            `, [userId, ach.id])

            // In a real app, we'd trigger a notification here
            console.log(`User ${userId} earned achievement: ${ach.name}`)
        }
    }

    /**
     * Fetch user progress summary
     */
    static async getProgressSummary(userId: number) {
        const streakRes = await query("SELECT current_streak, longest_streak FROM user_streaks WHERE user_id = ?", [userId])
        const streak = streakRes.data?.[0] as any

        const achievementRes = await query(`
            SELECT al.*, ua.earned_at
            FROM user_achievements ua
            JOIN achievement_library al ON ua.achievement_id = al.id
            WHERE ua.user_id = ?
            ORDER BY ua.earned_at DESC
        `, [userId])

        const achievements = achievementRes.data || []

        return {
            streak: streak || { current_streak: 0, longest_streak: 0 },
            achievements
        }
    }
}
