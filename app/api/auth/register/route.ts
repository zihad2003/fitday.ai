import { NextRequest, NextResponse } from 'next/server'
import { selectQuery, executeMutation } from '@/lib/d1'
import { calculateBMR, calculateTDEE, calculateMacros } from '@/lib/nutrition'
import { hashPassword, generateSalt } from '@/lib/auth'

export const runtime = 'edge';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, password, name, gender, age, height, weight, goal, activity_level = 'sedentary' } = body as any

        if (!email || !password || !name || !age || !height || !weight || !goal) {
            return NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 })
        }

// 1. Check Duplicates
        let existingUsers;
        try {
            existingUsers = await selectQuery('SELECT id FROM users WHERE email = ?', [email])
        } catch (dbError) {
            console.error('Database query error:', dbError)
            return NextResponse.json({ success: false, error: 'Database connection error' }, { status: 500 })
        }

        if (!existingUsers) {
            return NextResponse.json({ success: false, error: 'Database Connection Error' }, { status: 503 })
        }

        if (existingUsers.length > 0) {
            return NextResponse.json({ success: false, error: 'Email already exists' }, { status: 409 })
        }

        // 2. Compute Nutrition Profile
        let targetCalories = 2000;
        try {
            const bmr = calculateBMR(gender, weight, height, age)
            const tdee = calculateTDEE(bmr, activity_level)
            const macros = calculateMacros(tdee, goal)
            targetCalories = macros.targetCalories
        } catch (e) {
            console.warn("Nutrition calc failed, using defaults")
        }

        // 3. Security: Hash Password
        // Storing as "salt:hash" in the password column
        const salt = generateSalt();
        const hashedPassword = await hashPassword(password, salt);
        const storedPassword = `${salt}:${hashedPassword}`;

        // 4. Save to DB
        const sql = `
      INSERT INTO users (email, password, name, gender, age, height_cm, weight_kg, activity_level, goal, target_calories)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
        const params = [
            email,
            storedPassword,
            name,
            gender,
            age,
            height,
            weight,
            activity_level,
            goal,
            targetCalories
        ]

        let changes;
        try {
            changes = await executeMutation(sql, params)
        } catch (dbError) {
            console.error('Database insertion error:', dbError)
            return NextResponse.json({ success: false, error: 'Failed to create user record' }, { status: 500 })
        }

if (changes > 0) {
            // Fetch user to return ID (important for session)
            let userResult;
            try {
                userResult = await selectQuery('SELECT * FROM users WHERE email = ?', [email])
                if (userResult && userResult.length > 0) {
                    const { password, ...safeUser } = userResult[0]
                    return NextResponse.json({ success: true, data: safeUser }, { status: 201 })
                }
                return NextResponse.json({ success: true, message: 'User created' }, { status: 201 })
            } catch (fetchError) {
                console.error('Fetch user error:', fetchError)
                return NextResponse.json({ success: true, message: 'User created successfully' }, { status: 201 })
            }
        } else {
            return NextResponse.json({ success: false, error: 'Failed to create user in database' }, { status: 500 })
        }

    } catch (error: any) {
        console.error('Registration Error:', error)
        return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
