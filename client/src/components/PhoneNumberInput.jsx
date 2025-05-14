import React, { useState, useEffect } from 'react';
import { useCheckout } from '@stripe/react-stripe-js';

// PhoneNumberInput tries to use the Stripe checkout context if available, but works without it too
const PhoneNumberInput = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // Try to get the checkout context, but it might be null if not within a CheckoutProvider
  let checkout = null;
  try {
    checkout = useCheckout();
  } catch (error) {
    // CheckoutProvider context not available - that's okay
  }

  const handlePhoneChange = (e) => {
    const newPhoneNumber = e.target.value;
    setPhoneNumber(newPhoneNumber);
    
    // If Stripe checkout context is available, update the phone number there too
    if (checkout) {
      // Only update non-empty values - never set a default placeholder
      if (newPhoneNumber && newPhoneNumber.trim()) {
        checkout.updatePhoneNumber(newPhoneNumber.trim());
      } else {
        // If empty, explicitly set to empty string to override any defaults
        checkout.updatePhoneNumber('');
      }
    }
  };

  const handleBlur = () => {
    // On blur, make sure to update Stripe context if available
    if (checkout) {
      // Only pass non-empty values - never set a default
      if (phoneNumber && phoneNumber.trim()) {
        checkout.updatePhoneNumber(phoneNumber.trim());
      } else {
        // If empty, explicitly set to empty string to override any defaults
        checkout.updatePhoneNumber('');
      }
    }
  };

  return (
    <div className="mb-4">
      <label htmlFor="phone-number" className="block text-sm font-medium mb-1">
        Phone Number
      </label>
      <input
        id="phone-number"
        type="tel"
        value={phoneNumber}
        onChange={handlePhoneChange}
        onBlur={handleBlur}
        className="w-full p-2 border rounded-md"
        placeholder="Enter phone number (optional)"
      />
      <p className="text-xs text-gray-500 mt-1">
        For shipping updates and order notifications
      </p>
    </div>
  );
};

export default PhoneNumberInput;