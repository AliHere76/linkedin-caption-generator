'use client'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Sparkles, History, LogOut, Menu, X, Send, Copy, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Word-by-word animation component
const AnimatedText = ({ text }) => {
  const words = text.split(' ')
  
  return (
    <span>
      {words.map((word, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            delay: index * 0.05,
            ease: 'easeOut'
          }}
          style={{ display: 'inline-block', marginRight: '0.25em' }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  )
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [generatedCaption, setGeneratedCaption] = useState('')
  const [history, setHistory] = useState([])
  const [copied, setCopied] = useState(false)
  const [hasGenerated, setHasGenerated] = useState(false)
  const [showAnimation, setShowAnimation] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchHistory()
    }
  }, [session])

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/captions')
      const data = await response.json()
      if (response.ok) {
        setHistory(data.captions || [])
      }
    } catch (error) {
      console.error('Error fetching history:', error)
    }
  }

  const handleGenerate = async (e) => {
    e.preventDefault()
    if (!prompt.trim() || loading) return

    setLoading(true)
    setHasGenerated(true)
    setGeneratedCaption('')
    setShowAnimation(false)

    try {
      const response = await fetch('/api/generate-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() })
      })

      const data = await response.json()

      if (response.ok) {
        setGeneratedCaption(data.caption)
        setShowAnimation(true)
        fetchHistory()
      } else {
        console.error('Error:', data.error)
      }
    } catch (error) {
      console.error('Error generating caption:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCaption)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const loadHistoryItem = (caption) => {
    setGeneratedCaption(caption.caption)
    setPrompt(caption.prompt)
    setHasGenerated(true)
    setShowAnimation(true)
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border z-50 flex flex-col"
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg gradient-orange flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold text-foreground">LinkedIn AI</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden transition-all duration-300 hover:scale-110 hover:bg-secondary/50 active:scale-95"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* New Chat Button */}
            <div className="p-4">
              <Button
                onClick={() => {
                  setPrompt('')
                  setGeneratedCaption('')
                  setHasGenerated(false)
                  setShowAnimation(false)
                }}
                className="w-full gradient-orange text-white hover:opacity-90 transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-orange-500/50 active:scale-[0.98]"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                New Chat
              </Button>
            </div>

            {/* Recent Chats */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-muted-foreground">Recent Chat</h3>
                <History className="h-4 w-4 text-muted-foreground" />
              </div>
              
              {history.length === 0 ? (
                <p className="text-xs text-muted-foreground">No history yet</p>
              ) : (
                history.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => loadHistoryItem(item)}
                    className="w-full text-left p-3 rounded-lg hover:bg-secondary/80 transition-all duration-300 group border border-transparent hover:border-orange-500/50 hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
                  >
                    <p className="text-sm text-foreground truncate group-hover:text-orange-500 transition-colors duration-300">
                      {item.prompt}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </button>
                ))
              )}
            </div>

            {/* User Profile & Sign Out */}
            <div className="p-4 border-t border-border space-y-3">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-secondary/30 transition-all duration-300 hover:bg-secondary/50">
                <div className="w-10 h-10 rounded-full gradient-orange flex items-center justify-center text-white font-semibold">
                  {session.user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {session.user.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {session.user.email}
                  </p>
                </div>
              </div>
              
              <Button
                onClick={() => signOut({ callbackUrl: '/' })}
                variant="outline"
                className="w-full bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-red-500/50 active:scale-[0.98] font-medium"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
        {/* Top Bar */}
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="px-4 py-3 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hover:bg-secondary transition-all duration-300 hover:scale-110 active:scale-95"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="text-sm text-muted-foreground">
              LinkedIn Caption Generator
            </div>
            <div className="w-10"></div>
          </div>
        </div>

        {/* Grid Background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none"></div>

        {/* Main Content Area */}
        <div className="relative min-h-[calc(100vh-60px)] flex flex-col">
          <AnimatePresence mode="wait">
            {!hasGenerated ? (
              // Welcome State - Centered
                <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 flex flex-col items-center justify-center px-4 pb-32"
                >
                <div className="w-full max-w-3xl space-y-8">
                  <div className="text-center space-y-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-orange mb-4"
                  >
                    <Sparkles className="h-8 w-8 text-white" />
                  </motion.div>
                  
                  <h1 className="text-4xl md:text-5xl font-bold">
                    Welcome, <span className="gradient-text">{session.user.name?.split(' ')[0]}</span>
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    Let's create something Magical ✨
                  </p>
                  </div>

                  {/* Input Form - Center */}
                  <form onSubmit={handleGenerate} className="relative">
                    <div className="relative">
                      <Input
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ask whatever you want"
                        className="w-full h-14 px-6 pr-32 text-base bg-card border-border rounded-2xl focus:ring-2 focus:ring-orange-500/50 transition-all"
                        disabled={loading}
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="rounded-lg hover:bg-secondary transition-all duration-300 hover:scale-105 active:scale-95"
                          disabled={loading}
                        >
                          Think
                        </Button>
                        <Button
                          type="submit"
                          size="sm"
                          disabled={loading || !prompt.trim()}
                          className="rounded-full gradient-orange text-white hover:opacity-90 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-orange-500/50 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                        >
                          {loading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>
              </motion.div>
            ) : (
              // Generated State - Top Input + Result
              <motion.div
                key="generated"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col"
              >
                {/* Input at Top */}
                <motion.div
                  initial={{ y: 200 }}
                  animate={{ y: 0 }}
                  transition={{ type: 'spring', damping: 20 }}
                  className="px-4 py-6 border-b border-border bg-background/50 backdrop-blur-sm"
                >
                  <div className="max-w-4xl mx-auto">
                    <form onSubmit={handleGenerate} className="relative">
                      <div className="relative">
                        <Input
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          placeholder="Ask whatever you want"
                          className="w-full h-12 px-6 pr-32 text-sm bg-card border-border rounded-xl focus:ring-2 focus:ring-orange-500/50 transition-all"
                          disabled={loading}
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="rounded-lg hover:bg-secondary text-xs transition-all duration-300 hover:scale-105 active:scale-95"
                            disabled={loading}
                          >
                            Think
                          </Button>
                          <Button
                            type="submit"
                            size="sm"
                            disabled={loading || !prompt.trim()}
                            className="rounded-full gradient-orange text-white hover:opacity-90 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-orange-500/50 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                          >
                            {loading ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </form>
                  </div>
                </motion.div>

                {/* Generated Content */}
                <div className="flex-1 overflow-y-auto px-4 py-8">
                  <div className="max-w-4xl mx-auto space-y-6">
                    {loading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center space-y-4">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto" />
                          <p className="text-muted-foreground">Generating your caption...</p>
                        </div>
                      </div>
                    ) : generatedCaption ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <Card className="p-6 bg-card border-border">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 rounded-lg gradient-orange flex items-center justify-center">
                                <Sparkles className="h-4 w-4 text-white" />
                              </div>
                              <span className="font-semibold">Generated Caption</span>
                            </div>
                            <Button
                              onClick={handleCopy}
                              variant="ghost"
                              size="sm"
                              className="hover:bg-secondary transition-all duration-300 hover:scale-110 hover:shadow-md active:scale-95"
                            >
                              {copied ? (
                                <>
                                  <Check className="h-4 w-4 mr-2 text-green-500" />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Copy
                                </>
                              )}
                            </Button>
                          </div>
                          <div className="prose prose-invert max-w-none">
                            <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                              {showAnimation ? (
                                <AnimatedText text={generatedCaption} />
                              ) : (
                                generatedCaption
                              )}
                            </p>
                          </div>
                        </Card>
                      </motion.div>
                    ) : null}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}