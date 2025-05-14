import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useCart } from "@/context/CartContext";
import { useDiscount } from "@/context/DiscountContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigation } from "@/App";
import { PaymentForm } from "@/components/ui/payment-form";
import { Tag } from "lucide-react";

// Animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const buttonVariants = {
  hover: {
    scale: 1.03,
    transition: { duration: 0.2 },
  },
  tap: {
    scale: 0.97,
  },
};

export default function Checkout() {
  const { getTotalPrice, cartItems, clearCart } = useCart();
  const { activeDiscount, applyDiscount, removeDiscount, getDiscountedPrice } = useDiscount();
  const { toast } = useToast();
  const { navigate } = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const subtotal = getTotalPrice();
  const totalAmount = activeDiscount ? getDiscountedPrice(subtotal) : subtotal;
  const discountAmount = subtotal - totalAmount;
  
  // Handle successful payment
  const handlePaymentSuccess = () => {
    toast({
      title: "Payment successful!",
      description: "Thank you for your purchase. Your order has been confirmed.",
    });
    clearCart();
    navigate("/payment-success");
  };
  
  // Handle payment error
  const handlePaymentError = (errorMessage: string) => {
    toast({
      title: "Payment failed",
      description: errorMessage || "There was a problem processing your payment. Please try again.",
      variant: "destructive",
    });
  };
  
  // Handle applying discount code
  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    
    setIsApplyingDiscount(true);
    try {
      // Force uppercase one more time to be sure
      const success = await applyDiscount(discountCode.toUpperCase());
      if (success) {
        setDiscountCode("");
      }
    } catch (error) {
      console.error("Error applying discount:", error);
      toast({
        title: "Error",
        description: "Failed to apply discount code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  return (
    <section className="pt-28 pb-16 bg-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-montserrat font-bold text-center mb-8"
        >
          Secure Checkout
        </motion.h1>
        
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
              <a href="/menu" className="no-underline">
                <div className="inline-block bg-[#4A2C2A] text-white hover:bg-[#3A1F1D] py-6 px-8 rounded-md transition-colors font-semibold">
                  Browse Our Collection
                </div>
              </a>
            </motion.div>
          </motion.div>
        ) : (
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
                      {cartItems.map((item) => (
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
                                {item.size} - {item.type}
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
                      className="font-bold"
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
                
                {/* Discount code section */}
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
                          disabled={isApplyingDiscount || !discountCode.trim()}
                          className="p-2 px-4 bg-[#5c3426] text-white rounded-md text-sm font-medium hover:bg-[#4A2C2A] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isApplyingDiscount ? (
                            <span className="flex items-center justify-center">
                              <motion.span
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="mr-2 h-3 w-3 border-2 border-white border-t-transparent rounded-full inline-block"
                              />
                              Applying...
                            </span>
                          ) : "Apply"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                <PaymentForm 
                  amount={totalAmount} 
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};