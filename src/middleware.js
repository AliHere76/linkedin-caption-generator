import { NextResponse } from 'next/server'

export function middleware(request) {
  // Simply pass through - authentication is now handled via Authorization headers
  return NextResponse.next()
}

// Only run middleware on API routes that need protection
export const config = {
  matcher: [
    '/api/captions/:path*',
    '/api/generate-caption/:path*',
  ]
}
