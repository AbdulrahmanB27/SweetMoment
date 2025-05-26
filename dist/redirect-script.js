// GitHub Pages SPA redirect script v3.0
// This handles direct navigation to pages when shared or bookmarked
(function() {
  // Detect current URL path
  var path = location.pathname.slice(1);
  var segments = path.split('/');
  var firstSegment = segments[0] || '';
  
  // Check if we need to redirect
  var shouldRedirect = !location.hash && path !== '' && !path.endsWith('.html');
  
  if (shouldRedirect) {
    // Store path to redirect after page load
    sessionStorage.redirect = location.href;
    
    // Calculate base path for GitHub Pages
    var repo = firstSegment;
    var basePath = '/' + repo + '/';
    
    // Redirect to base page that will handle routing
    location.href = location.origin + basePath;
  }
})();