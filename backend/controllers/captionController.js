import { GoogleGenerativeAI } from '@google/generative-ai'
import Caption from '../models/Caption.js'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export const generateCaption = async (req, res) => {
  try {
    const { prompt } = req.body
    const userId = req.user.id

    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({ error: 'Prompt is required' })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    
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

    const newCaption = await Caption.create({
      userId,
      prompt: prompt.trim(),
      caption: caption.trim(),
    })

    res.status(201).json({
      success: true,
      caption: caption.trim(),
      captionId: newCaption._id,
    })
  } catch (error) {
    console.error('Error generating caption:', error)
    res.status(500).json({ error: 'Failed to generate caption' })
  }
}

export const getCaptions = async (req, res) => {
  try {
    const userId = req.user.id
    const { limit = 50, skip = 0 } = req.query

    const captions = await Caption.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))

    const total = await Caption.countDocuments({ userId })

    res.json({
      success: true,
      captions,
      total,
      hasMore: skip + captions.length < total,
    })
  } catch (error) {
    console.error('Error fetching captions:', error)
    res.status(500).json({ error: 'Failed to fetch captions' })
  }
}

export const deleteCaption = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const caption = await Caption.findOne({ _id: id, userId })

    if (!caption) {
      return res.status(404).json({ error: 'Caption not found' })
    }

    await caption.deleteOne()

    res.json({
      success: true,
      message: 'Caption deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting caption:', error)
    res.status(500).json({ error: 'Failed to delete caption' })
  }
}