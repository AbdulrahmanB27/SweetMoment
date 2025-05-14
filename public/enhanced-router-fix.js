/**
 * Enhanced GitHub Pages Router Fix v4.0
 * 
 * This script fixes GitHub Pages routing issues with SPAs by using hash-based routing.
 * It also detects and breaks refresh loops to ensure a stable browsing experience.
 */

(function() {
  // Set repository name - must match GitHub repository name exactly (case-sensitive)
  window.REPO_NAME = "SweetMoment";
  
  // Enable hash router for GitHub Pages
  window.USE_HASH_ROUTER = true;
  
  // Log script initialization
  console.log("[Router Fix] Enhanced GitHub Pages Router Fix v4.0 initialized");
  console.log("[Router Fix] Using repository name: " + window.REPO_NAME);
  
  // Detect if this is GitHub Pages or has hash routing explicitly enabled
  var isGitHubPages = 
    window.location.hostname.indexOf('github.io') !== -1 || 
    window.location.hostname === 'github.io' ||
    !!window.USE_HASH_ROUTER;
  
  if (isGitHubPages) {
    console.log("[Router Fix] GitHub Pages detected or hash router explicitly enabled");
    
    // Convert non-hash URLs to hash URLs
    if (window.location.hash === '' && window.location.pathname !== '/') {
      var pathToConvert = window.location.pathname;
      
      // Adjust for repository base path if needed
      if (window.REPO_NAME) {
        var repoPrefix = '/' + window.REPO_NAME;
        if (pathToConvert.startsWith(repoPrefix)) {
          pathToConvert = pathToConvert.substring(repoPrefix.length);
        }
      }
      
      // Handle the case when pathToConvert is now empty (was just the repo name)
      if (pathToConvert === '') {
        pathToConvert = '/';
      }
      
      // Preserve the query string if any
      var queryString = window.location.search || '';
      
      // Redirect with hash
      console.log("[Router Fix] Converting path to hash URL: " + pathToConvert);
      window.location.href = window.location.origin + 
                            window.location.pathname.split('/').slice(0, -1).join('/') + 
                            '/#' + pathToConvert + queryString;
    }
    
    // Detect refresh loops
    var refreshCount = sessionStorage.getItem('refreshCount');
    var lastPath = sessionStorage.getItem('lastPath');
    var lastRefreshTime = sessionStorage.getItem('lastRefreshTime');
    var currentTime = Date.now();
    var currentPath = window.location.pathname + window.location.hash;
    
    // Initialize or update refresh tracking
    if (!refreshCount || !lastRefreshTime || !lastPath) {
      sessionStorage.setItem('refreshCount', '1');
      sessionStorage.setItem('lastPath', currentPath);
      sessionStorage.setItem('lastRefreshTime', currentTime.toString());
    } else {
      // Calculate time since last refresh
      var timeDiff = currentTime - parseInt(lastRefreshTime, 10);
      
      // If same path and quick refresh, increment counter
      if (currentPath === lastPath && timeDiff < 2000) {
        var count = parseInt(refreshCount, 10) + 1;
        sessionStorage.setItem('refreshCount', count.toString());
        
        // Break refresh loop if detected (4+ rapid refreshes on same path)
        if (count >= 4) {
          console.warn("[Router Fix] Detected refresh loop, breaking cycle");
          // Force hash-based URL to break out of any loops
          sessionStorage.clear();
          window.location.href = window.location.origin + window.location.pathname + '#/';
          return;
        }
      } else {
        // Reset counter for normal navigation
        sessionStorage.setItem('refreshCount', '1');
      }
      
      // Update tracking info
      sessionStorage.setItem('lastPath', currentPath);
      sessionStorage.setItem('lastRefreshTime', currentTime.toString());
    }
  }
})();