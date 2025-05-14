// Path detection and fixing script for GitHub Pages
(function() {
  // Detect GitHub Pages hosting
  const isGitHubPages = window.location.hostname.includes('github.io');
  
  if (isGitHubPages) {
    // Extract repository name from path
    const pathSegments = window.location.pathname.split('/');
    
    // GitHub Pages project sites have the repo name as the first path segment
    if (pathSegments.length > 1) {
      const repoName = pathSegments[1];
      console.log('Detected GitHub Pages repository:', repoName);
      
      // Fix base URL for all resources
      const baseHref = document.createElement('base');
      baseHref.href = '/' + repoName + '/';
      document.head.prepend(baseHref);
      
      // Fix relative URLs in <link> and <script> tags
      document.querySelectorAll('link[rel="stylesheet"], script[src]').forEach(element => {
        const srcAttr = element.src ? 'src' : 'href';
        const currentPath = element[srcAttr];
        
        if (currentPath && currentPath.startsWith('./')) {
          // Convert ./style.css to /repoName/style.css
          element[srcAttr] = '/' + repoName + '/' + currentPath.substring(2);
        } else if (currentPath && currentPath.startsWith('/')) {
          // Convert /style.css to /repoName/style.css
          if (!currentPath.startsWith('/' + repoName + '/')) {
            element[srcAttr] = '/' + repoName + currentPath;
          }
        }
      });
      
      console.log('Path fixing complete for GitHub Pages');
    }
  }
})();