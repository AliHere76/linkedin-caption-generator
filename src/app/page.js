'use client'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sparkles, Loader2, Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { motion } from 'framer-motion'
import Script from 'next/script'

export default function Home() {
  const { user, loading: authLoading, login, register, loginWithGoogle } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false)
  const googleButtonRef1 = useRef(null)
  const googleButtonRef2 = useRef(null)

  // Sign In State
  const [signInEmail, setSignInEmail] = useState('')
  const [signInPassword, setSignInPassword] = useState('')
  const [showSignInPassword, setShowSignInPassword] = useState(false)

  // Sign Up State
  const [signUpName, setSignUpName] = useState('')
  const [signUpEmail, setSignUpEmail] = useState('')
  const [signUpPassword, setSignUpPassword] = useState('')
  const [showSignUpPassword, setShowSignUpPassword] = useState(false)

  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  // Handle Google Sign In callback
  const handleGoogleSignIn = async (response) => {
    if (loading) return // Prevent double clicks
    
    setLoading(true)
    setError('')

    try {
      const result = await loginWithGoogle(response.credential)
      
      if (result.success) {
        router.push('/dashboard')
      } else {
        setError(result.error || 'Google sign in failed')
        setLoading(false)
      }
    } catch (err) {
      setError('An error occurred during Google sign in')
      setLoading(false)
    }
  }

  // Initialize Google Sign In after script loads
  useEffect(() => {
    // Wait for Google script to load
    const checkGoogleLoaded = setInterval(() => {
      if (window.google?.accounts?.id) {
        clearInterval(checkGoogleLoaded)
        setGoogleScriptLoaded(true)
      }
    }, 100)

    return () => clearInterval(checkGoogleLoaded)
  }, [])

  useEffect(() => {
    if (googleScriptLoaded && !user) {
      try {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: handleGoogleSignIn,
          auto_select: false,
        })

        // Render Google button in both locations
        if (googleButtonRef1.current && !googleButtonRef1.current.hasChildNodes()) {
          window.google.accounts.id.renderButton(
            googleButtonRef1.current,
            { 
              theme: 'outline',
              size: 'large',
              width: googleButtonRef1.current.offsetWidth,
              text: 'continue_with',
              shape: 'rectangular',
            }
          )
        }

        if (googleButtonRef2.current && !googleButtonRef2.current.hasChildNodes()) {
          window.google.accounts.id.renderButton(
            googleButtonRef2.current,
            { 
              theme: 'outline',
              size: 'large',
              width: googleButtonRef2.current.offsetWidth,
              text: 'continue_with',
              shape: 'rectangular',
            }
          )
        }
      } catch (err) {
        console.error('Failed to initialize Google Sign In:', err)
      }
    }
  }, [googleScriptLoaded, user])

  const handleSignIn = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(signInEmail, signInPassword)

    if (result.success) {
      router.push('/dashboard')
    } else {
      setError(result.error || 'Sign in failed')
    }
    setLoading(false)
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await register(signUpName, signUpEmail, signUpPassword)

    if (result.success) {
      router.push('/dashboard')
    } else {
      setError(result.error || 'Registration failed')
    }
    setLoading(false)
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <>
      <Script 
        src="https://accounts.google.com/gsi/client" 
        strategy="afterInteractive"
      />
      <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-background to-background"></div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
      
      <div className="relative z-10 min-h-screen">
        <div className="container mx-auto px-4 h-screen flex items-center">
          <div className="grid lg:grid-cols-2 gap-6 w-full items-center max-w-7xl mx-auto">
            
            {/* Left Section - Welcome Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8 lg:pr-6"
            >
              {/* Logo/Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="inline-flex items-center justify-center w-24 h-24 rounded-3xl gradient-orange"
              >
                <Sparkles className="h-12 w-12 text-white" />
              </motion.div>
              
              {/* Main Heading */}
              <div className="space-y-6">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground">
                  Welcome to <span className="gradient-text">LinkedWizard</span>
                </h1>
                
                <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl">
                  Generate engaging LinkedIn captions with AI in seconds. Boost your social media presence with intelligent content creation.
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg gradient-orange flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-muted-foreground text-lg">AI-powered caption generation</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg gradient-orange flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-muted-foreground text-lg">Save and manage your captions</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg gradient-orange flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-muted-foreground text-lg">Instant results in seconds</p>
                </div>
              </div>
            </motion.div>

            {/* Divider */}
            <div className="hidden lg:block absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 h-4/5">
              <div className="h-full w-px bg-gradient-to-b from-transparent via-border to-transparent"></div>
            </div>

            {/* Right Section - Auth Forms */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full max-w-xl mx-auto lg:mx-0 lg:ml-auto lg:pl-6"
            >
              <Card className="border-border bg-card">
                <CardContent className="p-8">
                <Tabs defaultValue="signin" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-secondary mb-6">
                    <TabsTrigger value="signin" className="data-[state=active]:bg-primary">Sign In</TabsTrigger>
                    <TabsTrigger value="signup" className="data-[state=active]:bg-primary">Sign Up</TabsTrigger>
                  </TabsList>

                  {/* Sign In Tab */}
                            <TabsContent value="signin" className="mt-0">
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <form onSubmit={handleSignIn} className="space-y-5 min-h-[420px] flex flex-col justify-center">
                              {error && (
                                <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-lg text-sm">
                                {error}
                                </div>
                              )}
                              
                              <div className="space-y-3 pb-2 text-center">
                                <h1 className="text-2xl font-bold text-foreground">Welcome Back!</h1>
                              </div>

                              <div className="space-y-2">
                                <label className="text-base font-semibold text-foreground">Email</label>
                                <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                  type="email"
                                  placeholder="your@email.com"
                                  value={signInEmail}
                                  onChange={(e) => setSignInEmail(e.target.value)}
                                  className="pl-11 h-12 text-base bg-secondary/50 border-border"
                                  autoComplete="off"
                                  required
                                />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <label className="text-base font-semibold text-foreground">Password</label>
                                <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                  type={showSignInPassword ? 'text' : 'password'}
                                  placeholder="••••••••"
                                  value={signInPassword}
                                  onChange={(e) => setSignInPassword(e.target.value)}
                                  className="pl-11 pr-11 h-12 text-base bg-secondary/50 border-border"
                                  autoComplete="current-password"
                                  required
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowSignInPassword(!showSignInPassword)}
                                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-orange-500 transition-colors duration-200"
                                >
                                  {showSignInPassword ? (
                                  <EyeOff className="h-5 w-5" />
                                  ) : (
                                  <Eye className="h-5 w-5" />
                                  )}
                                </button>
                                </div>
                              </div>

                              <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 text-base font-semibold gradient-orange text-white hover:opacity-90 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-orange-500/50"
                              >
                                {loading ? (
                                <>
                                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                  Signing in...
                                </>
                                ) : (
                                'Sign In'
                                )}
                              </Button>

                              <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                <span className="px-3 bg-card text-muted-foreground font-medium">Or continue with</span>
                                </div>
                              </div>

                              {/* Google Sign-In Button Container */}
                              <div 
                                ref={googleButtonRef1}
                                className="w-full flex justify-center"
                                style={{ minHeight: '48px' }}
                              />
                              
                              {!googleScriptLoaded && (
                                <div className="w-full h-12 flex items-center justify-center border border-border rounded-lg bg-secondary/30">
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  <span className="text-sm text-muted-foreground">Loading Google Sign-In...</span>
                                </div>
                              )}
                              </form>
                            </motion.div>
                            </TabsContent>

                            {/* Sign Up Tab */}
                  <TabsContent value="signup" className="mt-0">
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                    <form onSubmit={handleSignUp} className="space-y-4 min-h-[420px]">
                      {error && (
                        <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-lg text-sm">
                          {error}
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="text"
                            placeholder="John Doe"
                            value={signUpName}
                            onChange={(e) => setSignUpName(e.target.value)}
                            className="pl-10 bg-secondary/50 border-border"
                            autoComplete="off"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Email</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="email"
                            placeholder="your@email.com"
                            value={signUpEmail}
                            onChange={(e) => setSignUpEmail(e.target.value)}
                            className="pl-10 bg-secondary/50 border-border"
                            autoComplete="off"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type={showSignUpPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={signUpPassword}
                            onChange={(e) => setSignUpPassword(e.target.value)}
                            className="pl-10 pr-10 bg-secondary/50 border-border"
                            autoComplete="new-password"
                            required
                            minLength={6}
                          />
                          <button
                            type="button"
                            onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-orange-500 transition-colors duration-200"
                          >
                            {showSignUpPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
                      </div>

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full gradient-orange text-white hover:opacity-90 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-orange-500/50"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          'Create Account'
                        )}
                      </Button>

                      <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-border"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
                        </div>
                      </div>

                      {/* Google Sign-In Button Container */}
                      <div 
                        ref={googleButtonRef2}
                        className="w-full flex justify-center"
                        style={{ minHeight: '40px' }}
                      />
                      
                      {!googleScriptLoaded && (
                        <div className="w-full h-10 flex items-center justify-center border border-border rounded-lg bg-secondary/30">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          <span className="text-xs text-muted-foreground">Loading Google Sign-In...</span>
                        </div>
                      )}
                    </form>
                    </motion.div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>

          </div>
        </div>
      </div>
    </div>
    </>
  )
}