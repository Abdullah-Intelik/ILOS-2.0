/**
 * ILOS Timezone Configuration
 * Default timezone: Asia/Karachi (Pakistan Standard Time - PKT, UTC+5)
 */

const ILOS_TIMEZONE = 'Asia/Karachi';

/**
 * Get current date/time in Pakistan timezone
 * @returns {Date}
 */
function getPakistanDateTime() {
  // Create date in Pakistan timezone
  const now = new Date();
  const pakistanTime = new Date(now.toLocaleString('en-US', { timeZone: ILOS_TIMEZONE }));
  return pakistanTime;
}

/**
 * Format date to YYYY-MM-DD in Pakistan timezone
 * @param {Date|string} date 
 * @returns {string}
 */
function formatDateForPakistan(date) {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return null;
    }
    
    // Format in Pakistan timezone
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: ILOS_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(dateObj);
  } catch (e) {
    console.error('Error formatting date for Pakistan timezone:', e);
    return null;
  }
}

/**
 * Get timestamp for Pakistan timezone
 * @returns {string} ISO 8601 timestamp
 */
function getPakistanTimestamp() {
  return getPakistanDateTime().toISOString();
}

/**
 * Format datetime for display in Pakistan timezone
 * @param {Date|string} date 
 * @returns {string}
 */
function formatDateTimeForPakistan(date) {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    return new Intl.DateTimeFormat('en-PK', {
      timeZone: ILOS_TIMEZONE,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(dateObj);
  } catch (e) {
    console.error('Error formatting datetime for Pakistan:', e);
    return '';
  }
}

module.exports = {
  ILOS_TIMEZONE,
  getPakistanDateTime,
  getPakistanTimestamp,
  formatDateForPakistan,
  formatDateTimeForPakistan
};

