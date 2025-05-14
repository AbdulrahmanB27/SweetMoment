/**
 * Duplicate Repository Path Fix Script v1.0
 * 
 * This script specifically addresses the issue where URLs contain duplicate repository names
 * like: /sweet-moment/#/SweetMoment/
 * 
 * This is a targeted fix to run before enhanced-router-fix.js
 */

(function() {
  // Execute immediately
  
  console.log("[Path Fix] Checking for duplicate repository paths");
  
  // Function to detect repository name from URL
  function detectRepoFromUrl() {
    if (window.location.hostname.indexOf('github.io') !== -1) {
      const pathParts = window.location.pathname.split('/');
      if (pathParts.length >= 2 && pathParts[1] !== '') {
        return pathParts[1].toLowerCase(); // Get repository name from URL (case insensitive)
      }
    }
    return null;
  }
  
  // Get base repository name from URL
  const repoName = detectRepoFromUrl() || 'sweet-moment';
  console.log("[Path Fix] Repository name detected: " + repoName);
  
  // Check if the hash part contains the repository name again
  // This should match patterns like /#/SweetMoment/ (case insensitive)
  if (window.location.hash) {
    const hashPath = window.location.hash.toLowerCase();
    const repoInHash = hashPath.indexOf('/#/' + repoName + '/') === 0 || 
                       hashPath.indexOf('#/' + repoName + '/') === 0;
    
    // If we found a duplicate repo path
    if (repoInHash) {
      console.warn("[Path Fix] Duplicate repository path detected in hash: " + window.location.hash);
      
      // Fix the path by removing the repository name from the hash
      let fixedHash = window.location.hash;
      
      // Handle both /#/repoName/ and #/repoName/ cases
      if (fixedHash.indexOf('/#/') === 0) {
        fixedHash = '/#' + fixedHash.substring(3 + repoName.length);
      } else {
        fixedHash = '#' + fixedHash.substring(2 + repoName.length);
      }
      
      // Make sure we have a slash after the hash if needed
      if (!fixedHash.endsWith('/') && !fixedHash.includes('/', 1)) {
        fixedHash += '/';
      }
      
      console.log("[Path Fix] Corrected hash: " + fixedHash);
      
      // Replace the current URL
      history.replaceState(null, document.title, 
        window.location.origin + window.location.pathname + fixedHash);
      
      console.log("[Path Fix] URL corrected");
    } else {
      console.log("[Path Fix] No duplicate repository path found");
    }
  }
})();