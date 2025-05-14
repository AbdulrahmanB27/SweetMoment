import { useEffect, useState } from "react";
import { Trash2, X, Tag, ShoppingBag, AlertCircle } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useDiscount } from "../context/DiscountContext";
import { useAwayMode } from "../context/AwayModeContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import QuantitySelector from "./QuantitySelector";
import { motion } from "framer-motion";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartModal = ({ isOpen, onClose }: CartModalProps) => {
  const { cartItems, removeFromCart, cartTotal, updateQuantity } = useCart();
  const { activeDiscount, applyDiscount, removeDiscount, getDiscountedPrice } = useDiscount();
  const { areOrdersDisabled, disableOrdersReason } = useAwayMode();
  const { toast } = useToast();
  const [isClosing, setIsClosing] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const subtotal = cartTotal;
  const totalPrice = activeDiscount ? getDiscountedPrice(subtotal) : subtotal;
  const discountAmount = subtotal - totalPrice;
  
  // Handle closing animation
  const handleClose = () => {
    if (isAnimating) return; // Prevent multiple clicks during animation
    
    setIsClosing(true);
    setIsAnimating(true);
    
    // Wait for animation to complete before actually closing
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      
      // Add small delay before allowing animations again
      setTimeout(() => {
        setIsAnimating(false);
      }, 50);
    }, 400); // Match the animation duration (slideOutRight)
  };

  const handleCheckout = () => {
    if (isAnimating) return; // Prevent multiple clicks during animation
    
    setIsClosing(true);
    setIsAnimating(true);
    
    // Wait for animation to complete before navigating
    setTimeout(() => {
      onClose();
      window.location.href = "/checkout";
    }, 400);
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isClosing) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      setIsAnimating(false); // Reset animation state when opening
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, isClosing]);

  if (!isOpen && !isClosing) return null;

  return (
    <div className="fixed inset-0 z-[1000]">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 backdrop-blur-[2px] bg-black/5 transition-all duration-300 ease-in-out ${isClosing ? 'opacity-0 backdrop-blur-none' : 'opacity-100'}`}
        onClick={handleClose}
        style={{ animation: isClosing ? 'none' : 'fadeIn 0.3s ease-out forwards' }}
      ></div>
      
      {/* Cart panel */}
      <div 
        className={`absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-lg flex flex-col ${isClosing ? 'animate-slideOutRight' : 'animate-slideInRight'}`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-montserrat font-semibold">Your Cart</h2>
          <button 
            onClick={handleClose} 
            className="text-[#2A1A18] focus:outline-none hover:bg-gray-100 p-1 rounded-full transition-colors"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Main content - scrollable */}
        <div className="p-4 overflow-y-auto flex-grow" style={{ paddingBottom: "150px" }}>
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-gray-500 mb-4">Your cart is empty</p>
              <Button 
                onClick={handleClose}
                className="bg-[#4A2C2A] hover:bg-[#3A1F1D] text-white transition-transform hover:scale-105"
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            <>
              {/* Cart items */}
              {cartItems.map((item) => (
                <div 
                  key={`${item.id}-${item.size}-${item.type}`} 
                  className="flex py-4 border-b border-gray-200 animate-fadeIn"
                >
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-20 h-20 object-cover rounded transition-all duration-300 hover:shadow-md" 
                  />
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-semibold">{item.name}</h3>
                      <span className="font-semibold text-[#4A2C2A]">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {/* Only display options that are relevant for each product */}
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
                    
                    <div className="flex justify-between items-center mt-2">
                      <div className="scale-75 origin-left">
                        <QuantitySelector 
                          quantity={item.quantity}
                          onIncrease={() => updateQuantity(
                            item.id, 
                            item.quantity + 1,
                            item.size, 
                            item.type
                          )}
                          onDecrease={() => {
                            if (item.quantity > 1) {
                              updateQuantity(
                                item.id, 
                                item.quantity - 1,
                                item.size, 
                                item.type
                              );
                            } else {
                              // Remove item if quantity is 1
                              removeFromCart(item.id, item.size, item.type);
                            }
                          }}
                        />
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id, item.size, item.type)}
                        className="text-sm text-red-600 hover:text-red-800 flex items-center group transition-all duration-200"
                        aria-label="Remove item"
                      >
                        <Trash2 size={16} className="mr-1 group-hover:scale-110 transition-transform" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
        
        {/* Fixed checkout section (always at bottom) */}
        {cartItems.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg" style={{ zIndex: 100 }}>
            <div className="px-4 pt-3">
              {/* Summary section */}
              <div className="space-y-1 mb-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Subtotal:</span>
                  <span className="text-[#4A2C2A]">${subtotal.toFixed(2)}</span>
                </div>
                
                {activeDiscount && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span className="flex items-center gap-1">
                      <Tag size={14} className="inline" />
                      Discount ({activeDiscount.code})
                    </span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between font-bold border-t border-[#E8D9B5] pt-2 mb-2">
                  <span className="font-semibold text-gray-700">Total:</span>
                  <span className={`font-bold text-[#4A2C2A] ${activeDiscount ? 'text-green-600' : ''}`}>
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Checkout button */}
            <div className="p-4 pt-0">
              {areOrdersDisabled && (
                <div className="bg-amber-100 p-3 mb-2 rounded-md text-amber-800 text-sm flex items-center">
                  <AlertCircle className="mr-2 h-4 w-4 text-amber-600 flex-shrink-0" />
                  <span>{disableOrdersReason || "Orders are currently disabled. You can build your cart now, but checkout will be available when we return."}</span>
                </div>
              )}
              <motion.button
                whileHover={{ scale: areOrdersDisabled ? 1 : 1.03 }}
                whileTap={{ scale: areOrdersDisabled ? 1 : 0.98 }}
                onClick={areOrdersDisabled ? undefined : handleCheckout}
                disabled={areOrdersDisabled}
                title={disableOrdersReason || ""}
                className={`w-full py-4 ${areOrdersDisabled ? 'bg-amber-500 opacity-90' : 'bg-[#4A2C2A] hover:bg-[#3A1F1D]'} text-white font-semibold rounded-md transition-all shadow-md hover:shadow-lg flex items-center justify-center`}
              >
                {areOrdersDisabled ? (
                  <>
                    <AlertCircle className="mr-2 h-5 w-5 text-white" />
                    Checkout Unavailable
                  </>
                ) : (
                  <>
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    Proceed to Checkout ${totalPrice.toFixed(2)}
                  </>
                )}
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;