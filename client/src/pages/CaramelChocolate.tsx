import { useState } from "react";
import { Star, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import QuantitySelector from "../components/QuantitySelector";
import OptionSelector, { Option } from "../components/OptionSelector";
import ReviewSystem from "../components/ReviewSystem";
import { useCart } from "../context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { getProductReviews, calculateReviewCount, calculateAverageRating } from "../lib/reviewService";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

type CaramelSize = "small" | "medium" | "large";
type CaramelType = "milk" | "dark";

const sizeOptions: Option[] = [
  { id: "small", label: "Small", sublabel: "150g box - $8", value: "small", price: 8 },
  { id: "medium", label: "Medium", sublabel: "300g box - $15", value: "medium", price: 15 },
  { id: "large", label: "Large", sublabel: "500g box - $20", value: "large", price: 20 }
];

const typeOptions: Option[] = [
  { id: "milk", label: "Milk Chocolate", value: "milk", price: 0 },
  { id: "dark", label: "Dark Chocolate", value: "dark", price: 2 }
];

// Type-safe price map
const priceMap: Record<CaramelSize, Record<CaramelType, number>> = {
  small: { milk: 8, dark: 10 },
  medium: { milk: 15, dark: 17 },
  large: { milk: 20, dark: 22 }
};

const CaramelChocolate = () => {
  const [selectedSize, setSelectedSize] = useState<CaramelSize>("small");
  const [selectedType, setSelectedType] = useState<CaramelType>("milk");
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  // Get accurate review count and rating using React Query
  const { data: reviews = [] } = useQuery({
    queryKey: [`product-reviews-caramel`],
    queryFn: () => getProductReviews("caramel"),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Calculate review metrics from the fetched data
  const reviewCount = calculateReviewCount(reviews);
  const rating = calculateAverageRating(reviews);

  const maxQuantity = 99;
  const handleIncrease = () => quantity < maxQuantity && setQuantity(quantity + 1);
  const handleDecrease = () => quantity > 1 && setQuantity(quantity - 1);

  const basePrice = priceMap[selectedSize][selectedType];
  const totalPrice = basePrice * quantity;

  const handleAddToCart = () => {
    addToCart({
      id: "caramel",
      name: "Caramel Chocolate",
      size: selectedSize === "small" ? "Small (150g)" : 
            selectedSize === "medium" ? "Medium (300g)" : "Large (500g)",
      type: selectedType === "milk" ? "Milk" : "Dark",
      price: basePrice,
      quantity,
      image: "https://images.unsplash.com/photo-1582049024337-a045acffe5e1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
    });

    toast({
      title: "Added to cart",
      description: `${quantity} ${selectedSize} ${selectedType} Caramel Chocolate added to your cart.`,
      duration: 1000,
    });
  };

  // Use wouter navigation for direct navigation without a page reload
  const [_, navigate] = useLocation();
  
  const handleBuyNow = () => {
    handleAddToCart();
    navigate("/checkout");
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Header with title and back button */}
        <div className="flex items-center justify-between mb-12">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              onClick={() => navigate("/menu")}
              variant="ghost"
              className="flex items-center text-[#6F4E37] hover:text-[#4A2C2A] hover:bg-[#FAF5F0] transition-colors"
            >
              <ArrowLeft size={18} className="mr-2" />
              Back to Menu
            </Button>
          </motion.div>
          
          <motion.h1 
            className="text-3xl font-montserrat font-bold flex-grow text-center mr-24"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Caramel Chocolate
          </motion.h1>
          
          {/* Empty div to balance the layout */}
          <div className="w-24"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Image */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <img 
              src="https://images.unsplash.com/photo-1582049024337-a045acffe5e1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
              alt="Caramel Chocolate" 
              className="w-full h-auto rounded-lg shadow-lg"
            />
            <div className="absolute top-4 right-4 bg-[#D4AF37] text-[#2A1A18] px-3 py-1 rounded-full text-sm font-semibold">
              New
            </div>
          </motion.div>
          
          {/* Product Details */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={`${i < Math.floor(rating) ? 'text-[#D4AF37] fill-[#D4AF37]' : 
                                i < rating ? 'text-[#D4AF37] fill-[#D4AF37] opacity-50' : 
                                'text-[#D4AF37] opacity-25'}`}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-600">{rating.toFixed(1)} ({reviewCount} reviews)</span>
              </div>
            </motion.div>
            
            <motion.p 
              className="text-[#6F4E37] mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              Smooth caramel wrapped in rich chocolate, crafted to perfection for a luxurious treat. 
              Our signature caramel recipe creates a buttery, melt-in-your-mouth experience with every bite.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.7 }}
            >
              <OptionSelector 
                title="Size Options"
                options={sizeOptions}
                selectedValue={selectedSize}
                onChange={(value) => setSelectedSize(value as CaramelSize)}
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.8 }}
            >
              <OptionSelector 
                title="Chocolate Type"
                options={typeOptions}
                selectedValue={selectedType}
                onChange={(value) => setSelectedType(value as CaramelType)}
              />
            </motion.div>
            
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.9 }}
            >
              <h4 className="font-montserrat font-semibold mb-3">Quantity</h4>
              <QuantitySelector 
                quantity={quantity}
                onIncrease={handleIncrease}
                onDecrease={handleDecrease}
                maxQuantity={maxQuantity}
              />
            </motion.div>
            
            <motion.div 
              className="mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 1.0 }}
            >
              <div className="flex items-baseline">
                <h4 className="font-montserrat font-bold text-2xl">${totalPrice}</h4>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex space-x-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.1 }}
            >
              <Button 
                onClick={handleAddToCart}
                className="flex-1 py-6 border-2 border-[#4A2C2A] bg-white text-[#4A2C2A] hover:bg-[#F5EFEA] rounded-md transition-colors font-semibold"
              >
                Add to Cart
              </Button>
              <Button 
                onClick={handleBuyNow}
                className="flex-1 py-6 bg-[#4A2C2A] text-white hover:bg-[#3A1F1D] rounded-md transition-colors font-semibold"
              >
                Buy Now
              </Button>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Review System */}
        <ReviewSystem productId="caramel" />
        
        {/* Back to Menu Button */}
        <motion.div 
          className="mt-12 mb-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Button
            onClick={() => navigate("/menu")}
            className="px-8 py-3 bg-[#6F4E37] text-white hover:bg-[#8C6E58] transition-colors rounded-md font-semibold"
          >
            <ArrowLeft size={16} className="mr-2 inline" />
            Back to All Chocolates
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default CaramelChocolate;