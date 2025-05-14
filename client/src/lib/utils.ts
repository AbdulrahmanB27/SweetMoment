import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a URL-friendly slug from a product name
 * @param name The product name to convert to a slug
 * @returns A lowercase, hyphenated slug for use in URLs
 */
export function generateProductSlug(name: string): string {
  if (!name) return '';
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

/**
 * Forcefully resets the scroll position of the window to the top
 * Uses multiple methods to ensure it works across browsers/scenarios
 */
export function resetScroll(): void {
  // Immediate reset with no animation
  window.scrollTo(0, 0);
  
  // Alternative methods for stubborn browsers
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
  
  // For browsers that still don't cooperate, do it with a minimal delay
  setTimeout(() => {
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }, 0);
}
