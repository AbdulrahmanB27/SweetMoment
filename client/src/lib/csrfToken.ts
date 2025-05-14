/**
 * CSRF Token Utility
 * 
 * This module provides functions to fetch and manage CSRF tokens for secure API requests.
 * A CSRF token is required for all non-GET requests to protected endpoints.
 */

// Store the most recently received CSRF token
let currentCsrfToken: string | null = null;

/**
 * Fetches a fresh CSRF token from the server by making a GET request
 * that will return the token in the headers
 */
export async function fetchCsrfToken(): Promise<string> {
  try {
    // Make a simple GET request to any endpoint that will return a CSRF token
    const response = await fetch('/api/csrf-token');
    
    // Extract the token from the response headers
    const token = response.headers.get('X-CSRF-Token');
    
    if (!token) {
      throw new Error('No CSRF token found in response headers');
    }
    
    // Store the token for future use
    currentCsrfToken = token;
    return token;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    throw error;
  }
}

/**
 * Gets the current CSRF token or fetches a new one if none exists
 */
export async function getCsrfToken(): Promise<string> {
  if (currentCsrfToken) {
    return currentCsrfToken;
  }
  
  return fetchCsrfToken();
}

/**
 * Adds CSRF token headers to a fetch request options object
 */
export async function addCsrfToken(options: RequestInit = {}): Promise<RequestInit> {
  const token = await getCsrfToken();
  
  return {
    ...options,
    headers: {
      ...options.headers,
      'X-CSRF-Token': token,
    },
  };
}

/**
 * Preloads the CSRF token so it's ready when needed
 * Call this function when the app/component mounts to ensure
 * the token is available before the first API request
 */
export async function preloadCsrfToken(): Promise<void> {
  try {
    await fetchCsrfToken();
  } catch (error) {
    console.error('Failed to preload CSRF token:', error);
  }
}