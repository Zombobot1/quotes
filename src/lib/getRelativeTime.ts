import { formatDistanceToNow } from "date-fns";

/**
 * Formats a date into a relative time string (e.g., "2 hours ago", "3 days ago")
 * @param date - ISO date string
 * @returns Relative time string
 */
export function getRelativeTime(date: string | Date): string {
  try {
    date = date instanceof Date ? date : new Date(date);

    if (Number.isNaN(date.getTime())) {
      return "Unknown date";
    }

    // If date is in future, add 'in' prefix
    if (date > new Date()) {
      return `in ${formatDistanceToNow(date)}`;
    }

    return `${formatDistanceToNow(date).replace("about ", "")} ago`;
  } catch (error) {
    return "";
  }
}
