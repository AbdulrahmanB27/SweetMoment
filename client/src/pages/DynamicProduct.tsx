import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MessageCircle, Star, ShoppingCart, Minus, Plus, Share2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import QuantitySelector from "../components/QuantitySelector";
import MixedTypeSelector from "../components/MixedTypeSelector";
import ReviewSystem from "../components/ReviewSystem";
import AnimatedPrice from "../components/AnimatedPrice";
import { useCart } from "../context/CartContext";
import { useAwayMode } from "../context/AwayModeContext";
import { useToast } from "@/hooks/use-toast";
import NotFound from "./not-found";
import { getProductReviews } from "../lib/reviewService";
import { generateProductSlug } from "../lib/utils";
import resetScroll from "../resetScroll";
import { motion } from "framer-motion";

// Helper function to get size options from a product
function getSizeOptions(product: any): any[] {
  if (!product) return [];
  
  // Try to use the parsed sizes array
  if (product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0) {
    return product.sizes;
  }
  
  // Fallback: try to parse the sizeOptions string
  if (product.sizeOptions) {
    try {
      const parsed = JSON.parse(product.sizeOptions);
      
      if (Array.isArray(parsed) && parsed.length > 0) {
        // For each size option, add the quantity info from the label if not already present
        return parsed.map(option => {
          // If option already has quantity, use it
          if (option.quantity) {
            return option;
          }
          
          // Try to extract quantity from the label (e.g., "Small Box (4 pieces)")
          const match = option.label?.match(/\((\d+)\s*pieces?\)/i);
          if (match && match[1]) {
            // Parse to integer to ensure it's stored as a number
            const parsedQuantity = parseInt(match[1], 10);
            return {
              ...option,
              quantity: parsedQuantity
            };
          }
          
          return option;
        });
      }
    } catch (e) {
      console.error("Error parsing size options:", e);
    }
  }
  
  return [];
}

// Helper function to get type options from a product
function getTypeOptions(product: any): any[] {
  if (!product) return [];
  
  // Try to use the parsed types array
  if (product.types && Array.isArray(product.types) && product.types.length > 0) {
    return product.types;
  }
  
  // Fallback: try to parse the typeOptions string
  if (product.typeOptions) {
    try {
      const parsed = JSON.parse(product.typeOptions);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.error("Error parsing type options:", e);
    }
  }
  
  return [];
}

// Helper function to get shape options from a product
function getShapeOptions(product: any): any[] {
  if (!product) return [];
  
  // Try to use the parsed shapes array
  if (product.shapes && Array.isArray(product.shapes) && product.shapes.length > 0) {
    return product.shapes;
  }
  
  // Fallback: try to parse the shapeOptions string
  if (product.shapeOptions) {
    try {
      const parsed = JSON.parse(product.shapeOptions);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.error("Error parsing shape options:", e);
    }
  }
  
  return [];
}

// Default size and type options for all dynamic products
const defaultSizeOptions = [
  { id: "none", label: "Regular Box (6 pieces)", value: "none", price: 0 }
];

const defaultTypeOptions = [
  { id: "milk", label: "Milk Chocolate", value: "milk", price: 0 },
  { id: "dark", label: "Dark Chocolate", value: "dark", price: 0 }
];

// Default shape options
const defaultShapeOptions = [
  { id: "none", label: "Regular Shape", value: "none", price: 0 }
];

// Mixed type for half and half selection
const MIXED_TYPE_ID = "mixed";

interface MixedTypeRatio {
  typeId1: string;
  typeId2: string;
  ratio: number;
  type1Pieces?: number;
  type2Pieces?: number;
  totalPieces?: number;
}

