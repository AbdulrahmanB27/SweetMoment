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
 */
function getRepoName(): string | null {
  // Try to get from window global (set in enhanced-router-fix.js)
  if (typeof window !== 'undefined' && window.REPO_NAME) {
    return window.REPO_NAME;
  }
  
  // Try to detect from URL if on GitHub Pages
  if (typeof window !== 'undefined' && window.location.hostname.includes('github.io')) {
    const pathParts = window.location.pathname.split('/');
    if (pathParts.length >= 2 && pathParts[1] !== '') {
      return pathParts[1]; // Return the first path segment
    }
  }
  
  // Default repository name
  return 'sweet-moment';
}

/**
 * Clean path by removing duplicate repository name segments
 * This fixes issues like /SweetMoment/product/1 when the repo is already SweetMoment
 */
function cleanHashPath(path: string): string {
  const repoName = getRepoName();
  if (!repoName) return path;
  
  // Convert to lowercase for case-insensitive matching
  const lowerPath = path.toLowerCase();
  const lowerRepoName = repoName.toLowerCase();
  
  // Check if path starts with /repoName/
  if (lowerPath.startsWith('/' + lowerRepoName + '/')) {
    console.log(`[StaticHashRouter] Cleaning path by removing repository prefix: ${path} -> ${path.substring(repoName.length + 1)}`);
    return path.substring(repoName.length + 1);
  }
  
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