import { Star } from "lucide-react";
import { Link } from "wouter";
import resetScroll from "../resetScroll";
import { DEFAULT_HERO_IMAGES, DEFAULT_PRODUCT_IMAGE } from "../pages/admin/default-images";
import { motion } from "framer-motion";
import { parseProductDescription } from "../utils/descriptionParser";

interface ProductCardProps {
  id: string;
  name: string;
  image: string;
  rating: number;
  reviewCount: number;
  description: string;
  price: number;
  path: string;
  badge?: "best-seller" | "premium" | "popular" | "new";
  saleActive?: boolean;
  originalPrice?: number;
  saleEndDate?: string | null;
  inventory?: number; // Add inventory prop
}

const ProductCard = ({ id, name, image, rating, reviewCount, description, price, path, badge, saleActive, originalPrice, saleEndDate, inventory = 100 }: ProductCardProps) => {
  // Check if product is out of stock
  const isOutOfStock = inventory <= 0;
  // Add scroll to top behavior before navigation
  const handleClick = () => {
    // Use our improved scroll utility for consistent behavior
    resetScroll();
  };
  
  // Debug price
  console.log(`ProductCard: Product ${id} (${name}) received price: ${price} (type: ${typeof price})`);
  
  // Badge text and color mapping with exact colors from product pages
  const badgeConfig = {
    "best-seller": { text: "Best Seller", color: "bg-[#D4AF37] text-[#2A1A18]" },
    "premium": { text: "Premium", color: "bg-[#6F4E37] text-white" },
    "popular": { text: "Popular", color: "bg-[#BE8C63] text-white" },
    "new": { text: "New", color: "bg-[#D4AF37] text-[#2A1A18]" },
    "sale": { text: "Sale", color: "bg-[#E63946] text-white" }, // Added distinctive red color for sale items
    "out-of-stock": { text: "Out of Stock", color: "bg-gray-800 text-white" } // Out of stock badge
  };
  
  // Hover animation for the card
  const cardVariants = {
    initial: {},
    hover: {
      y: -8,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: {
        y: { type: "spring", stiffness: 300, damping: 15 },
        boxShadow: { duration: 0.2 }
      }
    }
  };
  
  // Image animation on hover
  const imageVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: { duration: 0.4 }
    }
  };
  
  // Badge animation for entry
  const badgeVariants = {
    initial: { x: -100, opacity: 0 },
    animate: { 
      x: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 500, 
        damping: 25,
        delay: 0.2
      }
    }
  };
  
  // Sale banner animation
  const saleBannerVariants = {
    initial: { y: -50, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 500, 
        damping: 25
      }
    }
  };
  
  return (
    <Link href={path} onClick={handleClick}>
      <motion.div 
        className="bg-white rounded-lg overflow-hidden shadow-md cursor-pointer h-full relative"
        variants={cardVariants}
        initial="initial"
        whileHover="hover"
      >
        {/* Show product badge (if not on sale) */}
        {badge && !saleActive && (
          <motion.div 
            className={`absolute top-2 left-0 ${badgeConfig[badge].color} text-xs font-bold py-1 px-2 rounded-r shadow-md z-10`}
            variants={badgeVariants}
            initial="initial"
            animate="animate"
          >
            {badgeConfig[badge].text}
          </motion.div>
        )}
        
        {/* Show sale ribbon (priority over regular badge) */}
        {saleActive && !isOutOfStock && (
          <>
            {/* Sale banner across the top with gradient and pattern */}
            <motion.div 
              className="absolute top-0 left-0 right-0 bg-gradient-to-r from-[#E63946] to-[#FF6B6B] text-white font-bold py-2 px-4 text-center shadow-lg text-sm z-10 flex items-center justify-center space-x-1"
              variants={saleBannerVariants}
              initial="initial"
              animate="animate"
            >
              <span className="animate-pulse">SALE</span>
              <span className="inline-block mx-1">•</span>
              <span>LIMITED TIME</span>
            </motion.div>
            
            {/* Percentage off badge - only show if we have original price for comparison */}
            {originalPrice && price < originalPrice && (
              <motion.div 
                className="absolute top-8 right-2 bg-[#E63946] text-white text-xs font-bold py-2 px-3 rounded-full shadow-md z-10"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: [0.8, 1.2, 1], 
                  opacity: 1,
                  transition: { 
                    duration: 0.5, 
                    times: [0, 0.5, 1],
                    delay: 0.3
                  }
                }}
                whileHover={{ 
                  scale: 1.1,
                  transition: { duration: 0.2, yoyo: Infinity, repeatDelay: 0.5 }
                }}
              >
                <span className="text-sm">{Math.round((1 - (price / originalPrice)) * 100)}%</span> OFF
              </motion.div>
            )}
          </>
        )}
        
        {/* Show out of stock overlay */}
        {isOutOfStock && (
          <>
            {/* Out of stock banner */}
            <motion.div 
              className="absolute top-0 left-0 right-0 bg-gray-800 text-white font-bold py-2 px-4 text-center shadow-lg text-sm z-20 flex items-center justify-center"
              variants={saleBannerVariants}
              initial="initial"
              animate="animate"
            >
              OUT OF STOCK
            </motion.div>
            
            {/* Overlay on the image to fade it out */}
            <motion.div 
              className="absolute inset-0 bg-gray-900/50 z-10 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ duration: 0.3 }}
            />
          </>
        )}
        
        <div className="h-48 sm:h-56 md:h-64 overflow-hidden bg-amber-50">
          <motion.img 
            src={image || DEFAULT_PRODUCT_IMAGE} 
            alt={name} 
            className="w-full h-full object-cover"
            variants={imageVariants}
            onError={(e) => {
              console.error("Image failed to load:", image);
              const target = e.target as HTMLImageElement;
              
              // Try adding https:// if it doesn't start with http or /
              if (image && !image.startsWith('http://') && !image.startsWith('https://') && !image.startsWith('/')) {
                console.log("Attempting to fix URL by adding https://");
                target.src = "https://" + image;
                
                // Add a one-time listener to handle if the fixed URL also fails
                target.onerror = () => {
                  console.error("Fixed URL also failed:", target.src);
                  // Use local fallback image
                  target.src = DEFAULT_PRODUCT_IMAGE;
                  target.onerror = null; // Prevent infinite loop
                };
              } else if (image && image.startsWith('/images/')) {
                // Update old path format
                console.log("Replacing old image path format with static path");
                target.src = DEFAULT_PRODUCT_IMAGE;
              } else {
                // Use a local fallback image
                console.log("Using static fallback image");
                target.src = DEFAULT_PRODUCT_IMAGE;
              }
            }}
            loading="lazy"
          />
        </div>
        <motion.div 
          className="p-3 sm:p-4 md:p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            transition: { delay: 0.1, duration: 0.3 }
          }}
        >
          <h3 className="font-montserrat font-semibold text-base sm:text-lg md:text-xl mb-1 sm:mb-2">{name}</h3>
          <div className="flex items-center mb-2 sm:mb-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    transition: { 
                      delay: 0.1 + (i * 0.05),
                      duration: 0.3,
                      type: "spring", 
                      stiffness: 500
                    }
                  }}
                >
                  <Star
                    size={12}
                    className={`sm:w-4 sm:h-4 md:w-4 md:h-4 ${i < Math.floor(rating) ? 'text-[#D4AF37] fill-[#D4AF37]' : 
                                 i < rating ? 'text-[#D4AF37] fill-[#D4AF37] opacity-50' : 
                                 'text-[#D4AF37] opacity-25'}`}
                  />
                </motion.div>
              ))}
            </div>
            <span className="ml-1 sm:ml-2 text-xs sm:text-sm text-gray-600">({reviewCount})</span>
          </div>
          <div className="text-[#6F4E37] mb-2 sm:mb-4 text-xs sm:text-sm md:text-base line-clamp-3">
            {parseProductDescription(description, saleEndDate, saleActive)}
          </div>
          <div className="flex justify-between items-center">
            {/* Price display - show original and sale price if on sale */}
            {saleActive && originalPrice ? (
              <motion.div 
                className="flex flex-col"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: 1,
                  transition: { delay: 0.3, duration: 0.3 }
                }}
              >
                <div className="flex items-center">
                  <motion.span 
                    className="font-bold text-base sm:text-lg text-[#E63946] mr-2"
                    whileHover={{ scale: 1.05 }}
                  >
                    Starting at ${typeof price === 'number' ? (price * 100).toFixed(2) : price}
                  </motion.span>
                  <span className="text-xs sm:text-sm text-gray-500 line-through mt-0.5">
                    ${typeof originalPrice === 'number' ? (originalPrice * 100).toFixed(2) : originalPrice}
                  </span>
                </div>
                <motion.span 
                  className="text-xs text-[#E63946] font-medium"
                  animate={{ 
                    opacity: [0.7, 1, 0.7],
                    transition: { 
                      repeat: Infinity, 
                      duration: 2, 
                      ease: "easeInOut" 
                    }
                  }}
                >
                  {typeof originalPrice === 'number' && typeof price === 'number' && 
                    originalPrice > price ? `Save $${((originalPrice - price) * 100).toFixed(2)}` : ''}
                </motion.span>
              </motion.div>
            ) : (
              <motion.span 
                className="font-semibold text-sm sm:text-base"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: 1,
                  transition: { delay: 0.3, duration: 0.3 }
                }}
                whileHover={{ scale: 1.05 }}
              >
                Starting at ${typeof price === 'number' ? (price * 100).toFixed(2) : price}
              </motion.span>
            )}
          </div>
        </motion.div>
      </motion.div>
    </Link>
  );
};

export default ProductCard;
