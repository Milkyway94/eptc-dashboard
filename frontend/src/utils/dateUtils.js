/**
 * Date utility functions
 */

/**
 * Format date to Vietnamese format (DD/MM/YYYY)
 */
export function formatDateVN(date) {
  if (!date) return '';

  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Format date to ISO format (YYYY-MM-DD)
 */
export function formatDateISO(date) {
  if (!date) return '';

  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Get number of days in a month
 */
export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Get first day of week for a month (0 = Sunday, 1 = Monday, etc.)
 */
export function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

/**
 * Get Vietnamese month name
 */
export function getMonthNameVN(month) {
  const months = [
    'THÁNG 1', 'THÁNG 2', 'THÁNG 3', 'THÁNG 4',
    'THÁNG 5', 'THÁNG 6', 'THÁNG 7', 'THÁNG 8',
    'THÁNG 9', 'THÁNG 10', 'THÁNG 11', 'THÁNG 12'
  ];
  return months[month];
}

/**
 * Get day of week abbreviation (Vietnamese)
 */
export function getDayOfWeekVN(dayIndex) {
  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  return days[dayIndex];
}

/**
 * Check if date is today
 */
export function isToday(date) {
  const today = new Date();
  const d = new Date(date);

  return d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
}

/**
 * Check if date is in the past
 */
export function isPast(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  return d < today;
}

/**
 * Check if date is within N days from today
 */
export function isWithinDays(date, days) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(today);
  targetDate.setDate(targetDate.getDate() + days);

  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  return d >= today && d <= targetDate;
}

/**
 * Get days difference from today
 */
export function getDaysFromToday(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  const diffTime = d - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Parse ISO date string to Date object
 */
export function parseDate(dateString) {
  if (!dateString) return null;
  return new Date(dateString);
}

/**
 * Get calendar grid for a month (includes empty cells for alignment)
 */
export function getMonthCalendar(year, month) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const calendar = [];

  // Add empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    calendar.push(null);
  }

  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendar.push({
      day,
      date: new Date(year, month, day),
      dateISO: formatDateISO(new Date(year, month, day))
    });
  }

  return calendar;
}
