/**
 * Nutrition API Integration
 * Primarily uses Edamam or Nutritionix for food data
 */

export interface ExternalFood {
    label: string
    calories: number
    protein: number
    fat: number
    carbs: number
    image?: string
    brand?: string
}

export async function searchFood(query: string): Promise<ExternalFood[]> {
    const appId = process.env.EDAMAM_APP_ID
    const appKey = process.env.EDAMAM_APP_KEY

    if (!appId || !appKey) {
        console.warn('EDAMAM credentials not found. Using mock fallback.')
        return [
            {
                label: `Mock: ${query}`,
                calories: 150,
                protein: 10,
                fat: 5,
                carbs: 20,
            }
        ]
    }

    try {
        const response = await fetch(
            `https://api.edamam.com/api/food-database/v2/parser?app_id=${appId}&app_key=${appKey}&ingr=${encodeURIComponent(query)}`
        )

        if (!response.ok) throw new Error('Nutrition API request failed')

        const data = await response.json() as any

        return data.hints.map((h: any) => ({
            label: h.food.label,
            calories: h.food.nutrients.ENERC_KCAL || 0,
            protein: h.food.nutrients.PROCNT || 0,
            fat: h.food.nutrients.FAT || 0,
            carbs: h.food.nutrients.CHOCDF || 0,
            image: h.food.image,
            brand: h.food.brand
        }))
    } catch (error) {
        console.error('Food search failed:', error)
        return []
    }
}
