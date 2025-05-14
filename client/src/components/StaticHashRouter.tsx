/**
 * StaticHashRouter Component
 * 
 * A hash-based router wrapper for static site deployment that's compatible with GitHub Pages.
 * This component solves the infinite refresh issue by using hash-based routing (#/) instead of
 * normal path-based routing.
 */

import React, { useEffect, useState } from 'react';
import { Router, useLocation, BaseLocationHook } from 'wouter';

// Extend Window interface to include our custom properties
declare global {
  interface Window {
    USE_HASH_ROUTER?: boolean;
    REPO_NAME?: string;
    ROUTER_FIX_VERSION?: string;
  }
}

// Custom hook to use hash-based location
/**
 * Get repository name from window global or detect from URL
 * Enhanced version with multiple detection strategies
 */
function getRepoName(): string | null {
  // 1. Try to get from window global (set in enhanced-router-fix.js)
  if (typeof window !== 'undefined' && window.REPO_NAME) {
    return window.REPO_NAME;
  }
  
  // 2. Try to detect from URL if on GitHub Pages
  if (typeof window !== 'undefined' && window.location.hostname.includes('github.io')) {
    const pathParts = window.location.pathname.split('/').filter(part => part.length > 0);
    if (pathParts.length >= 1) {
      return pathParts[0]; // Return the first path segment
    }
  }
  
  // 3. Try to extract from the referrer if available
  if (typeof document !== 'undefined' && document.referrer) {
    try {
      const referrerUrl = new URL(document.referrer);
      if (referrerUrl.hostname.includes('github.io')) {
        const pathParts = referrerUrl.pathname.split('/').filter(part => part.length > 0);
        if (pathParts.length >= 1) {
          return pathParts[0];
        }
      }
    } catch (e) {
      console.error('[StaticHashRouter] Error parsing referrer:', e);
    }
  }
  
  // 4. Check for common repository name variants in the URL hash 
  if (typeof window !== 'undefined' && window.location.hash) {
    const hash = window.location.hash;
    const repoVariants = ['SweetMoment', 'sweet-moment', 'sweetmoment', 'Sweet-Moment'];
    
    for (const variant of repoVariants) {
      if (hash.includes('/' + variant + '/')) {
        console.log(`[StaticHashRouter] Detected repo name '${variant}' in hash`);
        return variant;
      }
    }
  }
  
  // 5. Default to null - don't provide a hardcoded value
  // This forces the router to not attempt path cleaning unless we're positive about the repo name
  return null;
}

/**
 * Clean path by removing duplicate repository name segments
 * Enhanced version with support for multiple repository variants
 * This fixes issues like /SweetMoment/product/1 when the repo is already SweetMoment
 */
function cleanHashPath(path: string): string {
  // If the path is missing or invalid, just return it
  if (!path) return path;
  
  // Get the repository name from multiple sources
  const repoName = getRepoName();
  
  // Define all possible repository name variants (case insensitive)
  const repoVariants = ['SweetMoment', 'sweet-moment', 'sweetmoment', 'Sweet-Moment'];
  
  // If we found a specific repo name, prioritize checking that first
  if (repoName) {
    // Convert to lowercase for case-insensitive matching
    const lowerPath = path.toLowerCase();
    const lowerRepoName = repoName.toLowerCase();
    
    // Check if path starts with /repoName/
    if (lowerPath.startsWith('/' + lowerRepoName + '/')) {
      console.log(`[StaticHashRouter] Cleaning path - removing detected repo prefix: ${path} -> ${path.substring(repoName.length + 1)}`);
      return path.substring(repoName.length + 1);
    }
  }
  
  // Try all known repository name variants if we didn't clean with the detected name
  const lowerPath = path.toLowerCase();
  for (const variant of repoVariants) {
    const lowerVariant = variant.toLowerCase();
    if (lowerPath.startsWith('/' + lowerVariant + '/')) {
      const cleanedPath = path.substring(variant.length + 1);
      console.log(`[StaticHashRouter] Cleaning path - removing variant ${variant}: ${path} -> ${cleanedPath}`);
      return cleanedPath;
    }
  }
  
  // Check for SweetMoment specifically anywhere in the URL (not just at the start)
  // This handles cases where the path might have been partially cleaned
  for (const variant of repoVariants) {
    const variantPattern = new RegExp(`\\/${variant}\\/`, 'i');
    if (variantPattern.test(path)) {
      const cleanedPath = path.replace(variantPattern, '/');
      console.log(`[StaticHashRouter] Found repo name in middle of path: ${path} -> ${cleanedPath}`);
      return cleanedPath;
    }
  }
  
  // Path doesn't need cleaning
  return path;
}

function useHashLocation(): [string, (to: string) => void] {
  // Initialize with current hash location or default to /
  const [location, setLocation] = useState(() => {
    // Get the hash portion of the URL (or default to /)
    let hash = window.location.hash.replace(/^#/, '') || '/';
    
    // Clean the path by removing repository name if it's duplicated
    hash = cleanHashPath(hash);
    
    return hash;
  });

  // Update location when hash changes
  useEffect(() => {
    // Handler for hash change
    const handleHashChange = () => {
      // Get the hash portion of the URL (or default to /)
      let hash = window.location.hash.replace(/^#/, '') || '/';
      
      // Clean the path by removing repository name if it's duplicated
      hash = cleanHashPath(hash);
      
      setLocation(hash);
    };

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    // Initial check (might be needed if component mounts after hash was set)
    handleHashChange();

    // Clean up
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Custom setter for location that updates the hash
  const setHashLocation = (to: string) => {
    // First clean the path to avoid duplicating repository name
    const cleanedPath = cleanHashPath(to);
    
    // Don't use window.location.hash as it will trigger a navigation
    if (cleanedPath[0] === '/') {
      window.location.hash = cleanedPath;
    } else {
      // Ensure path starts with /
      window.location.hash = '/' + cleanedPath;
    }
  };

  return [location, setHashLocation];
}

interface StaticHashRouterProps {
  children: React.ReactNode;
}

export function useIsGitHubPages() {
  return window.location.hostname.includes('github.io') || 
         !!window.USE_HASH_ROUTER; // Also use hash router if explicitly configured
}

const StaticHashRouter: React.FC<StaticHashRouterProps> = ({ children }) => {
  // Check if this is a static site that needs hash routing
  const isGitHubPages = useIsGitHubPages();
  
  // Use hash-based routing for GitHub Pages, regular routing otherwise
  const routerHook = isGitHubPages ? useHashLocation : useLocation;
  
  if (isGitHubPages) {
    console.log("[StaticHashRouter] Using hash-based routing for GitHub Pages compatibility");
  }

  return (
    <Router hook={routerHook as unknown as BaseLocationHook}>
      {children}
    </Router>
  );
};

export default StaticHashRouter;