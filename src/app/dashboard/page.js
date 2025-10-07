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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Navbar />
      
      <main className="container py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">
              Welcome back, {session.user.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-muted-foreground text-lg">
              Create engaging LinkedIn captions powered by AI
            </p>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="generate" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="generate" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Generate
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generate" className="space-y-6">
              <CaptionGenerator 
                onCaptionGenerated={() => setRefreshHistory(prev => prev + 1)}
              />
            </TabsContent>

            <TabsContent value="history">
              <CaptionHistory refresh={refreshHistory} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  )
}