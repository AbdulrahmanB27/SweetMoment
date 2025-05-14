/**
 * React Static Site Build Export Helper
 * 
 * This script helps extract and package a complete React static site
 * that matches the exact look and feel of the dynamic site.
 */

(function() {
  // Configuration
  const config = {
    // This ensures we use the React components as-is
    preserveReactComponents: true,
    // This ensures we use the same styling
    preserveStyling: true,
    // This ensures we render routes the same way
    preserveRouting: true
  };
  
  /**
   * Export helper for React components
   * 
   * This extracts React components in their original form
   * rather than pre-rendering to basic HTML
   */
  function exportReactComponents() {
    // Get all component modules
    const componentModules = Object.keys(window).filter(key => 
      key.startsWith('__vite_chunk_') || 
      key.includes('_component_') ||
      key.includes('React')
    );
    
    // Create component export
    const componentExport = componentModules.reduce((acc, key) => {
      try {
        if (window[key] && typeof window[key] === 'object') {
          acc[key] = window[key];
        }
      } catch (e) {
        console.warn(`Error exporting component ${key}:`, e);
      }
      return acc;
    }, {});
    
    return componentExport;
  }
  
  /**
   * Export styling information
   */
  function exportStyling() {
    // Extract all stylesheets
    const styles = Array.from(document.styleSheets).map(sheet => {
      try {
        return Array.from(sheet.cssRules).map(rule => rule.cssText).join('\n');
      } catch (e) {
        // CORS restriction on external stylesheets
        return null;
      }
    }).filter(Boolean).join('\n');
    
    // Extract all inline styles
    const inlineStyles = Array.from(document.querySelectorAll('[style]')).map(el => {
      return { 
        selector: getSelector(el), 
        style: el.getAttribute('style') 
      };
    });
    
    return { 
      styleSheets: styles, 
      inlineStyles 
    };
  }
  
  /**
   * Get a CSS selector for an element
   */
  function getSelector(el) {
    if (el.id) return `#${el.id}`;
    if (el.className) {
      const classes = Array.from(el.classList).join('.');
      return classes ? `.${classes}` : '';
    }
    return el.tagName.toLowerCase();
  }
  
  /**
   * Get routes information
   */
  function exportRoutes() {
    // Find the router instance
    let router = null;
    
    // Attempt to find React Router or wouter
    if (window.__WOUTER_INSTANCES) {
      router = { type: 'wouter', routes: window.__WOUTER_INSTANCES };
    } else if (window.__REACT_ROUTER_INSTANCES) {
      router = { type: 'react-router', routes: window.__REACT_ROUTER_INSTANCES };
    }
    
    // If no router found, try to infer routes from links
    if (!router) {
      const links = Array.from(document.querySelectorAll('a[href]'))
        .map(a => a.getAttribute('href'))
        .filter(href => href.startsWith('/') && !href.includes('://'));
        
      router = { type: 'inferred', routes: Array.from(new Set(links)) };
    }
    
    return router;
  }
  
  /**
   * Main export function
   */
  function generateFullExport() {
    const exportData = {
      config,
      components: config.preserveReactComponents ? exportReactComponents() : null,
      styling: config.preserveStyling ? exportStyling() : null,
      routes: config.preserveRouting ? exportRoutes() : null,
      timestamp: new Date().toISOString()
    };
    
    return exportData;
  }
  
  // Expose for the static site generator to use
  window.__STATIC_REACT_EXPORT = generateFullExport;
})();