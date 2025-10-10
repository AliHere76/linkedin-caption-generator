import { verifyToken } from '@/lib/auth'
import { GoogleGenerativeAI } from '@google/generative-ai'
import connectDB from '@/lib/mongodb'
import Caption from '@/models/Caption'
import User from '@/models/User'
import { NextResponse } from 'next/server'
import sharp from 'sharp'
import { encode } from 'blurhash'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

async function generateBlurHash(imageBase64) {
  try {
    // Remove data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')
    
    // Resize image to small dimensions for blur hash (32x32 is sufficient)
    const image = await sharp(buffer)
      .resize(32, 32, { fit: 'cover' })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })
    
    const { data, info } = image
    const blurHash = encode(new Uint8ClampedArray(data), info.width, info.height, 4, 4)
    
    return blurHash
  } catch (error) {
    console.error('Error generating blur hash:', error)
    return null
  }
}

export async function POST(request) {
  try {
    const verification = verifyToken(request)
    
    if (verification.error) {
      return NextResponse.json({ error: verification.error }, { status: verification.status })
    }

    const { prompt, image } = await request.json()

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    let blurHash = null
    
    // Generate blur hash if image is provided
    if (image) {
      blurHash = await generateBlurHash(image)
    }

    // Generate caption using Gemini
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash'
    })
    
    let enhancedPrompt = `Create a professional, engaging LinkedIn post caption based on this idea: "${prompt}". 
    
    Requirements:
    - Make it professional yet conversational
    - Include relevant emojis where appropriate
    - Add 3-5 relevant hashtags at the end
    - Keep it between 150-250 words
    - Make it engaging and likely to get interactions
    - Use line breaks for better readability
    `
    
    let result
    
    if (image) {
      // If image is provided, send it to Gemini for vision analysis
      enhancedPrompt += `\nAnalyze the provided image and incorporate relevant details from it into the caption to make it more contextual and engaging.\n\nJust return the caption, nothing else.`
      
      // Convert base64 to the format Gemini expects
      const base64Data = image.replace(/^data:image\/\w+;base64,/, '')
      const mimeType = image.match(/^data:(image\/\w+);base64,/)?.[1] || 'image/jpeg'
      
      result = await model.generateContent([
        enhancedPrompt,
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Data
          }
        }
      ])
    } else {
      enhancedPrompt += `\nJust return the caption, nothing else.`
      result = await model.generateContent(enhancedPrompt)
    }
    
    const response = await result.response
    const caption = response.text()

    // Save to database
    await connectDB()
    const user = await User.findOne({ email: verification.email })

    if (user) {
      await Caption.create({
        userId: user._id,
        prompt: prompt.trim(),
        caption: caption.trim(),
        thumbnailBlurHash: blurHash,
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