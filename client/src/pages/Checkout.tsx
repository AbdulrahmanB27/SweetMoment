import { useEffect, useState } from "react";
import { useStripe, Elements, PaymentElement, useElements, useCheckout } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "../context/CartContext";
import { useDiscount } from "../context/DiscountContext";
import { Button } from "@/components/ui/button";
import { CustomLink, useNavigation } from "../App";
import { motion, AnimatePresence } from "framer-motion";
import { Tag } from "lucide-react";
import CountryCodeSelect from "../components/CountryCodeSelect";
import PhoneNumberInput from "../components/PhoneNumberInput";
import { PickupLocation } from "@/components/checkout/PickupLocation";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  console.error('Missing Stripe public key. Payments may not work correctly.');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Custom appearance for Stripe Elements
// Type-safe configuration using 'as const' to ensure theme is a valid option
const appearance = {
  theme: 'stripe' as const, // This ensures the theme is one of 'stripe' | 'night' | 'flat'
  variables: {
    colorPrimary: '#4A2C2A',
    colorBackground: '#FFFFFF',
    colorText: '#30313d',
    colorDanger: '#df1b41',
    fontFamily: 'Montserrat, system-ui, sans-serif',
    spacingUnit: '4px',
    borderRadius: '4px',
  },
  rules: {
    '.Input': {
      border: '1px solid #E8D9B5',
      boxShadow: 'none',
      padding: '12px',
    },
    '.Input:focus': {
      border: '1px solid #4A2C2A',
      boxShadow: '0 0 0 1px #4A2C2A',
    },
    '.Label': {
      fontWeight: '500',
      color: '#6F4E37',
    },
    '.Tab': {
      borderRadius: '4px',
    },
    '.Tab--selected': {
      borderColor: '#4A2C2A',
      borderWidth: '2px',
    },
    '.Tab:hover': {
      borderColor: '#4A2C2A',
    },
    '.GooglePayButton': {
      borderRadius: '4px',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    },
    '.GooglePayButton:hover': {
      transform: 'translateY(-1px)',
      boxShadow: '0px 4px 8px rgba(0,0,0,0.1)',
    },
    '.SubmitButton': {
      backgroundColor: '#4A2C2A',
      color: 'white',
      fontWeight: '600',
      padding: '14px 24px',
      boxShadow: 'none',
    },
    '.SubmitButton:hover': {
      backgroundColor: '#3A1F1D',
      transform: 'translateY(-1px)',
    },
    '.SubmitButton:active': {
      transform: 'translateY(0)',
    },
  },
};

// Animation variants
const buttonVariants = {
  hover: { scale: 1.05, boxShadow: "0px 5px 15px rgba(0,0,0,0.1)" },
  tap: { scale: 0.95 }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
    }
  }
};

interface CheckoutFormProps {
  onProcessingPayment: (isProcessing: boolean) => void;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  phone: string;
  setNameError: (error: string) => void;
  setEmailError: (error: string) => void;
}

