/**
 * GitHub Pages Router Fix
 * 
 * This script fixes URL corruption issues that occur with wouter router
 * on GitHub Pages. The most common symptom is URLs continuously adding 
 * "/~and~/" segments during navigation.
 * 
 * @version 1.0.0
 * @author SweetMoment Development Team
 */

(function() {
  // Only run this fix on GitHub Pages domains
  const isGitHubPages = window.location.hostname.includes('github.io') || 
                         window.location.hostname.endsWith('.github.io');
  
  if (!isGitHubPages) {
    console.log("[Router Fix] Not running on GitHub Pages - fix not applied");
    return;
  }

  console.log("[Router Fix] Initializing router fix for GitHub Pages");
  
  // Track if we've already fixed an issue to avoid infinite loops
  let isFixingUrl = false;
  
  /**
   * Detect and fix a corrupted URL with "/~and~/" pattern
   */
  function fixRecursiveAndIssue() {
    if (isFixingUrl) return;
    
    try {
      isFixingUrl = true;
      const currentPath = window.location.pathname;
      
      // Check if URL has the corrupted pattern
      if (currentPath.includes('/~and~/')) {
        console.log("[Router Fix] Detected URL corruption with /~and~/");
        
        // Extract the base URL (before any corruption)
        let cleanPath = currentPath;
        
        // Handle multiple /~and~/ occurrences 
        if (currentPath.indexOf('/~and~/') >= 0) {
          cleanPath = currentPath.split('/~and~/')[0];
          
          // Some paths might need to preserve one segment after a specific pattern
          // This is application-specific and may need adjustment
          const pathParts = currentPath.split('/');
          const repoName = pathParts[1]; // E.g., "SweetMoment" in "/SweetMoment/menu"
          
          if (cleanPath === "" || cleanPath === "/") {
            // Special case for root path corruption
            cleanPath = "/" + repoName;
          } else if (!cleanPath.includes('/' + repoName + '/') && repoName) {
            // Make sure we preserve the repo name in the path if it's not there
            cleanPath = '/' + repoName + cleanPath;
          }
        }
        
        console.log("[Router Fix] Fixing URL from:", currentPath, "to:", cleanPath);
        
        // Use history API to fix the URL without a reload
        window.history.replaceState(null, document.title, cleanPath);
      }
    } catch (err) {
      console.error("[Router Fix] Error fixing URL:", err);
    } finally {
      isFixingUrl = false;
    }
  }
  
  // Apply fix on page load
  fixRecursiveAndIssue();
  
  // Monitor hash changes (Single Page App navigation)
  window.addEventListener('hashchange', fixRecursiveAndIssue);
  
  // Patch history API methods to intercept navigation
  const originalPushState = window.history.pushState;
  window.history.pushState = function() {
    const result = originalPushState.apply(this, arguments);
    fixRecursiveAndIssue();
    return result;
  };
  
  const originalReplaceState = window.history.replaceState;
  window.history.replaceState = function() {
    const result = originalReplaceState.apply(this, arguments);
    fixRecursiveAndIssue();
    return result;
  };
  
  // Catch all navigation events on the page
  document.addEventListener('click', function(event) {
    // Let the click happen, then check the URL
    setTimeout(fixRecursiveAndIssue, 50);
  });
  
  // Last resort - check periodically for issues
  setInterval(fixRecursiveAndIssue, 2000);
  
  console.log("[Router Fix] GitHub Pages router fix installed successfully");
})();