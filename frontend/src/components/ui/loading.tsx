import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface LoadingProps {
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton' | 'plane'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

export function Loading({ 
  variant = 'spinner', 
  size = 'md', 
  className,
  text 
}: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  const renderSpinner = () => (
    <motion.div
      className={cn('border-2 border-primary/30 border-t-primary rounded-full', sizeClasses[size])}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  )

  const renderDots = () => (
    <div className="flex space-x-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={cn('bg-primary rounded-full', {
            'w-2 h-2': size === 'sm',
            'w-3 h-3': size === 'md',
            'w-4 h-4': size === 'lg'
          })}
          animate={{
            y: [0, -10, 0],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.2,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  )

  const renderPulse = () => (
    <motion.div
      className={cn('bg-primary rounded-full', sizeClasses[size])}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.8, 0.3]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    />
  )

  const renderSkeleton = () => (
    <div className="space-y-3">
      <motion.div
        className="h-4 bg-muted rounded-lg"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="h-4 bg-muted rounded-lg w-4/5"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
      />
      <motion.div
        className="h-4 bg-muted rounded-lg w-3/5"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
      />
    </div>
  )

  const renderPlane = () => (
    <motion.div
      className={cn('text-primary', {
        'text-lg': size === 'sm',
        'text-2xl': size === 'md',
        'text-4xl': size === 'lg'
      })}
      animate={{
        x: [0, 20, 0],
        y: [0, -5, 0],
        rotate: [0, 5, 0]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    >
      ✈️
    </motion.div>
  )

  const renderVariant = () => {
    switch (variant) {
      case 'dots':
        return renderDots()
      case 'pulse':
        return renderPulse()
      case 'skeleton':
        return renderSkeleton()
      case 'plane':
        return renderPlane()
      default:
        return renderSpinner()
    }
  }

  return (
    <div className={cn('flex flex-col items-center justify-center space-y-4', className)}>
      {renderVariant()}
      {text && (
        <motion.p
          className="text-sm text-muted-foreground"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          {text}
        </motion.p>
      )}
    </div>
  )
}

// Skeleton components for different content types
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('bg-card p-6 rounded-xl border shadow-sm', className)}>
      <div className="space-y-4">
        <motion.div
          className="h-4 bg-muted rounded w-3/4"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="h-4 bg-muted rounded w-1/2"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
        />
        <motion.div
          className="h-24 bg-muted rounded"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
        />
      </div>
    </div>
  )
}

export function SkeletonAvatar({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn('w-10 h-10 bg-muted rounded-full', className)}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

export default Loading