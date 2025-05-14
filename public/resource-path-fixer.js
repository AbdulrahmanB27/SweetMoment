/**
 * Resource Path Fixer for Static Site
 * 
 * This script fixes resource paths in the static site by handling:
 * 1. Image sources
 * 2. Link hrefs
 * 3. Script sources
 * 4. Custom data-src attributes
 * 
 * It ensures that all relative paths work correctly when deployed to different platforms.
 */

(function() {
  // Only run in the browser
  if (typeof document === 'undefined') return;
  
  console.log('[Resource Fixer] Starting resource path fixer...');
  
  // Get the base URL from window.STATIC_SITE_BASE_URL or the current path
  const baseUrl = window.STATIC_SITE_BASE_URL || 
    (window.location.pathname.endsWith('/') 
      ? window.location.pathname 
      : window.location.pathname + '/');
  
  console.log(`[Resource Fixer] Using base URL: ${baseUrl}`);
  
  /**
   * Fix resource paths in the document
   */
  function fixResourcePaths() {
    // Fix image sources
    document.querySelectorAll('img[src]').forEach(img => {
      if (shouldFixPath(img.src)) {
        const originalSrc = img.getAttribute('src');
        const fixedSrc = fixPath(originalSrc);
        img.setAttribute('src', fixedSrc);
        console.log(`[Resource Fixer] Fixed image src: ${originalSrc} -> ${fixedSrc}`);
      }
    });
    
    // Fix link hrefs
    document.querySelectorAll('link[href]').forEach(link => {
      if (shouldFixPath(link.href)) {
        const originalHref = link.getAttribute('href');
        const fixedHref = fixPath(originalHref);
        link.setAttribute('href', fixedHref);
        console.log(`[Resource Fixer] Fixed link href: ${originalHref} -> ${fixedHref}`);
      }
    });
    
    // Fix script sources
    document.querySelectorAll('script[src]').forEach(script => {
      if (shouldFixPath(script.src)) {
        const originalSrc = script.getAttribute('src');
        const fixedSrc = fixPath(originalSrc);
        script.setAttribute('src', fixedSrc);
        console.log(`[Resource Fixer] Fixed script src: ${originalSrc} -> ${fixedSrc}`);
      }
    });
    
    // Fix data-src attributes (used in lazy loading)
    document.querySelectorAll('[data-src]').forEach(element => {
      const originalSrc = element.getAttribute('data-src');
      if (originalSrc && shouldFixPathString(originalSrc)) {
        const fixedSrc = fixPath(originalSrc);
        element.setAttribute('data-src', fixedSrc);
        console.log(`[Resource Fixer] Fixed data-src: ${originalSrc} -> ${fixedSrc}`);
      }
    });
    
    console.log('[Resource Fixer] Resource path fixing complete');
  }
  
  /**
   * Determine if a path should be fixed
   */
  function shouldFixPath(url) {
    try {
      // Skip empty URLs
      if (!url) return false;
      
      // Parse the URL
      const parsedUrl = new URL(url, window.location.href);
      
      // Skip if different origin (external URL)
      if (parsedUrl.origin !== window.location.origin) {
        return false;
      }
      
      return true;
    } catch (error) {
      // If URL parsing fails, assume it's a relative path that needs fixing
      return true;
    }
  }
  
  /**
   * Determine if a path string should be fixed
   */
  function shouldFixPathString(path) {
    // Skip if it's already an absolute path or data URL
    if (!path || 
        path.startsWith('http') || 
        path.startsWith('//') || 
        path.startsWith('data:') ||
        path.startsWith('#') ||
        path.startsWith('javascript:')) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Fix a path by prepending the base URL
   */
  function fixPath(path) {
    // Skip if it shouldn't be fixed
    if (!shouldFixPathString(path)) {
      return path;
    }
    
    // Create the fixed path by prepending the base URL
    return path.startsWith('/') 
      ? baseUrl + path.substring(1) // Remove leading slash to avoid double slashes
      : baseUrl + path;
  }
  
  // Run when DOM is fully loaded
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    fixResourcePaths();
  } else {
    document.addEventListener('DOMContentLoaded', fixResourcePaths);
  }
  
  // Also run when window has loaded (for images and other resources)
  window.addEventListener('load', fixResourcePaths);
})();