import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Consistent date-time formatter used across dashboards
export function formatDateTime(dateLike: string | number | Date | undefined | null): string {

  if (!dateLike) return 'N/A'

  // Normalize common Postgres timestamp formats and enforce Asia/Karachi time.
  // Rules:
  // - If the input includes an explicit timezone (Z or +/-HH:MM), respect it.
  // - If the input is a naive timestamp (no timezone), treat it as local time in Asia/Karachi.
  let dateObj: Date
  if (typeof dateLike === 'string') {
    const trimmed = dateLike.trim()
    const hasExplicitTz = /([zZ]|[+-]\d{2}:?\d{2})$/.test(trimmed)
    const naiveMatch = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,6}))?$/.exec(trimmed)

    if (hasExplicitTz) {
      dateObj = new Date(trimmed)
    } else if (naiveMatch) {
      // Interpret as Asia/Karachi local time, then convert to a UTC timestamp
      const [_, y, m, d, hh, mm, ss, frac] = naiveMatch
      const year = Number(y)
      const monthIndex = Number(m) - 1
      const day = Number(d)
      const hour = Number(hh)
      const minute = Number(mm)
      const second = Number(ss)
      const ms = frac ? Number((frac + '000').slice(0, 3)) : 0
      // Asia/Karachi is UTC+05:00 (no DST currently). Subtract 5 hours to get UTC instant.
      const utcMillis = Date.UTC(year, monthIndex, day, hour - 5, minute, second, ms)
      dateObj = new Date(utcMillis)
    } else {
      // Fallback: let JS try to parse
      dateObj = new Date(trimmed)
    }
  } else {
    dateObj = new Date(dateLike)
  }

  if (isNaN(dateObj.getTime())) return 'N/A'

  const baseOptions: Intl.DateTimeFormatOptions = { timeZone: 'Asia/Karachi' }

  const datePart = dateObj.toLocaleDateString('en-GB', {
    ...baseOptions,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })

  const timePart = dateObj
    .toLocaleTimeString('en-US', {
      ...baseOptions,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
    .replace('AM', 'am')
    .replace('PM', 'pm')

  return `${datePart} ${timePart}`
}

// Format using the viewer's local (PC) timezone while preserving the actual timestamp
// If a timestamp is naive (no timezone), we assume it's UTC to avoid client mis-parsing
export function formatDateTimeLocal(dateLike: string | number | Date | undefined | null): string {
  if (!dateLike) return 'N/A'

  let dateObj: Date
  if (typeof dateLike === 'string') {
    const trimmed = dateLike.trim()
    const looksNaive = /^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?)$/.test(trimmed)
    dateObj = new Date(looksNaive ? `${trimmed}Z` : trimmed)
  } else {
    dateObj = new Date(dateLike)
  }

  if (isNaN(dateObj.getTime())) return 'N/A'

  const datePart = dateObj.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })

  const timePart = dateObj
    .toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
    .replace('AM', 'am')
    .replace('PM', 'pm')

  return `${datePart}, ${timePart}`
}