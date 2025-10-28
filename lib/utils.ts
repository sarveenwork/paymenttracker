import { format, parseISO, isValid } from 'date-fns'

export const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export const monthNamesShort = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return ''
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    if (!isValid(dateObj)) return ''
    return format(dateObj, 'MMM dd, yyyy')
  } catch {
    return ''
  }
}

export function formatDateShort(date: string | Date | null | undefined): string {
  if (!date) return ''
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    if (!isValid(dateObj)) return ''
    return format(dateObj, 'MMM dd')
  } catch {
    return ''
  }
}

export function getCurrentYear(): number {
  return new Date().getFullYear()
}

export function getCurrentMonth(): number {
  return new Date().getMonth() + 1
}

export function getMonthName(month: number): string {
  return monthNames[month - 1] || ''
}

export function getMonthNameShort(month: number): string {
  return monthNamesShort[month - 1] || ''
}

export function generateStudentId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 5)
  return `STU-${timestamp}-${random}`.toUpperCase()
}

export function generateTMNumber(): string {
  const random = Math.random().toString(36).substr(2, 8)
  return `TM-${random}`.toUpperCase()
}
