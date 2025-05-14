/**
 * GitHub Pages Router Fix
 * 
 * This script fixes URL corruption issues that occur with wouter router
 * on GitHub Pages. The most common symptom is URLs continuously adding 
 * "/~and~/" segments during navigation.
 * 
 * @version 2.0.0
 * @author SweetMoment Development Team
 */

(function() {
  // Force enable for testing/development
  const FORCE_ENABLE = false;
  // Debug mode for verbose logging
  const DEBUG_MODE = true;
  
  // Run the fix on GitHub Pages or when forced for testing
  const isGitHubPages = window.location.hostname.includes('github.io') || 
                         window.location.hostname.endsWith('.github.io');
  
  if (!isGitHubPages && !FORCE_ENABLE) {
    console.log("[Router Fix] Not running on GitHub Pages - fix not applied");
    return;
  }

  console.log("[Router Fix] Initializing v2.0 router fix for GitHub Pages");
  
  // Track state to avoid infinite loops
  let isFixingUrl = false;
  let lastCleanedPath = null;
  
  // Attempt to determine the repository name from the URL if we're on GitHub Pages
  let repoNameFromURL = "";
  if (isGitHubPages) {
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    if (pathSegments.length > 0) {
      repoNameFromURL = pathSegments[0];
      if (DEBUG_MODE) console.log("[Router Fix] Detected repo name from URL:", repoNameFromURL);
    }
  }
  
  // Check if we have a known repo name from configuration
  const configuredRepoName = window.REPO_NAME || repoNameFromURL || "SweetMoment";
  if (DEBUG_MODE) console.log("[Router Fix] Using repo name:", configuredRepoName);
  
  /**
   * Extract repository name from the current URL path
   */
  function getRepoNameFromCurrentURL() {
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    if (pathSegments.length > 0) {
      return pathSegments[0];
    }
    return configuredRepoName; // Fallback to configured name
  }
  
  /**
   * Detect multiple types of URL corruption patterns and fix them
   */
  function fixURLCorruption() {
    if (isFixingUrl) return;
    
    try {
      isFixingUrl = true;
      const currentPath = window.location.pathname;
      
      // Skip if we already cleaned this exact path
      if (lastCleanedPath === currentPath) {
        return;
      }
      
      let needsFix = false;
      let cleanPath = currentPath;
      
      // Pattern 1: /~and~/ corruption (most common)
      if (currentPath.includes('/~and~/')) {
        needsFix = true;
        if (DEBUG_MODE) console.log("[Router Fix] Detected '/~and~/' corruption");
        
        // Get base path before corruption
        cleanPath = currentPath.split('/~and~/')[0];
      }
      
      // Pattern 2: Repeated paths like /repoName/page/repoName/page
      const repoName = getRepoNameFromCurrentURL();
      const repoPattern = new RegExp(`(/${repoName}/[^/]+).*\\1`, 'i');
      if (repoPattern.test(currentPath)) {
        needsFix = true;
        if (DEBUG_MODE) console.log("[Router Fix] Detected repeated path pattern:", repoPattern);
        
        // Extract first occurrence of the pattern
        cleanPath = currentPath.match(repoPattern)[1];
      }
      
      // Pattern 3: Double slashes
      if (currentPath.includes('//')) {
        needsFix = true;
        if (DEBUG_MODE) console.log("[Router Fix] Detected double slashes");
        
        // Replace double slashes with single slashes
        cleanPath = currentPath.replace(/\/+/g, '/');
      }
      
      // Final check: Make sure the repository name is present if we're on GitHub Pages
      if (isGitHubPages && repoName && !cleanPath.startsWith('/' + repoName + '/') && cleanPath !== '/' + repoName) {
        // Special case for root path
        if (cleanPath === '/' || cleanPath === '') {
          cleanPath = '/' + repoName;
        } else if (!cleanPath.startsWith('/')) {
          cleanPath = '/' + repoName + '/' + cleanPath;
        } else {
          cleanPath = '/' + repoName + cleanPath;
        }
        needsFix = true;
      }
      
      // Apply the fix if needed
      if (needsFix) {
        console.log("[Router Fix] Fixing URL from:", currentPath, "to:", cleanPath);
        window.history.replaceState(null, document.title, cleanPath);
        lastCleanedPath = cleanPath;
      }
      
    } catch (err) {
      console.error("[Router Fix] Error fixing URL:", err);
    } finally {
      isFixingUrl = false;
    }
  }
  
  // Create a more robust patching method for history API
  function patchHistoryMethod(methodName) {
    const original = window.history[methodName];
    window.history[methodName] = function() {
      // Call original method first
      const result = original.apply(this, arguments);
      
      // Then fix any corruption that might have happened
      setTimeout(fixURLCorruption, 0);
      
      // Schedule another check a bit later (helps with more complex navigation)
      setTimeout(fixURLCorruption, 50);
      
      return result;
    };
    if (DEBUG_MODE) console.log(`[Router Fix] Patched history.${methodName}`);
  }
  
  // Fix on initial load 
  setTimeout(fixURLCorruption, 0);
  
  // Monitor hash changes
  window.addEventListener('hashchange', function() {
    if (DEBUG_MODE) console.log("[Router Fix] Hash change detected");
    setTimeout(fixURLCorruption, 0);
  });
  
  // Patch history API methods
  patchHistoryMethod('pushState');
  patchHistoryMethod('replaceState');
  
  // Monitor navigation events (route changes)
  document.addEventListener('click', function(event) {
    // Check for <a> tag clicks which might be navigation
    let target = event.target;
    while (target && target !== document) {
      if (target.tagName.toLowerCase() === 'a') {
        if (DEBUG_MODE) console.log("[Router Fix] Link click detected");
        // Check after a short delay to catch the URL change
        setTimeout(fixURLCorruption, 50);
        setTimeout(fixURLCorruption, 300); // Second check for delayed navigation
        break;
      }
      target = target.parentNode;
    }
  });
  
  // Apply specific patches for wouter compatibility
  if (window.wouter) {
    if (DEBUG_MODE) console.log("[Router Fix] Detected wouter - applying specific patches");
    // This would contain wouter-specific fixes if needed
  }
  
  // Check periodically (safety net for complex navigation scenarios)
  setInterval(fixURLCorruption, 1000);
  
  // Use the browser's Navigation API if available for modern browsers
  if (window.navigation && typeof window.navigation.addEventListener === 'function') {
    if (DEBUG_MODE) console.log("[Router Fix] Using Navigation API");
    window.navigation.addEventListener('navigate', function() {
      setTimeout(fixURLCorruption, 0);
    });
  }
  
  // Define a global fix function that can be manually triggered if needed
  window.fixGitHubPagesUrl = fixURLCorruption;
  
  console.log("[Router Fix] GitHub Pages router fix v2.0 installed successfully");
})();