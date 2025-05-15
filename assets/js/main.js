
// Stripe checkout redirect script
const stripe = Stripe('pk_test_51R1xQu2chWyJsJ9zIQ6ziHH4oCWyj1YbdNglzmOQzlFBCtE7EzJ9kdQQepwLQfTZvf3oLSJdRK5sHs3OlW3Xu1P5008T29fUn8');
const CHECKOUT_URL = 'https://5305fa2b-1ef4-4173-98ba-48d9fb1a9563-00-2747chn3vj065.janeway.replit.dev/api/checkout/create-session';

async function redirectToCheckout(productId, productName, price, options = {}) {
  try {
    // Product details
    const item = {
      id: productId,
      name: productName,
      price: price,
      ...options
    };
    
    // Redirect to main site for checkout session creation
    window.location.href = `https://5305fa2b-1ef4-4173-98ba-48d9fb1a9563-00-2747chn3vj065.janeway.replit.dev/checkout.html?product=${encodeURIComponent(JSON.stringify(item))}`;
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred. Please try again or visit our main website.');
  }
}
