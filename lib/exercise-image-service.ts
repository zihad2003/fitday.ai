const EXTERNAL_DB_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json'
const IMAGE_BASE_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/'

/**
 * Fetches the GIF URL for a given exercise name from the open-source database.
 */
export async function fetchExerciseImage(exerciseName: string): Promise<string | null> {
    try {
        const response = await fetch(EXTERNAL_DB_URL)
        if (!response.ok) return null
        const exercises = await response.json()

        // Clean the input name (remove "Barbell", "Dumbbell" if needed for better match?)
        // actually simple inclusion check is robust enough for now
        const normalizedInput = exerciseName.toLowerCase()

        const match = exercises.find((ex: any) =>
            ex.name.toLowerCase().includes(normalizedInput) ||
            normalizedInput.includes(ex.name.toLowerCase())
        )

        if (match && match.images && match.images.length > 0) {
            return `${IMAGE_BASE_URL}${match.images[0]}`
        }
        return null
    } catch (e) {
        console.error("Failed to fetch exercise image", e)
        return null
    }
}
