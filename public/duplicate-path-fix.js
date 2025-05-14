/**
 * GitHub Pages Repository Path Fix (v4.0) - MAXIMUM FORCE EDITION
 * 
 * ULTRA AGGRESSIVE FIX for duplicate repository names in the URL hash.
 * For example, when the URL shows: https://username.github.io/sweet-moment/#/SweetMoment/product/1
 * 
 * This script enforces path cleanliness at every level possible.
 * 
 * Deployment: Add to the very top of your HTML, before any other scripts.
 */
(function() {
  console.log('[PathFix] ⚠️ MAXIMUM FORCE URL cleanup script loaded (v4.0) ⚠️');
  
  // Known repository name variations (case insensitive)
  const REPO_VARIANTS = [
    'sweet-moment', 'SweetMoment', 'sweetmoment', 'sweet_moment', 'Sweet-Moment',
    'sweet_moment', 'Sweet_Moment', 'SWEETMOMENT', 'Sweet', 'moment', 'Moment'
  ];
  
  // Store the actual repository name when detected
  let detectedRepoName = null;
  
  // Store the current clean path to detect loops
  let lastCleanedPath = null;
  let cleaningAttempts = 0;
  
  /**
   * Detect repository name using multiple strategies
   */
  function detectRepoName() {
    // Return cached value if we already detected it
    if (detectedRepoName) {
      return detectedRepoName;
    }
    
    // Check window.REPO_NAME global variable (may be set by other scripts)
    if (window.REPO_NAME) {
      detectedRepoName = window.REPO_NAME;
      console.log(`[PathFix] Using repository name from window.REPO_NAME: ${detectedRepoName}`);
      return detectedRepoName;
    }
    
    // Extract from GitHub Pages URL
    if (window.location.hostname.includes('github.io')) {
      const pathSegments = window.location.pathname.split('/').filter(Boolean);
      if (pathSegments.length > 0) {
        detectedRepoName = pathSegments[0];
        console.log(`[PathFix] Detected repository name from URL path: ${detectedRepoName}`);
        return detectedRepoName;
      }
    }
    
    // Check for repository variants in the URL hash
    const hash = window.location.hash;
    for (const variant of REPO_VARIANTS) {
      const pattern = new RegExp(`#\\/(${variant})\\/`, 'i');
      if (pattern.test(hash)) {
        detectedRepoName = variant;
        console.log(`[PathFix] Detected repository name '${variant}' in hash`);
        return detectedRepoName;
      }
    }
    
    // Try to extract from referrer URL
    try {
      if (document.referrer) {
        const referrerUrl = new URL(document.referrer);
        if (referrerUrl.hostname.includes('github.io')) {
          const pathSegments = referrerUrl.pathname.split('/').filter(Boolean);
          if (pathSegments.length > 0) {
            detectedRepoName = pathSegments[0];
            console.log(`[PathFix] Detected repository name from referrer: ${detectedRepoName}`);
            return detectedRepoName;
          }
        }
      }
    } catch (e) {
      console.error('[PathFix] Error extracting from referrer:', e);
    }
    
    // Last resort: check for any matching variant in the URL
    const fullUrl = window.location.href;
    for (const variant of REPO_VARIANTS) {
      if (fullUrl.toLowerCase().includes(variant.toLowerCase())) {
        detectedRepoName = variant;
        console.log(`[PathFix] Found repository variant in URL: ${variant}`);
        return variant;
      }
    }
    
    // Default to the most common value if nothing else works
    detectedRepoName = 'sweet-moment';
    console.log(`[PathFix] Using default repository name: ${detectedRepoName}`);
    return detectedRepoName;
  }
  
  /**
   * Aggressive path cleaning for hash paths
   */
  function cleanHashPath(hash) {
    if (!hash) return hash;
    
    // Store original for logging
    const originalHash = hash;
    
    // Ensure hash starts with # and has a path with /
    if (hash.charAt(0) === '#') {
      // Remove the hash symbol for processing
      hash = hash.substring(1);
    }
    
    // Ensure path starts with /
    if (hash.charAt(0) !== '/') {
      hash = '/' + hash;
    }
    
    // Get all repository variations for checking
    const repoName = detectRepoName();
    let wasFixed = false;
    
    // First try to clean with the detected repository name
    if (repoName) {
      const lowerHash = hash.toLowerCase();
      const lowerRepoName = repoName.toLowerCase();
      
      if (lowerHash.startsWith('/' + lowerRepoName + '/')) {
        hash = hash.substring(repoName.length + 1);
        wasFixed = true;
      }
    }
    
    // If not fixed yet, try all known repository variants
    if (!wasFixed) {
      for (const variant of REPO_VARIANTS) {
        const lowerHash = hash.toLowerCase();
        const lowerVariant = variant.toLowerCase();
        
        // Clean from start of path
        if (lowerHash.startsWith('/' + lowerVariant + '/')) {
          hash = hash.substring(variant.length + 1);
          wasFixed = true;
          break;
        }
      }
    }
    
    // Also check for repository name elsewhere in the path
    if (!wasFixed) {
      for (const variant of REPO_VARIANTS) {
        const pattern = new RegExp(`\\/${variant}\\/`, 'i');
        if (pattern.test(hash)) {
          // Replace the repo name with a single slash
          hash = hash.replace(pattern, '/');
          wasFixed = true;
          break;
        }
      }
    }
    
    // Ensure path starts with /
    if (hash.charAt(0) !== '/') {
      hash = '/' + hash;
    }
    
    // Add back the hash symbol
    hash = '#' + hash;
    
    // Log changes
    if (wasFixed) {
      console.log(`[PathFix] Cleaned hash path: ${originalHash} → ${hash}`);
    }
    
    return hash;
  }
  
  /**
   * Fix duplicate repository in the current URL hash
   */
  function fixCurrentPath() {
    const originalHash = window.location.hash;
    
    // Skip if there's no hash
    if (!originalHash) return false;
    
    // Clean the hash path
    const cleanedHash = cleanHashPath(originalHash);
    
    // Check if cleaning actually changed something
    if (cleanedHash === originalHash) {
      return false; // No changes needed
    }
    
    // Prevent infinite loops by checking if we're cleaning the same path repeatedly
    if (cleanedHash === lastCleanedPath) {
      cleaningAttempts++;
      console.warn(`[PathFix] Repeated cleaning of the same path (attempt ${cleaningAttempts})`);
      
      if (cleaningAttempts > 3) {
        console.error('[PathFix] Detected potential cleaning loop, stopping');
        // Force to root path as last resort
        window.history.replaceState(null, document.title, window.location.pathname + '#/');
        lastCleanedPath = '#/';
        return true;
      }
    } else {
      // Reset the counter when we clean a new path
      cleaningAttempts = 0;
      lastCleanedPath = cleanedHash;
    }
    
    // Update the URL without triggering a navigation
    console.log(`[PathFix] Fixing URL hash: ${originalHash} → ${cleanedHash}`);
    window.history.replaceState(null, document.title, window.location.pathname + cleanedHash);
    
    return true;
  }
  
  /**
   * Override window.location.hash getter/setter
   */
  function installHashOverride() {
    try {
      // Save original descriptor
      const originalDescriptor = Object.getOwnPropertyDescriptor(window.location, 'hash');
      
      if (originalDescriptor && originalDescriptor.configurable) {
        // Define new descriptor with cleaning
        Object.defineProperty(window.location, 'hash', {
          get: function() {
            return originalDescriptor.get.call(this);
          },
          set: function(newValue) {
            // Clean the hash before setting it
            const cleanedHash = cleanHashPath(newValue);
            return originalDescriptor.set.call(this, cleanedHash);
          },
          configurable: true
        });
        
        console.log('[PathFix] Successfully installed hash property override');
        return true;
      }
    } catch (e) {
      console.error('[PathFix] Failed to override hash property:', e);
    }
    
    return false;
  }
  
  /**
   * Override history API methods
   */
  function installHistoryOverrides() {
    // Save original methods
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;
    
    // Override pushState
    window.history.pushState = function(state, title, url) {
      if (url && typeof url === 'string') {
        // Check if URL contains a hash
        const hashIndex = url.indexOf('#');
        if (hashIndex !== -1) {
          // Extract and clean the hash part
          const hash = url.substring(hashIndex);
          const cleanedHash = cleanHashPath(hash);
          
          // Update the URL with the cleaned hash
          if (cleanedHash !== hash) {
            url = url.substring(0, hashIndex) + cleanedHash;
            console.log(`[PathFix] Cleaned URL in pushState: ${hash} → ${cleanedHash}`);
          }
        }
      }
      
      // Call original method with cleaned URL
      return originalPushState.call(this, state, title, url);
    };
    
    // Override replaceState
    window.history.replaceState = function(state, title, url) {
      if (url && typeof url === 'string') {
        // Check if URL contains a hash
        const hashIndex = url.indexOf('#');
        if (hashIndex !== -1) {
          // Extract and clean the hash part
          const hash = url.substring(hashIndex);
          const cleanedHash = cleanHashPath(hash);
          
          // Update the URL with the cleaned hash
          if (cleanedHash !== hash) {
            url = url.substring(0, hashIndex) + cleanedHash;
            console.log(`[PathFix] Cleaned URL in replaceState: ${hash} → ${cleanedHash}`);
          }
        }
      }
      
      // Call original method with cleaned URL
      return originalReplaceState.call(this, state, title, url);
    };
    
    console.log('[PathFix] Successfully installed history API overrides');
    return true;
  }
  
  /**
   * Main initialization function
   */
  function initialize() {
    try {
      // Detect repository name immediately
      detectRepoName();
      
      // First, fix the current path if needed
      const pathFixed = fixCurrentPath();
      if (pathFixed) {
        console.log('[PathFix] Fixed initial path');
      }
      
      // Install override for window.location.hash property
      installHashOverride();
      
      // Override history pushState and replaceState
      installHistoryOverrides();
      
      // Monitor hash changes
      window.addEventListener('hashchange', function(event) {
        if (fixCurrentPath()) {
          console.log('[PathFix] Fixed path during hash change');
        }
      });
      
      // Set up periodic checks for the first few seconds
      // This catches any changes made by other scripts soon after page load
      let checkCount = 0;
      const interval = setInterval(function() {
        if (fixCurrentPath()) {
          console.log(`[PathFix] Fixed path during scheduled check #${checkCount + 1}`);
        }
        
        checkCount++;
        if (checkCount >= 5) {
          clearInterval(interval);
        }
      }, 1000);
      
      // Store the repository name globally for other scripts
      if (detectedRepoName && typeof window.REPO_NAME === 'undefined') {
        window.REPO_NAME = detectedRepoName;
      }
      
      console.log('[PathFix] Initialization complete - URL protection active');
    } catch (error) {
      console.error('[PathFix] Error during initialization:', error);
    }
  }
  
  // Run immediately - don't wait for anything
  initialize();
})();