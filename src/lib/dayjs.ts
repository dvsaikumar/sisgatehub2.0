import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import isBetween from 'dayjs/plugin/isBetween';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import duration from 'dayjs/plugin/duration';
import customParseFormat from 'dayjs/plugin/customParseFormat';

/**
 * Day.js Configuration
 * 
 * Per God Mode Protocol:
 * - Day.js replaces Moment.js
 * - All plugins loaded upfront
 * - Export configured dayjs as default
 */

// Extend Day.js with plugins
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localizedFormat);
dayjs.extend(isBetween);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(duration);
dayjs.extend(customParseFormat);

// Re-export configured dayjs
export default dayjs;

// Named export for convenience
export { dayjs };

/**
 * Common date formatting utilities
 */

/**
 * Format a date for display (e.g., "Jan 15, 2026")
 */
export function formatDate(date: string | Date | null | undefined, format = 'MMM D, YYYY'): string {
    if (!date) return '';
    return dayjs(date).format(format);
}

/**
 * Format a date with time (e.g., "Jan 15, 2026 3:30 PM")
 */
export function formatDateTime(date: string | Date | null | undefined, format = 'MMM D, YYYY h:mm A'): string {
    if (!date) return '';
    return dayjs(date).format(format);
}

/**
 * Format a time only (e.g., "3:30 PM")
 */
export function formatTime(date: string | Date | null | undefined, format = 'h:mm A'): string {
    if (!date) return '';
    return dayjs(date).format(format);
}

/**
 * Get relative time (e.g., "2 hours ago", "in 3 days")
 */
export function fromNow(date: string | Date | null | undefined): string {
    if (!date) return '';
    return dayjs(date).fromNow();
}

/**
 * Check if a date is today
 */
export function isToday(date: string | Date | null | undefined): boolean {
    if (!date) return false;
    return dayjs(date).isSame(dayjs(), 'day');
}

/**
 * Check if a date is in the past
 */
export function isPast(date: string | Date | null | undefined): boolean {
    if (!date) return false;
    return dayjs(date).isBefore(dayjs());
}

/**
 * Check if a date is in the future
 */
export function isFuture(date: string | Date | null | undefined): boolean {
    if (!date) return false;
    return dayjs(date).isAfter(dayjs());
}

/**
 * Get start of day
 */
export function startOfDay(date?: string | Date): dayjs.Dayjs {
    return dayjs(date).startOf('day');
}

/**
 * Get end of day
 */
export function endOfDay(date?: string | Date): dayjs.Dayjs {
    return dayjs(date).endOf('day');
}

/**
 * Add time to a date
 */
export function addTime(
    date: string | Date | undefined,
    amount: number,
    unit: 'day' | 'week' | 'month' | 'year' | 'hour' | 'minute'
): dayjs.Dayjs {
    return dayjs(date).add(amount, unit);
}

/**
 * Get difference between two dates
 */
export function diffInDays(
    date1: string | Date,
    date2: string | Date = new Date()
): number {
    return dayjs(date1).diff(dayjs(date2), 'day');
}

/**
 * Format duration (e.g., "2h 30m")
 */
export function formatDuration(minutes: number): string {
    const d = dayjs.duration(minutes, 'minutes');
    const hours = Math.floor(d.asHours());
    const mins = d.minutes();

    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
}

/**
 * Parse a date string with a specific format
 */
export function parseDate(dateString: string, format: string): dayjs.Dayjs {
    return dayjs(dateString, format);
}
