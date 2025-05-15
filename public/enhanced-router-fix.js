/**
 * Enhanced GitHub Pages Router Fix v5.0
 * 
 * This script fixes GitHub Pages routing issues with SPAs by using hash-based routing.
 * It also detects and breaks refresh loops to ensure a stable browsing experience.
 * Added special handling for duplicate repository segments in hash paths.
 */

(function() {
  // Set repository base from build configuration
  window.REPO_BASE = '<!-- REPO_BASE_PLACEHOLDER -->';
  
  // This will be set by the template engine with the actual base URL
  // and will be used instead of hardcoding a specific repository name
  window.REPO_NAME = window.REPO_BASE ? window.REPO_BASE.replace(/^\/|\/$/g, '') : "";
  
  // Function to detect repository name from multiple sources
  function detectRepoName() {
    // First check if REPO_BASE was set in the window object by the template
    if (window.REPO_BASE) {
      const cleanRepoName = window.REPO_BASE.replace(/^\/|\/$/g, '');
      console.log("[Router Fix] Using configured repository name from REPO_BASE:", cleanRepoName);
      return cleanRepoName;
    }
    
    // If on GitHub Pages, try to extract from the URL
    if (window.location.hostname.indexOf('github.io') !== -1) {
      const pathParts = window.location.pathname.split('/');
      if (pathParts.length >= 2 && pathParts[1] !== '') {
        console.log("[Router Fix] Detected repository from URL path:", pathParts[1]);
        return pathParts[1]; // The repo name is the first path segment
      }
    }
    
    // Try to get it from the base tag
    const baseTag = document.querySelector('base');
    if (baseTag && baseTag.href) {
      const baseUrl = baseTag.href;
      const basePathMatch = baseUrl.match(/\/([^\/]+)\/$/);
      if (basePathMatch && basePathMatch[1]) {
        console.log("[Router Fix] Detected repository from base tag:", basePathMatch[1]);
        return basePathMatch[1];
      }
    }
    
    console.warn("[Router Fix] Could not detect repository name, using empty default");
    return ""; // Default to empty if we can't detect
  }
  
  // Try to detect repo name from URL first
  const detectedRepoName = detectRepoName();
  if (detectedRepoName && detectedRepoName !== window.REPO_NAME) {
    console.log("[Router Fix] Detected repository name from URL: " + detectedRepoName);
    window.REPO_NAME = detectedRepoName;
  }
  
  // Enable hash router for GitHub Pages
  window.USE_HASH_ROUTER = true;
  
  // Log script initialization
  console.log("[Router Fix] Enhanced GitHub Pages Router Fix v5.0 initialized");
  console.log("[Router Fix] Using repository name: " + window.REPO_NAME);
  
  // *** Special fix for duplicate repository segments in URLs ***
  // This fixes the /{repoName}/#/{repoName}/... issue
  if (window.location.hash && window.REPO_NAME && window.location.hash.indexOf('/' + window.REPO_NAME + '/') === 1) {
    console.warn("[Router Fix] Detected duplicate repository segment in hash URL, fixing");
    const fixedHash = window.location.hash.replace('/#/' + window.REPO_NAME + '/', '/#/');
    console.log("[Router Fix] Corrected hash URL: " + fixedHash);
    window.location.replace(window.location.origin + window.location.pathname + fixedHash);
    return;
  }
  
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