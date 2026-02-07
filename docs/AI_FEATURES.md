# 🤖 FitDayAI - AI/ML Features Documentation

## Overview

FitDayAI now includes comprehensive AI-powered features using Google Gemini AI for personalized food suggestions, exercise recommendations, and lifestyle optimization.

## 🍽️ AI-Powered Food Suggestions

### Endpoint: `GET /api/ai/suggestions?user_id={id}&type=food`

**Features:**
- Personalized Bangladeshi food recommendations
- Considers user goals (lose weight, gain muscle, maintain)
- Analyzes recent eating patterns
- Provides nutritional breakdown
- Cultural relevance (authentic Bangla names)

**Response Format:**
```json
{
  "success": true,
  "type": "food",
  "data": {
    "suggestions": [
      {
        "meal_type": "breakfast",
        "food_name": "Paratha with Egg",
        "bangla_name": "পরোটা ডিম",
        "calories": 350,
        "protein": 15,
        "carbs": 40,
        "fat": 12,
        "reason": "High protein breakfast for muscle gain"
      }
    ],
    "tips": ["Eat within 1 hour of waking", "Include protein in every meal"]
  }
}
```

### Endpoint: `POST /api/ai/meals`

**Features:**
- Generates complete daily meal plan
- Uses AI to select foods from database
- Balances macronutrients
- Saves directly to database
- Provides AI insights

**Request:**
```json
{
  "user_id": 1,
  "date": "2026-01-20"
}
```

## 💪 AI-Powered Exercise Suggestions

### Endpoint: `GET /api/ai/suggestions?user_id={id}&type=exercise`

**Features:**
- Personalized workout recommendations
- Considers fitness level and BMI
- Safety checks (high-impact exercises for appropriate users)
- Progressive overload suggestions
- Form tips and instructions

**Response Format:**
```json
{
  "success": true,
  "type": "exercise",
  "data": {
    "suggestions": [
      {
        "exercise_name": "Barbell Squat",
        "muscle_group": "legs",
        "difficulty": "intermediate",
        "sets": 4,
        "reps": "8-12",
        "rest": "90s",
        "reason": "Builds lower body strength for muscle gain",
        "form_tip": "Keep back straight, knees aligned with toes"
      }
    ],
    "tips": ["Warm up before workout", "Focus on form over weight"]
  }
}
```

### Endpoint: `POST /api/ai/workouts`

**Features:**
- Generates complete workout plan
- Matches exercises from library
- Considers recent workout history
- Provides duration estimates
- Saves to database

## 🧘 AI-Powered Lifestyle Suggestions

### Endpoint: `GET /api/ai/suggestions?user_id={id}&type=lifestyle`

**Features:**
- Comprehensive lifestyle optimization
- Sleep recommendations
- Hydration guidelines
- Stress management techniques
- Meal timing optimization
- Recovery strategies
- Daily motivation quotes

**Response Format:**
```json
{
  "success": true,
  "type": "lifestyle",
  "data": {
    "sleep": {
      "recommended_hours": 8,
      "tips": ["Sleep in dark room", "Avoid screens 1 hour before bed"]
    },
    "hydration": {
      "recommended_liters": 3,
      "tips": ["Drink water before meals", "Carry water bottle"]
    },
    "stress_management": {
      "techniques": ["Meditation", "Deep Breathing"],
      "tips": ["Take breaks", "Practice mindfulness"]
    },
    "meal_timing": {
      "breakfast_time": "07:00-08:00",
      "lunch_time": "12:00-13:00",
      "dinner_time": "19:00-20:00",
      "tips": ["Eat breakfast within 1 hour of waking"]
    },
    "recovery": {
      "rest_days_per_week": 2,
      "active_recovery_suggestions": ["Yoga", "Walking"],
      "tips": ["Listen to your body", "Stretch daily"]
    },
    "motivation": {
      "daily_quote": "Progress, not perfection",
      "consistency_tips": ["Set small goals", "Track progress"]
    },
    "weekly_focus": "Focus on protein intake this week"
  }
}
```

## 🎯 How AI Makes Decisions

### User Context Analysis
The AI considers:
- **Demographics**: Age, gender, height, weight, BMI
- **Goals**: Lose weight, gain muscle, maintain
- **Activity Level**: Sedentary, light, moderate, active
- **Progress**: Recent weight trends, meal compliance, workout frequency
- **Preferences**: Recent meals and workouts (to avoid repetition)

### Safety Features
- BMI-based exercise recommendations
- Calorie minimums (never below 1200 kcal/day)
- Difficulty level matching
- Equipment availability checks

### Personalization
- Cultural relevance (Bangladeshi cuisine focus)
- Realistic portion sizes
- Meal timing optimization
- Recovery recommendations based on activity

## 📱 User Interface

### Dashboard
- **AI Insights Component**: Shows daily food, exercise, and motivation suggestions
- **AI Protocol Generators**: Buttons to generate AI-powered meal and workout plans
- **Lifestyle Link**: Quick access to lifestyle optimization page

### Lifestyle Page (`/lifestyle`)
- Comprehensive lifestyle recommendations
- Sleep, hydration, stress management sections
- Meal timing guide
- Recovery strategies
- Daily motivation quotes
- Refresh button to get new suggestions

### Checklist Page
- AI-generated meals and workouts
- Real-time progress tracking
- Completion status

## 🔧 Setup & Configuration

### Environment Variables
```bash
# Required for AI features
GEMINI_API_KEY=your_api_key_here
```

### Getting API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with Google account
3. Create new API key
4. Add to `.env` file (development) or Cloudflare Pages environment variables (production)

### API Limits
- Gemini 1.5 Flash: Free tier includes generous limits
- Rate limiting handled automatically
- Fallback to rule-based generation if AI unavailable

## 🚀 Usage Examples

### Generate AI Meal Plan
```typescript
const response = await fetch('/api/ai/meals', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_id: 1,
    date: '2026-01-20'
  })
})
const data = await response.json()
console.log(data.ai_insights) // Personalized insights
```

### Get Lifestyle Suggestions
```typescript
const response = await fetch('/api/ai/suggestions?user_id=1&type=lifestyle')
const data = await response.json()
console.log(data.data.sleep.recommended_hours)
console.log(data.data.motivation.daily_quote)
```

## 🎨 Features Summary

✅ **AI-Powered Meal Generation** - Personalized Bangladeshi food recommendations
✅ **AI-Powered Workout Generation** - Customized exercise plans
✅ **Lifestyle Optimization** - Sleep, hydration, stress, recovery
✅ **Daily Insights** - Food, exercise, and motivation suggestions
✅ **Cultural Relevance** - Authentic Bangladeshi cuisine focus
✅ **Safety First** - BMI-based safety checks
✅ **Progressive Learning** - Considers user history and progress
✅ **Fallback Support** - Rule-based generation if AI unavailable

## 📊 AI Model

**Model**: Google Gemini 1.5 Flash
- Fast response times
- Cost-effective
- Excellent for structured data generation
- Supports JSON output
- Handles Bengali text

## 🔄 Future Enhancements

- [ ] Image-based food recognition (already implemented in `/api/vision`)
- [ ] Voice commands for logging
- [ ] Predictive analytics (weight loss/gain predictions)
- [ ] Social features (share AI recommendations)
- [ ] Multi-language support (full Bengali interface)
- [ ] Integration with fitness trackers
- [ ] Meal prep suggestions
- [ ] Recipe generation from available ingredients

---

**FitDayAI** - Bridging Bangladeshi Tradition with Modern AI Technology 🇧🇩🤖
