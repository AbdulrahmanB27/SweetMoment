/**
 * NUCLEAR OPTION PATH FIX - v5.0
 * 
 * This is a last resort fix for persistent repository path issues on GitHub Pages.
 * This script aggressively intercepts and cleans all URL paths.
 */
(function() {
  console.log('[NuclearFix] Initializing absolute path fix v5.0');
  
  // Detect when we're on GitHub Pages
  const isGitHubPages = window.location.hostname.includes('github.io');
  
  // Detect repository name from URL
  function getRepoName() {
    if (window.location.hostname.includes('github.io')) {
      const pathSegments = window.location.pathname.split('/').filter(Boolean);
      if (pathSegments.length > 0) {
        return pathSegments[0];
      }
    }
    return 'sweet-moment'; // Fallback default
  }
  
  // Extract the actual repo name
  const repoName = getRepoName();
  console.log('[NuclearFix] Detected repository:', repoName);
  
  // Aggressive path cleaner
  function cleanPath(path) {
    if (!path) return '#/';
    
    // Make sure we're working with a clean path format
    if (path.startsWith('#')) {
      path = path.substring(1);
    }
    
    // Make sure path starts with /
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
    
    // Create regex patterns for all possible case variations of the repo name
    const escapedRepo = repoName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const repoPattern = new RegExp(`\\/${escapedRepo}\\/`, 'i');
    
    // Remove all instances of repository name from the path
    while (repoPattern.test(path)) {
      path = path.replace(repoPattern, '/');
    }
    
    // Clean up any double slashes
    while (path.includes('//')) {
      path = path.replace('//', '/');
    }
    
    return '#' + path;
  }
  
  // INTERCEPT: Hash changes
  window.addEventListener('hashchange', function(e) {
    const dirtyHash = window.location.hash;
    const cleanHash = cleanPath(dirtyHash);
    
    if (cleanHash !== dirtyHash) {
      console.log(`[NuclearFix] Fixing hash: ${dirtyHash} → ${cleanHash}`);
      
      // Prevent the default navigation and replace with clean version
      history.replaceState(null, document.title, window.location.pathname + cleanHash);
      e.preventDefault();
      e.stopPropagation();
    }
  }, true); // Use capturing phase to intercept before other handlers
  
  // INTERCEPT: Initial URL on page load
  function fixInitialPath() {
    const dirtyHash = window.location.hash;
    const cleanHash = cleanPath(dirtyHash);
    
    if (cleanHash !== dirtyHash) {
      console.log(`[NuclearFix] Fixing initial hash: ${dirtyHash} → ${cleanHash}`);
      
      // Replace URL with clean version
      history.replaceState(null, document.title, window.location.pathname + cleanHash);
      return true;
    }
    return false;
  }
  
  // OVERRIDE: History API methods
  const originalPushState = window.history.pushState;
  const originalReplaceState = window.history.replaceState;
  
  window.history.pushState = function() {
    // Get URL from arguments
    if (arguments.length >= 3 && typeof arguments[2] === 'string') {
      const url = arguments[2];
      
      // Check if URL contains a hash
      const hashIndex = url.indexOf('#');
      if (hashIndex !== -1) {
        // Extract hash part
        const hash = url.substring(hashIndex);
        const cleanHash = cleanPath(hash);
        
        if (cleanHash !== hash) {
          console.log(`[NuclearFix] Cleaning URL in pushState: ${hash} → ${cleanHash}`);
          arguments[2] = url.substring(0, hashIndex) + cleanHash;
        }
      }
    }
    
    return originalPushState.apply(this, arguments);
  };
  
  window.history.replaceState = function() {
    // Get URL from arguments
    if (arguments.length >= 3 && typeof arguments[2] === 'string') {
      const url = arguments[2];
      
      // Check if URL contains a hash
      const hashIndex = url.indexOf('#');
      if (hashIndex !== -1) {
        // Extract hash part
        const hash = url.substring(hashIndex);
        const cleanHash = cleanPath(hash);
        
        if (cleanHash !== hash) {
          console.log(`[NuclearFix] Cleaning URL in replaceState: ${hash} → ${cleanHash}`);
          arguments[2] = url.substring(0, hashIndex) + cleanHash;
        }
      }
    }
    
    return originalReplaceState.apply(this, arguments);
  };
  
  // INTERCEPT: Location hash property
  try {
    const hashDescriptor = Object.getOwnPropertyDescriptor(window.location, 'hash');
    if (hashDescriptor && hashDescriptor.configurable) {
      Object.defineProperty(window.location, 'hash', {
        get: function() {
          return hashDescriptor.get.call(this);
        },
        set: function(newValue) {
          const cleanValue = cleanPath(newValue);
          console.log(`[NuclearFix] Intercepted hash change: ${newValue} → ${cleanValue}`);
          return hashDescriptor.set.call(this, cleanValue);
        },
        configurable: true
      });
    }
  } catch (e) {
    console.error('[NuclearFix] Failed to override location.hash:', e);
  }
  
  // Emergency absolute fallback fix for the most common issue
  function emergencyClean() {
    if (window.location.hash && (
        window.location.hash.toLowerCase().includes('/sweetmoment/') || 
        window.location.hash.toLowerCase().includes('/sweet-moment/')
    )) {
      console.error('[EmergencyFix] Repository name STILL in URL after all fixes! Forcing clean path');
      window.location.hash = '#/';
    }
  }
  
  // FIX IMMEDIATELY
  fixInitialPath();
  
  // Also fix after a very short delay (helps with race conditions)
  setTimeout(fixInitialPath, 100);
  setTimeout(emergencyClean, 200);
  
  // Periodic check for the first few seconds
  for (let i = 1; i <= 5; i++) {
    setTimeout(fixInitialPath, i * 500);
    setTimeout(emergencyClean, i * 500 + 100);
  }
  
  console.log('[NuclearFix] Path protection active');
})();