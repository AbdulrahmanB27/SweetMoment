// GitHub Pages Asset Path Fixer - Auto-generated
(function() {
  if (window.location.hostname.indexOf('github.io') === -1) return;
  var pathSegments = window.location.pathname.split('/').filter(Boolean);
  var repoName = pathSegments[0] || '';
  if (!repoName) return;
  console.log('GitHub Pages detected with repository: ' + repoName);
  window.REPO_NAME = repoName;
  
  function fixAssetPaths() {
    var elements = document.querySelectorAll('script[src], link[href], img[src]');
    elements.forEach(function(el) {
      var attr = el.src ? 'src' : 'href';
      var value = el.getAttribute(attr);
      if (value && value.startsWith('/') && !value.startsWith('/' + repoName + '/')) {
        el.setAttribute(attr, '/' + repoName + value);
      }
    });
  }
  
  document.addEventListener('DOMContentLoaded', fixAssetPaths);
})();