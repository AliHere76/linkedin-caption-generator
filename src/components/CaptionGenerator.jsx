'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Sparkles, Copy, Check, Send } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function CaptionGenerator({ onCaptionGenerated }) {
  const [prompt, setPrompt] = useState('')
  const [generatedCaption, setGeneratedCaption] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const generateCaption = async () => {
    if (!prompt.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/generate-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      const data = await response.json()
      
      if (data.success) {
        setGeneratedCaption(data.caption)
        onCaptionGenerated?.()
      } else {
        alert(data.error || 'Failed to generate caption')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to generate caption')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedCaption)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      generateCaption()
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardContent className="p-6 space-y-4">
          <div className="relative">
            <Textarea
              placeholder="Ask whatever you want - Generate a LinkedIn post about..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={handleKeyPress}
              className="min-h-[120px] resize-none bg-secondary/50 border-border focus-visible:ring-primary pr-20 text-base"
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <Button
                onClick={generateCaption}
                disabled={loading || !prompt.trim()}
                size="icon"
                className="gradient-orange text-white hover:opacity-90 h-10 w-10 rounded-full"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            <span>Press Enter to send, Shift + Enter for new line</span>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {generatedCaption && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-border bg-card">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Generated Caption
                  </h3>
                  <Button
                    onClick={handleCopy}
                    variant="outline"
                    size="sm"
                    className="border-border hover:bg-secondary"
                  >
                    {copied ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="bg-secondary/50 rounded-lg p-4 border border-border">
                  <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                    {generatedCaption}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
