// app/api/meals/generate/route.ts - Automatic Bangladeshi Diet Planner
import { NextRequest, NextResponse } from 'next/server'
import { selectQuery, executeMutation } from '@/lib/d1'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, date } = body

    if (!user_id || !date) {
      return NextResponse.json({ success: false, error: 'User ID and Date required' }, { status: 400 })
    }

    // ১. ইউজারের ক্যালোরি টার্গেট জানা
    const users = await selectQuery('SELECT target_calories, goal FROM users WHERE id = ?', [user_id])
    if (users.length === 0) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }
    const user = users[0]
    
    // টার্গেট না থাকলে ডিফল্ট ২০০০ ধরা হবে
    const dailyCalories = user.target_calories || 2000

    // ২. ক্যালোরি ডিস্ট্রিবিউশন (Bangladeshi Habit)
    // সকাল (২৫%), দুপুর (৩৫%), বিকেল (১৫%), রাত (২৫%)
    const targets = {
      breakfast: dailyCalories * 0.25,
      lunch: dailyCalories * 0.35,
      snack: dailyCalories * 0.15,
      dinner: dailyCalories * 0.25
    }

    // ৩. খাবার ডাটাবেস থেকে লোড করা
    const foods = await selectQuery('SELECT * FROM food_items')
    
    // ক্যাটাগরি অনুযায়ী খাবার আলাদা করা
    const carbs = foods.filter((f: any) => f.category === 'carb')
    const proteins = foods.filter((f: any) => f.category === 'protein')
    const veggies = foods.filter((f: any) => f.category === 'vegetable')
    const fruits = foods.filter((f: any) => f.category === 'fruit' || f.category === 'snack')

    // ৪. মিল প্ল্যান জেনারেট করার ফাংশন
    const generateMeal = (type: string, targetCal: number) => {
      let items: any[] = []
      let selectedCarb, selectedProtein, selectedVeg, selectedSnack

      // র‍্যান্ডম সিলেকশন লজিক
      const pick = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)]

      if (type === 'breakfast') {
        // সকাল: রুটি/পরোটা + ডিম/ভাজি
        selectedCarb = pick(carbs.filter((c: any) => c.name.includes('Ruti') || c.name.includes('Bread')))
        selectedProtein = pick(proteins.filter((p: any) => p.name.includes('Egg')))
        items.push(selectedCarb, selectedProtein)
      } 
      else if (type === 'lunch') {
        // দুপুর: ভাত + মাছ/মাংস + ডাল + সবজি
        selectedCarb = pick(carbs.filter((c: any) => c.name.includes('Rice')))
        selectedProtein = pick(proteins.filter((p: any) => !p.name.includes('Egg'))) // ডিম বাদে মাছ/মাংস
        selectedVeg = pick(veggies)
        
        // ডাল মাস্ট (বাঙালি লাঞ্চ)
        const dal = proteins.find((p: any) => p.name.includes('Dal'))
        
        items.push(selectedCarb, selectedProtein, selectedVeg)
        if (dal) items.push(dal)
      }
      else if (type === 'dinner') {
        // রাত: রুটি/হালকা ভাত + প্রোটিন + সবজি
        selectedCarb = pick(carbs) // ভাত বা রুটি
        selectedProtein = pick(proteins.filter((p: any) => !p.name.includes('Egg')))
        selectedVeg = pick(veggies)
        items.push(selectedCarb, selectedProtein, selectedVeg)
      }
      else {
        // স্ন্যাকস: ফল বা দই
        selectedSnack = pick(fruits)
        items.push(selectedSnack)
      }

      // null ভ্যালু ফিল্টার করা
      items = items.filter(i => i)

      // পরিমাণ (Quantity) অ্যাডজাস্টমেন্ট
      // সব আইটেমের মোট ক্যালোরি যোগ করে টার্গেটের সাথে মিলিয়ে পরিমাণ বাড়ানো/কমানো
      const totalBaseCal = items.reduce((sum, item) => sum + item.calories, 0)
      const multiplier = targetCal / totalBaseCal

      return items.map(item => {
        const quantity = Math.round(1 * multiplier * 10) / 10 // ১ ইউনিটের সাথে মাল্টিপ্লাই
        const desc = `${item.bangla_name || item.name} - ${quantity} serving(s)`
        
        return {
          user_id,
          date,
          meal_type: type,
          food: desc,
          calories: Math.round(item.calories * multiplier),
          completed: false
        }
      })
    }

    // ৫. প্ল্যান তৈরি
    const breakfast = generateMeal('breakfast', targets.breakfast)
    const lunch = generateMeal('lunch', targets.lunch)
    const snack = generateMeal('snack', targets.snack)
    const dinner = generateMeal('dinner', targets.dinner)

    const allMeals = [...breakfast, ...lunch, ...snack, ...dinner]

    // ৬. আগের প্ল্যান ডিলিট করা (একই দিনে ডুপ্লিকেট এড়াতে)
    await executeMutation('DELETE FROM meals WHERE user_id = ? AND date = ?', [user_id, date])

    // ৭. নতুন প্ল্যান ডাটাবেসে সেভ করা
    for (const meal of allMeals) {
      await executeMutation(
        'INSERT INTO meals (user_id, date, meal_type, food, completed) VALUES (?, ?, ?, ?, ?)',
        [meal.user_id, meal.date, meal.meal_type, meal.food, 0]
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Daily meal plan generated successfully', 
      total_calories: Math.round(dailyCalories),
      plan: allMeals 
    })

  } catch (error) {
    console.error('Error generating diet plan:', error)
    return NextResponse.json({ success: false, error: 'Failed to generate plan' }, { status: 500 })
  }
}