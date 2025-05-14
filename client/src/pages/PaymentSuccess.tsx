import React, { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertCircle, ShoppingBag, Mail, CalendarClock, Gift, MapPin } from "lucide-react";
import { useCart } from "../context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { PickupLocation } from "@/components/checkout/PickupLocation";
import { HideNoneValues } from "@/components/HideNoneValues";

// Define types for the order data
interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  size: string;
  type: string;
  shape?: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  userId: number;
  status: string;
  totalAmount: number;
  shippingAddress: string;
  paymentIntentId: string;
  customerName?: string | null;
  customerAddress?: string | null;
  postPurchaseDiscountCode?: string | null;
  createdAt: string;
  items: OrderItem[];
  deliveryMethod?: string;
}

export default function PaymentSuccess() {
  const { clearCart } = useCart();
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  
  console.log("PaymentSuccess - Current paymentIntentId:", paymentIntentId);
  
  // Query for order data from our database
  const orderQuery = useQuery<Order | null>({
    queryKey: paymentIntentId ? [`/api/orders/payment/${paymentIntentId}`] : ['no-payment-info'],
    queryFn: async ({ queryKey }) => {
      if (!paymentIntentId) {
        console.error("PaymentSuccess - No payment intent ID available for query");
        return null;
      }
      
      // Extract the actual URL from the query key for debugging
      const url = queryKey[0] as string;
      console.log("PaymentSuccess - Order query URL:", url);
      console.log("PaymentSuccess - Fetching order for payment intent:", paymentIntentId);
      
      try {
        // Make a direct, non-cached fetch request to see what's happening
        const response = await fetch(`/api/orders/payment/${paymentIntentId}`);
        console.log("PaymentSuccess - Order fetch response status:", response.status);
        console.log("PaymentSuccess - Order fetch response OK:", response.ok);
        
        if (!response.ok) {
          console.error(`Failed to fetch order: ${response.status} ${response.statusText}`);
          throw new Error("Failed to fetch order");
        }
        
        // Clone the response so we can log it without consuming it
        const clonedResponse = response.clone();
        const responseText = await clonedResponse.text();
        console.log("PaymentSuccess - Raw response text:", responseText);
        
        try {
          const data = await response.json();
          console.log("PaymentSuccess - Order data received:", data);
          console.log("PaymentSuccess - Order items:", data?.items);
          if (!data) {
            console.error("PaymentSuccess - Received null or undefined data from order API");
          }
          return data;
        } catch (jsonError) {
          console.error("PaymentSuccess - JSON parsing error:", jsonError);
          console.error("PaymentSuccess - Response was not valid JSON:", responseText);
          return null;
        }
      } catch (err) {
        console.error("PaymentSuccess - Error fetching order by payment intent:", err);
        return null;
      }
    },
    staleTime: Infinity,
    retry: 3,
    enabled: !!paymentIntentId, // Only run when paymentIntentId is available
    refetchOnWindowFocus: false,
    refetchOnMount: true
  });

  // Function to check if confirmation has already been shown
  const hasConfirmationBeenShown = () => {
    try {
      return sessionStorage.getItem('confirmationShown') === 'true';
    } catch (e) {
      return false;
    }
  };
  
  // Function to mark confirmation as shown
  const markConfirmationAsShown = () => {
    try {
      sessionStorage.setItem('confirmationShown', 'true');
    } catch (e) {
      console.error("Could not save to session storage:", e);
    }
  };
  
  // Create a state for manual order fetching
  const [orderData, setOrderData] = useState<Order | null>(null);

  // Effect to fetch payment details and order details independently
  useEffect(() => {
    // Function to get payment details based on URL parameters
    const getPaymentAndOrderDetails = async () => {
      try {
        // Extract payment_intent from URL query parameters
        const searchParams = new URLSearchParams(window.location.search);
        const paymentIntentParam = searchParams.get('payment_intent');
        
        if (!paymentIntentParam) {
          console.log("PaymentSuccess - No payment intent ID found in URL");
          setIsLoading(false);
          return;
        }
        
        // Set the payment intent ID (for both payment details and order query)
        setPaymentIntentId(paymentIntentParam);
        console.log("PaymentSuccess - Found payment intent ID:", paymentIntentParam);
        
        // Fetch order details directly
        try {
          console.log("PaymentSuccess - Directly fetching order for payment intent:", paymentIntentParam);
          const orderResponse = await fetch(`/api/orders/payment/${paymentIntentParam}`);
          
          if (orderResponse.ok) {
            const orderResult = await orderResponse.json();
            console.log("PaymentSuccess - Direct order fetch successful:", orderResult);
            setOrderData(orderResult);
          } else {
            console.error("PaymentSuccess - Direct order fetch failed:", orderResponse.status);
          }
        } catch (orderError) {
          console.error("PaymentSuccess - Error in direct order fetch:", orderError);
        }
        
        // Fetch payment details from API
        const response = await fetch(`/api/checkout/payment-details?payment_intent=${paymentIntentParam}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch payment details: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && data.paymentIntent) {
          console.log("Payment details received:", data.paymentIntent);
          
          // Store payment data and update state
          setPaymentInfo(data.paymentIntent);
          
          // Clear cart if payment was successful
          if (data.paymentIntent.status === 'succeeded') {
            clearCart();
            
            // Create order for this payment if it doesn't exist yet
            try {
              // Check if order exists first
              const orderResponse = await fetch(`/api/orders/payment/${paymentIntentParam}`);
              
              if (!orderResponse.ok) {
                // No order found, so let's create one
                console.log("No order found for this payment intent, creating a new one...");
                
                // Parse cart items from metadata
                let cartItems = [];
                if (data.paymentIntent.metadata?.cart_items) {
                  try {
                    cartItems = JSON.parse(data.paymentIntent.metadata.cart_items);
                  } catch (parseError) {
                    console.error("Error parsing cart items:", parseError);
                  }
                }
                
                if (Array.isArray(cartItems) && cartItems.length > 0) {
                  // Prepare order data
                  const orderData = {
                    paymentIntentId: data.paymentIntent.id,
                    userId: 1,  // Default to admin user
                    totalAmount: data.paymentIntent.amount,
                    customerName: data.paymentIntent.metadata?.customer_name || null,
                    customerAddress: data.paymentIntent.metadata?.customer_address || null,
                    shippingAddress: data.paymentIntent.metadata?.customer_address || 
                      (data.paymentIntent.shipping?.address 
                      ? `${data.paymentIntent.shipping.address.line1}, ${data.paymentIntent.shipping.address.city}, ${data.paymentIntent.shipping.address.state} ${data.paymentIntent.shipping.address.postal_code}` 
                      : "No shipping address provided"),
                    cartItems: cartItems.map(item => ({
                      productId: parseInt(item.id),
                      size: item.size || "standard",
                      type: item.type || "milk",
                      shape: item.shape || "standard",
                      quantity: item.qty || 1,
                      price: data.paymentIntent.amount  // Will be divided by items in backend
                    }))
                  };
                  
                  // Send the order creation request
                  const createResponse = await fetch('/api/orders/test', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(orderData)
                  });
                  
                  if (createResponse.ok) {
                    const result = await createResponse.json();
                    console.log("Successfully created order:", result);
                    
                    // Set the order data directly to avoid another fetch
                    setOrderData(result);
                    
                    // Refresh the order query to ensure it reflects the new order
                    orderQuery.refetch();
                  } else {
                    console.error("Failed to create order:", await createResponse.text());
                  }
                } else {
                  console.warn("No valid cart items found in payment metadata");
                }
              } else {
                console.log("Order already exists for this payment intent");
              }
            } catch (createOrderError) {
              console.error("Error creating order:", createOrderError);
            }
            
            // Only show confirmation if it hasn't been shown before
            if (!hasConfirmationBeenShown()) {
              setTimeout(() => {
                setShowConfirmation(true);
              }, 500);
            }
          }
        } else {
          console.error("Invalid payment data received");
        }
      } catch (error) {
        console.error("Error fetching payment details:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Call the function when component mounts
    getPaymentAndOrderDetails();
  }, [clearCart]);
  
  // Render loading spinner while fetching payment details
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white flex justify-center items-center z-50">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-[#4A2C2A] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-6 text-[#6F4E37] font-medium text-lg">Verifying payment...</p>
          <p className="mt-2 text-[#6F4E37] text-sm">Please wait while we confirm your order</p>
        </div>
      </div>
    );
  }
  
  // Function to convert shape IDs to human-readable names
  function getShapeName(shapeId: string): string {
    // For PaymentSuccess page, return the raw shape value
    // to display exactly what was stored, without any transformation
    return shapeId;
  }

  // Helper function to calculate the correct item price based on product details
  const calculateItemPrice = (item: any): number => {
    // If the price is already stored in dollars from the database or API
    if (item.price && typeof item.price === 'number' && item.price < 100) {
      // This is likely a price already in dollars (e.g. 7 = $7.00)
      // Use the price directly with no modification
      return item.price;
    }
    
    // If the price is in cents from the database, convert to dollars
    if (item.price && typeof item.price === 'number' && item.price > 100) {
      // This is likely a price in cents (e.g. 3000 = $30.00)
      return item.price / 100;
    }
    
    // Otherwise calculate based on product details
    // Base price in dollars
    let basePrice = 8.00; // Default price for most products
    
    // If the product has a different base price based on ID
    if (item.productId === 41) {
      basePrice = 15.00; // Cereal Chocolate
    } else if (item.productId === 46) {
      basePrice = 9.00; // Assorted Nuts
    } else if (item.productId === 47 || item.productId === "DubaiBar" || (typeof item.productId === "string" && item.productId.toLowerCase() === "dubaibar")) {
      basePrice = 5.00; // Dubai Bar base price is $5.00
    } else if (item.productId === 48) {
      basePrice = 10.00; // Signature Collection base price is $10.00
    }
    
    // If the item has a type that costs extra, add it
    if (item.type === 'dark') {
      basePrice += 2.00; // Dark chocolate costs $2 more
    }
    
    // If medium or large size, add the appropriate price
    // But don't apply size pricing to Dubai Bar (product ID 47)
    if (item.productId !== 47) {
      if (item.size === 'medium') {
        basePrice += 7.00; // Medium box costs $7 more
      } else if (item.size === 'large') {
        // Special case for Signature Collection - large size costs $20 more to make it $30 total
        if (item.productId === 48) {
          basePrice += 20.00; // Large Signature Collection is $30 total
        } else {
          basePrice += 19.00; // Large box costs $19 more for other products
        }
      }
    }
    
    // Handle quantity for Signature Collection
    if (item.productId === 48 && item.quantity === 2) {
      basePrice *= 2; // Double the price for quantity 2 ($60)
    }
    
    console.log(`calculateItemPrice for product ${item.productId} (${item.productName}): $${basePrice.toFixed(2)}`);
    return basePrice;
  }

  // Helper to render order items
  const renderOrderItems = () => {
    console.log("PaymentSuccess - Payment Intent ID:", paymentIntentId);
    console.log("PaymentSuccess - Payment metadata:", paymentInfo?.metadata);
    console.log("PaymentSuccess - Order query state:", orderQuery);
    console.log("PaymentSuccess - Manual order data:", orderData);
    
    // First priority: Use the direct fetch data if available
    if (orderData && orderData.items && orderData.items.length > 0) {
      console.log("PaymentSuccess - Rendering order items from direct fetch");
      return (
        <>
          {orderData.items.map((item: OrderItem, index: number) => (
            <div key={index} className="flex justify-between items-center py-1 text-sm text-left">
              <HideNoneValues item={item} getShapeName={getShapeName} />
              <span className="font-medium">
                ${calculateItemPrice(item).toFixed(2)}
              </span>
            </div>
          ))}
        </>
      );
    }
    
    // Second priority: Use React Query data if available
    if (orderQuery.data && orderQuery.data.items && orderQuery.data.items.length > 0) {
      console.log("PaymentSuccess - Rendering order items from React Query");
      return (
        <>
          {orderQuery.data.items.map((item: OrderItem, index: number) => (
            <div key={index} className="flex justify-between items-center py-1 text-sm text-left">
              <HideNoneValues item={item} getShapeName={getShapeName} />
              <span className="font-medium">
                ${calculateItemPrice(item).toFixed(2)}
              </span>
            </div>
          ))}
        </>
      );
    }
    
    // Third priority: Try to extract cart items from payment metadata
    if (paymentInfo?.metadata?.cart_items) {
      try {
        console.log("PaymentSuccess - Attempting to render from payment metadata");
        const cartItems = JSON.parse(paymentInfo.metadata.cart_items);
        
        // Helper to get product name and price based on ID (supports both string and numeric IDs)
        const getProductInfo = (id: string | number): { name: string, basePrice: number } => {
          // Convert to string and lowercase for string-based ID matching
          const idStr = id.toString().toLowerCase();
          
          // Match both numeric IDs and string IDs (case insensitive)
          switch (idStr) {
            case '42':
            case 'classicchocolate':
              return { name: 'Classic Chocolate', basePrice: 8.00 };
            case '44':
            case 'caramelchocolate':
              return { name: 'Caramel Chocolate', basePrice: 8.00 };
            case '41':
            case 'cerealchocolate':
              return { name: 'Cereal Chocolate', basePrice: 15.00 };
            case '46':
            case 'assortednutschocolate':
              return { name: 'Assorted Nuts Chocolate', basePrice: 9.00 };
            case '47':
            case 'dubaibar':
              return { name: 'Dubai Bar', basePrice: 5.00 }; // Dubai Bar has a base price of $5.00
            case '48':
            case 'signaturecollection':
              return { name: 'Signature Collection', basePrice: 10.00 }; // Signature Collection has a base price of $10.00
            default:
              console.log("Unknown product ID:", id);
              return { name: 'Luxury Chocolate', basePrice: 8.00 };
          }
        };
        
        if (Array.isArray(cartItems) && cartItems.length > 0) {
          // Calculate individual item price if there are multiple items
          const perItemPrice = cartItems.length > 1 
            ? (paymentInfo.amount / 100) / cartItems.reduce((sum, item) => sum + (item.qty || 1), 0)
            : paymentInfo.amount / 100;
            
          return (
            <>
              {cartItems.map((item: any, index: number) => {
                const quantity = item.qty || 1;
                const productInfo = getProductInfo(item.id);
                
                // Apply the same product-specific options filtering from cart/checkout
                const options = [];
                const productIdStr = item.id?.toString().toLowerCase();
                const productIdNum = parseInt(item.id);
                
                // Handle products that only have size options (e.g., Signature Collection)
                if (productIdStr === "signaturecollection" || productIdStr === "48") {
                  // For Signature Collection, only show size if it's not 'none'
                  if (item.size && item.size.toLowerCase() !== 'none') {
                    options.push(item.size);
                  }
                } 
                // Handle products that have shape but no type or size (e.g., Dubai Bar)
                else if (productIdStr === "dubaibar" || productIdStr === "47") {
                  // Only show shape for Dubai Bar if it's not 'none'
                  if (item.shape && item.shape.toLowerCase() !== 'none') {
                    options.push(getShapeName(item.shape));
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
                    options.push(getShapeName(item.shape));
                  }
                  
                  // Add type if it exists and isn't 'none'
                  if (item.type && item.type.toLowerCase() !== 'none') {
                    options.push(item.type);
                  }
                }
                
                // Create the display name with appropriate options
                let optionsText = "";
                if (options.length > 0) {
                  optionsText = ` (${options.join(' - ')})`;
                } else if (options.length === 0 && productIdStr !== "47" && productIdStr !== "48") {
                  // Add "Regular" for products that could have options but don't
                  optionsText = " (Regular)";
                }
                
                const displayName = `${productInfo.name}${optionsText}`;
                
                // Calculate price with adjustments for size/type options
                let adjustedPrice = productInfo.basePrice;
                
                // Add type price adjustment (dark chocolate costs $2 more)
                if (item.type === 'dark') {
                  adjustedPrice += 2.00;
                }
                
                // Add size price adjustment
                // Don't apply size pricing to Dubai Bar (product ID 47)
                if (productIdNum !== 47) {
                  if (item.size === 'medium') {
                    adjustedPrice += 7.00;
                  } else if (item.size === 'large') {
                    // Special case for Signature Collection - large size costs $20 more to make it $30 total
                    if (productIdNum === 48) {
                      adjustedPrice += 20.00; // Large Signature Collection is $30 total
                    } else {
                      adjustedPrice += 19.00; // Large box costs $19 more for other products
                    }
                  }
                }
                
                // Handle quantity for Signature Collection
                if (productIdNum === 48 && quantity === 2) {
                  adjustedPrice *= 2; // Double the price for quantity 2 ($60)
                }
                
                return (
                  <div key={index} className="flex justify-between items-center py-1 text-sm">
                    <HideNoneValues 
                      item={{
                        quantity: quantity,
                        productId: item.id,
                        productName: productInfo.name,
                        size: item.size,
                        type: item.type,
                        shape: item.shape
                      }} 
                      getShapeName={getShapeName} 
                    />
                    <span className="font-medium">
                      ${adjustedPrice.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </>
          );
        }
      } catch (error) {
        console.error("PaymentSuccess - Error parsing cart items:", error);
      }
    }
    
    // Fallback: Show a message if no order data is available
    return (
      <div className="text-center text-red-500 p-4">
        <AlertCircle className="mx-auto h-8 w-8 mb-2" />
        <p>No order details available</p>
      </div>
    );
  };
  
  // Format the date string for display
  const getFormattedDate = () => {
    try {
      const date = orderData?.createdAt
        ? new Date(orderData.createdAt)
        : orderQuery.data?.createdAt
          ? new Date(orderQuery.data.createdAt)
          : new Date();
      
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (e) {
      console.error("Error formatting date:", e);
      return new Date().toLocaleString();
    }
  };
  
  // Calculate the total amount
  const getTotalAmount = () => {
    // For debugging
    console.log("Calculating total amount:", {
      orderDataTotal: orderData?.totalAmount,
      queryDataTotal: orderQuery.data?.totalAmount,
      paymentInfoAmount: paymentInfo?.amount
    });
    
    // Special case for Signature Collection (product ID 48)
    const isSignatureCollection = (
      (orderData?.items && orderData.items[0]?.productId === 48) ||
      (orderQuery.data?.items && orderQuery.data.items[0]?.productId === 48)
    );
    
    // Use stored amount in cents and convert to dollars
    if (orderData?.totalAmount) {
      return (orderData.totalAmount / 100).toFixed(2);
    } else if (orderQuery.data?.totalAmount) {
      return (orderQuery.data.totalAmount / 100).toFixed(2);
    } else if (paymentInfo?.amount) {
      return (paymentInfo.amount / 100).toFixed(2);
    }
    
    return '0.00';
  };
  
  // Determine if the order is for pickup
  const isPickupOrder = (): boolean => {
    console.log("PaymentSuccess - Checking delivery method");
    console.log("PaymentSuccess - Order data delivery method:", orderData?.deliveryMethod);
    console.log("PaymentSuccess - Query data delivery method:", orderQuery.data?.deliveryMethod);
    console.log("PaymentSuccess - Payment metadata:", paymentInfo?.metadata);
    
    const deliveryMethod = orderData?.deliveryMethod || 
                           orderQuery.data?.deliveryMethod || 
                           paymentInfo?.metadata?.deliveryMethod;
                           
    console.log("PaymentSuccess - Final delivery method:", deliveryMethod);
    return deliveryMethod === 'pickup';
  };

  // Get the confirmation status
  const getConfirmationStatus = () => {
    if (paymentInfo?.status === 'succeeded') {
      return {
        icon: <CheckCircle className="h-16 w-16 text-green-600" />,
        title: "Payment Successfully Processed",
        description: "Your order has been confirmed and is now being prepared.",
        color: "text-green-600"
      };
    } else if (paymentInfo?.status === 'processing') {
      return {
        icon: <CalendarClock className="h-16 w-16 text-yellow-500" />,
        title: "Payment Processing",
        description: "Your payment is being processed. We'll update you once it's complete.",
        color: "text-yellow-500"
      };
    } else {
      return {
        icon: <XCircle className="h-16 w-16 text-red-600" />,
        title: "Payment Failed",
        description: "There was an issue processing your payment. Please try again.",
        color: "text-red-600"
      };
    }
  };
  
  // For debugging price calculations
  console.log("Price data check:", {
    orderDataTotal: orderData?.totalAmount,
    queryDataTotal: orderQuery.data?.totalAmount,
    paymentInfoAmount: paymentInfo?.amount,
    firstItemId: orderData?.items?.[0]?.productId || orderQuery.data?.items?.[0]?.productId,
    firstItemPrice: orderData?.items?.[0]?.price || orderQuery.data?.items?.[0]?.price,
  });
  
  const confirmationStatus = getConfirmationStatus();
  
  // Handle animation completion
  const handleAnimationComplete = () => {
    markConfirmationAsShown();
  };

  return (
    <div className="min-h-screen bg-[#F9F4EE] flex flex-col items-center justify-center pt-28 pb-10 px-4">
      <div className="max-w-md w-full mx-auto bg-white shadow-lg rounded-xl p-8 mb-4">
        <div className="text-center mb-8">
          {confirmationStatus.icon}
          <h2 className={`mt-4 text-2xl font-semibold ${confirmationStatus.color}`}>
            {confirmationStatus.title}
          </h2>
          <p className="mt-2 text-[#6F4E37]">
            {confirmationStatus.description}
          </p>
        </div>
        
        <div className="border-t border-[#E6DFD7] pt-6">
          <h3 className="text-lg font-semibold text-[#4A2C2A] mb-4 flex items-center">
            <ShoppingBag className="mr-2 h-5 w-5" /> Order Summary
          </h3>
          
          <div className="space-y-2 mb-4">
            {renderOrderItems()}
          </div>
          
          <div className="border-t border-[#E6DFD7] pt-4 mt-4">
            <div className="flex justify-between font-semibold text-[#4A2C2A]">
              <span>Total</span>
              <span>${getTotalAmount()}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-6 border-t border-[#E6DFD7] pt-4">
          <div className="flex items-start mb-4">
            <Mail className="h-5 w-5 text-[#6F4E37] mt-1 mr-2" />
            <div>
              <h4 className="font-medium text-[#4A2C2A]">Order Information</h4>
              <p className="text-sm text-[#6F4E37]">
                We'll send a confirmation email to your registered email address.
              </p>
            </div>
          </div>
          
          <div className="flex items-start mb-4">
            <CalendarClock className="h-5 w-5 text-[#6F4E37] mt-1 mr-2" />
            <div>
              <h4 className="font-medium text-[#4A2C2A]">Order Date</h4>
              <p className="text-sm text-[#6F4E37]">{getFormattedDate()}</p>
            </div>
          </div>
          
          <div className="flex items-start mb-4">
            <ShoppingBag className="h-5 w-5 text-[#6F4E37] mt-1 mr-2" />
            <div>
              <h4 className="font-medium text-[#4A2C2A]">Payment ID</h4>
              <p className="text-sm text-[#6F4E37] font-mono">{paymentIntentId}</p>
            </div>
          </div>
          
          {/* Show delivery information based on delivery method */}
          {isPickupOrder() ? (
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-[#6F4E37] mt-1 mr-2" />
              <div>
                <h4 className="font-medium text-[#4A2C2A]">Pickup Information</h4>
                <div className="text-sm text-[#6F4E37]">
                  <PickupLocation onOrderComplete={true} />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-[#6F4E37] mt-1 mr-2" />
              <div>
                <h4 className="font-medium text-[#4A2C2A]">Shipping Address</h4>
                <p className="text-sm text-[#6F4E37] whitespace-pre-line">
                  {orderData?.shippingAddress || orderQuery.data?.shippingAddress || "Address not available"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Display discount code if available */}
      {(orderData?.postPurchaseDiscountCode || orderQuery.data?.postPurchaseDiscountCode) && (
        <div className="mt-6 p-4 bg-[#F4E9D7] border border-[#D8C9AF] rounded-lg">
          <div className="flex items-center mb-2">
            <Gift className="h-5 w-5 text-[#4A2C2A] mr-2" />
            <h3 className="font-medium text-[#4A2C2A]">Your Special Discount Code</h3>
          </div>
          <p className="text-sm text-[#6F4E37] mb-2">
            Thanks for your purchase! Use this code on your next order for a special discount:
          </p>
          <div className="bg-white border border-[#D8C9AF] rounded p-2 text-center font-mono text-lg text-[#4A2C2A] font-semibold">
            {orderData?.postPurchaseDiscountCode || orderQuery.data?.postPurchaseDiscountCode}
          </div>
          <p className="text-xs text-[#8C6E5D] mt-2">
            This is a one-time use code that will expire in 30 days.
          </p>
        </div>
      )}
      
      <div className="flex space-x-4 mt-6">
        <Button
          asChild
          variant="outline"
          className="bg-[#F4E9D7] hover:bg-[#E9DCC7] text-[#4A2C2A] border-[#D8C9AF]"
        >
          <Link href="/menu">
            Continue Shopping
          </Link>
        </Button>
        
        <Button
          asChild
          className="bg-[#4A2C2A] hover:bg-[#3A1F1A] text-white"
        >
          <Link href="/account/orders">
            View Orders
          </Link>
        </Button>
      </div>
      
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5 }}
            onAnimationComplete={handleAnimationComplete}
            className="fixed bottom-8 right-8 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-lg max-w-sm"
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="ml-3">
                <p className="font-medium">Order Confirmed!</p>
                <p className="text-sm">Your payment has been processed successfully.</p>
              </div>
              <button
                onClick={() => setShowConfirmation(false)}
                className="ml-4 text-green-500 hover:text-green-700"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
