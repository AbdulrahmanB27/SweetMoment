import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface AnimatedPriceProps {
  price: number;
  className?: string;
  prefix?: string;
  decimalPlaces?: number;
  isSale?: boolean;
}

// Animation variants for individual digits
const digitVariants = {
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

// Function to convert a number to an array of individual digits
// This will be used to animate each digit independently
const getDigits = (num: number, decimalPlaces: number): string[] => {
  // Format the number to the specified decimal places
  const formatted = num.toFixed(decimalPlaces);
  // Split into array of characters (including decimal point)
  return formatted.split('');
};

const AnimatedPrice = ({ 
  price, 
  className = "", 
  prefix = "$",
  decimalPlaces = 2,
  isSale = false
}: AnimatedPriceProps) => {
  // Keep track of previous price for comparison
  const [prevPrice, setPrevPrice] = useState<string[]>([]);
  const [currentPrice, setCurrentPrice] = useState<string[]>([]);
  
  // Update currentPrice when price prop changes
  useEffect(() => {
    // Store previous price for comparison
    setPrevPrice(currentPrice);
    // Get new digits
    setCurrentPrice(getDigits(price, decimalPlaces));
  }, [price, decimalPlaces]);
  
  // Default base class for price
  const baseClassName = `font-montserrat font-bold ${isSale ? "text-[#E63946]" : ""} ${className}`;
  
  return (
    <div className={`flex items-baseline ${baseClassName}`}>
      {/* Currency symbol */}
      <span className="inline-block mr-[0.08em]">{prefix}</span>
      
      {/* Animated digits */}
      <div className="inline-flex">
        {currentPrice.map((digit, index) => {
          // Check if this specific digit has changed from previous price
          const hasChanged = prevPrice.length > 0 && prevPrice[index] !== digit;
          
          // For decimal point, don't animate but keep consistent spacing
          if (digit === '.') {
            return <span key={`decimal-${index}`} className="inline-block text-center w-[0.35em]">.</span>;
          }
          
          return (
            <div key={`digit-${index}`} className="inline-block overflow-visible relative w-[0.7em] text-center">
              {hasChanged ? (
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={`${index}-${digit}`}
                    className="inline-block"
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={digitVariants}
                  >
                    {digit}
                  </motion.span>
                </AnimatePresence>
              ) : (
                <span>{digit}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnimatedPrice;