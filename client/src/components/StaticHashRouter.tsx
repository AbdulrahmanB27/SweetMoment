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
  }
}

// Custom hook to use hash-based location
function useHashLocation(): [string, (to: string) => void] {
  // Initialize with current hash location or default to /
  const [location, setLocation] = useState(() => {
    // Get the hash portion of the URL (or default to /)
    const hash = window.location.hash.replace(/^#/, '') || '/';
    return hash;
  });

  // Update location when hash changes
  useEffect(() => {
    // Handler for hash change
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#/, '') || '/';
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
    // Don't use window.location.hash as it will trigger a navigation
    if (to[0] === '/') {
      window.location.hash = to;
    } else {
      // Ensure path starts with /
      window.location.hash = '/' + to;
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