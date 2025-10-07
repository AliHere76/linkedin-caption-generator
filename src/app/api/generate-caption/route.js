import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { GoogleGenerativeAI } from '@google/generative-ai'
import connectDB from '@/lib/mongodb'
import Caption from '@/models/Caption'
import User from '@/models/User'
import { NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { prompt } = await request.json()

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // Generate caption using Gemini
    // Using gemini-2.5-flash which is the stable version
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    
    const enhancedPrompt = `Create a professional, engaging LinkedIn post caption based on this idea: "${prompt}". 
    
    Requirements:
    - Make it professional yet conversational
    - Include relevant emojis where appropriate
    - Add 3-5 relevant hashtags at the end
    - Keep it between 150-250 words
    - Make it engaging and likely to get interactions
    - Use line breaks for better readability
    
    Just return the caption, nothing else.`

    const result = await model.generateContent(enhancedPrompt)
    const response = await result.response
    const caption = response.text()

    // Save to database
    await connectDB()
    const user = await User.findOne({ email: session.user.email })

    if (user) {
      await Caption.create({
        userId: user._id,
        prompt: prompt.trim(),
        caption: caption.trim(),
      })
    }

    return NextResponse.json({ success: true, caption: caption.trim() })
  } catch (error) {
    console.error('Error generating caption:', error)
    return NextResponse.json(
      { error: 'Failed to generate caption' },
      { status: 500 }
    )
  }
}