'use client'

/**
 * Loading Dots Animation Component
 * Reusable animated loading indicator
 */

import { motion } from 'framer-motion'

interface LoadingDotsProps {
  size?: 'sm' | 'md' | 'lg'
  color?: string
}

export default function LoadingDots({ size = 'md', color = '#0F4C81' }: LoadingDotsProps) {
  const sizeMap = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  }

  const dotClass = sizeMap[size]

  const containerVariants = {
    start: {
      transition: {
        staggerChildren: 0.2,
      },
    },
    end: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const dotVariants = {
    start: {
      y: '0%',
    },
    end: {
      y: '100%',
    },
  }

  const dotTransition = {
    duration: 0.5,
    repeat: Infinity,
    repeatType: 'reverse' as const,
    ease: 'easeInOut',
  }

  return (
    <motion.div
      className="flex items-center justify-center gap-1"
      variants={containerVariants}
      initial="start"
      animate="end"
    >
      <motion.div
        className={`${dotClass} rounded-full`}
        style={{ backgroundColor: color }}
        variants={dotVariants}
        transition={dotTransition}
      />
      <motion.div
        className={`${dotClass} rounded-full`}
        style={{ backgroundColor: color }}
        variants={dotVariants}
        transition={dotTransition}
      />
      <motion.div
        className={`${dotClass} rounded-full`}
        style={{ backgroundColor: color }}
        variants={dotVariants}
        transition={dotTransition}
      />
    </motion.div>
  )
}
