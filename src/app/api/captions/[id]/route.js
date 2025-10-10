import { verifyToken } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Caption from '@/models/Caption'
import User from '@/models/User'
import { NextResponse } from 'next/server'

export async function DELETE(request, { params }) {
  try {
    const verification = verifyToken(request)
    
    if (verification.error) {
      return NextResponse.json({ error: verification.error }, { status: verification.status })
    }

    await connectDB()
    const user = await User.findOne({ email: verification.email })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { id } = params
    const caption = await Caption.findOne({ _id: id, userId: user._id })

    if (!caption) {
      return NextResponse.json({ error: 'Caption not found' }, { status: 404 })
    }

    await Caption.deleteOne({ _id: id })

    return NextResponse.json({ success: true, message: 'Caption deleted' })
  } catch (error) {
    console.error('Error deleting caption:', error)
    return NextResponse.json(
      { error: 'Failed to delete caption' },
      { status: 500 }
    )
  }
}