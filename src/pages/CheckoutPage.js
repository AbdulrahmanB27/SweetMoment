import React from 'react';
import './CheckoutPage.css';

function CheckoutPage() {
  return (
    <div className="checkout-page">
      <div className="container">
        <h1>Checkout</h1>
        <p>This is a static site demo. Checkout functionality is simulated.</p>
        <a className="button" href="/success">Complete Purchase</a>
      </div>
    </div>
  );
}

export default CheckoutPage;