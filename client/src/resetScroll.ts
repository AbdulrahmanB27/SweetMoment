/**
 * Reset the scroll position to the top of the page immediately
 * 
 * This utility ensures that when navigating between pages, the new page
 * always starts at the top rather than maintaining the scroll position
 * or animating to the top.
 */
export function resetScroll(): void {
  // Function to do the actual scrolling with all methods
  const doScroll = () => {
    // Method 1: Force the layout to recalculate by accessing a property that triggers reflow
    // This helps ensure our scroll commands are applied after any pending layout changes
    const forceReflow = document.documentElement.offsetHeight;
    
    // Method 2: Direct DOM manipulation - most reliable for immediate positioning
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    
    // Method 3: Alternative DOM element for older browsers
    if (document.body) {
      document.body.scrollTop = 0;
    }
    
    // Method 4: window.scrollTo - standard approach
    window.scrollTo(0, 0);
    
    // Method 5: Ensure no smooth scrolling behavior is applied with explicit options
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto' // Specifically use 'auto' not 'smooth' to ensure no animation
    });
    
    // Method 6: Try to override any scroll positions for absolute reliability
    try {
      window.scroll({
        top: 0,
        left: 0,
        behavior: 'auto'
      });
    } catch (e) {
      // Fallback for older browsers
      window.scroll(0, 0);
    }
    
    // Method 7: For scroll containers that might be nested
    document.querySelectorAll('.scroll-container').forEach(container => {
      (container as HTMLElement).scrollTop = 0;
    });
  };
  
  // First execute immediately
  doScroll();
  
  // Then execute again after a microscopic delay to ensure it happens after React's rendering
  setTimeout(doScroll, 0);
  
  // And once more with a slightly longer delay as an insurance policy
  setTimeout(doScroll, 50);
}

export default resetScroll;