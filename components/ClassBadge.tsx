import { motion } from 'framer-motion'
import { Class } from '@/lib/types'
import clsx from 'clsx'

interface ClassBadgeProps {
  classData: Class | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ClassBadge({ classData, size = 'md', className }: ClassBadgeProps) {
  if (!classData) {
    return (
      <span className={clsx(
        'inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800',
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'lg' && 'px-3 py-1 text-sm',
        className
      )}>
        No Class
      </span>
    )
  }

  const getClassColor = (className: string) => {
    const lowerClassName = className.toLowerCase()
    
    if (lowerClassName.includes('main')) {
      return 'bg-blue-200 text-blue-800'
    } else if (lowerClassName.includes('mak mandin')) {
      return 'bg-green-200 text-green-800'
    } else if (lowerClassName.includes('kuala prai')) {
      return 'bg-purple-200 text-purple-800'
    } else {
      return 'bg-gray-200 text-gray-800'
    }
  }

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        getClassColor(classData.class_name),
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'lg' && 'px-3 py-1 text-sm',
        className
      )}
    >
      {classData.class_name}
    </motion.span>
  )
}
