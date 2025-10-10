import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export async function POST(request) {
  try {
    const { credential } = await request.json()

    if (!credential) {
      return NextResponse.json(
        { error: 'Google credential is required' },
        { status: 400 }
      )
    }

    // Decode the Google JWT token
    const decoded = jwt.decode(credential)
    
    if (!decoded || !decoded.email) {
      return NextResponse.json(
        { error: 'Invalid Google credential' },
        { status: 400 }
      )
    }

    await connectDB()

    // Find or create user
    let user = await User.findOne({ email: decoded.email })

    if (!user) {
      // Create new user from Google data
      user = await User.create({
        name: decoded.name,
        email: decoded.email,
        image: decoded.picture,
        googleId: decoded.sub
      })
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        userId: user._id.toString(),
        email: user.email 
      },
      process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '30d' }
    )

    // Return token and user data
    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        image: user.image
      }
    })
  } catch (error) {
    console.error('Google login error:', error)
    return NextResponse.json(
      { error: 'An error occurred during Google login' },
      { status: 500 }
    )
  }
}
