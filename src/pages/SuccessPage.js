import React from 'react';
import { Link } from 'react-router-dom';
import './SuccessPage.css';

function SuccessPage() {
  return (
    <div className="success-page">
      <div className="container">
        <h1>Order Successful!</h1>
        <p>Thank you for your purchase. Your order has been received.</p>
        <Link to="/" className="button">Return to Home</Link>
      </div>
    </div>
  );
}

export default SuccessPage;