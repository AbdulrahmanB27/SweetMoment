// This script adds a base tag to fix resource loading on GitHub Pages
document.addEventListener('DOMContentLoaded', function() {
  // Check if we're on GitHub Pages
  if (window.location.hostname.includes('github.io')) {
    // Get repository name from URL
    const pathParts = window.location.pathname.split('/');
    if (pathParts.length > 1) {
      const repoName = pathParts[1];
      console.log('GitHub Pages detected! Repository name:', repoName);
      
      // Create a base tag if it doesn't exist
      if (!document.querySelector('base')) {
        const baseTag = document.createElement('base');
        baseTag.href = '/' + repoName + '/';
        document.head.insertBefore(baseTag, document.head.firstChild);
        console.log('Added base tag with href="/' + repoName + '/"');
      }
    }
  }
});