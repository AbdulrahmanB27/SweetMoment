import { useEffect } from 'react';
import { useLocation } from 'wouter';
import resetScroll from '../resetScroll';

// Hook to reset scroll position when the route changes
export function useScrollReset() {
  const [location] = useLocation();

  // Effect to reset scroll when location changes
  useEffect(() => {
    // Reset scroll position to top
    resetScroll();
    
    // We want this to run on every location change
  }, [location]);

  return null;
}