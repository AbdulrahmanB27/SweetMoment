/**
 * Date Utilities
 * 
 * This module provides utility functions for handling dates consistently
 * throughout the application, addressing common timezone issues.
 */

/**
 * Takes a date from the calendar component and converts it to a YYYY-MM-DD string format.
 * 
 * Note: The calendar component now has a built-in adjustment (adds 1 day)
 * to correct the timezone displacement issue.
 * 
 * @param selectedDate - Date object returned by the calendar component (already adjusted)
 * @returns Date string in YYYY-MM-DD format that matches the date the user clicked
 */
export function fixCalendarDateSelection(selectedDate: Date): string {
  // Note: The calendar component has already added one day to fix the displacement
  // So we just need to extract the date parts and format them as a string
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth() + 1; // Add 1 because getMonth() is 0-indexed (0-11)
  const day = selectedDate.getDate();
  
  // Format with leading zeros for consistent YYYY-MM-DD format
  const formattedMonth = String(month).padStart(2, '0');
  const formattedDay = String(day).padStart(2, '0');
  
  // Create the ISO date string format (YYYY-MM-DD)
  const isoDateString = `${year}-${formattedMonth}-${formattedDay}`;
  
  // Log for debugging
  console.log('Calendar date received (already adjusted):', selectedDate);
  console.log('Date parts extracted:', { year, month, day });
  console.log('Formatted as date string:', isoDateString);
  
  // Return the formatted date string
  return isoDateString;
}

/**
 * Creates a date object normalized to a consistent representation
 * to completely eliminate timezone shift issues when converting dates.
 * 
 * @param date - Date to normalize or date string
 * @returns Normalized date or undefined if input is invalid
 */
export function normalizeDate(date: Date | string | null | undefined): Date | undefined {
  if (!date) return undefined;
  
  try {
    // Handle string dates in YYYY-MM-DD format directly - most reliable approach
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      // Create an unambiguous ISO string with a fixed time (noon UTC)
      // This guarantees the date won't shift due to timezone conversions
      const isoDateString = `${date}T12:00:00.000Z`;
      return new Date(isoDateString);
    }
    
    // For Date objects or other string formats
    const inputDate = new Date(date);
    
    // Check if the date is valid
    if (isNaN(inputDate.getTime())) {
      return undefined;
    }
    
    // Extract UTC components to ensure consistency
    const year = inputDate.getUTCFullYear();
    const month = inputDate.getUTCMonth(); // 0-indexed
    const day = inputDate.getUTCDate();
    
    // Create an ISO string with a fixed time (noon UTC)
    const isoDateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T12:00:00.000Z`;
    
    // Create a new date from the ISO string
    return new Date(isoDateString);
  } catch (error) {
    console.error("Error normalizing date:", error);
    return undefined;
  }
}

/**
 * Formats a date as ISO string, but handles potential invalid dates
 * 
 * @param date - Date to format
 * @returns ISO string or empty string for invalid dates
 */
export function safeISOString(date: Date | string | null | undefined): string {
  const normalized = normalizeDate(date);
  
  if (!normalized) return "";
  
  // Create an ISO string but ensure it keeps the date as is without timezone shifts
  // by creating a string in YYYY-MM-DDT12:00:00.000Z format
  const year = normalized.getFullYear();
  const month = String(normalized.getMonth() + 1).padStart(2, '0');
  const day = String(normalized.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}T12:00:00.000Z`;
}

/**
 * Safely parses a date from any format and returns a normalized date
 * This is useful for form inputs and APIs where dates may come in different formats
 * 
 * @param dateValue - Date value to parse
 * @returns Normalized date or undefined if parsing fails
 */
export function parseDate(dateValue: any): Date | undefined {
  if (!dateValue) return undefined;
  
  try {
    // Handle strings, Date objects, or timestamps
    return normalizeDate(new Date(dateValue));
  } catch (error) {
    console.error("Error parsing date:", error);
    return undefined;
  }
}

/**
 * Creates a normalized Date object for today at noon local time
 * 
 * @returns Today's date normalized to local noon
 */
export function today(): Date {
  return normalizeDate(new Date()) as Date;
}

/**
 * Creates a normalized Date object for tomorrow at noon local time
 * 
 * @returns Tomorrow's date normalized to local noon
 */
export function tomorrow(): Date {
  const result = new Date();
  result.setDate(result.getDate() + 1);
  return normalizeDate(result) as Date;
}

/**
 * Adds a specified number of days to a date
 * 
 * @param date - Base date
 * @param days - Number of days to add
 * @returns New date with days added or undefined if input date is invalid
 */
export function addDays(date: Date | string | null | undefined, days: number): Date | undefined {
  const normalized = normalizeDate(date);
  if (!normalized) return undefined;
  
  const result = new Date(normalized);
  result.setDate(result.getDate() + days);
  return normalizeDate(result);
}