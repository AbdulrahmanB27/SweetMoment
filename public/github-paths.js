/**
 * GitHub Pages Path Fixer
 * 
 * This script fixes path issues that cause 404 errors on GitHub Pages deployments.
 * It ensures all assets (CSS, images, scripts) load correctly from the repository base path.
 * 
 * How it works:
 * 1. Detects if the site is running on GitHub Pages (github.io domain)
 * 2. Extracts the repository name from the URL path
 * 3. Updates all relative URLs to include the repository prefix
 */
document.addEventListener('DOMContentLoaded', function() {
  // Only run on GitHub Pages
  if (window.location.hostname.includes('github.io')) {
    console.log('GitHub Pages detected - fixing resource paths');
    
    // Extract repository name from path
    const pathParts = window.location.pathname.split('/');
    if (pathParts.length > 1) {
      const repoName = pathParts[1];
      if (!repoName) return; // No repository name found
      
      console.log('Repository name detected:', repoName);
      const basePath = '/' + repoName + '/';
      
      // 1. Fix base tag if present, or create one if not
      let baseTag = document.querySelector('base');
      if (!baseTag) {
        baseTag = document.createElement('base');
        document.head.insertBefore(baseTag, document.head.firstChild);
      }
      baseTag.href = basePath;
      console.log('Set base tag href to:', basePath);
      
      // 2. Fix CSS links that might not respect the base tag
      const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
      cssLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('http') && !href.startsWith('/') && !href.startsWith(basePath)) {
          link.href = basePath + href;
          console.log('Fixed CSS link:', href, '->', link.href);
        }
      });
      
      // 3. Fix script sources
      const scripts = document.querySelectorAll('script[src]');
      scripts.forEach(script => {
        const src = script.getAttribute('src');
        if (src && !src.startsWith('http') && !src.startsWith('/') && !src.startsWith(basePath)) {
          script.src = basePath + src;
          console.log('Fixed script src:', src, '->', script.src);
        }
      });
      
      // 4. Fix image sources
      const images = document.querySelectorAll('img[src]');
      images.forEach(img => {
        const src = img.getAttribute('src');
        if (src && !src.startsWith('http') && !src.startsWith('/') && !src.startsWith(basePath)) {
          img.src = basePath + src;
          console.log('Fixed image src:', src, '->', img.src);
        }
      });
      
      // Create a global variable for use by other scripts
      window.GITHUB_PAGES_BASE = basePath;
      console.log('Path fixing complete - created global GITHUB_PAGES_BASE variable');
    }
  }
});