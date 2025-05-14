// Navigation test to verify product page reloading correctly
// Copy and paste this into the browser console when on a product page

(function runNavigationTest() {
  console.log('=== Starting Navigation Test ===');
  
  // Record initial product info
  const initialProduct = {
    name: document.querySelector('h2')?.textContent || 'Unknown',
    url: window.location.pathname
  };
  
  console.log('Initial product:', initialProduct);
  
  // Find all product links in the dropdown menu
  const productLinks = Array.from(document.querySelectorAll('a[href^="/menu/"]'))
    .filter(link => link.href !== window.location.href);
  
  if (productLinks.length === 0) {
    console.log('No other product links found to test navigation with');
    return;
  }
  
  // Pick a different product link
  const targetLink = productLinks[0];
  const targetProduct = {
    name: targetLink.textContent.trim(),
    url: new URL(targetLink.href).pathname
  };
  
  console.log('Will navigate to:', targetProduct);
  
  // Set up scroll position logging
  const logScrollPosition = () => {
    console.log('Current scroll position:', {
      window: window.pageYOffset,
      documentElement: document.documentElement.scrollTop,
      body: document.body.scrollTop
    });
  };
  
  // Log initial scroll position
  console.log('Before navigation:');
  logScrollPosition();
  
  // Click the link to navigate
  console.log('Clicking link to navigate...');
  targetLink.click();
  
  // Check after a delay to allow for navigation and rendering
  setTimeout(() => {
    // Record new product info after navigation
    const newProduct = {
      name: document.querySelector('h2')?.textContent || 'Unknown',
      url: window.location.pathname
    };
    
    console.log('After navigation:');
    console.log('New product:', newProduct);
    logScrollPosition();
    
    // Verify navigation was successful
    if (newProduct.url !== initialProduct.url && newProduct.name !== initialProduct.name) {
      console.log('✅ PASS: Successfully navigated to a different product');
    } else {
      console.log('❌ FAIL: Product page did not change properly');
    }
    
    // Verify scroll position is at top
    if (window.pageYOffset <= 10 && document.documentElement.scrollTop <= 10) {
      console.log('✅ PASS: Page is scrolled to the top (or very close)');
    } else {
      console.log('❌ FAIL: Page is not scrolled to the top');
    }
    
    console.log('=== Navigation Test Complete ===');
  }, 1000);
})();