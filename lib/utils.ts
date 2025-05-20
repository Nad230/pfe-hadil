// lib/utils.ts

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

// Class name merger
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Enhanced currency formatting with error handling
export function formatCurrency(value: number | string): string {
  try {
    const numberValue = typeof value === 'string' ? 
      parseFloat(value.replace(/[^0-9.-]/g, '')) : 
      value
    
    if (isNaN(numberValue)) return '$0.00'

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numberValue)
  } catch (error) {
    console.error('Currency formatting error:', error)
    return '$0.00'
  }
}

// Universal date formatter with error handling
export function formatDate(
  dateInput: Date | string | number,
  formatStr: string = 'MMM dd, yyyy HH:mm'
): string {
  try {
    const parsedDate = new Date(dateInput)
    if (isNaN(parsedDate.getTime())) return 'N/A'
    
    return format(parsedDate, formatStr)
  } catch (error) {
    console.error('Date formatting error:', error)
    return 'N/A'
  }
}

// Additional utility functions
export function formatNumber(value: number | string): string {
  try {
    const numberValue = typeof value === 'string' ? 
      parseFloat(value) : 
      value
    
    if (isNaN(numberValue)) return '0'

    return new Intl.NumberFormat('en-US').format(numberValue)
  } catch (error) {
    console.error('Number formatting error:', error)
    return '0'
  }
}

// Abbreviate large numbers
export function formatCompactNumber(value: number | string): string {
  try {
    const numberValue = typeof value === 'string' ? 
      parseFloat(value) : 
      value
    
    if (isNaN(numberValue)) return '0'

    return new Intl.NumberFormat('en-US', {
      notation: "compact",
      compactDisplay: "short"
    }).format(numberValue)
  } catch (error) {
    console.error('Compact number formatting error:', error)
    return '0'
  }
}