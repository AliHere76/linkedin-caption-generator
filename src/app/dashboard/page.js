'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import CaptionGenerator from '@/components/CaptionGenerator'
import CaptionHistory from '@/components/CaptionHistory'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sparkles, History } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [refreshHistory, setRefreshHistory] = useState(0)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

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
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Grid Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none"></div>
      
      <main className="relative container max-w-6xl py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold">
              Welcome, <span className="gradient-text">{session.user.name?.split(' ')[0]}</span>
            </h1>
            <p className="text-muted-foreground">
              How can I help you today?
            </p>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="generate" className="space-y-6">
            <TabsList className="bg-card border border-border">
              <TabsTrigger value="generate" className="data-[state=active]:bg-secondary">
                <Sparkles className="h-4 w-4 mr-2" />
                Generate
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-secondary">
                <History className="h-4 w-4 mr-2" />
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generate" className="space-y-6 mt-6">
              <CaptionGenerator 
                onCaptionGenerated={() => setRefreshHistory(prev => prev + 1)}
              />
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <CaptionHistory refresh={refreshHistory} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  )
}