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

/**
 * Converts a date string or Excel serial number from any format to ISO format (YYYY-MM-DD)
 * Supports: YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY, MM/DD/YYYY, Excel serial dates
 */
export function normalizeDate(dateValue: string | number): string | null {
  if (!dateValue) return null
  
  try {
    // If it's a number (Excel serial date), convert to Date
    if (typeof dateValue === 'number') {
      // Excel date serial: days since January 1, 1900
      const excelEpoch = new Date(1899, 11, 30) // December 30, 1899
      const date = new Date(excelEpoch.getTime() + (dateValue * 24 * 60 * 60 * 1000))
      
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      
      return `${year}-${month}-${day}`
    }
    
    // Handle string dates
    const dateString = dateValue.toString().trim()
    
    // Try to parse as-is first (handles ISO format YYYY-MM-DD)
    let date = new Date(dateString)
    
    // If that fails, try common formats
    if (isNaN(date.getTime())) {
      // Try DD/MM/YYYY or DD-MM-YYYY
      const ddmmyyyy = dateString.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/)
      if (ddmmyyyy) {
        const [, day, month, year] = ddmmyyyy
        date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`)
      }
    }
    
    // If still invalid, try MM/DD/YYYY
    if (isNaN(date.getTime())) {
      const mmddyyyy = dateString.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/)
      if (mmddyyyy) {
        const [, month, day, year] = mmddyyyy
        date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`)
      }
    }
    
    if (isNaN(date.getTime())) {
      console.warn(`Could not parse date: ${dateValue}`)
      return null
    }
    
    // Return in ISO format (YYYY-MM-DD)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    
    return `${year}-${month}-${day}`
  } catch (error) {
    console.warn(`Error normalizing date: ${dateValue}`, error)
    return null
  }
}
