/**
 * SweetMoment Repository Path Fix (v2.0)
 * 
 * ENHANCED AGGRESSIVE FIX for duplicate repository names in the URL hash.
 * For example, when the URL shows: https://username.github.io/sweet-moment/#/SweetMoment/product/1
 * 
 * This script runs immediately and intercepts navigation to prevent duplicate paths.
 * 
 * Deployment: Add to the very top of your HTML, before any other scripts.
 */
(function() {
  console.log('[PathFix] ENHANCED URL cleanup script loaded (v2.0)');
  
  // RUN IMMEDIATELY - don't wait for anything
  // This is critical to fix the path before any other scripts run
  
  // Known repository name variations (case insensitive)
  const REPO_NAMES = ['sweet-moment', 'SweetMoment', 'sweetmoment', 'sweet_moment', 'Sweet-Moment'];
  
  // Function to detect repository name from URL
  function detectRepoName() {
    // 1. Use the global variable if available (set by other scripts)
    if (window.REPO_NAME) {
      return window.REPO_NAME;
    }
    
    // 2. Extract from GitHub Pages URL
    if (window.location.hostname.includes('github.io')) {
      const pathSegments = window.location.pathname.split('/').filter(Boolean);
      if (pathSegments.length > 0) {
        return pathSegments[0];
      }
    }
    
    // 3. Default fallback
    return 'sweet-moment';
  }
  
  // Function to check and fix duplicate repository paths
  function fixDuplicatePath() {
    let hash = window.location.hash;
    if (!hash) {
      return false; // No hash, nothing to fix
    }
    
    // Remove the # symbol
    let hashPath = hash.substring(1);
    if (!hashPath || hashPath === '/') {
      return false; // Empty hash or root, nothing to fix
    }
    
    // Ensure hashPath starts with a slash for consistency
    if (hashPath[0] !== '/') {
      hashPath = '/' + hashPath;
    }
    
    // Get detected repository name (or fallback)
    const repoName = detectRepoName();
    let wasFixed = false;
    
    // Check all known variants of the repository name
    for (const variant of REPO_NAMES) {
      const lowerHashPath = hashPath.toLowerCase();
      const lowerVariant = variant.toLowerCase();
      
      // Check if path starts with /repoName/ (with case insensitivity)
      if (lowerHashPath.startsWith('/' + lowerVariant + '/')) {
        console.warn(`[PathFix] Detected duplicate repository segment in URL: ${hash}`);
        
        // Find the exact index where the repo name ends (add 1 for the leading slash)
        const repoEndIndex = hashPath.toLowerCase().indexOf(lowerVariant) + variant.length + 1;
        
        // Create a clean path without the repository segment
        const correctedPath = '#' + hashPath.substring(repoEndIndex);
        
        console.log(`[PathFix] Correcting hash path: ${hash} → ${correctedPath}`);
        
        // Directly update the URL without causing navigation
        if (window.history && window.history.replaceState) {
          window.history.replaceState(
            null, 
            document.title, 
            window.location.pathname + correctedPath + window.location.search
          );
          wasFixed = true;
          
          // Update the global window.location.hash to ensure consistency
          // This is important for any scripts that check the hash before the page fully loads
          try {
            Object.defineProperty(window.location, 'hash', {
              writable: true,
              value: correctedPath
            });
          } catch (e) {
            // Fallback for browsers that don't allow redefining location properties
          }
          
          break; // Exit after fixing
        }
      }
    }
    
    return wasFixed;
  }
  
  // Monkey-patch the history pushState and replaceState methods to prevent bad paths
  const originalPushState = window.history.pushState;
  const originalReplaceState = window.history.replaceState;
  
  // Override pushState to intercept bad URLs before they're set
  window.history.pushState = function(state, title, url) {
    if (url && typeof url === 'string') {
      // Check if URL contains a hash with a duplicate repo name
      const hashIndex = url.indexOf('#');
      if (hashIndex !== -1) {
        const hash = url.substring(hashIndex);
        let fixedHash = hash;
        
        // Check for duplicate repo name in the hash
        const repoName = detectRepoName();
        const REPO_NAMES = ['sweet-moment', 'SweetMoment', 'sweetmoment', 'sweet_moment', 'Sweet-Moment'];
        
        for (const variant of REPO_NAMES) {
          const pattern = new RegExp(`#\/(${variant})\\/`, 'i');
          if (pattern.test(hash)) {
            // Fix the hash by removing the repo name segment
            fixedHash = hash.replace(pattern, '#/');
            console.log(`[PathFix] Intercepted pushState with bad path: ${hash} → ${fixedHash}`);
            url = url.substring(0, hashIndex) + fixedHash;
            break;
          }
        }
      }
    }
    return originalPushState.call(this, state, title, url);
  };
  
  // Override replaceState to intercept bad URLs before they're set
  window.history.replaceState = function(state, title, url) {
    if (url && typeof url === 'string') {
      // Check if URL contains a hash with a duplicate repo name
      const hashIndex = url.indexOf('#');
      if (hashIndex !== -1) {
        const hash = url.substring(hashIndex);
        let fixedHash = hash;
        
        // Check for duplicate repo name in the hash
        const repoName = detectRepoName();
        const REPO_NAMES = ['sweet-moment', 'SweetMoment', 'sweetmoment', 'sweet_moment', 'Sweet-Moment'];
        
        for (const variant of REPO_NAMES) {
          const pattern = new RegExp(`#\/(${variant})\\/`, 'i');
          if (pattern.test(hash)) {
            // Fix the hash by removing the repo name segment
            fixedHash = hash.replace(pattern, '#/');
            console.log(`[PathFix] Intercepted replaceState with bad path: ${hash} → ${fixedHash}`);
            url = url.substring(0, hashIndex) + fixedHash;
            break;
          }
        }
      }
    }
    return originalReplaceState.call(this, state, title, url);
  };
  
  // Apply the fix immediately
  try {
    // Run immediately
    const wasFixed = fixDuplicatePath();
    
    if (wasFixed) {
      console.log('[PathFix] URL has been corrected on page load');
    }
    
    // Also monitor hash changes
    window.addEventListener('hashchange', function(event) {
      // Prevent the default navigation if we need to fix it
      if (fixDuplicatePath()) {
        console.log('[PathFix] Fixed duplicate path during navigation');
      }
    });
    
    // Run again after a delay to catch any late changes
    setTimeout(fixDuplicatePath, 100);
    
    console.log('[PathFix] Path monitoring installed successfully');
  } catch (error) {
    console.error('[PathFix] Error while fixing path:', error);
  }
})();