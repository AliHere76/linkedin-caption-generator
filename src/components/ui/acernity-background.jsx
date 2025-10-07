'use client'
import { motion } from 'framer-motion'

export function BackgroundBeams() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-full w-1 bg-gradient-to-b from-transparent via-blue-500/30 to-transparent"
          style={{
            left: `${20 + i * 20}%`,
          }}
          animate={{
            y: ['-100%', '100%'],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            ease: 'linear',
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  )
}

export function GridPattern() {
  return (
    <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
  )
}