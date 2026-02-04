/**
 * ExerciseDB Integration
 * Fetches exercises from RapidAPI
 */

export interface ExternalExercise {
    id: string
    name: string
    target: string
    bodyPart: string
    equipment: string
    gifUrl: string
    instructions: string[]
}

export async function searchExercises(query: string): Promise<ExternalExercise[]> {
    const apiKey = process.env.EXERCISE_DB_API_KEY
    const apiHost = 'exercisedb.p.rapidapi.com'

    if (!apiKey) {
        console.warn('EXERCISE_DB_API_KEY not found. Using mock fallback.')
        return [
            {
                id: '0001',
                name: `Mock: ${query}`,
                target: 'full body',
                bodyPart: 'waist',
                equipment: 'body weight',
                gifUrl: 'https://edamam-product-images.s3.amazonaws.com/web-img/e12/e12ca00160a221f7362a26563604b31c.jpg', // Dummy
                instructions: ['Step 1: Start', 'Step 2: Continue', 'Step 3: Finish']
            }
        ]
    }

    try {
        const response = await fetch(`https://${apiHost}/exercises/name/${query.toLowerCase()}`, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': apiKey,
                'X-RapidAPI-Host': apiHost
            }
        })

        if (!response.ok) throw new Error('ExerciseDB request failed')

        return await response.json()
    } catch (error) {
        console.error('ExerciseDB search failed:', error)
        return []
    }
}
