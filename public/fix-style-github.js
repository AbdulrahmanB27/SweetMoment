/**
 * CSS Path Fixer for GitHub Pages Deployment
 * This script fixes the paths to CSS files when the site is deployed to GitHub Pages.
 */
(function() {
  // We will run this on DOMContentLoaded to fix CSS paths before the page renders
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Running CSS path fixer for GitHub Pages...');
    
    // Detect if we're running on GitHub Pages
    const isGitHubPages = window.location.hostname.includes('github.io');
    if (!isGitHubPages) {
      console.log('Not running on GitHub Pages, no need to fix CSS paths');
      return;
    }

    // Get the repository name from the location
    const pathSegments = window.location.pathname.split('/');
    const repoName = pathSegments[1]; // The repository name is the first segment of the path
    
    console.log('Detected GitHub Pages repository:', repoName);
    
    // Fix the base href
    const baseTag = document.querySelector('base');
    if (baseTag) {
      baseTag.href = `/${repoName}/`;
      console.log('Updated base href to:', baseTag.href);
    }
    
    // Additionally, we'll look for any CSS files that may be loaded directly and fix those paths
    const links = document.querySelectorAll('link[rel="stylesheet"]');
    links.forEach(link => {
      if (link.href && !link.href.startsWith('http') && link.href.startsWith('/')) {
        const newHref = `/${repoName}${link.getAttribute('href')}`;
        link.href = newHref;
        console.log('Fixed CSS path:', newHref);
      }
    });
    
    console.log('CSS path fixing complete for GitHub Pages');
  });
})();