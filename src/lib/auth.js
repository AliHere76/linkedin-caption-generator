import jwt from 'jsonwebtoken'
import { NextResponse } from 'next/server'

export function verifyToken(request) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: 'Unauthorized', status: 401 }
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    
    const decoded = jwt.verify(
      token,
      process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production'
    )

    return { userId: decoded.userId, email: decoded.email }
  } catch (error) {
    console.error('Token verification error:', error)
    return { error: 'Invalid or expired token', status: 401 }
  }
}

export function authMiddleware(handler) {
  return async (request, context) => {
    const verification = verifyToken(request)
    
    if (verification.error) {
      return NextResponse.json(
        { error: verification.error },
        { status: verification.status }
      )
    }

    // Add user info to request for use in handler
    request.userId = verification.userId
    request.userEmail = verification.email

    return handler(request, context)
  }
}
