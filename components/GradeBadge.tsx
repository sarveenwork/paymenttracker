import { motion } from 'framer-motion'
import { Grade } from '@/lib/types'
import clsx from 'clsx'

interface GradeBadgeProps {
  grade: Grade | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function GradeBadge({ grade, size = 'md', className }: GradeBadgeProps) {
  if (!grade) {
    return (
      <span className={clsx(
        'inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800',
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'lg' && 'px-3 py-1 text-sm',
        className
      )}>
        No Grade
      </span>
    )
  }

  const getGradeColor = (gradeLevel: string) => {
    if (gradeLevel.includes('D')) {
      // Dan grades - black background
      return 'bg-black text-white'
    } else if (gradeLevel >= '7') {
      // Yellow grades
      return 'bg-yellow-200 text-yellow-800'
    } else if (gradeLevel >= '5') {
      // Green grades
      return 'bg-green-200 text-green-800'
    } else if (gradeLevel >= '3') {
      // Blue grades
      return 'bg-blue-200 text-blue-800'
    } else if (gradeLevel >= '1') {
      // Red grades
      return 'bg-red-200 text-red-800'
    } else {
      // White grade
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
        getGradeColor(grade.grade_level),
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'lg' && 'px-3 py-1 text-sm',
        className
      )}
    >
      {grade.grade_name}
    </motion.span>
  )
}
