// lib/d1.ts - Cloudflare D1 Database Connection
// This file provides functions to interact with Cloudflare D1 database via REST API

const D1_DB_ID = process.env.NEXT_PUBLIC_D1_DB || '42dfee08-f14f-4e08-938d-6fdebab4700e'
const ACCOUNT_ID = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID!
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN! // This should be a secret, not NEXT_PUBLIC

const D1_API_BASE = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${D1_DB_ID}`

// Mock data for development when D1 is not available
const mockUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    gender: 'male',
    age: 30,
    height: 175,
    weight: 75,
    goal: 'lose_weight',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]

const mockWorkouts = [
  {
    id: 1,
    user_id: 1,
    date: new Date().toISOString().split('T')[0],
    workout_type: 'Morning Cardio',
    exercises: 'Running, Jumping Jacks, Push-ups',
    completed: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]

const mockMeals = [
  {
    id: 1,
    user_id: 1,
    date: new Date().toISOString().split('T')[0],
    meal_type: 'breakfast',
    food: 'Oatmeal with berries and nuts',
    completed: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    user_id: 1,
    date: new Date().toISOString().split('T')[0],
    meal_type: 'lunch',
    food: 'Grilled chicken salad',
    completed: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]

let useMockData = !ACCOUNT_ID || !API_TOKEN || ACCOUNT_ID === 'YOUR_CLOUDFLARE_ACCOUNT_ID'

/**
 * Execute a SQL query on the D1 database
 * @param sql - The SQL query string
 * @param params - Optional parameters for prepared statements
 * @returns Promise with query results
 */
export async function executeQuery(sql: string, params: any[] = []) {
  if (useMockData) {
    // Return mock data for development
    return mockExecuteQuery(sql, params)
  }

  const response = await fetch(`${D1_API_BASE}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sql,
      params,
    }),
  })

  if (!response.ok) {
    throw new Error(`D1 Query failed: ${response.statusText}`)
  }

  const data = await response.json()
  return data
}

/**
 * Mock query execution for development
 */
function mockExecuteQuery(sql: string, params: any[] = []) {
  const lowerSql = sql.toLowerCase()

  if (lowerSql.includes('select') && lowerSql.includes('users')) {
    let results = [...mockUsers]

    // Apply filters
    if (params.length > 0) {
      const userId = params[0]
      results = results.filter(u => u.id === userId)
    }

    return {
      success: true,
      result: [{
        results,
        meta: { changes: results.length }
      }]
    }
  }

  if (lowerSql.includes('select') && lowerSql.includes('workouts')) {
    let results = [...mockWorkouts]

    // Apply filters
    if (params.length > 0) {
      if (lowerSql.includes('user_id = ?')) {
        results = results.filter(w => w.user_id === params[0])
      }
      if (lowerSql.includes('date = ?')) {
        results = results.filter(w => w.date === params[1])
      }
    }

    return {
      success: true,
      result: [{
        results,
        meta: { changes: results.length }
      }]
    }
  }

  if (lowerSql.includes('select') && lowerSql.includes('meals')) {
    let results = [...mockMeals]

    // Apply filters
    if (params.length > 0) {
      if (lowerSql.includes('user_id = ?')) {
        results = results.filter(m => m.user_id === params[0])
      }
      if (lowerSql.includes('date = ?')) {
        results = results.filter(m => m.date === params[1])
      }
    }

    return {
      success: true,
      result: [{
        results,
        meta: { changes: results.length }
      }]
    }
  }

  if (lowerSql.includes('insert into users')) {
    const newUser = {
      id: mockUsers.length + 1,
      ...params.reduce((acc, param, index) => {
        if (index === 0) acc.name = param
        if (index === 1) acc.email = param
        if (index === 2) acc.gender = param
        if (index === 3) acc.age = param
        if (index === 4) acc.height = param
        if (index === 5) acc.weight = param
        if (index === 6) acc.goal = param
        return acc
      }, {} as any),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    mockUsers.push(newUser)

    return {
      success: true,
      result: [{
        results: [],
        meta: { changes: 1, last_row_id: newUser.id }
      }]
    }
  }

  if (lowerSql.includes('insert into workouts')) {
    const newWorkout = {
      id: mockWorkouts.length + 1,
      user_id: params[0],
      date: params[1],
      workout_type: params[2],
      exercises: params[3],
      completed: params[4] ? true : false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    mockWorkouts.push(newWorkout)

    return {
      success: true,
      result: [{
        results: [],
        meta: { changes: 1, last_row_id: newWorkout.id }
      }]
    }
  }

  if (lowerSql.includes('insert into meals')) {
    const newMeal = {
      id: mockMeals.length + 1,
      user_id: params[0],
      date: params[1],
      meal_type: params[2],
      food: params[3],
      completed: params[4] ? true : false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    mockMeals.push(newMeal)

    return {
      success: true,
      result: [{
        results: [],
        meta: { changes: 1, last_row_id: newMeal.id }
      }]
    }
  }

  if (lowerSql.includes('update users')) {
    const userId = params[params.length - 1]
    const userIndex = mockUsers.findIndex(u => u.id === userId)
    if (userIndex >= 0) {
      // Apply updates (simplified)
      mockUsers[userIndex].updated_at = new Date().toISOString()
      return {
        success: true,
        result: [{
          results: [],
          meta: { changes: 1 }
        }]
      }
    }
  }

  if (lowerSql.includes('update workouts')) {
    const workoutId = params[params.length - 1]
    const workoutIndex = mockWorkouts.findIndex(w => w.id === workoutId)
    if (workoutIndex >= 0) {
      mockWorkouts[workoutIndex].updated_at = new Date().toISOString()
      return {
        success: true,
        result: [{
          results: [],
          meta: { changes: 1 }
        }]
      }
    }
  }

  if (lowerSql.includes('update meals')) {
    const mealId = params[params.length - 1]
    const mealIndex = mockMeals.findIndex(m => m.id === mealId)
    if (mealIndex >= 0) {
      mockMeals[mealIndex].updated_at = new Date().toISOString()
      return {
        success: true,
        result: [{
          results: [],
          meta: { changes: 1 }
        }]
      }
    }
  }

  if (lowerSql.includes('delete')) {
    return {
      success: true,
      result: [{
        results: [],
        meta: { changes: 1 }
      }]
    }
  }

  // Default response
  return {
    success: true,
    result: [{
      results: [],
      meta: { changes: 0 }
    }]
  }
}

/**
 * Helper function to execute SELECT queries and return results
 * @param sql - The SELECT SQL query
 * @param params - Optional parameters
 * @returns Array of result rows
 */
export async function selectQuery(sql: string, params: any[] = []): Promise<any[]> {
  const result = await executeQuery(sql, params)
  if (result.success && result.result && result.result[0]) {
    return result.result[0].results || []
  }
  return []
}

/**
 * Helper function to execute INSERT/UPDATE/DELETE queries
 * @param sql - The SQL query
 * @param params - Optional parameters
 * @returns Number of affected rows
 */
export async function executeMutation(sql: string, params: any[] = []): Promise<number> {
  const result = await executeQuery(sql, params)
  if (result.success && result.result && result.result[0]) {
    return result.result[0].meta?.changes || 0
  }
  return 0
}