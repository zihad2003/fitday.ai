import { selectQuery } from './d1';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export class ChatService {
    private static model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    private static embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });

    /**
     * Search food logs based on a query using standard text search in D1
     */
    static async searchLogs(userId: string, query: string) {
        // D1 doesn't support vector search yet, so we'll use a simple LIKE match or just get recent logs
        const results = await selectQuery(
            'SELECT food_name, calories, created_at FROM meals WHERE user_id = ? AND food_name LIKE ? ORDER BY created_at DESC LIMIT 5',
            [userId, `%${query}%`]
        );
        return results || [];
    }

    /**
     * Log food is now handled by standard API routes using D1, 
     * but we keep the method signature for compatibility if needed.
     */
    static async logFoodWithEmbedding(userId: string, foodData: any) {
        console.log("D1 migration: logging handled via /api/meals");
    }

    /**
     * Chat with the coach
     */
    static async askCoach(userId: string, question: string, stats: { dailyLimit: number, consumed: number }) {
        const logs = await this.searchLogs(userId, question);
        const context = logs.map((l: any) => `- ${l.food_name}: ${l.calories}kcal (${new Date(l.created_at).toLocaleDateString()})`).join('\n');

        const prompt = `
      You are the "FitDay AI Coach", an expert nutritionist for the Bangladeshi market.
      The user's daily calorie limit is ${stats.dailyLimit} kcal.
      So far today, they have consumed ${stats.consumed} kcal.
      Remaining: ${stats.dailyLimit - stats.consumed} kcal.

      Recent food logs from the user:
      ${context}

      User Question: "${question}"

      Provide a helpful, concise response in a friendly tone. Suggest Bangladeshi alternatives (like Ruti and Beef Bhuna) if the user's choice is too high in calories.
      Mention their remaining calories.
    `;

        const result = await this.model.generateContent(prompt);
        return result.response.text();
    }
}
