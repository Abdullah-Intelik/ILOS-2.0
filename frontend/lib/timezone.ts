/**
 * ILOS Timezone Configuration
 * Default timezone: Asia/Karachi (Pakistan Standard Time - PKT)
 */

export const ILOS_TIMEZONE = 'Asia/Karachi';

/**
 * Convert any date to YYYY-MM-DD in Pakistan timezone
 */
export function formatDateForPakistan(dateString: string | Date): string {
  if (!dateString) return '';
  
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    
    if (isNaN(date.getTime())) return '';
    
    // Format in Pakistan timezone
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: ILOS_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  } catch (e) {
    console.error('Error formatting date for Pakistan timezone:', e);
    return '';
  }
}

/**
 * Get current date/time in Pakistan timezone
 */
export function getPakistanDateTime(): Date {
  // Create a date object that represents current time in Pakistan
  const now = new Date();
  const pakistanTime = new Date(now.toLocaleString('en-US', { timeZone: ILOS_TIMEZONE }));
  return pakistanTime;
}

/**
 * Format date-time for display in Pakistan timezone
 */
export function formatDateTimeForPakistan(date: Date | string): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    return new Intl.DateTimeFormat('en-PK', {
      timeZone: ILOS_TIMEZONE,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(dateObj);
  } catch (e) {
    console.error('Error formatting datetime for Pakistan:', e);
    return '';
  }
}

