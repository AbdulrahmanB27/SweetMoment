/**
 * Resource Path Fixer for GitHub Pages
 * 
 * This script fixes resource paths for GitHub Pages deployment
 * by correctly handling both repo subdirectory and custom domain scenarios.
 */

(function() {
  // Detect if we're on GitHub Pages and determine the base path
  function detectBasePath() {
    // Default to empty for custom domains
    let basePath = '';
    
    // Extract from window location for repo subdirectory deployments
    const pathParts = window.location.pathname.split('/');
    if (
      window.location.hostname.endsWith('github.io') && 
      pathParts.length > 1 && 
      pathParts[1] !== '' && 
      !pathParts[1].includes('.')
    ) {
      basePath = '/' + pathParts[1];
    }
    
    return basePath;
  }
  
  // Apply the base path to all relative URLs
  function fixResourcePaths(basePath) {
    console.log('Fixing resource paths with base path:', basePath);
    
    // Only run if we have a base path (repo deployment)
    if (!basePath) {
      console.log('No base path detected, assuming custom domain or root deployment');
      return;
    }
    
    // Fix stylesheet href attributes
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('/') && !href.startsWith('//') && !href.startsWith(basePath)) {
        link.setAttribute('href', basePath + href);
        console.log('Fixed CSS path:', href, '->', basePath + href);
      }
    });
    
    // Fix script src attributes
    document.querySelectorAll('script[src]').forEach(script => {
      const src = script.getAttribute('src');
      if (src && src.startsWith('/') && !src.startsWith('//') && !src.startsWith(basePath)) {
        script.setAttribute('src', basePath + src);
        console.log('Fixed script path:', src, '->', basePath + src);
      }
    });
    
    // Fix image src attributes
    document.querySelectorAll('img[src]').forEach(img => {
      const src = img.getAttribute('src');
      if (src && src.startsWith('/') && !src.startsWith('//') && !src.startsWith(basePath)) {
        img.setAttribute('src', basePath + src);
        console.log('Fixed image path:', src, '->', basePath + src);
      }
    });
    
    // Fix all anchors to include the base path for internal links
    document.querySelectorAll('a[href]').forEach(a => {
      const href = a.getAttribute('href');
      if (href && href.startsWith('/') && !href.startsWith('//') && !href.startsWith(basePath)) {
        a.setAttribute('href', basePath + href);
        console.log('Fixed anchor path:', href, '->', basePath + href);
      }
    });
    
    // Fix background images in inline styles
    document.querySelectorAll('[style*="background-image"]').forEach(el => {
      const style = el.getAttribute('style');
      if (style && style.includes('url(') && style.includes('/') && !style.includes('//')) {
        // Extract URLs and replace them with base path included
        const newStyle = style.replace(/url\(['"](\/[^'"]+)['"]\)/g, `url('${basePath}$1')`);
        el.setAttribute('style', newStyle);
        console.log('Fixed background image style:', style, '->', newStyle);
      }
    });
    
    // Store the base path in a global variable for any dynamic loading
    window.STATIC_BASE_PATH = basePath;
    
    // Attach to the HTML element for CSS use
    document.documentElement.setAttribute('data-base-path', basePath);
  }
  
  // Run the path fixer after the document loads
  document.addEventListener('DOMContentLoaded', function() {
    const basePath = detectBasePath();
    fixResourcePaths(basePath);
    
    // Also fix paths in dynamically loaded content
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes && mutation.addedNodes.length) {
          fixResourcePaths(basePath);
        }
      });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
  });
})();