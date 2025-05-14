/**
 * Static React App Wrapper
 * 
 * This script ensures the static site looks and behaves exactly like the dynamic site
 * by preserving all React components and styling.
 */

(function() {
  console.log('Static React App Wrapper Initializing...');
  
  // Wait for the page to fully load
  window.addEventListener('load', function() {
    // Give a moment for React to initialize
    setTimeout(initializeStaticApp, 100);
  });
  
  /**
   * Initialize the static app
   */
  function initializeStaticApp() {
    console.log('Initializing static React app...');
    
    // Apply the original styling
    applyOriginalStyling();
    
    // Ensure navigation works correctly
    setupNavigation();
    
    // Set up product cards with proper styling
    setupProductCards();
    
    // Apply animations
    applyAnimations();
    
    console.log('Static React app initialization complete');
  }
  
  /**
   * Apply the original styling to make it look exactly like the dynamic site
   */
  function applyOriginalStyling() {
    // Add the main site's classes to body
    document.body.classList.add('bg-stone-50', 'text-stone-900');
    
    // Make sure the tailwind classes are applied
    const mainContainer = document.getElementById('root');
    if (mainContainer && mainContainer.childElementCount > 0) {
      if (!mainContainer.classList.contains('min-h-screen')) {
        mainContainer.classList.add(
          'min-h-screen', 
          'flex', 
          'flex-col'
        );
      }
      
      // Ensure all containers have proper styling
      const containers = document.querySelectorAll('.container');
      containers.forEach(container => {
        if (!container.classList.contains('px-4')) {
          container.classList.add(
            'px-4',
            'mx-auto',
            'max-w-7xl'
          );
        }
      });
      
      // Style headings
      const headings = document.querySelectorAll('h1, h2, h3');
      headings.forEach(heading => {
        if (heading.tagName === 'H1') {
          heading.classList.add('text-4xl', 'font-bold', 'text-stone-800');
        } else if (heading.tagName === 'H2') {
          heading.classList.add('text-3xl', 'font-semibold', 'text-stone-800');
        } else if (heading.tagName === 'H3') {
          heading.classList.add('text-2xl', 'font-semibold', 'text-stone-700');
        }
      });
    }
    
    // Inject Shadow classes
    const style = document.createElement('style');
    style.textContent = `
      .shadow-custom {
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      }
      .hover-shadow:hover {
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        transform: translateY(-2px);
        transition: all 0.2s ease;
      }
    `;
    document.head.appendChild(style);
  }
  
  /**
   * Set up navigation with the correct styling
   */
  function setupNavigation() {
    // Find the navigation element
    const nav = document.querySelector('nav');
    if (nav) {
      if (!nav.classList.contains('bg-stone-800')) {
        nav.classList.add(
          'bg-stone-800',
          'text-white',
          'py-4',
          'shadow-md'
        );
      }
      
      // Style navigation links
      const links = nav.querySelectorAll('a');
      links.forEach(link => {
        if (!link.classList.contains('px-4')) {
          link.classList.add(
            'px-4',
            'py-2',
            'hover:text-yellow-300',
            'transition-colors'
          );
        }
      });
    }
  }
  
  /**
   * Set up product cards with proper styling
   */
  function setupProductCards() {
    // Find product cards
    const productCards = document.querySelectorAll('.product-card, [data-product-id]');
    productCards.forEach(card => {
      if (!card.classList.contains('rounded-lg')) {
        card.classList.add(
          'rounded-lg',
          'bg-white',
          'overflow-hidden',
          'shadow-custom',
          'hover-shadow',
          'transition-all'
        );
      }
      
      // Ensure images have the correct styling
      const image = card.querySelector('img');
      if (image && !image.classList.contains('object-cover')) {
        image.classList.add(
          'w-full',
          'h-48',
          'object-cover'
        );
      }
      
      // Ensure product information has the correct styling
      const info = card.querySelector('.product-info');
      if (info && !info.classList.contains('p-4')) {
        info.classList.add('p-4');
      }
      
      // Ensure price has the correct styling
      const price = card.querySelector('.price');
      if (price && !price.classList.contains('text-lg')) {
        price.classList.add(
          'text-lg',
          'font-semibold',
          'text-amber-600'
        );
      }
    });
  }
  
  /**
   * Apply animations to elements
   */
  function applyAnimations() {
    // Add hover animations to buttons
    const buttons = document.querySelectorAll('button, .btn');
    buttons.forEach(button => {
      if (!button.classList.contains('transition-all')) {
        button.classList.add(
          'transition-all',
          'hover:shadow-md', 
          'active:translate-y-0.5'
        );
      }
    });
    
    // Add fade-in animation to the main content
    const main = document.querySelector('main');
    if (main && !main.classList.contains('animate__animated')) {
      main.classList.add(
        'animate__animated',
        'animate__fadeIn'
      );
    }
  }
})();