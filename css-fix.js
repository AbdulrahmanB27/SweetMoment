// CSS Path Fix for GitHub Pages
// This script fixes the common CSS loading issue when hosted on GitHub Pages

(function() {
  // Get the base URL from window context
  const baseUrl = window.STATIC_SITE_BASE_URL || '/';
  console.log('CSS Fixer: Using base URL:', baseUrl);
  
  // Create a function to fix CSS paths in stylesheets
  function fixCssPaths() {
    // Wait until document is fully loaded
    if (document.readyState !== 'complete') {
      window.addEventListener('load', fixCssPaths);
      return;
    }
    
    console.log('CSS Fixer: Starting CSS path fixing...');
    
    // Fix <link> tags pointing to CSS files
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('/assets/')) {
        // Use assets directory in the repository
        link.setAttribute('href', `${baseUrl}${href.substring(1)}`);
        console.log(`CSS Fixer: Fixed link href from ${href} to ${baseUrl}${href.substring(1)}`);
      }
    });
    
    // Find all stylesheets
    Array.from(document.styleSheets).forEach(styleSheet => {
      try {
        // Only process if we can access rules (same origin)
        if (styleSheet.cssRules) {
          // Process each rule
          Array.from(styleSheet.cssRules).forEach(rule => {
            // Check if it's a style rule with background-image
            if (rule.style && rule.style.backgroundImage) {
              const bgImage = rule.style.backgroundImage;
              
              // If the background image contains a URL
              if (bgImage.indexOf('url(') >= 0) {
                // Extract the URL
                const urlMatch = bgImage.match(/url\(['"]?([^'")]+)['"]?\)/);
                if (urlMatch && urlMatch[1]) {
                  const originalUrl = urlMatch[1];
                  
                  // If it's an absolute path starting with /
                  if (originalUrl.startsWith('/') && !originalUrl.startsWith(baseUrl)) {
                    // Create new URL with base URL
                    const newUrl = `${baseUrl}${originalUrl.substring(1)}`;
                    
                    // Update the rule
                    const newBgImage = bgImage.replace(originalUrl, newUrl);
                    rule.style.setProperty('background-image', newBgImage);
                    
                    console.log(`CSS Fixer: Fixed background image from ${originalUrl} to ${newUrl}`);
                  }
                }
              }
            }
          });
        }
      } catch (e) {
        // CORS errors will be thrown when trying to access cross-origin stylesheets
        console.log('CSS Fixer: Could not process stylesheet (likely CORS)', e);
      }
    });
    
    console.log('CSS Fixer: CSS path fixing complete');
  }
  
  // Initialize the fix
  if (document.readyState === 'complete') {
    fixCssPaths();
  } else {
    window.addEventListener('load', fixCssPaths);
  }
  
  console.log('CSS Fixer: Initialized');
})();