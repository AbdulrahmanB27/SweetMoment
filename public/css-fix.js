/**
 * CSS Fix for GitHub Pages deployment
 * 
 * This script is injected into the static site to fix CSS and resource path issues.
 * It runs after the page loads and fixes any relative paths in the CSS files.
 */

(function() {
  // Only run in the browser
  if (typeof document === 'undefined') return;
  
  console.log('[CSS Fix] Starting CSS path fixer...');
  
  // Get the base URL from window.STATIC_SITE_BASE_URL or the current path
  const baseUrl = window.STATIC_SITE_BASE_URL || 
    (window.location.pathname.endsWith('/') 
      ? window.location.pathname 
      : window.location.pathname + '/');
  
  console.log(`[CSS Fix] Using base URL: ${baseUrl}`);
  
  // Function to fix CSS URLs
  function fixCssUrls() {
    // Get all stylesheets
    const styleSheets = Array.from(document.styleSheets);
    
    styleSheets.forEach((sheet) => {
      try {
        // Skip external stylesheets or if we can't access rules
        if (!sheet.href || !sheet.cssRules) return;
        
        // Get all CSS rules with url() references
        const rules = Array.from(sheet.cssRules);
        
        rules.forEach((rule) => {
          if (rule.style && rule.style.cssText) {
            // Find all url() references in the rule
            const urlMatches = rule.style.cssText.match(/url\(['"]?([^'")]+)['"]?\)/g);
            
            if (urlMatches) {
              urlMatches.forEach((urlMatch) => {
                // Extract the path from url()
                const pathMatch = urlMatch.match(/url\(['"]?([^'")]+)['"]?\)/);
                
                if (pathMatch && pathMatch[1]) {
                  const originalPath = pathMatch[1];
                  
                  // Skip if it's already an absolute path or data URL
                  if (originalPath.startsWith('http') || 
                      originalPath.startsWith('//') || 
                      originalPath.startsWith('data:')) {
                    return;
                  }
                  
                  // Create the fixed path by prepending the base URL
                  const fixedPath = originalPath.startsWith('/') 
                    ? baseUrl + originalPath.substring(1) // Remove leading slash to avoid double slashes
                    : baseUrl + originalPath;
                    
                  // Replace the original path with the fixed one in the rule
                  const newCssText = rule.style.cssText.replace(
                    `url(${originalPath})`,
                    `url(${fixedPath})`
                  ).replace(
                    `url('${originalPath}')`,
                    `url('${fixedPath}')`
                  ).replace(
                    `url("${originalPath}")`,
                    `url("${fixedPath}")`
                  );
                  
                  // Apply the fixed CSS text
                  rule.style.cssText = newCssText;
                  
                  console.log(`[CSS Fix] Fixed path: ${originalPath} -> ${fixedPath}`);
                }
              });
            }
          }
        });
      } catch (error) {
        // Some stylesheets throw security errors when accessing cssRules from different origins
        console.warn(`[CSS Fix] Could not access stylesheet rules: ${error.message}`);
      }
    });
    
    console.log('[CSS Fix] CSS path fixing complete');
  }
  
  // Run the fix when the page is fully loaded
  if (document.readyState === 'complete') {
    fixCssUrls();
  } else {
    window.addEventListener('load', fixCssUrls);
  }
})();