function CheckoutForm({ onProcessingPayment, customerName, customerEmail, customerAddress, phone, setNameError, setEmailError }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const { toast } = useToast();
  const { clearCart } = useCart();
  const { removeDiscount } = useDiscount();
  const navigate = useNavigation();
  
  // Try to get the checkout context if it's available
  let checkout = null;
  try {
    checkout = useCheckout();
  } catch (error) {
    // CheckoutProvider context not available - that's okay
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded
      console.warn("Stripe has not yet loaded");
      return;
    }

    if (customerName.trim().length < 2) {
      setNameError("Please enter your name");
      return;
    } else {
      setNameError("");
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!customerEmail || !emailRegex.test(customerEmail)) {
      setEmailError("Please enter a valid email address");
      return;
    } else {
      setEmailError("");
    }

    try {
      // Start processing animation
      setIsProcessing(true);
      onProcessingPayment(true);

      // Submit the form with the Payment Element
      
      let result;
      try {
        // Note: We can't directly add metadata to the confirmPayment call
        // We've already added the phone in billing_details and we'll update the metadata separately
        // through our update-payment-intent API
        result = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/payment-success`,
            receipt_email: customerEmail, // Add email for automatic receipts
            payment_method_data: {
              billing_details: {
                name: customerName.trim(),
                email: customerEmail, // Include email in billing details
                phone: phone, // Include the phone number from our input
                address: customerAddress ? {
                  line1: customerAddress
                } : undefined
              }
            }
          },
          redirect: "if_required"
        });
        
        // Handle successful payment confirmation
        if (!result.error) {
          // Manually redirect if redirect is not automatic
          const paymentIntentId = result.paymentIntent?.id || '';
          window.location.href = `${window.location.origin}/payment-success?payment_intent=${paymentIntentId}`;
          return;
        }
      } catch (confirmError) {
        console.error("Error in confirmPayment:", confirmError);
        result = { 
          error: { 
            type: "api_error", 
            message: "Payment processing failed. Please try again or use a different payment method." 
          }
        };
      }

      // If we're here, there was an error
      if (result?.error) {
        // This point will only be reached if there's an immediate error when
        // confirming the payment (e.g. invalid card details)
        console.error("Payment error details:", {
          type: result.error.type,
          code: result.error.code,
          message: result.error.message,
          decline_code: result.error.decline_code,
          param: result.error.param
        });
        
        let errorMsg = result.error.message || "An unexpected error occurred during payment.";
        
        // Add more helpful information based on error type
        if (result.error.type === 'card_error') {
          errorMsg = `Card error: ${errorMsg}`;
        } else if (result.error.type === 'validation_error') {
          errorMsg = `Please check your payment details: ${errorMsg}`;
        }
        
        setErrorMessage(errorMsg);
        toast({
          title: "Payment Failed",
          description: errorMsg,
          variant: "destructive",
        });
      }
    } catch (e) {
      // Log the full error object
      console.error("Unexpected payment error:", e);
      
      // Attempt to extract more information from the error
      let errorDetails = "Unknown error";
      try {
        errorDetails = JSON.stringify(e);
      } catch (stringifyError) {
        console.error("Error stringifying error object:", stringifyError);
      }
      
      console.error("Payment error details:", errorDetails);
      
      setErrorMessage("There was a problem processing your payment. Please check your card details and try again.");
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred during payment processing. Please try again with a different card or payment method.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      onProcessingPayment(false);
    }
  };

  // Handle phone number input
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPhoneNumber = e.target.value;
    
    // If Stripe checkout context is available, update the phone number there too
    if (checkout) {
      checkout.updatePhoneNumber(newPhoneNumber);
    }
  };

  // Update Stripe checkout with phone number on blur
  const handlePhoneBlur = () => {
    if (checkout && phone) {
      checkout.updatePhoneNumber(phone);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="mb-6">
        <PaymentElement 
          options={{
            layout: 'tabs',
            defaultValues: {
              billingDetails: {
                name: customerName,
                address: {
                  country: 'US',
                },
              },
            },
            terms: {
              card: 'always',
            },
            wallets: {
              applePay: 'auto',
              googlePay: 'auto',
            },
            paymentMethodOrder: ['card', 'google_pay', 'apple_pay', 'cashapp'], // Express checkout options in tabs
          }}
        />
      </div>
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
          {errorMessage}
        </div>
      )}
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing} 
        className="w-full py-6 bg-[#4A2C2A] hover:bg-[#3A1F1D] text-white font-semibold rounded-md transition-all"
      >
        {isProcessing ? (
          <div className="flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Processing...
          </div>
        ) : (
          "Complete Purchase"
        )}
      </Button>
    </form>
  );
}

export default function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { toast } = useToast();
  const { activeDiscount, applyDiscount, removeDiscount } = useDiscount();
  const [discountCode, setDiscountCode] = useState("");
  
  const [clientSecret, setClientSecret] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  
  // Name fields for shipping address
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  
  // Address information states
  const [country, setCountry] = useState("United States");
  const [streetAddress, setStreetAddress] = useState("");
  const [apartment, setApartment] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [stateSelectActive, setStateSelectActive] = useState(false);
  const [zipCode, setZipCode] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("US");
  const [phoneError, setPhoneError] = useState("");
  
  // Country codes data
  const countries = [
    { name: "United States", code: "US", dialCode: "1" },
    { name: "United Kingdom", code: "GB", dialCode: "44" },
    { name: "United Arab Emirates", code: "AE", dialCode: "971" },
    { name: "Canada", code: "CA", dialCode: "1" },
    { name: "Australia", code: "AU", dialCode: "61" },
    { name: "France", code: "FR", dialCode: "33" },
    { name: "Germany", code: "DE", dialCode: "49" },
    { name: "Italy", code: "IT", dialCode: "39" },
    { name: "Spain", code: "ES", dialCode: "34" },
    { name: "Japan", code: "JP", dialCode: "81" },
    { name: "China", code: "CN", dialCode: "86" },
    { name: "India", code: "IN", dialCode: "91" },
    { name: "Brazil", code: "BR", dialCode: "55" },
    { name: "Russia", code: "RU", dialCode: "7" },
    { name: "South Africa", code: "ZA", dialCode: "27" },
    { name: "Saudi Arabia", code: "SA", dialCode: "966" },
    { name: "Singapore", code: "SG", dialCode: "65" },
    { name: "Mexico", code: "MX", dialCode: "52" },
  ];
  const MAX_PHONE_LENGTH = 15;
  
  // Shipping enabled state
  const [isShippingEnabled, setIsShippingEnabled] = useState(true);
  
  // Loading state for shipping options
  const [isLoadingDeliveryOptions, setIsLoadingDeliveryOptions] = useState(true);
  
  // Delivery method state - initialize without a value until we check shipping status
  const [deliveryMethod, setDeliveryMethod] = useState<string | null>(null);
  
  // Combined address for API and database
  const [customerAddress, setCustomerAddress] = useState("");
  const [nameError, setNameError] = useState("");
  const totalAmount = cartTotal;

  const handleApplyDiscount = async () => {
    if (!discountCode || !discountCode.trim()) return;
    
    setIsApplyingDiscount(true);
    try {
      // Force uppercase one more time to be sure
      const success = await applyDiscount(discountCode.toUpperCase());
      if (success) {
        setDiscountCode("");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to apply discount code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  // Fetch shipping status when component mounts and initialize delivery method
  useEffect(() => {
    // Preload CSRF token for payment operations
    const preloadCsrfToken = async () => {
      try {
        const { preloadCsrfToken } = await import("../lib/csrfToken");
        await preloadCsrfToken();
        console.log("CSRF token preloaded successfully");
      } catch (err) {
        console.error("Failed to preload CSRF token:", err);
      }
    };
    
    const fetchShippingStatus = async () => {
      try {
        const response = await fetch('/api/shipping/status');
        if (response.ok) {
          const data = await response.json();
          setIsShippingEnabled(data.enabled);
          
          // Set initial delivery method based on shipping status
          // If deliveryMethod is null (initial load) or shipping is disabled but method is ship
          if (deliveryMethod === null || (!data.enabled && deliveryMethod === "ship")) {
            setDeliveryMethod("pickup");
          } else if (deliveryMethod === null && data.enabled) {
            setDeliveryMethod("ship");
          }
        } else {
          // Default to enabled if fetch fails
          setIsShippingEnabled(true);
          // Set default delivery method if not already set
          if (deliveryMethod === null) {
            setDeliveryMethod("ship");
          }
        }
      } catch (error) {
        // Default to enabled if fetch fails
        setIsShippingEnabled(true);
        // Set default delivery method if not already set
        if (deliveryMethod === null) {
          setDeliveryMethod("ship");
        }
      } finally {
        // Make sure to set loading to false once we have the shipping status
        setIsLoadingDeliveryOptions(false);
      }
    };
    
    // Initialize both shipping status and CSRF token
    fetchShippingStatus();
    preloadCsrfToken();
  }, []); // No dependencies since we only want this to run once

  // Initial payment intent creation
  useEffect(() => {
    const initializePayment = async () => {
      // Create PaymentIntent as soon as the page loads
      if (totalAmount <= 0) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Get CSRF token and add it to request headers
        // Using the csrfToken utility
        const { addCsrfToken } = await import("../lib/csrfToken");
        const requestOptions = await addCsrfToken({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            amount: totalAmount,
            cartItems: cartItems,
            discount: activeDiscount,
            customerName: customerName.trim() || "", // Use current customer name if available
            customerEmail: customerEmail.trim() || "" // Include customer email for receipts
          })
        });
        
        // Make the request with CSRF token included
        const response = await fetch("/api/checkout/payment-intent", requestOptions);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to create payment intent: ${errorText}`);
        }
        
        const data = await response.json();
        
        if (!data.clientSecret) {
          throw new Error('Invalid payment intent response: No client secret received');
        }
        
        setClientSecret(data.clientSecret);
      } catch (err: any) {
        toast({
          title: "Payment Setup Error",
          description: err.message || "Unable to initialize payment. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    initializePayment();
  }, [totalAmount, toast, cartItems, activeDiscount]);
  
  // Effect to combine address fields into a single string
  useEffect(() => {
    // Update combined customer name when shipping address fields change
    if (deliveryMethod === "ship" && firstName && lastName) {
      setCustomerName(`${firstName} ${lastName}`);
    }

    // For pickup orders, no need for address
    if (deliveryMethod === "pickup") {
      setCustomerAddress("Pickup order - No shipping address required");
      return;
    }

    // For shipping orders, create a well-formatted address
    const addressParts = [];
    
    // Add street address if available
    if (streetAddress.trim()) {
      addressParts.push(streetAddress.trim());
    }
    
    // Add apartment/suite if available
    if (apartment.trim()) {
      addressParts.push(apartment.trim());
    }
    
    // Combine city, state, zip in standard format
    const cityStateZip = [];
    if (city.trim()) cityStateZip.push(city.trim());
    if (state.trim()) cityStateZip.push(state.trim());
    if (zipCode.trim()) cityStateZip.push(zipCode.trim());
    
    if (cityStateZip.length > 0) {
      addressParts.push(cityStateZip.join(", "));
    }
    
    // Add country
    if (country.trim()) {
      addressParts.push(country.trim());
    }
    
    // Note: Phone number is now handled separately as its own metadata field
    // and no longer included in the address string
    
    // Join all parts with newlines for better display in admin panel
    // We've updated this from commas to newlines to ensure proper formatting throughout the system
    const formattedAddress = addressParts.length > 0 
      ? addressParts.join("\n") 
      : "No shipping address provided";
    
    // Set the formatted address
    setCustomerAddress(formattedAddress);
  }, [deliveryMethod, firstName, lastName, streetAddress, apartment, city, state, zipCode, country, phone]);

  // Add an effect to update payment intent when customer name changes
  useEffect(() => {
    // Skip if no customer name or no client secret
    if (!customerName.trim() || !clientSecret) {
      return;
    }
    
    // Only update payment intent if we have both a name and client secret
    const updatePaymentIntent = async () => {
      try {
        // Get display name - Either firstName + lastName (if shipping) or customerName (if pickup)
        const displayName = deliveryMethod === "ship" ? `${firstName} ${lastName}`.trim() : customerName.trim();
        
        // Get payment intent ID from client secret (client_secret is in format pi_XXX_secret_YYY)
        const parts = clientSecret.split('_');
        const paymentIntentId = parts.length >= 2 ? `${parts[0]}_${parts[1]}` : null;
        
        if (!paymentIntentId) {
          return;
        }
        
        // Get user ID from localStorage if available
        let userId = null;
        try {
          const userJson = localStorage.getItem('user');
          if (userJson) {
            const user = JSON.parse(userJson);
            userId = user.id;
          }
        } catch (error) {
          // Silently handle localStorage errors
        }
        
        // Use the dedicated API for updating customer information
        // Get CSRF token utility
        const { addCsrfToken } = await import("../lib/csrfToken");
        
        // Add CSRF token to request headers
        const requestOptions = await addCsrfToken({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentIntentId,
            customerName: displayName,
            customerEmail: customerEmail.trim(), // Include customer email for receipts
            customerAddress: customerAddress.trim(),
            deliveryMethod: deliveryMethod,
            phone: phone.trim(), // Send phone as a separate field
            userId: userId // Include user ID in the metadata if available
          })
        });
        
        // Make the request with CSRF token included
        const response = await fetch("/api/checkout/update-payment-intent", requestOptions);
        
        // Silently fail - no need to handle response errors as this is non-critical
      } catch (err) {
        // Don't show a toast error as this is not critical to the checkout flow
      }
    };
    
    // Wait a moment after name changes before updating
    const timeoutId = setTimeout(() => {
      updatePaymentIntent();
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [customerName, customerEmail, customerAddress, clientSecret, firstName, lastName, deliveryMethod]);

  return (
    <>
      {/* Full-page loading spinner during payment processing */}
      {processingPayment && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col justify-center items-center">
          <div className="w-20 h-20 border-4 border-[#4A2C2A] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-6 text-[#6F4E37] font-medium text-lg">Processing your payment...</p>
          <p className="mt-2 text-[#6F4E37] text-sm">You're being redirected to our secure payment page.</p>
        </div>
      )}
      
      <section className="pt-28 pb-16 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="mb-8 relative max-w-4xl mx-auto">
            <div className="absolute left-0 top-1/2 -translate-y-1/2">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <CustomLink href="/menu">
                  <button className="flex items-center text-[#6F4E37] hover:text-[#4A2C2A] transition-colors p-0 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    <span>Back to Menu</span>
                  </button>
                </CustomLink>
              </motion.div>
            </div>
            
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-montserrat font-bold text-center"
            >
              Secure Checkout
            </motion.h1>
          </div>
        
        {totalAmount <= 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <h2 className="text-2xl font-montserrat mb-4">Your cart is empty</h2>
            <p className="mb-8 text-[#6F4E37]">Add some delicious chocolates before checkout</p>
            <motion.div
              whileHover="hover"
              whileTap="tap"
              variants={buttonVariants}
            >
              <CustomLink href="/menu">
                <div className="inline-block bg-[#4A2C2A] text-white hover:bg-[#3A1F1D] py-6 px-8 rounded-md transition-colors font-semibold">
                  Browse Our Collection
                </div>
              </CustomLink>
            </motion.div>
          </motion.div>
        ) : isLoading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center py-20"
          >
            <motion.div
              animate={{ 
                rotate: 360,
                borderColor: ["#4A2C2A transparent #4A2C2A #4A2C2A", "#4A2C2A #4A2C2A transparent #4A2C2A", "#4A2C2A #4A2C2A #4A2C2A transparent", "transparent #4A2C2A #4A2C2A #4A2C2A"]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                ease: "linear",
                times: [0, 0.25, 0.5, 0.75]
              }}
              className="w-12 h-12 border-4 border-[#4A2C2A] border-t-transparent rounded-full"
            />
          </motion.div>
        ) : clientSecret ? (
          <div className="max-w-4xl mx-auto">
            {/* Two-column layout for desktop, stacked for mobile */}
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Order summary column */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                className="w-full lg:w-2/5 bg-[#FCFAF7] p-6 rounded-lg shadow-md self-start"
              >
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.h2 
                    variants={fadeInUp}
                    className="text-2xl font-montserrat font-semibold mb-4"
                  >
                    Order Summary
                  </motion.h2>
                  
                  {cartItems.length > 0 && (
                    <motion.div 
                      variants={fadeInUp}
                      className="mb-6"
                    >
                      {cartItems.map((item, index) => (
                        <div 
                          key={`${item.id}-${item.size}-${item.type}`}
                          className="flex justify-between items-start py-2 border-b border-[#E8D9B5] last:border-b-0"
                        >
                          <div className="flex items-center">
                            <div className="w-12 h-12 rounded overflow-hidden mr-3">
                              <img 
                                src={item.image} 
                                alt={item.name} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{item.name}</p>
                              <p className="text-xs text-[#6F4E37]">
                                {(() => {
                                  const options = [];
                                  const productId = item.id?.toString().toLowerCase();
                                  
                                  // Handle products that only have size options (e.g., Signature Collection)
                                  if (productId === "signaturecollection" || productId === "48") {
                                    // For Signature Collection, only show size if it's not 'none'
                                    if (item.size && item.size.toLowerCase() !== 'none') {
                                      options.push(item.size);
                                    }
                                  } 
                                  // Handle products that have shape but no type or size (e.g., Dubai Bar)
                                  else if (productId === "dubaibar" || productId === "47") {
                                    // Only show shape for Dubai Bar if it's not 'none'
                                    if (item.shape && item.shape.toLowerCase() !== 'none') {
                                      options.push(item.shape);
                                    }
                                    // Add type for Dubai Bar if it exists and isn't 'none'
                                    if (item.type && item.type.toLowerCase() !== 'none') {
                                      options.push(item.type);
                                    }
                                  }
                                  // Handle regular products with different options
                                  else {
                                    // Add size if it's not 'none'
                                    if (item.size && item.size.toLowerCase() !== 'none') {
                                      options.push(item.size);
                                    }
                                    
                                    // Add shape if it's not 'none'
                                    if (item.shape && item.shape.toLowerCase() !== 'none') {
                                      options.push(item.shape);
                                    }
                                    
                                    // Add type if it exists and isn't 'none'
                                    if (item.type && item.type.toLowerCase() !== 'none') {
                                      options.push(item.type);
                                    }
                                  }
                                  
                                  // If no options are displayed, show a simple "Regular" label
                                  if (options.length === 0) {
                                    return "Regular";
                                  }
                                  
                                  // Join all non-empty options with ' - '
                                  return options.join(' - ');
                                })()}
                              </p>
                              <p className="text-xs">Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <span className="text-sm font-medium">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                  
                  {activeDiscount && (
                    <motion.div 
                      variants={fadeInUp}
                      className="flex justify-between items-center text-sm border-t border-[#E8D9B5] pt-3 pb-1"
                    >
                      <span className="text-emerald-700 font-medium">
                        {activeDiscount && (
                          activeDiscount.discountType === 'percentage' 
                            ? `Discount (${activeDiscount.value}%)` 
                            : activeDiscount.discountType === 'buy_one_get_one'
                              ? `BOGO: ${activeDiscount.value}% Off 2nd Item`
                              : 'Discount'
                        )}
                      </span>
                      <span className="text-emerald-700 font-medium">
                        {activeDiscount && (
                          activeDiscount.discountType === 'percentage' 
                            ? `-$${((totalAmount * activeDiscount.value) / 100).toFixed(2)}` 
                            : activeDiscount.discountType === 'buy_one_get_one'
                              ? `-$${(cartTotal - totalAmount).toFixed(2)}`
                              : `-$${activeDiscount.value.toFixed(2)}`
                        )}
                      </span>
                    </motion.div>
                  )}

                  <motion.div 
                    variants={fadeInUp}
                    className="flex justify-between items-center border-t border-[#E8D9B5] pt-4 pb-4"
                  >
                    <span className="font-semibold">Order Total</span>
                    <motion.span
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 200,
                        delay: 0.2
                      }}
                      className={`font-bold ${activeDiscount ? 'text-emerald-800' : ''}`}
                    >
                      ${totalAmount.toFixed(2)}
                    </motion.span>
                  </motion.div>
                </motion.div>
              </motion.div>
              
              {/* Payment form column */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 100 }}
                className="w-full lg:w-3/5 bg-[#FCFAF7] p-6 rounded-lg shadow-md"
              >
                <h2 className="text-2xl font-montserrat font-semibold mb-6">Payment Details</h2>
                
                {/* Show active discount if available */}
                {activeDiscount ? (
                  <div className="mb-6 pb-4 border-b border-[#E8D9B5]">
                    <div className="flex items-center justify-between text-green-600">
                      <div className="flex items-center gap-2">
                        <Tag size={18} className="text-green-600" />
                        <span className="font-medium">
                          Discount applied: {activeDiscount.code}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm mr-3">
                          {activeDiscount.discountType === 'percentage' 
                            ? `${activeDiscount.value}% off` 
                            : activeDiscount.discountType === 'buy_one_get_one'
                              ? activeDiscount.value === 100
                                ? "Buy One Get One Free"
                                : `${activeDiscount.value}% off second item`
                              : `$${(activeDiscount.value / 100).toFixed(2)} off`}
                        </span>
                        <button
                          onClick={removeDiscount}
                          className="px-2 py-1 border border-red-200 rounded-md text-red-600 hover:text-red-700 hover:bg-red-50 text-xs font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    {activeDiscount.description && (
                      <p className="mt-2 text-sm text-[#6F4E37] ml-7">
                        {activeDiscount.description}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="mb-6 pb-4 border-b border-[#E8D9B5]">
                    <div className="flex flex-col md:flex-row gap-3 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <Tag size={16} className="text-[#6F4E37] mr-2" />
                          <h3 className="font-semibold text-sm">Discount Code</h3>
                        </div>
                        <p className="text-sm text-[#6F4E37]">Enter your code to apply the discount to your order</p>
                      </div>
                      <div className="flex w-full md:w-auto gap-2">
                        <input
                          id="discount-code-checkout"
                          type="text"
                          value={discountCode}
                          onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                          placeholder="ENTER CODE"
                          className="flex-grow md:w-48 p-2 border border-[#E8D9B5] rounded-md text-sm focus:outline-none focus:border-[#4A2C2A] uppercase"
                        />
                        <button
                          onClick={handleApplyDiscount}
                          disabled={isApplyingDiscount || !discountCode || !discountCode.trim()}
                          className="px-3 py-2 bg-[#4A2C2A] text-white rounded-md text-sm font-medium hover:bg-[#3A1F1D] disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                        >
                          {isApplyingDiscount ? 'Applying...' : 'Apply'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {nameError && (
                  <div className="mb-6">
                    <p className="mt-1 text-sm text-red-600">{nameError}</p>
                  </div>
                )}
                
                {/* Delivery Methods */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">Delivery</h3>
                  
                  {isLoadingDeliveryOptions ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="w-8 h-8 border-4 border-[#4A2C2A] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <>
                      {!isShippingEnabled && (
                        <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
                          <div className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <div>
                              <p className="font-medium">Shipping currently unavailable</p>
                              <p>Pickup is currently the only available delivery option.</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex flex-col gap-3">
                        {isShippingEnabled && (
                          <label 
                            htmlFor="ship"
                            className={`block border ${deliveryMethod === "ship" ? 'border-[#4A2C2A] bg-[#F8F4EA]' : 'border-[#E8D9B5]'} rounded-md p-3 flex items-center justify-between cursor-pointer transition-colors hover:bg-[#F8F4EA]`}
                            onClick={() => setDeliveryMethod("ship")}
                          >
                            <div className="flex items-center gap-2">
                              <input 
                                type="radio" 
                                id="ship" 
                                name="delivery-method" 
                                checked={deliveryMethod === "ship"}
                                onChange={() => setDeliveryMethod("ship")} 
                                className="h-4 w-4 text-[#7D4E2C] focus:ring-[#7D4E2C] border-[#7D4E2C] accent-[#7D4E2C]"
                              />
                              <div>
                                <div className="font-medium text-[#4A2C2A]">Shipping</div>
                                <div className="text-xs text-gray-600">Deliver to your address</div>
                              </div>
                            </div>
                            <div className={`${deliveryMethod === "ship" ? 'text-[#4A2C2A]' : 'text-gray-400'}`}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="22" viewBox="-7 0 34 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="1" y="3" width="15" height="13" rx="3" ry="3"></rect>
                                <polygon points="16 8 20 8 23 12 23 16 16 16 16 8" rx="1.5" ry="1.5"></polygon>
                                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                                <circle cx="18.5" cy="18.5" r="2.5"></circle>
                                <line x1="-6" y1="7" x2="-1" y2="7" strokeWidth="2.2"></line>
                                <line x1="-8" y1="10" x2="-1" y2="10" strokeWidth="2.2"></line>
                                <line x1="-5" y1="13" x2="-1" y2="13" strokeWidth="2.2"></line>
                              </svg>
                            </div>
                          </label>
                        )}
                        <label 
                          htmlFor="pickup"
                          className={`block border ${deliveryMethod === "pickup" ? 'border-[#4A2C2A] bg-[#F8F4EA]' : 'border-[#E8D9B5]'} rounded-md p-3 flex items-center justify-between cursor-pointer transition-colors hover:bg-[#F8F4EA]`}
                          onClick={() => setDeliveryMethod("pickup")}
                        >
                          <div className="flex items-center gap-2">
                            <input 
                              type="radio" 
                              id="pickup" 
                              name="delivery-method" 
                              checked={deliveryMethod === "pickup"}
                              onChange={() => setDeliveryMethod("pickup")} 
                              className="h-4 w-4 text-[#7D4E2C] focus:ring-[#7D4E2C] border-[#7D4E2C] accent-[#7D4E2C]"
                            />
                            <div>
                              <div className="font-medium text-[#4A2C2A]">Pickup</div>
                              <div className="text-xs text-gray-600">Available at specified location</div>
                            </div>
                          </div>
                          <div className={`${deliveryMethod === "pickup" ? 'text-[#4A2C2A]' : 'text-gray-400'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                          </div>
                        </label>
                      </div>
                    </>
                  )}
                </div>

                {/* Shipping Address - Only show if delivery method is "ship" and shipping is enabled */}
                {deliveryMethod === "ship" && isShippingEnabled && (
                  <div className="mb-6 space-y-3">
                    <div>
                      <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                        Country/Region
                      </label>
                      <div className="relative">
                        <select
                          id="country"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className="w-full p-3 border border-[#E8D9B5] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A2C2A] appearance-none pr-10"
                        >
                          <option value="United States">United States</option>
                          <option value="Afghanistan">Afghanistan</option>
                          <option value="Albania">Albania</option>
                          <option value="Algeria">Algeria</option>
                          <option value="Andorra">Andorra</option>
                          <option value="Angola">Angola</option>
                          <option value="Antigua and Barbuda">Antigua and Barbuda</option>
                          <option value="Argentina">Argentina</option>
                          <option value="Armenia">Armenia</option>
                          <option value="Australia">Australia</option>
                          <option value="Austria">Austria</option>
                          <option value="Azerbaijan">Azerbaijan</option>
                          <option value="Bahamas">Bahamas</option>
                          <option value="Bahrain">Bahrain</option>
                          <option value="Bangladesh">Bangladesh</option>
                          <option value="Barbados">Barbados</option>
                          <option value="Belarus">Belarus</option>
                          <option value="Belgium">Belgium</option>
                          <option value="Belize">Belize</option>
                          <option value="Benin">Benin</option>
                          <option value="Bhutan">Bhutan</option>
                          <option value="Bolivia">Bolivia</option>
                          <option value="Bosnia and Herzegovina">Bosnia and Herzegovina</option>
                          <option value="Botswana">Botswana</option>
                          <option value="Brazil">Brazil</option>
                          <option value="Brunei">Brunei</option>
                          <option value="Bulgaria">Bulgaria</option>
                          <option value="Burkina Faso">Burkina Faso</option>
                          <option value="Burundi">Burundi</option>
                          <option value="Cabo Verde">Cabo Verde</option>
                          <option value="Cambodia">Cambodia</option>
                          <option value="Cameroon">Cameroon</option>
                          <option value="Canada">Canada</option>
                          <option value="Central African Republic">Central African Republic</option>
                          <option value="Chad">Chad</option>
                          <option value="Chile">Chile</option>
                          <option value="China">China</option>
                          <option value="Colombia">Colombia</option>
                          <option value="Comoros">Comoros</option>
                          <option value="Congo">Congo</option>
                          <option value="Costa Rica">Costa Rica</option>
                          <option value="Croatia">Croatia</option>
                          <option value="Cuba">Cuba</option>
                          <option value="Cyprus">Cyprus</option>
                          <option value="Czech Republic">Czech Republic</option>
                          <option value="Denmark">Denmark</option>
                          <option value="Djibouti">Djibouti</option>
                          <option value="Dominica">Dominica</option>
                          <option value="Dominican Republic">Dominican Republic</option>
                          <option value="Ecuador">Ecuador</option>
                          <option value="Egypt">Egypt</option>
                          <option value="El Salvador">El Salvador</option>
                          <option value="Equatorial Guinea">Equatorial Guinea</option>
                          <option value="Eritrea">Eritrea</option>
                          <option value="Estonia">Estonia</option>
                          <option value="Eswatini">Eswatini</option>
                          <option value="Ethiopia">Ethiopia</option>
                          <option value="Fiji">Fiji</option>
                          <option value="Finland">Finland</option>
                          <option value="France">France</option>
                          <option value="Gabon">Gabon</option>
                          <option value="Gambia">Gambia</option>
                          <option value="Georgia">Georgia</option>
                          <option value="Germany">Germany</option>
                          <option value="Ghana">Ghana</option>
                          <option value="Greece">Greece</option>
                          <option value="Grenada">Grenada</option>
                          <option value="Guatemala">Guatemala</option>
                          <option value="Guinea">Guinea</option>
                          <option value="Guinea-Bissau">Guinea-Bissau</option>
                          <option value="Guyana">Guyana</option>
                          <option value="Haiti">Haiti</option>
                          <option value="Honduras">Honduras</option>
                          <option value="Hungary">Hungary</option>
                          <option value="Iceland">Iceland</option>
                          <option value="India">India</option>
                          <option value="Indonesia">Indonesia</option>
                          <option value="Iran">Iran</option>
                          <option value="Iraq">Iraq</option>
                          <option value="Ireland">Ireland</option>
                          <option value="Israel">Israel</option>
                          <option value="Italy">Italy</option>
                          <option value="Jamaica">Jamaica</option>
                          <option value="Japan">Japan</option>
                          <option value="Jordan">Jordan</option>
                          <option value="Kazakhstan">Kazakhstan</option>
                          <option value="Kenya">Kenya</option>
                          <option value="Kiribati">Kiribati</option>
                          <option value="Korea, North">Korea, North</option>
                          <option value="Korea, South">Korea, South</option>
                          <option value="Kosovo">Kosovo</option>
                          <option value="Kuwait">Kuwait</option>
                          <option value="Kyrgyzstan">Kyrgyzstan</option>
                          <option value="Laos">Laos</option>
                          <option value="Latvia">Latvia</option>
                          <option value="Lebanon">Lebanon</option>
                          <option value="Lesotho">Lesotho</option>
                          <option value="Liberia">Liberia</option>
                          <option value="Libya">Libya</option>
                          <option value="Liechtenstein">Liechtenstein</option>
                          <option value="Lithuania">Lithuania</option>
                          <option value="Luxembourg">Luxembourg</option>
                          <option value="Madagascar">Madagascar</option>
                          <option value="Malawi">Malawi</option>
                          <option value="Malaysia">Malaysia</option>
                          <option value="Maldives">Maldives</option>
                          <option value="Mali">Mali</option>
                          <option value="Malta">Malta</option>
                          <option value="Marshall Islands">Marshall Islands</option>
                          <option value="Mauritania">Mauritania</option>
                          <option value="Mauritius">Mauritius</option>
                          <option value="Mexico">Mexico</option>
                          <option value="Micronesia">Micronesia</option>
                          <option value="Moldova">Moldova</option>
                          <option value="Monaco">Monaco</option>
                          <option value="Mongolia">Mongolia</option>
                          <option value="Montenegro">Montenegro</option>
                          <option value="Morocco">Morocco</option>
                          <option value="Mozambique">Mozambique</option>
                          <option value="Myanmar">Myanmar</option>
                          <option value="Namibia">Namibia</option>
                          <option value="Nauru">Nauru</option>
                          <option value="Nepal">Nepal</option>
                          <option value="Netherlands">Netherlands</option>
                          <option value="New Zealand">New Zealand</option>
                          <option value="Nicaragua">Nicaragua</option>
                          <option value="Niger">Niger</option>
                          <option value="Nigeria">Nigeria</option>
                          <option value="North Macedonia">North Macedonia</option>
                          <option value="Norway">Norway</option>
                          <option value="Oman">Oman</option>
                          <option value="Pakistan">Pakistan</option>
                          <option value="Palau">Palau</option>
                          <option value="Panama">Panama</option>
                          <option value="Papua New Guinea">Papua New Guinea</option>
                          <option value="Paraguay">Paraguay</option>
                          <option value="Peru">Peru</option>
                          <option value="Philippines">Philippines</option>
                          <option value="Poland">Poland</option>
                          <option value="Portugal">Portugal</option>
                          <option value="Qatar">Qatar</option>
                          <option value="Romania">Romania</option>
                          <option value="Russia">Russia</option>
                          <option value="Rwanda">Rwanda</option>
                          <option value="Saint Kitts and Nevis">Saint Kitts and Nevis</option>
                          <option value="Saint Lucia">Saint Lucia</option>
                          <option value="Saint Vincent and the Grenadines">Saint Vincent and the Grenadines</option>
                          <option value="Samoa">Samoa</option>
                          <option value="San Marino">San Marino</option>
                          <option value="Sao Tome and Principe">Sao Tome and Principe</option>
                          <option value="Saudi Arabia">Saudi Arabia</option>
                          <option value="Senegal">Senegal</option>
                          <option value="Serbia">Serbia</option>
                          <option value="Seychelles">Seychelles</option>
                          <option value="Sierra Leone">Sierra Leone</option>
                          <option value="Singapore">Singapore</option>
                          <option value="Slovakia">Slovakia</option>
                          <option value="Slovenia">Slovenia</option>
                          <option value="Solomon Islands">Solomon Islands</option>
                          <option value="Somalia">Somalia</option>
                          <option value="South Africa">South Africa</option>
                          <option value="South Sudan">South Sudan</option>
                          <option value="Spain">Spain</option>
                          <option value="Sri Lanka">Sri Lanka</option>
                          <option value="Sudan">Sudan</option>
                          <option value="Suriname">Suriname</option>
                          <option value="Sweden">Sweden</option>
                          <option value="Switzerland">Switzerland</option>
                          <option value="Syria">Syria</option>
                          <option value="Taiwan">Taiwan</option>
                          <option value="Tajikistan">Tajikistan</option>
                          <option value="Tanzania">Tanzania</option>
                          <option value="Thailand">Thailand</option>
                          <option value="Timor-Leste">Timor-Leste</option>
                          <option value="Togo">Togo</option>
                          <option value="Tonga">Tonga</option>
                          <option value="Trinidad and Tobago">Trinidad and Tobago</option>
                          <option value="Tunisia">Tunisia</option>
                          <option value="Turkey">Turkey</option>
                          <option value="Turkmenistan">Turkmenistan</option>
                          <option value="Tuvalu">Tuvalu</option>
                          <option value="Uganda">Uganda</option>
                          <option value="Ukraine">Ukraine</option>
                          <option value="United Arab Emirates">United Arab Emirates</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Uruguay">Uruguay</option>
                          <option value="Uzbekistan">Uzbekistan</option>
                          <option value="Vanuatu">Vanuatu</option>
                          <option value="Vatican City">Vatican City</option>
                          <option value="Venezuela">Venezuela</option>
                          <option value="Vietnam">Vietnam</option>
                          <option value="Yemen">Yemen</option>
                          <option value="Zambia">Zambia</option>
                          <option value="Zimbabwe">Zimbabwe</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="first-name" className="block text-sm font-medium text-gray-700 mb-1">
                          First name
                        </label>
                        <input
                          type="text"
                          id="first-name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full p-3 border border-[#E8D9B5] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A2C2A]"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="last-name" className="block text-sm font-medium text-gray-700 mb-1">
                          Last name
                        </label>
                        <input
                          type="text"
                          id="last-name"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full p-3 border border-[#E8D9B5] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A2C2A]"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="shipping-email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="shipping-email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full p-3 border border-[#E8D9B5] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A2C2A]"
                        placeholder="Email for order confirmation and receipt"
                        required
                      />
                      {emailError && (
                        <p className="mt-1 text-sm text-red-600">{emailError}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                        Company (optional)
                      </label>
                      <input
                        type="text"
                        id="company"
                        className="w-full p-3 border border-[#E8D9B5] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A2C2A]"
                        placeholder=""
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <div className="flex items-center relative">
                        <input
                          type="text"
                          id="address"
                          value={streetAddress}
                          onChange={(e) => setStreetAddress(e.target.value)}
                          className="w-full p-3 border border-[#E8D9B5] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A2C2A]"
                          placeholder=""
                        />

                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="apartment" className="block text-sm font-medium text-gray-700 mb-1">
                        Apartment, suite, etc. (optional)
                      </label>
                      <input
                        type="text"
                        id="apartment"
                        value={apartment}
                        onChange={(e) => setApartment(e.target.value)}
                        className="w-full p-3 border border-[#E8D9B5] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A2C2A]"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <motion.div 
                        className={country !== 'United States' ? 'md:col-span-2' : ''}
                        layout
                        transition={{ 
                          type: "spring", 
                          stiffness: 200, 
                          damping: 25 
                        }}
                      >
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          id="city"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full p-3 border border-[#E8D9B5] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A2C2A]"
                        />
                      </motion.div>
                      {/* Only show state dropdown when United States is selected */}
                      {country === 'United States' && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.2 }}
                        >
                          <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                            State
                          </label>
                          <div className="relative">
                            <select
                              id="state"
                              value={state}
                              onChange={(e) => {
                                setState(e.target.value);
                              }}
                              onClick={() => setStateSelectActive(!stateSelectActive)}
                              onBlur={() => setStateSelectActive(false)}
                              className="w-full p-3 border border-[#E8D9B5] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A2C2A] appearance-none pr-10"
                            >
                              <option value="">Select state...</option>
                            <option value="AL">Alabama</option>
                              <option value="AK">Alaska</option>
                              <option value="AZ">Arizona</option>
                              <option value="AR">Arkansas</option>
                              <option value="CA">California</option>
                              <option value="CO">Colorado</option>
                              <option value="CT">Connecticut</option>
                              <option value="DE">Delaware</option>
                              <option value="FL">Florida</option>
                              <option value="GA">Georgia</option>
                              <option value="HI">Hawaii</option>
                              <option value="ID">Idaho</option>
                              <option value="IL">Illinois</option>
                              <option value="IN">Indiana</option>
                              <option value="IA">Iowa</option>
                              <option value="KS">Kansas</option>
                              <option value="KY">Kentucky</option>
                              <option value="LA">Louisiana</option>
                              <option value="ME">Maine</option>
                              <option value="MD">Maryland</option>
                              <option value="MA">Massachusetts</option>
                              <option value="MI">Michigan</option>
                              <option value="MN">Minnesota</option>
                              <option value="MS">Mississippi</option>
                              <option value="MO">Missouri</option>
                              <option value="MT">Montana</option>
                              <option value="NE">Nebraska</option>
                              <option value="NV">Nevada</option>
                              <option value="NH">New Hampshire</option>
                              <option value="NJ">New Jersey</option>
                              <option value="NM">New Mexico</option>
                              <option value="NY">New York</option>
                              <option value="NC">North Carolina</option>
                              <option value="ND">North Dakota</option>
                              <option value="OH">Ohio</option>
                              <option value="OK">Oklahoma</option>
                              <option value="OR">Oregon</option>
                              <option value="PA">Pennsylvania</option>
                              <option value="RI">Rhode Island</option>
                              <option value="SC">South Carolina</option>
                              <option value="SD">South Dakota</option>
                              <option value="TN">Tennessee</option>
                              <option value="TX">Texas</option>
                              <option value="UT">Utah</option>
                              <option value="VT">Vermont</option>
                              <option value="VA">Virginia</option>
                              <option value="WA">Washington</option>
                              <option value="WV">West Virginia</option>
                              <option value="WI">Wisconsin</option>
                              <option value="WY">Wyoming</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <svg
                                xmlns="http://www.w3.org/2000/svg" 
                                width="16" 
                                height="16" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                                className={`transition-transform ${stateSelectActive ? 'rotate-180' : ''}`}
                              >
                                <path d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        </motion.div>
                      )}
                      <motion.div 
                        layout
                        transition={{ 
                          type: "spring", 
                          stiffness: 200, 
                          damping: 25 
                        }}
                      >
                        <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-1">
                          ZIP code {country !== 'United States' && <span className="text-gray-400 text-xs">(optional)</span>}
                        </label>
                        <input
                          type="text"
                          id="zip"
                          value={zipCode}
                          onChange={(e) => {
                            // For US addresses, limit to 5 digits only
                            if (country === 'United States') {
                              const value = e.target.value.replace(/\D/g, '').substring(0, 5);
                              setZipCode(value);
                            } else {
                              setZipCode(e.target.value);
                            }
                          }}
                          maxLength={country === 'United States' ? 5 : 10}
                          className="w-full p-3 border border-[#E8D9B5] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A2C2A]"
                          required={country === 'United States'}
                        />
                      </motion.div>
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <div className="flex gap-2">
                        {/* Country code dropdown as a separate box */}
                        <div style={{ width: '90px' }}>
                          <CountryCodeSelect 
                            countries={countries}
                            value={selectedCountry}
                            onChange={setSelectedCountry}
                          />
                        </div>
                        
                        {/* Phone number input as a separate box */}
                        <div className="flex-1">
                            <input
                            type="tel"
                            id="phone"
                            value={phone.replace(/^\+\d+\s*/, '')}
                            onChange={(e) => {
                              // Get only digits the user typed
                              const digitsOnly = e.target.value.replace(/\D/g, '');
                              
                              // Get country for dialing code
                              const country = countries.find(c => c.code === selectedCountry);
                              if (!country) return;
                              
                              // Format based on country
                              let formattedNumber;
                              if (country.code === 'US' || country.code === 'CA') {
                                // US/Canada format: XXX-XXX-XXXX
                                if (digitsOnly.length <= 3) {
                                  formattedNumber = digitsOnly;
                                } else if (digitsOnly.length <= 6) {
                                  formattedNumber = `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3)}`;
                                } else {
                                  formattedNumber = `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6, 10)}`;
                                }
                                // Create full number with country code - using narrower space
                                formattedNumber = `+${country.dialCode}\u00A0${formattedNumber}`;
                              } else {
                                // Default international format - using narrower space
                                formattedNumber = `+${country.dialCode}\u00A0${digitsOnly}`;
                              }
                              
                              // Check max length
                              if (formattedNumber.length > MAX_PHONE_LENGTH) {
                                return; // Don't update if too long
                              }
                              
                              // Update phone state with formatted value
                              setPhone(formattedNumber);
                              
                              // Validate on input
                              const hasCountryCode = /^\+/.test(formattedNumber);
                              const totalDigits = (formattedNumber.match(/\d/g) || []).length;
                              
                              if (!hasCountryCode || totalDigits < 5) {
                                setPhoneError('Please enter a valid phone number with country code.');
                              } else {
                                setPhoneError('');
                              }
                            }}
                            className={`w-full p-2 border border-[#E8D9B5] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A2C2A] ${
                              phoneError ? 'bg-red-50' : ''
                            }`}
                            style={{ height: '46px', boxSizing: 'border-box' }}
                            placeholder="Phone number"
                          />
                          {phoneError && (
                            <p className="text-xs text-red-500 mt-1">{phoneError}</p>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Select your country code and enter your phone number (max {MAX_PHONE_LENGTH} characters).
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Pickup Information Section - Only show if delivery method is "pickup" */}
                {(deliveryMethod === "pickup") && (
                  <div className="mb-6 p-4 bg-[#F8F4EA] rounded-md border border-[#E8D9B5]">
                    <div className="flex items-start mb-4">
                      <div className="mr-3 text-[#4A2C2A]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/></svg>
                      </div>
                      <div>
                        {/* Using the new PickupLocation component that respects privacy settings */}
                        <PickupLocation onOrderComplete={false} />
                        {/* Log delivery method for debugging */}
                        {(() => {
                          console.log("Rendering PickupLocation component with deliveryMethod:", deliveryMethod);
                          return null;
                        })()}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label htmlFor="pickup-name" className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="pickup-name"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full p-3 border border-[#E8D9B5] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A2C2A]"
                          placeholder="Name for pickup"
                        />
                      </div>
                      <div>
                        <label htmlFor="pickup-email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="pickup-email"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          className="w-full p-3 border border-[#E8D9B5] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A2C2A]"
                          placeholder="Email for order receipt"
                          required
                        />
                        {emailError && (
                          <p className="mt-1 text-sm text-red-600">{emailError}</p>
                        )}
                      </div>
                      <div className="mt-2">
                        <label htmlFor="pickup-phone" className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <div className="flex gap-2">
                          {/* Country code dropdown - using custom component */}
                          <div style={{ width: '90px' }}>
                            <CountryCodeSelect 
                              countries={countries}
                              value={selectedCountry}
                              onChange={setSelectedCountry}
                            />
                          </div>
                          
                          {/* Phone number input */}
                          <div className="flex-1">
                            <input
                              type="tel"
                              id="pickup-phone"
                              // Only display digits and formatting, not the country code
                              value={phone.replace(/^\+\d+\s*/, '')}
                              onChange={(e) => {
                                // Get only digits the user typed
                                const digitsOnly = e.target.value.replace(/\D/g, '');
                                
                                // Get country for dialing code
                                const country = countries.find(c => c.code === selectedCountry);
                                if (!country) return;
                                
                                // Format based on country
                                let formattedNumber;
                                if (country.code === 'US' || country.code === 'CA') {
                                  // US/Canada format: XXX-XXX-XXXX
                                  if (digitsOnly.length <= 3) {
                                    formattedNumber = digitsOnly;
                                  } else if (digitsOnly.length <= 6) {
                                    formattedNumber = `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3)}`;
                                  } else {
                                    formattedNumber = `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6, 10)}`;
                                  }
                                  // Create full number with country code - using narrower space
                                  formattedNumber = `+${country.dialCode}\u00A0${formattedNumber}`;
                                } else {
                                  // Default international format - using narrower space
                                  formattedNumber = `+${country.dialCode}\u00A0${digitsOnly}`;
                                }
                                
                                // Check max length (including formatting)
                                if (formattedNumber.length > MAX_PHONE_LENGTH) {
                                  return; // Don't update if too long
                                }
                                
                                // Update phone state with formatted value
                                setPhone(formattedNumber);
                                
                                // Validate on input
                                const hasCountryCode = /^\+/.test(formattedNumber);
                                const totalDigits = (formattedNumber.match(/\d/g) || []).length;
                                
                                if (!hasCountryCode || totalDigits < 5) {
                                  setPhoneError('Please enter a valid phone number with country code.');
                                } else {
                                  setPhoneError('');
                                }
                              }}
                              className={`w-full p-2 border border-[#E8D9B5] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A2C2A] ${
                                phoneError ? 'bg-red-50' : ''
                              }`}
                              style={{ height: '46px', boxSizing: 'border-box' }}
                              placeholder="Phone number"
                            />
                            {phoneError && (
                              <p className="text-xs text-red-500 mt-1">{phoneError}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Select your country code and enter your phone number (max {MAX_PHONE_LENGTH} characters).
                    </p>
                  </div>
                )}
                
                <Elements 
                  stripe={stripePromise} 
                  options={{ 
                    clientSecret, 
                    appearance,
                    // Add more options to help debug and improve the payment experience
                    loader: 'auto',
                    fonts: [
                      {
                        cssSrc: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&display=swap',
                      },
                    ],
                    // Phone number collection is enabled via custom code + webhook extraction
                  }}
                >
                  <CheckoutForm 
                    onProcessingPayment={setProcessingPayment}
                    customerName={customerName}
                    customerEmail={customerEmail}
                    customerAddress={customerAddress}
                    phone={phone}
                    setNameError={setNameError}
                    setEmailError={setEmailError}
                  />
                </Elements>
              </motion.div>
            </div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <h2 className="text-2xl font-montserrat mb-4">Unable to initialize payment</h2>
            <p className="mb-8 text-[#6F4E37]">Please try again later or contact customer support</p>
            <motion.div
              whileHover="hover"
              whileTap="tap"
              variants={buttonVariants}
            >
              <CustomLink href="/menu">
                <div className="inline-block bg-[#4A2C2A] text-white hover:bg-[#3A1F1D] py-6 px-8 rounded-md transition-colors font-semibold">
                  Return to Shopping
                </div>
              </CustomLink>
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
    </>
  );
}