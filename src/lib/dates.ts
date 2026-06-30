import {
  endOfMonth,
  isWithinInterval,
  parseISO,
  startOfMonth,
  subMonths,
} from 'date-fns'
import type { TimeRange } from '../types'

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parseISO(dateStr))
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export function isInTimeRange(dateStr: string, range: TimeRange): boolean {
  const date = parseISO(dateStr)
  const now = new Date()

  switch (range) {
    case 'this-month':
      return isWithinInterval(date, {
        start: startOfMonth(now),
        end: endOfMonth(now),
      })
    case 'last-3-months':
      return isWithinInterval(date, {
        start: startOfMonth(subMonths(now, 2)),
        end: endOfMonth(now),
      })
    case 'all-time':
      return true
  }
}

export function eachDayInRange(start: string, end: string): string[] {
  const days: string[] = []
  const cursor = parseISO(start)
  const endDate = parseISO(end)

  while (cursor <= endDate) {
    days.push(cursor.toISOString().slice(0, 10))
    cursor.setDate(cursor.getDate() + 1)
  }

  return days
}
