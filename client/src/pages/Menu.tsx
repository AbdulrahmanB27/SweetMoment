import ProductCard from "../components/ProductCard";
import { motion } from "framer-motion";
import { 
  getProductReviews, 
  calculateReviewCount, 
  calculateAverageRating 
} from "../lib/reviewService";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import resetScroll from "../resetScroll";
import { generateProductSlug } from "../lib/utils";

// No hardcoded products - rely entirely on dynamic data
// from the database via the API

const Menu = () => {
  // Reset scroll position when the menu page loads
  useEffect(() => {
    resetScroll();
  }, []);

  // Fetch all products from API - use the same queryKey as in Header for consistency
  const { data: apiProducts = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['/api/products'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const products = await response.json();
        
        // Log all data from the API for debugging
        console.log("Menu - All API products (unfiltered):", products.map((p: any) => ({
          id: p.id,
          name: p.name,
          displayOrder: p.displayOrder
        })));
        
        return products;
      } catch (error) {
        console.error('Error fetching products:', error);
        return [];
      }
    },
    staleTime: 60000 // Refresh every minute
  });

  // Create a lookup for reviews by productId
  const reviewsMap: Record<string, any[]> = {};
  
  // For each product, fetch its reviews
  const productIds = apiProducts.map((p: any) => p.id.toString());
  
  // Create a single query for all product reviews
  const { data: productReviews = {} } = useQuery({
    queryKey: ['all-product-reviews', productIds],
    queryFn: async () => {
      // Create an object to store all results
      const results: Record<string, any[]> = {};
      
      // Only fetch if we have IDs
      if (productIds.length > 0) {
        // Create promises for all fetches
        const promises = productIds.map(async (id: string) => {
          try {
            const reviews = await getProductReviews(id);
            return { id, reviews };
          } catch (error) {
            console.error(`Error fetching reviews for product ${id}:`, error);
            return { id, reviews: [] };
          }
        });
        
        // Wait for all promises to resolve
        const reviewsData = await Promise.all(promises);
        
        // Build the result object
        reviewsData.forEach(item => {
          results[item.id as string] = item.reviews;
        });
      }
      
      return results;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: productIds.length > 0, // Only run if we have IDs
  });
  
  // Update the reviews map with all product reviews
  Object.entries(productReviews).forEach(([id, reviews]) => {
    reviewsMap[id] = reviews;
  });
  
  // For consistency, we'll rely on the API products as the source of truth for ordering
  // Define a Product type for our processed products
  type ProductType = {
    id: string;
    name: string;
    description: string;
    image: string;
    rating: number;
    reviewCount: number;
    basePrice: number;
    price: number;
    path: string;
    displayOrder: number;
    badge: "best-seller" | "premium" | "popular" | "new";
    formattedPrice?: string;
    saleActive?: boolean;
    originalPrice?: number;
    inventory?: number;
  };

  // Process all products from the database
  const rawProducts = apiProducts.map((p: any): ProductType => {
    const pid = p.id.toString();
    const reviews = reviewsMap[pid] || [];
    
    // For pricing, convert from cents to dollars if needed (DB stores in cents)
    let price = p.basePrice || 0;
    // Always assume prices are stored in cents and convert to dollars
    price = price / 100;
    
    // Choose badge based on product attributes
    let badgeType: "best-seller" | "premium" | "popular" | "new" = "new";
    if (p.saleActive) {
      badgeType = "popular";
    } else if (p.featured) {
      badgeType = "best-seller";
    } else if (price >= 10) {
      badgeType = "premium";
    }
    
    // Get product name or default
    const name = p.name || `Product ${pid}`;
    
    // Prepare sale price if applicable
    const hasSalePrice = p.saleActive && p.salePrice !== null && p.salePrice !== undefined && p.salePrice !== 0;
    // Make sure to convert salePrice from cents to dollars if needed
    const salePrice = hasSalePrice 
                      ? (p.salePrice / 100) 
                      : null;
    const finalPrice = hasSalePrice ? salePrice : price;
    
    // Return a complete product object
    return {
      id: pid,
      name: name,
      description: p.description || "A delicious chocolate creation.",
      image: p.image || "https://placehold.co/800x800/6F4E37/FFF5E1?text=Sweet+Moment+Chocolate",
      rating: calculateAverageRating(reviews),
      reviewCount: calculateReviewCount(reviews),
      basePrice: price,
      price: finalPrice, // Use sale price if active
      path: `/menu/${generateProductSlug(name)}`,
      displayOrder: p.displayOrder || 1000,
      badge: badgeType,
      saleActive: p.saleActive || false,
      originalPrice: p.saleActive ? price : undefined, // Only set original price if there's an active sale
      inventory: p.inventory // Pass the inventory data
    };
  });
    
  // Log the products we have fetched to help debug sorting issues
  console.log("Products before processing:", rawProducts.map((p: ProductType) => ({
    id: p.id, 
    name: p.name,
    displayOrder: p.displayOrder
  })));
  
  // Make sure all products have proper displayOrder values
  rawProducts.forEach((product: ProductType) => {
    const id = product.id.toString();
    
    // Make sure all products have a valid displayOrder
    // If no displayOrder is set, use the product ID as a fallback to ensure everything has a position
    if (typeof product.displayOrder !== 'number' || isNaN(product.displayOrder) || product.displayOrder === null) {
      // Use product ID as a numeric basis for ordering if no displayOrder is set
      // This ensures all products will appear in a consistent order
      const numericId = parseInt(id);
      product.displayOrder = !isNaN(numericId) ? numericId * 10 : 1000;
    }
    
    // Log the displayOrder for debugging
    console.log(`Product ${product.id} final displayOrder: ${product.displayOrder}`);
  });
  
  // Sort products by displayOrder to match admin panel ordering
  const sortedProducts = [...rawProducts].sort((a: ProductType, b: ProductType) => {
    // Get display order or default to 1000 if not set
    const orderA = typeof a.displayOrder === 'number' && !isNaN(a.displayOrder) ? a.displayOrder : 1000;
    const orderB = typeof b.displayOrder === 'number' && !isNaN(b.displayOrder) ? b.displayOrder : 1000;
    
    console.log(`Menu - Comparing products: ${a.name} (${orderA}) vs ${b.name} (${orderB})`);
    
    // Sort by display order first
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    
    // Fall back to name if display orders are the same
    return a.name.localeCompare(b.name);
  });
  
  // Log the final sorted product list
  console.log("Menu - Final sorted products:", sortedProducts.map((p: ProductType) => ({
    id: p.id,
    name: p.name,
    displayOrder: p.displayOrder
  })));
  
  // Final products ready for display
  const products = sortedProducts.map((product: ProductType) => {
    // Format price properly with exactly 2 decimal places for display
    const formattedPrice = typeof product.price === 'number' ? 
                          product.price.toFixed(2) : 
                          '0.00';
    
    // Include inventory status
    const inventory = product.inventory !== undefined ? product.inventory : 100;
    
    return {
      ...product,
      formattedPrice, // Add formatted price for display
      inventory // Add inventory status
    };
  });

  // Animation variants for the container and items
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    }
  };

  return (
    <section className="pt-28 pb-16">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-montserrat font-bold text-center mb-6">Our Chocolate Collections</h1>
          <p className="text-center text-[#6F4E37] max-w-2xl mx-auto mb-12">
            Explore our exquisite range of handcrafted luxury chocolates, made with the finest ingredients sourced from around the world.
          </p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {products.map((product: ProductType) => (
            <motion.div key={product.id} variants={itemVariants}>
              <ProductCard 
                id={product.id}
                name={product.name}
                description={product.description}
                image={product.image}
                rating={product.rating}
                reviewCount={product.reviewCount}
                price={product.price}
                path={`/menu/${generateProductSlug(product.name)}`}
                badge={product.badge}
                saleActive={product.saleActive}
                originalPrice={product.originalPrice}
                inventory={product.inventory}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Menu;