export default function DynamicProduct({ slug, productId }: { slug?: string, productId?: string }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedShape, setSelectedShape] = useState("");
  const [isMixedType, setIsMixedType] = useState(false);
  const [mixedTypeRatio, setMixedTypeRatio] = useState<MixedTypeRatio | null>(null);
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  // Store the mixed type price adjustment separately
  const [mixedTypePrice, setMixedTypePrice] = useState<number>(0);
  const [currentProductId, setCurrentProductId] = useState<string | null>(productId || null);
  const [, navigate] = useLocation();
  const { addToCart } = useCart();
  const { toast } = useToast();
  // Add away mode context to check if orders are disabled
  const { areOrdersDisabled, disableOrdersReason } = useAwayMode();
  // No longer need the tooltip state
  
  // Force the page to start at the top when it first loads or changes
  useEffect(() => {
    // Set a small timeout to ensure this happens after the DOM is updated
    const scrollTimeout = setTimeout(() => {
      // First, use document methods for absolute positioning
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
      
      // Then use window.scrollTo for maximum compatibility
      window.scrollTo(0, 0);
      
      // Finally use our improved resetScroll utility that has multiple fallbacks
      resetScroll();
      
      console.log('Scroll position reset on product page load/change');
    }, 0);
    
    return () => clearTimeout(scrollTimeout);
  }, [currentProductId, slug]); // Re-run when product ID or slug changes

  // If we have a productId directly from the route parameter, use it immediately
  useEffect(() => {
    if (productId) {
      setCurrentProductId(productId);
    }
  }, [productId]);

  // Fetch all products to find the one with the matching slug
  const { data: allProducts = [], isLoading: isLoadingAllProducts } = useQuery({
    queryKey: ['/api/products', slug], // Add slug to force refresh when navigation between products
    queryFn: async () => {
      try {
        console.log(`Fetching all products for slug resolution. Slug: ${slug}, Direct ID: ${currentProductId}`);
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Failed to fetch products');
        return await response.json();
      } catch (error) {
        console.error('Error fetching products:', error);
        return [];
      }
    },
    enabled: !!slug, // Always enable when we have a slug regardless of product ID state
    staleTime: 0 // Always fetch fresh data
  });

  // Reset product ID when slug changes to force a refresh
  useEffect(() => {
    if (slug) {
      console.log("Slug changed to:", slug, "- Resetting product state and searching for product");
      
      // Clear the current product ID to trigger a fresh lookup
      setCurrentProductId(null);
      
      // Reset selection states for a clean start with the new product
      setSelectedSize("");
      setSelectedType("");
      setSelectedShape("");
      setCalculatedPrice(0);
      setQuantity(1);
      
      // If we have products data available, find the matching product
      if (allProducts.length > 0) {
        const slugLower = decodeURIComponent(slug).toLowerCase();
        console.log(`Looking for product with slug: "${slugLower}" among ${allProducts.length} products`);
        
        const product = allProducts.find((p: any) => {
          const productNameSlug = generateProductSlug(p.name);
          console.log(`Comparing: "${productNameSlug}" to "${slugLower}"`);
          return productNameSlug === slugLower;
        });
        
        if (product) {
          console.log(`Found product with ID ${product.id} for slug ${slug}`);
          setCurrentProductId(product.id.toString());
        } else {
          console.log("No product found with slug:", slug);
        }
      } else {
        console.log("No products available yet to search for slug:", slug);
      }
    }
  }, [slug, allProducts]);

  // Fetch this specific product directly from the API
  const { data: product, isLoading: isLoadingProduct } = useQuery({
    // Use slug in queryKey to invalidate cache when product changes
    queryKey: ['product', currentProductId, slug],
    queryFn: async () => {
      // If we have a direct product ID, fetch by ID
      if (currentProductId) {
        console.log(`Fetching product with ID: ${currentProductId} for slug: ${slug}`);
        // Use cache: 'no-store' to prevent browser caching
        const response = await fetch(`/api/products/${currentProductId}`, { 
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            console.error(`Product with ID ${currentProductId} not found`);
            return null; // Product not found
          }
          throw new Error(`Failed to fetch product: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log(`Product data received for ${data.name}:`, data);
        return data;
      }
      
      // Otherwise, we have no way to fetch the product
      console.log("No product ID available, cannot fetch product");
      return null;
    },
    enabled: !!currentProductId, // Only run when we have a product ID
    staleTime: 0, // Don't cache at all, always fetch fresh data
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    gcTime: 0, // Don't keep in garbage collection (formerly cacheTime)
    retry: false // Don't retry on failure
  });
  
  // Fetch reviews for this product
  const { data: reviews = [] } = useQuery({
    queryKey: [`product-reviews-${currentProductId}`],
    queryFn: () => getProductReviews(currentProductId || ''),
    // Always enable the query to avoid race conditions
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!currentProductId,
  });

  // When product loads, select the first available options
  useEffect(() => {
    if (product) {
      try {
        console.log("Processing product options for:", product.name);
        
        // Handle size options
        let sizeOptions = defaultSizeOptions;
        
        // Check if the product has parsed sizes array
        if ((product as any).sizes && Array.isArray((product as any).sizes) && (product as any).sizes.length > 0) {
          sizeOptions = (product as any).sizes;
        } 
        // Check for unparsed sizeOptions string (fallback)
        else if ((product as any).sizeOptions) {
          try {
            const parsedSizes = JSON.parse((product as any).sizeOptions);
            if (Array.isArray(parsedSizes) && parsedSizes.length > 0) {
              sizeOptions = parsedSizes;
            }
          } catch (e) {
            console.error("Error parsing sizeOptions:", e);
          }
        }
        
        // Set the selected size
        if (sizeOptions.length > 0) {
          setSelectedSize(sizeOptions[0].id);
        } else {
          setSelectedSize(defaultSizeOptions[0].id);
        }
        
        // Handle type options
        let typeOptions = defaultTypeOptions;
        
        // Check if the product has parsed types array
        if ((product as any).types && Array.isArray((product as any).types) && (product as any).types.length > 0) {
          typeOptions = (product as any).types;
        } 
        // Check for unparsed typeOptions string (fallback)
        else if ((product as any).typeOptions) {
          try {
            const parsedTypes = JSON.parse((product as any).typeOptions);
            if (Array.isArray(parsedTypes) && parsedTypes.length > 0) {
              typeOptions = parsedTypes;
            }
          } catch (e) {
            console.error("Error parsing typeOptions:", e);
          }
        }
        
        // Set the selected type
        if (typeOptions.length > 0) {
          setSelectedType(typeOptions[0].id);
        } else {
          setSelectedType(defaultTypeOptions[0].id);
        }
        
        // Handle shape options
        let shapeOptions = defaultShapeOptions;
        
        // Check if the product has parsed shapes array
        if ((product as any).shapes && Array.isArray((product as any).shapes) && (product as any).shapes.length > 0) {
          shapeOptions = (product as any).shapes;
        } 
        // Check for unparsed shapeOptions string (fallback)
        else if ((product as any).shapeOptions) {
          try {
            const parsedShapes = JSON.parse((product as any).shapeOptions);
            if (Array.isArray(parsedShapes) && parsedShapes.length > 0) {
              shapeOptions = parsedShapes;
            }
          } catch (e) {
            console.error("Error parsing shapeOptions:", e);
          }
        }
        
        // Set the selected shape
        if (shapeOptions.length > 0) {
          setSelectedShape(shapeOptions[0].id);
        } else {
          setSelectedShape(defaultShapeOptions[0].id);
        }
        
        console.log("Selected size options:", sizeOptions);
        console.log("Selected type options:", typeOptions);
        console.log("Selected shape options:", shapeOptions);
      } catch (error) {
        console.error("Error setting up product options:", error);
        // Fallback to defaults
        setSelectedSize(defaultSizeOptions[0].id);
        setSelectedType(defaultTypeOptions[0].id);
        setSelectedShape(defaultShapeOptions[0].id);
      }
    }
  }, [product]);

  // Calculate price whenever product, size, type, shape or quantity changes
  useEffect(() => {
    if (product) {
      const newPrice = calculateTotalPrice();
      setCalculatedPrice(newPrice);
    }
  }, [product, selectedSize, selectedType, selectedShape, quantity]);

  console.log("Dynamic Product ID:", currentProductId);
  console.log("Found product:", product);
  console.log("Loading state:", isLoadingProduct);
  console.log("Loading all products state:", isLoadingAllProducts);

  // Only show product not found when:
  // 1. We're not in any loading state 
  // 2. We have a slug or ID to look for
  // 3. We've properly tried fetching the product and failed
  // 4. We've waited for a minimum amount of time to prevent quick flashes of the not found screen
  
  // Track whether we've had enough time to consider a product truly not found
  const [hasWaitedForLoading, setHasWaitedForLoading] = useState(false);
  
  // Wait a minimum time before showing "product not found"
  useEffect(() => {
    if (!product && !isLoadingProduct && !isLoadingAllProducts && (!!slug || !!productId) && allProducts.length > 0) {
      // Wait 500ms before showing the not found message to avoid flashing it during navigation
      const timer = setTimeout(() => {
        setHasWaitedForLoading(true);
      }, 500);
      
      return () => clearTimeout(timer);
    } else {
      setHasWaitedForLoading(false);
    }
  }, [product, isLoadingProduct, isLoadingAllProducts, slug, productId, allProducts]);
  
  const showNotFound = !isLoadingProduct && 
                      !isLoadingAllProducts && 
                      (!!slug || !!productId) && 
                      !product && 
                      allProducts.length > 0 &&
                      hasWaitedForLoading;
                      
  if (showNotFound) {
    console.log("Showing product not found message");
    return (
      <div className="pt-24 pb-16 px-4 text-center">
        <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
        <p className="mb-6">We couldn't find the requested product</p>
        <button
          onClick={() => {
            navigate("/menu");
            // Also use our improved reset scroll utility
            resetScroll();
          }}
          className="bg-[#6F4E37] text-white px-4 py-2 rounded"
        >
          Return to Menu
        </button>
      </div>
    );
  }

  const handleIncrease = () => {
    // Explicitly convert to a number using Number() to avoid bitwise conversion issues
    setQuantity(prev => {
      const currentValue = Number(prev);
      // Ensure we're working with valid numbers
      if (isNaN(currentValue)) {
        console.warn("Invalid quantity value detected:", prev);
        return 1; // Reset to 1 if we have an invalid value
      }
      const nextValue = currentValue + 1;
      return nextValue > 99 ? 99 : nextValue;
    });
  };

  const handleDecrease = () => {
    // Explicitly convert to a number using Number() to avoid bitwise conversion issues
    setQuantity(prev => {
      const currentValue = Number(prev);
      // Ensure we're working with valid numbers
      if (isNaN(currentValue)) {
        console.warn("Invalid quantity value detected:", prev);
        return 1; // Reset to 1 if we have an invalid value
      }
      const nextValue = currentValue - 1;
      return nextValue < 1 ? 1 : nextValue;
    });
  };

  const calculateTotalPrice = (includeQuantity = false) => {
    if (!product) return 0;
    
    // Convert price from cents to dollars if needed
    let basePrice = product.basePrice || 0;
    if (basePrice > 100) { // If price is large, assume it's in cents
      basePrice = basePrice / 100;
    }
    
    // Make sure price is formatted to 2 decimal places
    let totalPrice = parseFloat(basePrice.toFixed(2));
    
    // Add size option price if applicable
    try {
      // Get size options using our helper function
      const sizeOptions = getSizeOptions(product);
      const selectedSizeOption = sizeOptions.find((option) => option.id === selectedSize);
      if (selectedSizeOption && selectedSizeOption.price) {
        // Convert option price if needed (should be in dollars)
        let optionPrice = selectedSizeOption.price;
        if (optionPrice > 100) { // If price is large, assume it's in cents
          optionPrice = optionPrice / 100;
        }
        totalPrice += parseFloat(optionPrice.toFixed(2));
      }
      
      // Get type options using our helper function
      const typeOptions = getTypeOptions(product);
      
      // Get total pieces count for mixed ratio calculations
      // Get total pieces count for mixed ratio calculations - priority on quantity property
      let totalPieces = 0;
      if (selectedSizeOption) {
        // Always try to use the quantity property first
        if (selectedSizeOption.quantity) {
          totalPieces = parseInt(selectedSizeOption.quantity.toString(), 10);
        } else {
          // Fallback to extracting from label only if quantity is not available
          const piecesMatch = selectedSizeOption.label.match(/\((\d+)\s*pieces?\)/i);
          if (piecesMatch && piecesMatch[1]) {
            totalPieces = parseInt(piecesMatch[1], 10);
          }
        }
      }
      
      if (totalPieces === 0) totalPieces = 6; // Default if we can't determine
      
      if (isMixedType && mixedTypeRatio) {
        // For mixed type, calculate weighted price based on piece count
        const type1 = typeOptions.find(opt => opt.id === mixedTypeRatio.typeId1);
        const type2 = typeOptions.find(opt => opt.id === mixedTypeRatio.typeId2);
        
        if (type1 && type2) {
          // Calculate actual pieces of each type
          const type1Pieces = Math.round((mixedTypeRatio.ratio / 100) * totalPieces);
          const type2Pieces = totalPieces - type1Pieces;
          
          // Calculate price of each type
          let type1Price = type1.price || 0;
          if (type1Price >= 100 && type1Price < 500) {
            type1Price = type1Price / 100;
          }
          
          let type2Price = type2.price || 0;
          if (type2Price >= 100 && type2Price < 500) {
            type2Price = type2Price / 100;
          }
          
          // Calculate weighted price based on piece count
          const weightedTypePrice = ((type1Price * type1Pieces) + (type2Price * type2Pieces)) / totalPieces;
          totalPrice += parseFloat(weightedTypePrice.toFixed(2));
          
          // Add additional fee for mixed type if applicable
          if (product.mixedTypeFee) {
            const mixedTypeFee = product.mixedTypeFee / 100; // Convert from cents to dollars
            totalPrice += mixedTypeFee;
            console.log(`Added mixed type fee: $${mixedTypeFee.toFixed(2)}`);
          }
          
          // Update console to show a helpful message
          console.log(`Mixed type price: ${weightedTypePrice.toFixed(2)} (${type1Pieces} ${type1.id} at $${type1Price} + ${type2Pieces} ${type2.id} at $${type2Price})`);
        }
      } else {
        // Regular single type price
        const selectedTypeOption = typeOptions.find((option) => option.id === selectedType);
        if (selectedTypeOption && selectedTypeOption.price) {
          // Convert option price if needed (should be in dollars)
          let optionPrice = selectedTypeOption.price;
          // For type options, use a more reasonable threshold for cents vs dollars
          // Dark chocolate upgrade is likely just $1 (100 cents), not $100
          if (optionPrice >= 100 && optionPrice < 500) {
            optionPrice = optionPrice / 100;
          }
          totalPrice += parseFloat(optionPrice.toFixed(2));
        }
      }
      
      // Add shape option price if applicable
      const shapeOptions = getShapeOptions(product);
      const selectedShapeOption = shapeOptions.find((option) => option.id === selectedShape);
      if (selectedShapeOption && selectedShapeOption.price) {
        // Convert option price if needed (should be in dollars)
        let optionPrice = selectedShapeOption.price;
        if (optionPrice >= 100 && optionPrice < 500) {
          optionPrice = optionPrice / 100;
        }
        totalPrice += parseFloat(optionPrice.toFixed(2));
      }
    } catch (error) {
      console.error("Error processing product options:", error);
    }
    
    // Apply sale price if product is on sale
    if ((product as any).saleActive && (product as any).salePrice !== null && (product as any).salePrice !== undefined) {
      let salePrice = (product as any).salePrice;
      
      // Make sure salePrice is a number (could be string from API)
      if (typeof salePrice === 'string') {
        salePrice = parseFloat(salePrice);
      }
      
      // Only proceed if it's a valid number
      if (!isNaN(salePrice)) {
        if (salePrice > 100) { // If price is large, assume it's in cents
          salePrice = salePrice / 100;
        }
        totalPrice = parseFloat(salePrice.toFixed(2));
      }
    }
    
    // Multiply by quantity if requested
    if (includeQuantity) {
      totalPrice *= quantity;
    }
    
    // Ensure final price is properly formatted with 2 decimal places
    return parseFloat(totalPrice.toFixed(2));
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    // Get the unit price (without including quantity)
    const unitPrice = calculateTotalPrice(false);
    
    // Handle mixed type
    if (isMixedType && mixedTypeRatio) {
      const typeOptions = getTypeOptions(product);
      const type1 = typeOptions.find(opt => opt.id === mixedTypeRatio.typeId1);
      const type2 = typeOptions.find(opt => opt.id === mixedTypeRatio.typeId2);
      
      if (type1 && type2) {
        // Get piece count from selected size
        const sizeOptions = getSizeOptions(product);
        const selectedSizeOption = sizeOptions.find(option => option.id === selectedSize);
        let pieceCount = 0;
        
        if (selectedSizeOption) {
          // Always try to use the quantity property first
          if (selectedSizeOption.quantity) {
            pieceCount = parseInt(selectedSizeOption.quantity.toString(), 10);
          } else {
            // Fallback to extracting from label only if quantity is not available
            const piecesMatch = selectedSizeOption.label.match(/\((\d+)\s*pieces?\)/i);
            if (piecesMatch && piecesMatch[1]) {
              pieceCount = parseInt(piecesMatch[1], 10);
            }
          }
        }
        
        // Default to 6 if we can't determine
        pieceCount = pieceCount || 6;
        
        // Calculate actual pieces of each type
        const type1Pieces = Math.round((mixedTypeRatio.ratio / 100) * pieceCount);
        const type2Pieces = pieceCount - type1Pieces;
        
        const mixedTypeLabel = `${type1Pieces} ${type1.label} + ${type2Pieces} ${type2.label}`;
        
        // Use product name as ID (without spaces) for string-based IDs
        const productNameId = product.name.replace(/\s+/g, '');
        
        // Create simplified cart item with product name as ID
        const cartItem = {
          id: productNameId, // Using product name without spaces as string ID
          name: product.name,
          size: selectedSize === "standard" ? "none" : selectedSize, // Replace "standard" with "none"
          type: MIXED_TYPE_ID,
          shape: selectedShape === "standard" ? "none" : selectedShape, // Replace "standard" with "none"
          price: unitPrice,
          quantity,
          image: product.image || "",
          mixedType: {
            label: mixedTypeLabel,
            typeId1: mixedTypeRatio.typeId1,
            typeId2: mixedTypeRatio.typeId2,
            ratio: mixedTypeRatio.ratio,
            type1Pieces: type1Pieces,
            type2Pieces: type2Pieces,
            totalPieces: pieceCount
          }
        };
        
        addToCart(cartItem);
        
        // Get the shape label for toast display if available
        const shapeOptions = getShapeOptions(product);
        const selectedShapeOption = shapeOptions.find(opt => opt.id === selectedShape);
        const shapeLabel = selectedShapeOption ? selectedShapeOption.label : "";
        
        let displayText = `${quantity} × ${product.name} (${mixedTypeLabel})`;
        if (shapeLabel) {
          displayText += ` - ${shapeLabel}`;
        }
        
        toast({
          title: "Added to Cart",
          description: `${displayText} added to your cart`,
          duration: 1500, // Auto-dismiss after 1.5 seconds
        });
        
        return;
      }
    }
    
    // Regular non-mixed type product
    // Use product name as ID (without spaces) for string-based IDs
    const productNameId = product.name.replace(/\s+/g, '');
    
    // Create simplified cart item with product name as ID
    const cartItem = {
      id: productNameId, // Using product name without spaces as string ID
      name: product.name,
      size: selectedSize === "standard" ? "none" : selectedSize, // Replace "standard" with "none"
      type: selectedType,
      shape: selectedShape === "standard" ? "none" : selectedShape, // Replace "standard" with "none"
      price: unitPrice,
      quantity,
      image: product.image || "",
    };
    
    addToCart(cartItem);
    
    // Find the selected type and shape options to show in the toast
    const typeOptions = getTypeOptions(product);
    const selectedTypeOption = typeOptions.find(opt => opt.id === selectedType);
    const typeLabel = selectedTypeOption ? selectedTypeOption.label : selectedType;
    
    const shapeOptions = getShapeOptions(product);
    const selectedShapeOption = shapeOptions.find(opt => opt.id === selectedShape);
    const shapeLabel = selectedShapeOption ? selectedShapeOption.label : "";
    
    let displayText = `${quantity} × ${product.name} (${typeLabel})`;
    if (shapeLabel) {
      displayText += ` - ${shapeLabel}`;
    }
    
    toast({
      title: "Added to Cart",
      description: `${displayText} added to your cart`,
      duration: 1500, // Auto-dismiss after 1.5 seconds
    });
  };
  
  const handleBuyNow = () => {
    handleAddToCart();
    navigate("/checkout");
    
    // Ensure checkout page starts at the top using our utility
    resetScroll();
  };
  
  // Handle sharing product
  const handleShareProduct = () => {
    // Get the current URL
    const productUrl = window.location.href;
    
    // Try to use the Web Share API if available (better for mobile)
    if (navigator.share) {
      try {
        navigator.share({
          title: product?.name || 'Sweet Moment Chocolate',
          text: product?.description || 'Check out this delicious chocolate!',
          url: productUrl,
        })
        .then(() => {
          console.log('Product shared successfully');
          // No notifications needed
        })
        .catch((error) => {
          console.error('Error sharing product:', error);
          // Only fall back to clipboard if it's a permission error, not a cancellation
          if (error.name !== 'AbortError') {
            copyToClipboard(productUrl);
          }
        });
      } catch (error) {
        console.error('Error in Web Share API:', error);
        copyToClipboard(productUrl);
      }
    } else {
      // On desktop or browsers that don't support Web Share API
      copyToClipboard(productUrl);
    }
  };
  
  // Helper function to copy to clipboard with fallbacks for mobile
  const copyToClipboard = (text: string) => {
    // Try using the modern Clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text)
        .then(() => {
          console.log('Link copied to clipboard');
        })
        .catch((error) => {
          console.error('Modern clipboard API failed:', error);
          // Try fallback methods
          fallbackCopyToClipboard(text);
        });
    } else {
      // Use fallback for non-secure contexts (like HTTP on some browsers)
      fallbackCopyToClipboard(text);
    }
  };
  
  // Fallback clipboard copy methods
  const fallbackCopyToClipboard = (text: string) => {
    try {
      // Try creating a temporary text area element
      const textArea = document.createElement('textarea');
      textArea.value = text;
      
      // Make the textarea out of viewport
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      
      // Focus and select the text
      textArea.focus();
      textArea.select();
      
      // Execute the copy command
      const successful = document.execCommand('copy');
      
      // Remove the temporary element
      document.body.removeChild(textArea);
      
      if (successful) {
        console.log('Link copied using fallback method');
      } else {
        console.warn('Copy command was unsuccessful');
      }
    } catch (err) {
      console.error('Fallback clipboard method failed:', err);
    }
  };

  const handleBackClick = () => {
    // Navigate back to menu immediately
    navigate("/menu");
    
    // Use our utility for consistent scrolling behavior
    resetScroll();
  };

  // Show loading state for any loading condition or when navigating
  // This expanded condition ensures we show loading state during any transition
  if (isLoadingProduct || 
      isLoadingAllProducts || 
      (!!slug && !currentProductId && !showNotFound) ||
      // Also show loading state during navigation or when product changes
      (!!slug && (!product || (product && product.id.toString() !== currentProductId)))) {
    return (
      <div className="pt-24 pb-16 container mx-auto px-4">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div>
              <div className="h-10 w-3/4 bg-gray-200 rounded mb-4"></div>
              <div className="h-6 w-24 bg-gray-200 rounded mb-6"></div>
              <div className="h-24 w-full bg-gray-200 rounded mb-6"></div>
              <div className="h-10 w-32 bg-gray-200 rounded mb-4"></div>
              <div className="h-12 w-full bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="pt-28 pb-16 bg-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Image with Back Button */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="absolute -top-10 left-0 z-10">
              <Button
                onClick={handleBackClick}
                variant="ghost"
                className="flex items-center text-[#6F4E37] hover:text-[#4A2C2A] hover:bg-[#FAF5F0] transition-colors p-1 pl-0"
                size="sm"
              >
                <ArrowLeft size={16} className="mr-1" />
                Back to Menu
              </Button>
            </div>
            
            {/* Share Button - positioned in top-right */}
            <div className="absolute top-4 right-4 z-10">
              <div className="relative">
                <Button 
                  onClick={handleShareProduct}
                  variant="ghost"
                  size="icon"
                  className="bg-white bg-opacity-80 text-[#6F4E37] hover:text-[#4A2C2A] hover:bg-white rounded-full h-9 w-9 shadow-sm"
                >
                  <Share2 size={18} />
                </Button>
                {/* No tooltip needed */}
              </div>
            </div>
            <img 
              src={product?.image || "https://placehold.co/800x800/6F4E37/FFF5E1?text=Sweet+Moment+Chocolate"} 
              alt={product?.name || "Chocolate Product"} 
              className="w-full h-auto rounded-lg shadow-lg"
              onError={(e) => {
                console.error("Product image failed to load:", product?.image);
                const target = e.target as HTMLImageElement;
                target.src = "https://placehold.co/800x800/6F4E37/FFF5E1?text=Sweet+Moment+Chocolate";
              }}
            />
            {product?.badge && (
              <div className="absolute top-4 right-16 bg-[#D4AF37] text-[#2A1A18] px-3 py-1 rounded-full text-sm font-semibold">
                {product.badge === 'best-seller' ? 'Best Seller' :
                 product.badge === 'popular' ? 'Popular' :
                 product.badge === 'premium' ? 'Premium' : 'New'}
              </div>
            )}
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
              <div className="mb-3">
                <h2 className="text-3xl font-montserrat font-bold">{product?.name || "Chocolate Product"}</h2>
              </div>
              
              <div className="flex items-center mb-4">
                {(() => {
                  // Calculate the average rating from reviews if product rating is 0 or not available
                  const productRating = product?.rating || 0;
                  const reviewsRating = reviews.length > 0 
                    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
                    : 0;
                  
                  // Use reviews rating if product rating is 0 and we have reviews
                  const displayRating = (productRating === 0 && reviews.length > 0) ? reviewsRating : productRating;
                  
                  return [...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={`${i < Math.floor(displayRating) ? 'text-[#D4AF37] fill-[#D4AF37]' : 
                                  i < displayRating ? 'text-[#D4AF37] fill-[#D4AF37] opacity-50' : 
                                  'text-[#D4AF37] opacity-25'}`}
                    />
                  ));
                })()}
                <span className="ml-2 text-sm text-gray-600">
                  {(() => {
                    // Calculate the same rating for display
                    const productRating = product?.rating || 0;
                    const reviewsRating = reviews.length > 0 
                      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
                      : 0;
                    
                    // Use reviews rating if product rating is 0 and we have reviews
                    const displayRating = (productRating === 0 && reviews.length > 0) ? reviewsRating : productRating;
                    
                    return displayRating.toFixed(1);
                  })()}
                  {" "}({product?.reviewCount || reviews.length || 0} reviews)
                </span>
              </div>
            </motion.div>
            
            <motion.p 
              className="text-[#6F4E37] mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              {product?.description || "Delicious handcrafted chocolate made with premium ingredients."}
            </motion.p>
            
            {/* Size Options Section */}
            {getSizeOptions(product).length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.7 }}
              >
                <div className="mb-6">
                  <h3 className="font-medium mb-2 text-gray-900">Size Options</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {getSizeOptions(product).map((option: any) => {
                      // Use the full label as it appears in the admin menu
                      const sizeName = option.label;
                      
                      // Get the quantity for display in the second line
                      const quantity = option.quantity ? option.quantity : null;
                      
                      // Calculate the correct price
                      let optionPrice = product.basePrice / 100;
                      if (option.price > 0) {
                        optionPrice += option.price / 100;
                      }
                      
                      return (
                        <button
                          key={option.id}
                          onClick={() => setSelectedSize(option.id)}
                          className={`border ${selectedSize === option.id ? 'border-[#6F4E37] ring-1 ring-[#6F4E37]' : 'border-gray-300'} 
                            bg-white rounded-md transition-all p-3 flex flex-col items-center`}
                        >
                          <span className="font-medium text-sm">{sizeName}</span>
                          <span className="text-xs text-gray-500">
                            {/* Display quantity as pcs with price */}
                            {quantity ? 
                              `${quantity} pcs - $${optionPrice.toFixed(2)}` 
                              : `$${optionPrice.toFixed(2)}`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Shape Options Section - Only show if shapes are enabled for the product */}
            {getShapeOptions(product).length > 0 && product.shapesEnabled === true && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.75 }}
              >
                <div className="mb-6">
                  <h3 className="font-medium mb-2 text-gray-900">Shape Options</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {getShapeOptions(product).map((option: any) => (
                      <button
                        key={option.id}
                        onClick={() => setSelectedShape(option.id)}
                        className={`border ${selectedShape === option.id ? 'border-[#6F4E37] ring-1 ring-[#6F4E37]' : 'border-gray-300'} 
                          bg-white rounded-md transition-all p-3 flex flex-col items-center`}
                      >
                        <span className="font-medium text-sm">{option.label}</span>
                        {option.price > 0 && (
                          <span className="text-xs text-gray-500">
                            ${(option.price / 100).toFixed(2)}
                          </span>
                        )}
                        {!option.price && <span className="text-xs text-gray-500">${"0.00"}</span>}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Chocolate Type Section */}
            {getTypeOptions(product).length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.8 }}
              >
                <div className="mb-6">
                  <h3 className="font-medium mb-2 text-gray-900">Chocolate Type</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {getTypeOptions(product).map((option: any) => (
                      <button
                        key={option.id}
                        onClick={() => {
                          setSelectedType(option.id);
                          setIsMixedType(false);
                        }}
                        className={`border ${selectedType === option.id && !isMixedType ? 'border-[#6F4E37] ring-1 ring-[#6F4E37]' : 'border-gray-300'} 
                          bg-white rounded-md transition-all p-3 flex flex-col items-center`}
                      >
                        <span className="font-medium text-sm">{option.label}</span>
                        {option.price > 0 && (
                          <span className="text-xs text-gray-500">
                            ${(option.price / 100).toFixed(2)}
                          </span>
                        )}
                        {!option.price && <span className="text-xs text-gray-500">${"0.00"}</span>}
                      </button>
                    ))}
                    
                    {/* Mixed type option - only show when mixedTypeEnabled is true */}
                    {getTypeOptions(product).length >= 2 && product.mixedTypeEnabled && (
                      <button
                        key="mixed"
                        onClick={() => {
                          setIsMixedType(true);
                          setSelectedType(MIXED_TYPE_ID);
                          
                          // Initialize mixed type ratio with default values
                          const typeOptions = getTypeOptions(product);
                          
                          // Create a default 50/50 mixed type ratio
                          const mixedRatio: MixedTypeRatio = {
                            typeId1: typeOptions[0].id,
                            typeId2: typeOptions[1].id,
                            ratio: 50,
                            type1Pieces: 0,
                            type2Pieces: 0,
                            totalPieces: 0
                          };
                          
                          setMixedTypeRatio(mixedRatio);
                          
                          // If slider is disabled, also update the mixed type price directly
                          if (!product.enableMixedSlider) {
                            // Get the selected size option to determine quantity
                            const sizeOptions = getSizeOptions(product);
                            const selectedSizeOption = sizeOptions.find(option => option.id === selectedSize);
                            
                            // Extract piece count from the selected size - prioritize the quantity field
                            let pieceCount = 0;
                            if (selectedSizeOption) {
                              // Always try to get quantity directly from the option first
                              if (selectedSizeOption.quantity) {
                                pieceCount = parseInt(selectedSizeOption.quantity.toString(), 10);
                              } else {
                                // Fallback to extracting from label only if quantity is not available
                                const piecesMatch = selectedSizeOption.label.match(/\((\d+)\s*pieces?\)/i);
                                if (piecesMatch && piecesMatch[1]) {
                                  pieceCount = parseInt(piecesMatch[1], 10);
                                }
                              }
                            }
                            
                            if (pieceCount === 0) pieceCount = 6; // Default if can't determine
                            
                            // Calculate pieces for each type in a 50/50 split
                            const halfPieces = Math.floor(pieceCount / 2);
                            const type1Pieces = halfPieces;
                            const type2Pieces = pieceCount - halfPieces;
                            
                            // Get the type prices
                            let type1Price = typeOptions[0].price || 0;
                            let type2Price = typeOptions[1].price || 0;
                            
                            // Convert prices from cents to dollars
                            type1Price = type1Price / 100;
                            type2Price = type2Price / 100;
                            
                            // Calculate the weighted price
                            const weightedPrice = 
                              ((type1Price * type1Pieces) + (type2Price * type2Pieces)) / pieceCount;
                            
                            console.log(`Mixed type price: ${weightedPrice.toFixed(2)} (${type1Pieces} ${typeOptions[0].label} at $${type1Price} + ${type2Pieces} ${typeOptions[1].label} at $${type2Price})`);
                            
                            setMixedTypePrice(weightedPrice);
                            
                            // Update the mixed ratio with the piece counts
                            const updatedRatio: MixedTypeRatio = {
                              ...mixedRatio,
                              type1Pieces,
                              type2Pieces,
                              totalPieces: pieceCount
                            };
                            setMixedTypeRatio(updatedRatio);
                          }
                        }}
                        className={`border ${isMixedType ? 'border-[#6F4E37] ring-1 ring-[#6F4E37]' : 'border-gray-300'} 
                          bg-white rounded-md transition-all p-3 flex flex-col items-center`}
                      >
                        <span className="font-medium text-sm">Mixed</span>
                        <span className="text-xs text-gray-500">Half & Half</span>
                      </button>
                    )}
                  </div>
                  
                  {/* Mixed Type Ratio Selector - Only display if enableMixedSlider is true */}
                  {isMixedType && getTypeOptions(product).length >= 2 && product.enableMixedSlider && (
                    <div className="mt-4">
                      {/* Get the selected size option to determine quantity */}
                      {(() => {
                        const sizeOptions = getSizeOptions(product);
                        const selectedSizeOption = sizeOptions.find(option => option.id === selectedSize);
                        
                        // Extract piece count from the selected size - prioritize the quantity field
                        let pieceCount = 0;
                        if (selectedSizeOption) {
                          // Always try to get quantity directly from the option first
                          if (selectedSizeOption.quantity) {
                            pieceCount = parseInt(selectedSizeOption.quantity.toString(), 10);
                          } else {
                            // Fallback to extracting from label only if quantity is not available
                            const piecesMatch = selectedSizeOption.label.match(/\((\d+)\s*pieces?\)/i);
                            if (piecesMatch && piecesMatch[1]) {
                              pieceCount = parseInt(piecesMatch[1], 10);
                            }
                          }
                        }
                        
                        return (
                          <MixedTypeSelector 
                            typeOptions={getTypeOptions(product).slice(0, 2)}
                            onChange={(ratio) => setMixedTypeRatio(ratio)}
                            initialRatio={mixedTypeRatio?.ratio || 50}
                            totalPieces={pieceCount || 6} // Default to 6 if we can't determine
                            onPriceChange={(price) => {
                              setMixedTypePrice(price); 
                              // Force price recalculation
                              const newPrice = calculateTotalPrice();
                              setCalculatedPrice(newPrice);
                            }}
                            // Pass enableSlider flag to control if the slider should be visible
                            enableSlider={true} // Always true since we're conditionally rendering this component
                          />
                        );
                      })()}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
            
            {/* Quantity Section */}
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
                maxQuantity={99}
              />
            </motion.div>
            
            {/* Price Section */}
            <motion.div 
              className="mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 1.0 }}
            >
              <div className="flex flex-col">
                <div className="flex items-baseline">
                  <AnimatedPrice 
                    price={calculatedPrice * quantity} 
                    className="text-2xl"
                    isSale={(product as any)?.saleActive}
                  />
                  
                  {(product as any)?.saleActive && (
                    <span className="ml-2 text-sm line-through text-gray-500">
                      ${((product.basePrice / 100) * quantity).toFixed(2)}
                    </span>
                  )}
                </div>
                
                {(product as any)?.saleActive && (
                  <div className="flex items-center">
                    <span className="text-sm text-[#E63946] font-medium mr-1">Save</span>
                    <AnimatedPrice 
                      price={(((product.basePrice / 100) - calculatedPrice) * quantity)} 
                      className="text-sm"
                      isSale={true}
                    />
                  </div>
                )}
              </div>
            </motion.div>
            
            {/* Check if product is out of stock */}
            {product?.inventory !== undefined && product.inventory <= 0 ? (
              <motion.div
                className="mb-4 py-4 px-6 bg-gray-200 text-gray-800 rounded-md text-center font-semibold"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.1 }}
              >
                Currently Out of Stock
              </motion.div>
            ) : (
              /* Action Buttons - only shown when product is in stock */
              <motion.div 
                className="flex space-x-4 mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.1 }}
              >
                {/* Allow adding to cart even when orders are disabled */}
                <Button 
                  onClick={handleAddToCart}
                  disabled={false}
                  className="flex-1 py-6 border-2 border-[#4A2C2A] bg-white text-[#4A2C2A] hover:bg-[#F5EFEA] rounded-md transition-colors font-semibold"
                  title={areOrdersDisabled ? (disableOrdersReason || "Orders are disabled, but you can still add items to your cart") : ""}
                >
                  Add to Cart
                </Button>
                <Button 
                  onClick={handleBuyNow}
                  disabled={areOrdersDisabled}
                  className={`flex-1 py-6 ${areOrdersDisabled ? 'bg-gray-500 text-white' : 'bg-[#4A2C2A] hover:bg-[#3A1F1D] text-white'} rounded-md transition-colors font-semibold`}
                  title={disableOrdersReason || ""}
                >
                  {areOrdersDisabled ? (
                    <div className="flex items-center justify-center">
                      <AlertCircle className="mr-2 h-4 w-4 text-amber-400" />
                      <span>Orders Disabled</span>
                    </div>
                  ) : "Buy Now"}
                </Button>
              </motion.div>
            )}
            
            {/* No content here anymore - Share button moved */}
          </motion.div>
        </div>
        
        {/* Ingredients Information if available */}
        {product?.ingredients && (
          <motion.div 
            className="mt-8 p-4 bg-[#F7FAFC] border border-[#CBD5E0] rounded-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h3 className="font-bold text-[#2D3748] text-lg mb-2">Ingredients</h3>
            <p className="text-[#4A5568]">{product.ingredients}</p>
          </motion.div>
        )}
        
        {/* Allergy Information if available */}
        {product?.allergyInfo && (
          <motion.div 
            className="mt-4 mb-8 p-4 bg-[#FDF7E4] border border-[#F9D59B] rounded-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h3 className="font-bold text-[#B7791F] text-lg mb-2">Allergy Information</h3>
            <p className="text-[#744210]">{product.allergyInfo}</p>
          </motion.div>
        )}
        
        {/* Review System */}
        <ReviewSystem productId={currentProductId || ""} />
      </div>
    </section>
  );
}