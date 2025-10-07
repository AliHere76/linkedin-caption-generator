import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
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
            throw new Error('Please sign in with Google')
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
  callbacks: {
    async signIn({ user, account }) {
      if (account.provider === 'google') {
        try {
          await connectDB()
          
          const existingUser = await User.findOne({ email: user.email })
          
          if (!existingUser) {
            await User.create({
              name: user.name,
              email: user.email,
              image: user.image,
              googleId: account.providerAccountId,
            })
          }
          
          return true
        } catch (error) {
          console.error('Error during sign in:', error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      try {
        await connectDB()
        const user = await User.findOne({ email: session.user.email })
        if (user) {
          session.user.id = user._id.toString()
        }
        return session
      } catch (error) {
        console.error('Error in session callback:', error)
        return session
      }
    },
  },
  pages: {
    signIn: '/',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }