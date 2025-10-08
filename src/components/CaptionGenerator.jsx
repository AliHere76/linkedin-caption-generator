'use client'
import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Sparkles, Copy, Check, Send, Image as ImageIcon, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function CaptionGenerator({ onCaptionGenerated }) {
  const [prompt, setPrompt] = useState('')
  const [generatedCaption, setGeneratedCaption] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [thumbnail, setThumbnail] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState(null)
  const fileInputRef = useRef(null)

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Image size should be less than 5MB')
        return
      }
      
      setThumbnail(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setThumbnailPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeThumbnail = () => {
    setThumbnail(null)
    setThumbnailPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const generateCaption = async () => {
    if (!prompt.trim()) return

    setLoading(true)
    try {
      let imageBase64 = null
      
      if (thumbnail) {
        const reader = new FileReader()
        imageBase64 = await new Promise((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result)
          reader.onerror = reject
          reader.readAsDataURL(thumbnail)
        })
      }

      const response = await fetch('/api/generate-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt,
          image: imageBase64
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        setGeneratedCaption(data.caption)
        setPrompt('')
        removeThumbnail()
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

          {/* Thumbnail Preview */}
          {thumbnailPreview && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative inline-block"
            >
              <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-border">
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  className="w-full h-full object-cover"
                />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-1 right-1 h-6 w-6 rounded-full"
                  onClick={removeThumbnail}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </motion.div>
          )}
          
          <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>Press Enter to send, Shift + Enter for new line</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                id="thumbnail-upload"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="text-xs"
              >
                <ImageIcon className="h-3 w-3 mr-1" />
                {thumbnail ? 'Change Image' : 'Add Image'}
              </Button>
            </div>
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
