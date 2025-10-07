'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Sparkles, Copy, Check } from 'lucide-react'
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

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Input Section */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Create Your Caption
          </CardTitle>
          <CardDescription>
            Describe your post idea and let AI craft the perfect LinkedIn caption
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="E.g., I just launched a new product that helps developers write better code..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[200px] resize-none"
          />
          <Button
            onClick={generateCaption}
            disabled={loading || !prompt.trim()}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Caption
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Output Section */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Generated Caption</CardTitle>
          <CardDescription>
            Your AI-powered LinkedIn caption is ready to share
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            {generatedCaption ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="relative rounded-lg bg-muted p-4 min-h-[200px]">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {generatedCaption}
                  </p>
                </div>
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy to Clipboard
                    </>
                  )}
                </Button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center min-h-[200px] text-muted-foreground"
              >
                <div className="text-center space-y-2">
                  <Sparkles className="h-12 w-12 mx-auto opacity-20" />
                  <p>Your generated caption will appear here</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  )
}