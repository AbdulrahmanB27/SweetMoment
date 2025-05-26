// Sweet Moment Static Site - GitHub Pages Edition
// This file ensures GitHub Pages loads all assets correctly

(function() {
  console.log("Sweet Moment Static Site - Initializing...");
  
  // Fix for assets not loading due to incorrect base path
  function fixAssetPaths() {
    // Only run this on GitHub Pages
    if (window.location.hostname.indexOf('github.io') === -1) return;
    
    // Get repository name from the URL path
    var pathSegments = window.location.pathname.split('/').filter(Boolean);
    var repoName = pathSegments[0] || '';
    
    if (!repoName) return;
    
    console.log("Detected repository name from URL: " + repoName);
    window.REPO_NAME = repoName;
    
    // Fix script and stylesheet paths
    var scripts = document.getElementsByTagName('script');
    var links = document.getElementsByTagName('link');
    var images = document.getElementsByTagName('img');
    
    function fixElementSrc(elements, attrName) {
      for (var i = 0; i < elements.length; i++) {
        var element = elements[i];
        var src = element.getAttribute(attrName);
        
        if (src && src.startsWith('/') && !src.startsWith('/' + repoName + '/')) {
          // Fix absolute paths that don't include the repo name
          var newSrc = '/' + repoName + src;
          console.log("Fixed asset path: " + src + " → " + newSrc);
          element.setAttribute(attrName, newSrc);
        }
      }
    }
    
    // Run the fixes
    fixElementSrc(scripts, 'src');
    fixElementSrc(links, 'href');
    fixElementSrc(images, 'src');
    
    // Handle any dynamic content loading (SPA navigation)
    var originalFetch = window.fetch;
    window.fetch = function(url, options) {
      if (typeof url === 'string' && url.startsWith('/') && !url.startsWith('/' + repoName + '/')) {
        url = '/' + repoName + url;
      }
      return originalFetch.call(this, url, options);
    };
    
    // Fix XMLHttpRequests
    var originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
      if (typeof url === 'string' && url.startsWith('/') && !url.startsWith('/' + repoName + '/')) {
        url = '/' + repoName + url;
      }
      return originalOpen.call(this, method, url, async, user, password);
    };
    
    console.log("Asset path handling initialized for GitHub Pages");
  }
  
  // Run immediately and also after page loads fully
  fixAssetPaths();
  window.addEventListener('load', fixAssetPaths);
})();