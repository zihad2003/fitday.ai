import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const image = formData.get('image') as File;

        if (!image) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 });
        }

        // Convert file to buffer
        const buffer = await image.arrayBuffer();
        const base64Image = Buffer.from(buffer).toString('base64');

        // Use Gemini 1.5 Flash for vision
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
      Analyze this image of food, specifically focusing on Bangladeshi cuisine.
      Identify the main food item and estimate its nutritional values.
      If it's a plate of multiple items, choose the most prominent one or describe it as a combined meal.
      
      Respond ONLY with a strict JSON object in this format:
      {
        "food_name": "Name of the food",
        "bn_name": "Bengali name",
        "estimated_calories": 0,
        "protein": 0,
        "carbs": 0,
        "fat": 0,
        "confidence": 0.0
      }
      
      Example Bangladeshi items: Singara, Fuchka, Rui Fish, Kacchi Biryani, etc.
    `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Image,
                    mimeType: image.type,
                },
            },
        ]);

        const response = await result.response;
        const text = response.text();

        // Clean JSON from response (sometimes Gemini wraps it in ```json ... ```)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : text;

        try {
            const nutritionData = JSON.parse(jsonStr);
            return NextResponse.json(nutritionData);
        } catch (e) {
            console.error('Failed to parse JSON from AI:', text);
            return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
        }
    } catch (error: any) {
        console.error('Vision API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
