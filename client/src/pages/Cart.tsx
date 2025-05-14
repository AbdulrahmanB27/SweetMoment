import { Trash2, Tag, ShoppingBag, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "../context/CartContext";
import { useDiscount, Discount } from "../context/DiscountContext";
import { useAwayMode } from "../context/AwayModeContext";
import QuantitySelector from "../components/QuantitySelector";
import { motion } from "framer-motion";
import { CustomLink, useNavigation } from "../App";
import { useLocation } from "wouter";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Animation variants for cart items
const cartItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    }
  }),
  removed: { 
    opacity: 0,
    x: -100,
    transition: {
      duration: 0.3
    }
  }
};

// Animation for buttons
const buttonVariants = {
  hover: {
    scale: 1.03,
    transition: {
      duration: 0.2
    }
  },
  tap: {
    scale: 0.97
  }
};

export default function Cart() {
  const { cartItems, removeFromCart: removeItemCompletely, cartTotal: subtotal, updateQuantity: updateCartItemQuantity } = useCart();
  const { navigate } = useNavigation();
  const { toast } = useToast();
  const { activeDiscount, applyDiscount, removeDiscount, getDiscountedPrice } = useDiscount();
  const { settings: awayModeSettings, areOrdersDisabled } = useAwayMode();
  const [discountCode, setDiscountCode] = useState("");
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  
  // Calculate total price with BOGO discount handling
  const calculateDiscountedTotal = () => {
    if (!activeDiscount) return subtotal;
    
    if (activeDiscount.discountType === 'buy_one_get_one') {
      // For Buy X Get Y, we need to group by product and apply the discount in sets
      let totalAfterDiscount = 0;
      
      // Get the Buy X and Get Y quantities from the discount, with fallbacks to 1 for backward compatibility
      const buyQuantity = activeDiscount.buyQuantity || 1;
      const getQuantity = activeDiscount.getQuantity || 1;
      const setSize = buyQuantity + getQuantity;
      
      // Group cart items by product ID, size and type
      const groupedItems = cartItems.reduce((groups, item) => {
        const key = `${item.id}-${item.size || 'none'}-${item.type || 'none'}`;
        if (!groups[key]) {
          groups[key] = { ...item };
        } else {
          groups[key].quantity += item.quantity;
        }
        return groups;
      }, {} as Record<string, any>);
      
      // Apply Buy X Get Y discount to each group
      Object.values(groupedItems).forEach((item: any) => {
        const itemPrice = item.price;
        const quantity = item.quantity;
        
        // Calculate how many complete sets (Buy X + Get Y) we can make
        const completeSets = Math.floor(quantity / setSize);
        const remainingItems = quantity % setSize;
        
        // For each complete set, the discount applies to the "Get Y" portion
        // The first "Buy X" items in each set are always full price
        const fullPriceItemsInSets = completeSets * buyQuantity;
        
        // The next "Get Y" items get the discount
        const discountedItemsInSets = completeSets * getQuantity;
        
        // Now handle remaining items
        // First, add any full price items up to the buyQuantity
        const fullPriceRemainingItems = Math.min(remainingItems, buyQuantity);
        
        // Any items beyond the buyQuantity (up to getQuantity) should get the discount
        const discountedRemainingItems = Math.max(0, remainingItems - buyQuantity);
        
        // Apply discount to the discounted items
        const discountPercentage = activeDiscount.value / 100;
        const discountedPrice = itemPrice * (1 - discountPercentage);
        
        // Calculate total for this group
        const groupTotal = 
          ((fullPriceItemsInSets + fullPriceRemainingItems) * itemPrice) + // Full price items
          ((discountedItemsInSets + discountedRemainingItems) * discountedPrice); // Discounted items
        
        totalAfterDiscount += groupTotal;
      });
      
      return totalAfterDiscount;
    } else {
      // For percentage and fixed discounts, use the existing function
      return getDiscountedPrice(subtotal);
    }
  };
  
  const totalPrice = activeDiscount ? calculateDiscountedTotal() : subtotal;
  const discountAmount = subtotal - totalPrice;
  const isEmpty = cartItems.length === 0;
  
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
    <div className="relative min-h-screen">
      <div className="pt-28 pb-24 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-3xl font-montserrat font-bold text-center mb-4"
          >
            Shopping Cart
          </motion.h1>
          
          {/* Away Mode Warning */}
          {awayModeSettings.enabled && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="mb-8"
            >
              <Alert className="bg-amber-50 border-amber-300">
                <AlertTriangle className="h-5 w-5 text-amber-700" />
                <AlertTitle className="text-amber-800 font-medium">Away Mode Active</AlertTitle>
                <AlertDescription className="text-amber-700">
                  {areOrdersDisabled ? (
                    <>
                      <p>We are currently away and new orders are disabled. {awayModeSettings.message}</p>
                      {awayModeSettings.showReturnDate && awayModeSettings.returnDate && (
                        <p className="mt-1">We'll be back on {new Date(awayModeSettings.returnDate).toLocaleDateString()}.</p>
                      )}
                    </>
                  ) : (
                    <>
                      <p>We are currently away. {awayModeSettings.message}</p>
                      {awayModeSettings.showReturnDate && awayModeSettings.returnDate && (
                        <p className="mt-1">We'll be back on {new Date(awayModeSettings.returnDate).toLocaleDateString()}.</p>
                      )}
                      <p className="mt-1 font-medium">You can still place orders but there may be delays in processing.</p>
                    </>
                  )}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
          
          {isEmpty ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-12"
            >
              <h2 className="text-2xl font-montserrat mb-4">Your cart is empty</h2>
              <p className="mb-8 text-[#6F4E37]">Add some delicious chocolates to get started</p>
              <motion.div
                whileHover="hover"
                whileTap="tap"
                variants={buttonVariants}
              >
                <Button 
                  className="bg-[#4A2C2A] text-white hover:bg-[#3A1F1D] py-6 px-8 rounded-md transition-colors font-semibold"
                  onClick={() => navigate("/menu")}
                >
                  Browse Our Collection
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="lg:col-span-2"
              >
                <div className="bg-[#FCFAF7] rounded-lg p-6 shadow-sm">
                  <h2 className="text-xl font-montserrat font-semibold mb-4">Cart Items</h2>
                  
                  <div className="space-y-4">
                    {cartItems.map((item, index) => (
                      <motion.div 
                        custom={index}
                        initial="hidden"
                        animate="visible"
                        exit="removed"
                        variants={cartItemVariants}
                        key={`${item.id}-${item.size}-${item.type}-${index}`} 
                        className="flex flex-col sm:flex-row items-start sm:items-center py-4 border-b border-[#E8D9B5] last:border-0"
                        layout
                      >
                        {/* Product Image */}
                        <motion.div 
                          whileHover={{ scale: 1.05 }}
                          className="w-20 h-20 rounded-md overflow-hidden mr-4 flex-shrink-0 mb-4 sm:mb-0"
                        >
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-cover"
                          />
                        </motion.div>
                        
                        {/* Product Details */}
                        <div className="flex-grow mr-4">
                          <h3 className="font-montserrat font-semibold">{item.name}</h3>
                          <p className="text-sm text-[#6F4E37] mb-1">
                            {item.size} - {item.type}
                          </p>
                          <p className="font-medium">${item.price.toFixed(2)}</p>
                        </div>
                        
                        {/* Quantity Selector */}
                        <div className="flex items-center mt-2 sm:mt-0">
                          <QuantitySelector 
                            quantity={item.quantity}
                            onIncrease={() => updateCartItemQuantity(
                              item.id, 
                              item.quantity + 1,
                              item.size, 
                              item.type
                            )}
                            onDecrease={() => {
                              if (item.quantity > 1) {
                                updateCartItemQuantity(
                                  item.id, 
                                  item.quantity - 1,
                                  item.size,
                                  item.type
                                );
                              } else {
                                // If quantity is already 1 and decreasing, remove it
                                removeItemCompletely(item.id, item.size || "", item.type || "");
                              }
                            }}
                          />
                          
                          <motion.button 
                            whileHover={{ scale: 1.1, color: "#ef4444" }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeItemCompletely(item.id, item.size || "", item.type || "")}
                            className="ml-4 text-red-500 hover:text-red-700 transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 size={20} />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
              
              {/* Standalone Discount Code Section */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="lg:col-span-3 mb-6"
              >
                <div className="bg-[#FCFAF7] rounded-lg p-6 shadow-sm border-2 border-[#E8D9B5]">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center">
                      <Tag size={22} className="mr-3 text-[#5c3426]" />
                      <div>
                        <h3 className="text-lg font-montserrat font-semibold">Have a discount code?</h3>
                        <p className="text-sm text-[#6F4E37]">Enter your code to apply the discount to your order</p>
                      </div>
                    </div>
                    <div className="flex w-full md:w-auto gap-2">
                      <input
                        id="discount-code-standalone"
                        type="text"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                        placeholder="ENTER CODE"
                        className="flex-grow md:w-48 p-2 border border-[#E8D9B5] rounded-md text-sm focus:outline-none focus:border-[#4A2C2A] uppercase"
                      />
                      {activeDiscount ? (
                        <button
                          onClick={removeDiscount}
                          className="p-2 px-4 border border-[#E8D9B5] rounded-md text-red-600 hover:text-red-700 hover:bg-red-50 text-sm font-medium"
                        >
                          Remove
                        </button>
                      ) : (
                        <button
                          onClick={handleApplyDiscount}
                          disabled={isApplyingDiscount || !discountCode.trim()}
                          className="p-2 px-4 bg-[#5c3426] text-white rounded-md text-sm font-medium hover:bg-[#4A2C2A] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isApplyingDiscount ? (
                            <span className="flex items-center justify-center">
                              <span
                                className="mr-1 h-3 w-3 border-2 border-white border-t-transparent rounded-full inline-block animate-spin"
                              />
                              <span>...</span>
                            </span>
                          ) : "Apply"}
                        </button>
                      )}
                    </div>
                  </div>
                  {activeDiscount && (
                    <div className="mt-3 flex items-center text-green-600 border-t border-[#E8D9B5] pt-3">
                      <span className="inline-block mr-2">✓</span> 
                      <div>
                        <p className="font-medium">{activeDiscount.code} applied successfully!</p>
                        {activeDiscount.description && (
                          <p className="text-sm">{activeDiscount.description}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
              
              {/* Order Summary */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="lg:col-span-1"
              >
                <div className="bg-[#FCFAF7] rounded-lg p-6 shadow-sm">
                  <h2 className="text-xl font-montserrat font-semibold mb-4">Order Summary</h2>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-[#6F4E37]">Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    
                    {activeDiscount && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="flex justify-between text-green-600"
                      >
                        <span className="flex items-center gap-1">
                          <Tag size={16} className="inline" />
                          {activeDiscount.discountType === 'buy_one_get_one' 
                            ? activeDiscount.value === 100
                              ? activeDiscount.buyQuantity === 1 && activeDiscount.getQuantity === 1
                                ? `Buy One Get One Free` 
                                : `Buy ${activeDiscount.buyQuantity || 1} Get ${activeDiscount.getQuantity || 1} Free`
                              : activeDiscount.buyQuantity === 1 && activeDiscount.getQuantity === 1
                                ? `Buy One Get One ${activeDiscount.value}% Off`
                                : `Buy ${activeDiscount.buyQuantity || 1} Get ${activeDiscount.getQuantity || 1} ${activeDiscount.value}% Off`
                            : `Discount (${activeDiscount.code})`}
                        </span>
                        <span>-${discountAmount.toFixed(2)}</span>
                      </motion.div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-[#6F4E37]">Shipping</span>
                      <span>Calculated at checkout</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-[#E8D9B5] pt-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="font-montserrat font-semibold">Total</span>
                      <motion.span 
                        key={totalPrice} // Re-animate when price changes
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ 
                          type: "spring", 
                          stiffness: 200
                        }}
                        className={`text-xl font-montserrat font-bold ${
                          activeDiscount ? "text-green-600" : ""
                        }`}
                      >
                        ${totalPrice.toFixed(2)}
                      </motion.span>
                    </div>
                  </div>
                  
                  {/* Checkout button section */}
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="border-[#4A2C2A] text-[#4A2C2A] hover:bg-[#F5EFEA] font-medium py-6"
                      onClick={() => navigate("/menu")}
                    >
                      Continue Shopping
                    </Button>
                    
                    <Button
                      className="bg-[#4A2C2A] text-white hover:bg-[#3A1F1D] font-semibold py-6"
                      onClick={() => navigate("/checkout")}
                      disabled={areOrdersDisabled}
                    >
                      {areOrdersDisabled ? "Ordering Disabled" : "Checkout"}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile Sticky Checkout Button */}
      {!isEmpty && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-xl z-50">
          <div className="container mx-auto">
            <motion.button
              whileHover={!areOrdersDisabled ? { scale: 1.02 } : {}}
              whileTap={!areOrdersDisabled ? { scale: 0.98 } : {}}
              onClick={() => !areOrdersDisabled && navigate('/checkout')}
              className={`w-full py-4 rounded-md font-semibold text-lg flex items-center justify-center ${
                areOrdersDisabled 
                  ? 'bg-gray-500 cursor-not-allowed text-white opacity-70' 
                  : 'bg-[#4A2C2A] text-white'
              }`}
              disabled={areOrdersDisabled}
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              {areOrdersDisabled ? "Ordering Disabled" : `Proceed to Checkout $${totalPrice.toFixed(2)}`}
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}