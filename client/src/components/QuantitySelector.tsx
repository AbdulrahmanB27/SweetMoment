import { useState, useEffect, useRef } from "react";
import { Minus, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface QuantitySelectorProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  maxQuantity?: number;
}

// Animation variants for the buttons
const buttonVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.1 },
  tap: { scale: 0.9 }
};

// Animation variants for the quantity display
const quantityVariants = {
  initial: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.15 }
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: "easeOut" }
  },
  exit: {
    opacity: 0,
    y: 10,
    transition: { duration: 0.15 }
  }
};

const QuantitySelector = ({ quantity, onIncrease, onDecrease, maxQuantity = 99 }: QuantitySelectorProps) => {
  // Create a local state to ensure consistent display even if parent state updates are delayed
  const [displayedQuantity, setDisplayedQuantity] = useState(quantity);
  const isMaxQuantity = displayedQuantity >= maxQuantity;
  
  // Touch/click handling - track that a click is in progress to avoid double processing
  const clickInProgressRef = useRef(false);
  
  // When the parent quantity changes, update our local displayed quantity
  useEffect(() => {
    setDisplayedQuantity(quantity);
  }, [quantity]);
  
  // Handler for decreasing quantity with debounce protection
  const handleDecrease = () => {
    // Prevent rapid clicks or touch events
    if (clickInProgressRef.current || displayedQuantity <= 1) return;
    
    // Mark that we're processing a click
    clickInProgressRef.current = true;
    
    // Update the local display immediately for better UX
    setDisplayedQuantity(prev => Math.max(1, prev - 1));
    
    // Call the parent handler
    onDecrease();
    
    // Reset the click state after a short delay
    setTimeout(() => {
      clickInProgressRef.current = false;
    }, 200); // Add a small delay to prevent accidental double taps on mobile
  };
  
  // Handler for increasing quantity with debounce protection
  const handleIncrease = () => {
    // Prevent rapid clicks or touch events
    if (clickInProgressRef.current || displayedQuantity >= maxQuantity) return;
    
    // Mark that we're processing a click
    clickInProgressRef.current = true;
    
    // Update the local display immediately for better UX
    setDisplayedQuantity(prev => Math.min(maxQuantity, prev + 1));
    
    // Call the parent handler
    onIncrease();
    
    // Reset the click state after a short delay
    setTimeout(() => {
      clickInProgressRef.current = false;
    }, 200); // Add a small delay to prevent accidental double taps on mobile
  };
  
  return (
    <div className="flex items-center">
      <motion.button 
        onClick={handleDecrease}
        disabled={displayedQuantity <= 1}
        className="w-10 h-10 rounded-l-md bg-[#F5EFEA] border border-[#D2B48C] flex items-center justify-center hover:bg-[#E8D9B5] disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Decrease quantity"
        variants={buttonVariants}
        initial="rest"
        whileHover={displayedQuantity > 1 ? "hover" : "rest"}
        whileTap={displayedQuantity > 1 ? "tap" : "rest"}
      >
        <Minus size={16} className="text-[#4A2C2A]" />
      </motion.button>
      
      <div className="w-16 h-10 border-t border-b border-[#D2B48C] flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.span
            key={displayedQuantity}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={quantityVariants}
            className="block text-center font-semibold"
          >
            {displayedQuantity}
          </motion.span>
        </AnimatePresence>
      </div>
      
      <motion.button 
        onClick={handleIncrease}
        disabled={isMaxQuantity}
        className="w-10 h-10 rounded-r-md bg-[#F5EFEA] border border-[#D2B48C] flex items-center justify-center hover:bg-[#E8D9B5] disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Increase quantity"
        variants={buttonVariants}
        initial="rest"
        whileHover={!isMaxQuantity ? "hover" : "rest"}
        whileTap={!isMaxQuantity ? "tap" : "rest"}
      >
        <Plus size={16} className="text-[#4A2C2A]" />
      </motion.button>
    </div>
  );
};

export default QuantitySelector;
