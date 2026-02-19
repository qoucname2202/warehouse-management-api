import { format } from 'date-fns'

/**
 * Get the current datetime in ISO-8601 format with timezone offset.
 * Example: 2026-02-13T17:41:33+07:00
 */
export const getCurrentTimestamp = (): string => {
  return format(new Date(), "yyyy-MM-dd'T'HH:mm:ssXXX")
}

// Validate date string
export function validateDateString(dateInput?: string | Date): Date | undefined {
  if (!dateInput) return undefined

  if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
    return dateInput
  }

  if (typeof dateInput === 'string') {
    const parsedDate = new Date(dateInput)
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate
    }
  }

  return undefined
}
