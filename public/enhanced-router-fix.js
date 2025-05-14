/**
 * Enhanced GitHub Pages Router Fix for Sweet Moment
 * 
 * This script fixes URL corruption issues that occur with wouter router
 * on GitHub Pages, specifically preventing the infinite appending of
 * "/~and~/" segments and preventing excessive refreshing.
 * 
 * Version 4.0 includes critical fixes for severe URL corruption patterns
 * like "?/&/~and~/~and~/" that can cause infinite page refreshing.
 * 
 * @version 4.0.0
 * @author SweetMoment Development Team
 */

(function() {
  // Configuration Options
  const CONFIG = {
    // Debug mode for verbose logging
    DEBUG_MODE: true,
    // Force enable for testing/development
    FORCE_ENABLE: false,
    // Fail-safe repository name if detection fails
    FALLBACK_REPO_NAME: "SweetMoment",
    // How often to check for URL corruption (ms)
    CHECK_INTERVAL: 500,
    // Whether to apply wouter-specific patches
    PATCH_WOUTER: true
  };
  
  // Initialize with a notice in the console
  if (CONFIG.DEBUG_MODE) {
    console.log("[Enhanced Router Fix] Initializing v4.0.0");
  }
  
  // Run the fix only on GitHub Pages or when forced for testing
  const isGitHubPages = window.location.hostname.includes('github.io') || 
                         window.location.hostname.endsWith('.github.io');
  
  if (!isGitHubPages && !CONFIG.FORCE_ENABLE) {
    console.log("[Enhanced Router Fix] Not running on GitHub Pages - fix not applied");
    return;
  }
  
  // Track state to avoid infinite loops
  let isFixingUrl = false;
  let lastCleanedPath = null;
  let fixCount = 0;
  const MAX_FIXES = 10; // Prevent potential issues by limiting consecutive fixes
  let lastFixTime = Date.now();
  
  // Attempt to determine the repository name from the URL if we're on GitHub Pages
  let repoNameFromURL = "";
  if (isGitHubPages) {
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    if (pathSegments.length > 0) {
      repoNameFromURL = pathSegments[0];
      if (CONFIG.DEBUG_MODE) console.log("[Enhanced Router Fix] Detected repo name from URL:", repoNameFromURL);
    }
  }
  
  // Check if we have a known repo name from global configuration
  const configuredRepoName = window.REPO_NAME || repoNameFromURL || CONFIG.FALLBACK_REPO_NAME;
  if (CONFIG.DEBUG_MODE) console.log("[Enhanced Router Fix] Using repo name:", configuredRepoName);
  
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
   * Force a clean reload to a specific page
   * This is a last resort for severe URL corruption cases
   */
  function forceCleanReload() {
    const repoName = getRepoNameFromCurrentURL();
    // Go directly to the site root
    const rootUrl = '/' + repoName + '/';
    
    console.warn("[Enhanced Router Fix] Forcing clean reload to site root:", rootUrl);
    
    // Use href for a complete reset of browser state
    window.location.href = rootUrl;
  }
  
  /**
   * Detect and fix common URL corruption patterns
   */
  function fixURLCorruption() {
    // Prevent re-entrancy
    if (isFixingUrl) return;
    
    // Initialize fix state
    isFixingUrl = true;
    const currentTime = Date.now();
    const currentPath = window.location.pathname;
    
    // CRITICAL FIX - STEALTH REFRESH LOOP DETECTION
    // Check if page is in a refresh loop without visible URL changes
    if (window.sessionStorage.getItem("refreshCount") === null) {
      window.sessionStorage.setItem("refreshCount", "1");
      window.sessionStorage.setItem("lastRefreshTime", Date.now().toString());
      window.sessionStorage.setItem("initialUrl", window.location.href);
    } else {
      const currentCount = parseInt(window.sessionStorage.getItem("refreshCount"), 10);
      const lastRefreshTime = parseInt(window.sessionStorage.getItem("lastRefreshTime"), 10);
      const initialUrl = window.sessionStorage.getItem("initialUrl");
      const timeDiff = Date.now() - lastRefreshTime;
      
      // If refreshing rapidly (less than 1.5 seconds between refreshes)
      if (timeDiff < 1500) {
        window.sessionStorage.setItem("refreshCount", (currentCount + 1).toString());
        
        // If we've refreshed rapidly 3 times in a row, assume we're in a stealth loop
        if (currentCount >= 3) {
          console.warn("[Enhanced Router Fix] CRITICAL: Detected invisible refresh loop");
          window.sessionStorage.removeItem("refreshCount");
          window.sessionStorage.removeItem("lastRefreshTime");
          window.sessionStorage.removeItem("initialUrl");
          
          // Simply force a reload to the site root - no fancy URL handling
          console.log("[Enhanced Router Fix] Redirecting to site root");
          forceCleanReload();
          isFixingUrl = false;
          return;
        }
      } else {
        // Reset counter if enough time has passed between refreshes
        window.sessionStorage.setItem("refreshCount", "1");
      }
      
      window.sessionStorage.setItem("lastRefreshTime", Date.now().toString());
    }
    
    try {
      // CRITICAL FIX: Check for the exact problematic pattern shown by user
      // This handles specifically the ?/&/~and~/~and~/ pattern that's causing infinite refreshes
      if (window.location.search && (
          window.location.search.includes('?/&/~and~') || 
          window.location.search.includes('?/~and~') ||
          window.location.search.includes('/?/&/')
      )) {
        if (CONFIG.DEBUG_MODE) console.log("[Enhanced Router Fix] Detected critical URL corruption pattern:", window.location.search);
        
        // This is a severe issue, completely reset to the repository root
        const cleanRepoPath = '/' + getRepoNameFromCurrentURL();
        console.warn("[Enhanced Router Fix] Severe URL corruption detected - resetting to:", cleanRepoPath);
        
        // Force URL reset and prevent loops
        window.history.replaceState(null, document.title, cleanRepoPath);
        lastCleanedPath = cleanRepoPath;
        fixCount++;
        lastFixTime = Date.now();
        
        // If conditions are right for an infinite loop, force a page reload as a last resort
        // This only happens on the most severe corruption
        if (window.location.search.includes('~and~/~and~/')) {
          console.warn("[Enhanced Router Fix] Multiple nested corruptions detected, forcing hash-based reload");
          forceCleanReload();
          return;
        }
        
        isFixingUrl = false;
        return; // Exit early after this emergency fix
      }
      
      // Prevent excessive fixes in a short time period to prevent loops
      if (currentTime - lastFixTime < 200 && fixCount > MAX_FIXES) {
        console.warn(`[Enhanced Router Fix] Too many fixes (${fixCount}) in a short time period, pausing fix attempts`);
        setTimeout(() => { fixCount = 0; }, 5000); // Reset counter after 5 seconds
        return;
      }
      
      // Skip if we already cleaned this exact path
      if (lastCleanedPath === currentPath) {
        return;
      }
      
      // Initialize fix variables
      let needsFix = false;
      let cleanPath = currentPath;
      
      // IMPROVED PATTERN 1: Handle the /~and~/ corruption more aggressively
      if (currentPath.includes('/~and~/')) {
        needsFix = true;
        if (CONFIG.DEBUG_MODE) console.log("[Enhanced Router Fix] Detected '/~and~/' corruption");
        
        // More aggressive fix - take everything before the first /~and~/
        cleanPath = currentPath.split('/~and~/')[0];
        
        // If the resulting path is empty, set it to root of the repository
        if (!cleanPath || cleanPath === '') {
          cleanPath = '/' + getRepoNameFromCurrentURL();
        }
      }
      
      // IMPROVED PATTERN 2: Handle nested repository paths with better regex
      const repoName = getRepoNameFromCurrentURL();
      const repoPattern = new RegExp(`/(${repoName})(/[^/]+).*?\\1\\2`, 'i');
      if (repoPattern.test(currentPath)) {
        needsFix = true;
        if (CONFIG.DEBUG_MODE) console.log("[Enhanced Router Fix] Detected repeated repository pattern");
        
        // Extract the correct portion of the path more accurately
        const match = currentPath.match(repoPattern);
        if (match && match.index === 0) {
          cleanPath = '/' + match[1] + match[2]; // Construct clean path from matched groups
        }
      }
      
      // IMPROVED PATTERN 3: Handle double slashes and other URL encoding issues
      if (currentPath.includes('//') || currentPath.includes('%2F') || currentPath.includes('%2f')) {
        needsFix = true;
        if (CONFIG.DEBUG_MODE) console.log("[Enhanced Router Fix] Detected double slashes or encoded slashes");
        
        // Replace double slashes and encoded slashes with single slashes
        cleanPath = cleanPath.replace(/\/+/g, '/').replace(/%2F/gi, '/');
      }
      
      // PATTERN 4: Fix query string encoding issues that can cause routing problems
      const queryString = window.location.search;
      if (queryString && (queryString.includes('/~and~/') || queryString.includes('/%2F'))) {
        if (CONFIG.DEBUG_MODE) console.log("[Enhanced Router Fix] Detected corrupted query string");
        needsFix = true;
        
        // Fix the URL by removing the problematic query string entirely
        window.history.replaceState(null, document.title, cleanPath);
        lastCleanedPath = cleanPath;
        return; // Early return after this specific fix
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
        console.log("[Enhanced Router Fix] Fixing URL from:", currentPath, "to:", cleanPath);
        window.history.replaceState(null, document.title, cleanPath);
        lastCleanedPath = cleanPath;
        fixCount++;
        lastFixTime = Date.now();
      } else {
        // If no fix was needed, gradually reset the fix counter
        if (fixCount > 0 && currentTime - lastFixTime > 2000) {
          fixCount = Math.max(0, fixCount - 1);
        }
      }
    } catch (err) {
      console.error("[Enhanced Router Fix] Error fixing URL:", err);
    } finally {
      isFixingUrl = false;
    }
  }
  
  /**
   * Patch history methods to intercept navigation changes
   */
  function patchHistoryMethod(methodName) {
    const original = window.history[methodName];
    window.history[methodName] = function() {
      // Call original method first
      const result = original.apply(this, arguments);
      
      // Then fix any corruption that might have happened
      setTimeout(fixURLCorruption, 0);
      
      // Schedule another check a bit later (helps with more complex navigation)
      setTimeout(fixURLCorruption, 100);
      
      return result;
    };
    if (CONFIG.DEBUG_MODE) console.log(`[Enhanced Router Fix] Patched history.${methodName}`);
  }
  
  /**
   * Apply wouter-specific patches when detected
   */
  function applyWouterPatches() {
    if (!window.wouter && !window._wouter) return;
    
    if (CONFIG.DEBUG_MODE) console.log("[Enhanced Router Fix] Detected wouter - applying specific patches");
    
    // Set up a MutationObserver to watch for wouter route changes through DOM updates
    const observer = new MutationObserver((mutations) => {
      // Check if any mutations might be related to navigation
      const navigationRelated = mutations.some(mutation => {
        return mutation.type === 'childList' && 
               mutation.addedNodes.length > 0;
      });
      
      if (navigationRelated) {
        setTimeout(fixURLCorruption, 0);
      }
    });
    
    // Start observing the document body for route-related changes
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });
    
    if (CONFIG.DEBUG_MODE) console.log("[Enhanced Router Fix] Set up MutationObserver for wouter");
  }
  
  // Fix on initial load 
  setTimeout(fixURLCorruption, 0);
  
  // Patch history methods to intercept navigation
  patchHistoryMethod('pushState');
  patchHistoryMethod('replaceState');
  
  // Monitor link clicks for navigation events
  document.addEventListener('click', function(event) {
    // Check for <a> tag clicks which might be navigation
    let target = event.target;
    while (target && target !== document) {
      if (target.tagName && target.tagName.toLowerCase() === 'a') {
        if (CONFIG.DEBUG_MODE) console.log("[Enhanced Router Fix] Link click detected");
        // Multi-phase checking after a click to ensure we catch the URL change
        setTimeout(fixURLCorruption, 10);
        setTimeout(fixURLCorruption, 100);
        setTimeout(fixURLCorruption, 500);
        break;
      }
      target = target.parentNode;
    }
  });
  
  // Apply wouter-specific patches if enabled
  if (CONFIG.PATCH_WOUTER) {
    // Try immediately if wouter is already loaded
    applyWouterPatches();
    
    // Also try again after a delay to catch async loading
    setTimeout(applyWouterPatches, 1000);
  }
  
  // Set up periodic URL checking as a safety net
  const intervalId = setInterval(fixURLCorruption, CONFIG.CHECK_INTERVAL);
  
  // Use Navigation API if available (modern browsers)
  if (window.navigation && typeof window.navigation.addEventListener === 'function') {
    if (CONFIG.DEBUG_MODE) console.log("[Enhanced Router Fix] Using Navigation API");
    window.navigation.addEventListener('navigate', function() {
      setTimeout(fixURLCorruption, 0);
    });
  }
  
  // Set up a global fix function that can be manually triggered if needed
  window.fixGitHubPagesUrl = fixURLCorruption;
  
  // Provide a method to disable the fix if needed
  window.disableGitHubPagesRouterFix = function() {
    clearInterval(intervalId);
    console.log("[Enhanced Router Fix] Router fix has been disabled");
  };
  
  // Apply additional Wouter-specific patch: fix URL paths on useLocation and useRoute hooks
  if (typeof window.wouter !== 'undefined') {
    try {
      // This is a deep patch, only attempt if DEBUG_MODE is on
      if (CONFIG.DEBUG_MODE && CONFIG.PATCH_WOUTER) {
        console.log("[Enhanced Router Fix] Attempting to patch Wouter internals");
        // (Advanced wouter patching would go here if needed)
      }
    } catch (e) {
      console.error("[Enhanced Router Fix] Error patching Wouter:", e);
    }
  }
  
  console.log("[Enhanced Router Fix] GitHub Pages router fix v4.0.0 installed successfully");
})();