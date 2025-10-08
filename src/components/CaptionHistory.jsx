'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Copy, Trash2, Loader2, History } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { Blurhash } from 'react-blurhash'

export default function CaptionHistory({ refresh }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState(null)

  useEffect(() => {
    fetchHistory()
  }, [refresh])

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/captions')
      const data = await response.json()
      if (data.success) {
        setHistory(data.captions)
      }
    } catch (error) {
      console.error('Error fetching history:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async (caption, id) => {
    try {
      await navigator.clipboard.writeText(caption)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this caption?')) return

    try {
      const response = await fetch(`/api/captions/${id}`, {
        method: 'DELETE',
      })
      const data = await response.json()
      if (data.success) {
        setHistory(history.filter(item => item._id !== id))
      }
    } catch (error) {
      console.error('Error deleting caption:', error)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Caption History
        </CardTitle>
        <CardDescription>
          View, copy, and manage your previously generated captions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <History className="h-12 w-12 mx-auto opacity-20 mb-4" />
            <p>No captions generated yet</p>
            <p className="text-sm">Start creating your first LinkedIn caption above</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {history.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border">
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          {/* Thumbnail with Blurhash */}
                          {item.thumbnailBlurHash && (
                            <div className="flex-shrink-0">
                              <div className="w-24 h-24 rounded-lg overflow-hidden border border-border">
                                <Blurhash
                                  hash={item.thumbnailBlurHash}
                                  width="100%"
                                  height="100%"
                                  resolutionX={32}
                                  resolutionY={32}
                                  punch={1}
                                />
                              </div>
                            </div>
                          )}
                          
                          <div className="flex-1 space-y-2">
                            <Badge variant="outline" className="text-xs">
                              {formatDate(item.createdAt)}
                            </Badge>
                            <p className="text-sm text-muted-foreground">
                              <span className="font-semibold">Prompt:</span> {item.prompt}
                            </p>
                          </div>
                        </div>
                        <Separator />
                        <div className="rounded-md bg-muted p-3">
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">
                            {item.caption}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopy(item.caption, item._id)}
                            className="flex-1"
                          >
                            <Copy className="mr-2 h-3 w-3" />
                            {copiedId === item._id ? 'Copied!' : 'Copy'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(item._id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  )
}