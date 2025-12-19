import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          await connectDB()

          if (!credentials?.email || !credentials?.password) {
            throw new Error('Email and password are required')
          }

          // Find user and include password field
          const user = await User.findOne({ email: credentials.email }).select('+password')

          console.log('=== AUTHENTICATION DEBUG ===')
          console.log('Searching for email:', credentials.email)
          console.log('User found:', !!user)
          if (user) {
            console.log('User fields:', Object.keys(user.toObject()))
            console.log('Has password field:', 'password' in user)
            console.log('Password value exists:', !!user.password)
            console.log('Password length:', user.password?.length)
          }
          console.log('=== END DEBUG ===')

          if (!user) {
            throw new Error('No user found with this email')
          }

          if (!user.password) {
            throw new Error('Invalid credentials')
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

          if (!isPasswordValid) {
            throw new Error('Invalid password')
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            image: user.image,
          }
        } catch (error) {
          console.error('Authorization error:', error)
          throw error
        }
      }
    }),
  ],
  pages: {
    signIn: '/',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }