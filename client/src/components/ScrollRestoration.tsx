import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import resetScroll from '../resetScroll';

/**
 * ScrollRestoration component that handles automatic scroll positioning
 * 
 * This component ensures that:
 * 1. The page always starts scrolled to the top when navigating
 * 2. The scroll position is reset immediately rather than using smooth scrolling
 * 3. Takes special measures to handle various browser and device quirks
 */
export default function ScrollRestoration() {
  const [location] = useLocation();
  const prevLocationRef = useRef<string | null>(null);

  // Function to reset scroll with multiple approaches, similar to our resetScroll utility
  // but specialized for the location change use case
  const resetScrollPosition = () => {
    console.log('ScrollRestoration: Resetting scroll for location change to', location);
    
    // Apply all immediate scroll reset methods
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo(0, 0);
    
    // Use our comprehensive resetScroll utility
    resetScroll();
    
    // Apply additional scroll reset in a staggered manner for persistent issues
    const applyScrollResets = () => {
      const timeouts = [0, 50, 100, 250, 500];
      
      timeouts.forEach(timeout => {
        setTimeout(() => {
          window.scrollTo(0, 0);
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        }, timeout);
      });
    };
    
    // Execute the staggered resets
    applyScrollResets();
  };

  useEffect(() => {
    // Only trigger when location actually changes
    if (prevLocationRef.current !== location) {
      // Set scroll position to top immediately
      resetScrollPosition();
      
      // Store current location for future comparison
      prevLocationRef.current = location;
    }
  }, [location]);

  // Additional useEffect to catch any scroll position that may have been set after
  // the initial render but before the component fully mounted
  useEffect(() => {
    const initialScrollReset = setTimeout(() => {
      resetScrollPosition();
    }, 100);
    
    return () => clearTimeout(initialScrollReset);
  }, []);

  return null; // This is a utility component with no visible UI
}