import { useState, useEffect, useRef } from "react";
import { Truck, Lock, Award, Gift, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import ProductCard from "../components/ProductCard";
import TrustBadge from "../components/TrustBadge";
import Testimonial from "../components/Testimonial";
import TestimonialCarousel from "../components/TestimonialCarousel";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { DEFAULT_HERO_IMAGES, DEFAULT_PRODUCT_IMAGE } from "../pages/admin/default-images";
import "../styles/carousel.css";
import "../fallback-styles.css";
import { 
  getProductReviews, 
  calculateReviewCount, 
  calculateAverageRating,
  Review,
  homePageTestimonials
} from "../lib/reviewService";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { generateProductSlug } from "../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { useAwayMode } from "../context/AwayModeContext";

// Using imported testimonials from reviewService as default values

const Home = () => {
  // Add scroll to top behavior before navigation
  const handleClick = () => {
    window.scrollTo(0, 0);
  };
  
  // Check if the user is on a mobile device
  const isMobile = useIsMobile();
  
  // Get Away Mode settings
  const { settings: awayMode } = useAwayMode();
  
  // Fetch site customization settings without timestamp cache busting to prevent unnecessary image refreshes
  const { data: siteCustomization, isLoading: isLoadingSiteConfig, refetch: refetchSiteCustomization } = useQuery({
    queryKey: ['/api/site-customization'],
    queryFn: async () => {
      try {
        // Use no-cache headers but avoid timestamp to prevent image URL changes
        const response = await fetch(`/api/site-customization`, {
          headers: {
            "Cache-Control": "no-cache, no-store",
            "Pragma": "no-cache"
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch site customization data');
        }
        
        const data = await response.json();
        console.log("Home component loaded site customization data");
        return data;
      } catch (error) {
        console.error('Error fetching site customization:', error);
        return {};
      }
    },
    staleTime: 0, // No caching - always get fresh data
    refetchOnWindowFocus: true, // Refresh data when the window is focused
    refetchOnMount: true, // Always fetch when component mounts
    refetchInterval: 30000, // Poll every 30 seconds for updates
  });
  
  // Create a specific function to fetch fresh content with direct server update
  const refreshHomepageContent = async () => {
    try {
      console.log('Explicitly refreshing homepage content with server-side updates...');
      
      // Call our special endpoint that refreshes image URLs on the server side
      // Removed timestamp parameter to prevent unnecessary URL changes
      const response = await fetch(`/api/refresh-homepage-content`, {
        headers: {
          "Cache-Control": "no-cache, no-store",
          "Pragma": "no-cache"
        }
      });
      
      if (!response.ok) {
        console.warn(`Failed to refresh homepage content: ${response.status} ${response.statusText}`);
        // Still try the regular refetch as fallback
        refetchSiteCustomization();
        return null;
      }
      
      let refreshedData;
      try {
        // First check if there's actual content
        const text = await response.text();
        if (!text || text.trim() === '') {
          console.log('Empty response from refresh-homepage-content endpoint');
          refreshedData = { success: true };
        } else {
          // Try to parse the response as JSON
          refreshedData = JSON.parse(text);
          console.log('Received freshly updated homepage data');
        }
      } catch (jsonError) {
        console.error('Error parsing response text as JSON:', jsonError);
        // Still try to invalidate and refresh even if JSON parsing fails
        refreshedData = { success: true };
      }
      
      // Force invalidate cached queries to use the new data
      queryClient.invalidateQueries({ queryKey: ['/api/site-customization'] });
      
      // After invalidating, trigger a refetch to get the updated data
      refetchSiteCustomization();
      
      return refreshedData;
    } catch (error) {
      console.error('Error refreshing homepage content:', error);
      // Still try the regular refetch as fallback
      refetchSiteCustomization();
      return null;
    }
  };
  
  // Set up a useEffect to periodically refresh the data
  useEffect(() => {
    // First do a deep refresh that updates image URLs on the server
    refreshHomepageContent();
    
    // Set up a timer to refresh the data periodically
    const refreshTimer = setInterval(() => {
      // Use the enhanced refresh every time
      refreshHomepageContent();
    }, 10000); // Check for updates every 10 seconds
    
    // Clean up the timer when component unmounts
    return () => {
      clearInterval(refreshTimer);
    };
  }, [refetchSiteCustomization]);
  
  // Extract site customization data with defaults for other properties,
  // but always respect image arrays as they are
  let heroSection = siteCustomization?.heroSection ? 
    JSON.parse(siteCustomization.heroSection) : 
    {
      title: "Luxury Dubai Chocolates",
      subtitle: "Handcrafted with the finest ingredients",
      buttonText: "Shop Now",
      buttonLink: "/menu",
      imageUrl: "", // Initialize with empty strings to respect admin changes
      images: [], // Initialize as empty array to respect admin changes
      autoplayInterval: 5000
    };
    
  // Log the parsed heroSection for debugging
  console.log("HOME PAGE - Raw heroSection from database:", siteCustomization?.heroSection);
  console.log("HOME PAGE - Parsed heroSection:", heroSection);
    
  // Ensure heroSection has the necessary properties
  if (!heroSection.images || !Array.isArray(heroSection.images)) {
    console.log("HOME PAGE - Initializing empty images array");
    heroSection.images = []; // Simply initialize as empty array, don't auto-populate
  } else {
    console.log("HOME PAGE - Using existing images array:", heroSection.images);
    
    // CRITICAL FIX: ALWAYS respect the images array as-is
    // NEVER auto-add default images, as this would override admin deletions
    
    // No limit on carousel images - allow all images from the admin panel
    console.log(`HOME PAGE - Using all ${heroSection.images.length} images in carousel`);
  }
  
  // Fix old image path references to use the new static path format
  // But only if there are images to process
  if (heroSection.images && heroSection.images.length > 0) {
    // Filter out images with old paths instead of replacing them with defaults
    heroSection.images = heroSection.images
      .map((img: string) => {
        // Skip old image paths completely instead of replacing them
        if (img.startsWith('/images/')) {
          console.log(`Skipping old format image path: ${img}`);
          return null;
        }
        // Keep valid paths
        return img;
      })
      .filter((img: string | null): img is string => img !== null); // Remove nulls
    
    // If all images were invalid, ensure we have an empty array
    if (heroSection.images.length === 0) {
      console.log("All images had invalid paths, using empty array");
    }
  }
  
  if (!heroSection.autoplayInterval) {
    heroSection.autoplayInterval = 5000;
  }
    
  // Simple state for the carousel - start with second image (index 1) if available
  const [currentIndex, setCurrentIndex] = useState(() => {
    // If we have at least two images and the preferred image is second in the array, start with index 1
    return (heroSection.images && heroSection.images.length >= 2 && 
            heroSection.images[1] === '/uploads/1742773966114-127560992.jpeg') ? 1 : 0;
  });
  
  // State to track if images have been loaded
  const [imagesLoaded, setImagesLoaded] = useState(false);
  
  // Touch and mouse event state for swipe detection
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isSwiping, setIsSwiping] = useState<boolean>(false);
  const [mouseDown, setMouseDown] = useState<boolean>(false);
  const [mouseStartX, setMouseStartX] = useState<number | null>(null);
  
  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;
  
  // Handle swipe navigation
  const handleSwipeNext = () => {
    if (heroSection.images && heroSection.images.length > 1) {
      setCurrentIndex(prevIndex => (prevIndex + 1) % heroSection.images.length);
    }
  };
  
  const handleSwipePrev = () => {
    if (heroSection.images && heroSection.images.length > 1) {
      setCurrentIndex(prevIndex => 
        prevIndex === 0 ? heroSection.images.length - 1 : prevIndex - 1
      );
    }
  };
  
  // Touch event handlers
  const onTouchStart = (e: React.TouchEvent) => {
    // Reset touchEnd to avoid false detection
    setTouchEnd(null);
    // Set touchStart to the first touch point's X coordinate
    setTouchStart(e.targetTouches[0].clientX);
    // Indicate swiping has started
    setIsSwiping(true);
  };
  
  const onTouchMove = (e: React.TouchEvent) => {
    // Update touchEnd to the current touch point's X coordinate
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const onTouchEnd = () => {
    // If touchStart or touchEnd is missing, don't trigger any swipe
    if (!touchStart || !touchEnd) return;
    
    // Calculate swipe distance
    const distance = touchStart - touchEnd;
    const isSwipeSignificant = Math.abs(distance) >= minSwipeDistance;
    
    // If swipe distance is significant, navigate to next/previous slide
    if (isSwipeSignificant) {
      if (distance > 0) {
        // Swiped left, show next image
        handleSwipeNext();
      } else {
        // Swiped right, show previous image
        handleSwipePrev();
      }
    }
    
    // Reset touch states after processing
    setTouchEnd(null);
    setTouchStart(null);
    setIsSwiping(false);
  };
  
  // Mouse event handlers
  const onMouseDown = (e: React.MouseEvent) => {
    setMouseDown(true);
    setMouseStartX(e.clientX);
    setIsSwiping(true);
  };
  
  const onMouseMove = (e: React.MouseEvent) => {
    if (!mouseDown || mouseStartX === null) return;
    
    // Calculate the distance moved
    const distance = mouseStartX - e.clientX;
    
    // Apply visual feedback during dragging for a smoother experience
    const imgElement = e.currentTarget.querySelector('img');
    if (imgElement) {
      // Apply a subtle transform to follow the cursor for visual feedback
      // Use a small fraction of the movement to make it feel responsive but not jump too much
      imgElement.style.transform = `translateX(${-distance * 0.2}px)`;
    }
  };
  
  const onMouseUp = (e: React.MouseEvent) => {
    if (!mouseDown || mouseStartX === null) return;
    
    // Calculate the distance moved
    const distance = mouseStartX - e.clientX;
    const isSwipeSignificant = Math.abs(distance) >= minSwipeDistance;
    
    // Reset any transform applied during dragging
    const imgElement = e.currentTarget.querySelector('img');
    if (imgElement) {
      imgElement.style.transform = '';
    }
    
    // If swipe distance is significant, navigate to next/previous slide
    if (isSwipeSignificant) {
      if (distance > 0) {
        // Dragged left, show next image
        handleSwipeNext();
      } else {
        // Dragged right, show previous image
        handleSwipePrev();
      }
    }
    
    // Reset mouse states
    setMouseDown(false);
    setMouseStartX(null);
    setIsSwiping(false);
  };
  
  // Handle mouse leave to prevent stuck states
  const onMouseLeave = (e: React.MouseEvent) => {
    if (mouseDown) {
      // Reset any transform styles when mouse leaves the container
      const imgElement = e.currentTarget.querySelector('img');
      if (imgElement) {
        imgElement.style.transform = '';
      }
      
      // Reset all mouse states
      setMouseDown(false);
      setMouseStartX(null);
      setIsSwiping(false);
    }
  };
  
  // Preload all carousel images to ensure they're in browser cache
  useEffect(() => {
    const preloadImages = async () => {
      // If there are no images, don't try to preload anything
      if (!heroSection?.images || !Array.isArray(heroSection.images) || heroSection.images.length === 0) {
        console.log("No carousel images to preload");
        return;
      }
      
      // Track image load success to decide if we need fallbacks
      let failedExternalUrls = false;
      
      // Create an array to hold all preload promises
      const preloadPromises = heroSection.images.map((imgSrc: string) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            console.log(`Successfully preloaded image: ${imgSrc}`);
            resolve({ success: true, src: imgSrc });
          };
          img.onerror = () => {
            console.error(`Failed to preload image: ${imgSrc}`);
            // Track if this was an external URL that failed
            if (imgSrc.startsWith('http')) {
              failedExternalUrls = true;
            }
            resolve({ success: false, src: imgSrc });
          };
          img.src = imgSrc;
        });
      });
      
      try {
        // Wait for all images to preload (or fail)
        const results = await Promise.all(preloadPromises);
        console.log("All carousel images have been processed");
        
        // Set images as loaded once they're processed
        setImagesLoaded(true);
        
        // If we had failed external URLs, update heroSection to use only local images
        if (failedExternalUrls) {
          console.log("Some external URLs failed to load. Replacing with local fallbacks.");
          
          // Filter out to keep only successful images and local paths
          const workingImages = results
            .filter(result => result.success || !result.src.startsWith('http'))
            .map(result => result.src);
          
          // If no images worked, respect the empty state
          if (workingImages.length === 0) {
            console.log("No working images found. Respecting empty image state.");
            // Don't add any fallback images, keep the array empty
            heroSection.images = [];
          }
        }
      } catch (error) {
        console.error("Error during image preloading:", error);
      }
    };
    
    preloadImages();
  }, [heroSection?.images]);

  // Setup automatic image rotation
  useEffect(() => {
    // Make sure we have valid images to rotate through
    const images = heroSection?.images || [];
    
    // Extra validation for images array to avoid runtime errors
    if (!Array.isArray(images) || images.length <= 1) {
      console.log("Carousel rotation not needed - only one image or invalid array:", images);
      return;
    }
    
    // Set up the rotation interval
    const interval = heroSection.autoplayInterval || 5000;
    console.log(`Setting up carousel rotation with ${images.length} images every ${interval}ms`);
    
    const rotationInterval = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % images.length);
    }, interval);
    
    // Cleanup on unmount
    return () => {
      clearInterval(rotationInterval);
    };
  }, [heroSection]);
  
  // Ensure images are properly handled in dependency array
  useEffect(() => {
    // This empty effect ensures the component re-renders when heroSection.images changes
    // All image processing is now handled when heroSection is first parsed
  }, [heroSection.images]);
    
  const reviewsSection = siteCustomization?.reviewsSection ?
    JSON.parse(siteCustomization.reviewsSection) :
    {
      enabled: true,
      title: "What Our Customers Say",
      subtitle: "Discover why chocolate lovers choose Sweet Moment",
      displayCount: 3,
      testimonials: homePageTestimonials
    };
    
  const featuredSection = siteCustomization?.featuredSection ?
    JSON.parse(siteCustomization.featuredSection) :
    {
      enabled: true,
      title: "Our Luxury Collections",
      subtitle: "Our handpicked selection of luxurious chocolates",
      productIds: []
    };
    
  // Extract signature collection section with defaults
  // Define interface for signature section to include timestamp
  interface SignatureSection {
    enabled: boolean;
    title: string;
    subtitle: string;
    tagline: string;
    buttonText: string;
    buttonLink: string;
    imageUrl: string;
    _timestamp?: number;
  }
  
  // Default signature section configuration - use exact values from database
  const defaultSignatureSection: SignatureSection = {
    enabled: true,
    title: "Our Signature Collection",
    subtitle: "Handcrafted with the finest ingredients",
    tagline: "Limited Edition - Exclusively from Dubai",
    buttonText: "Shop Now",
    buttonLink: "/signature-collection",
    imageUrl: "/uploads/1744075563796-815996067.jpeg", // Match what's actually in the database
    _timestamp: Date.now() // Add timestamp for forcing re-renders
  };
  
  // States for signature section loading and error handling
  const [isLoadingSignatureSection, setIsLoadingSignatureSection] = useState(true);
  const [signatureSectionError, setSignatureSectionError] = useState(false);
  
  // Extract signature collection section with robust error handling using useState for reactivity
  const [signatureSection, setSignatureSection] = useState<SignatureSection>(defaultSignatureSection);
  
  // Use useEffect to process signature section when siteCustomization changes
  useEffect(() => {
    // Start loading state
    setIsLoadingSignatureSection(true);
    setSignatureSectionError(false);
    
    try {
      console.log("Raw signatureSection from DB:", siteCustomization?.signatureSection);
      
      // Check if the data is in the corrupted format where it's a character-by-character object
      const rawData = siteCustomization?.signatureSection || "{}";
      
      if (rawData.startsWith('{"0":"{') || rawData.startsWith('{"0":"\\{')) {
        // This is a corrupted format, log it and use defaults
        console.error("Corrupted signature section data detected, using defaults");
        setSignatureSection(defaultSignatureSection);
        // End loading state
        setIsLoadingSignatureSection(false);
        
        // Try to fetch a fresh version by refreshing the page data without timestamp
        fetch('/api/refresh-signature-section', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            "Cache-Control": "no-cache, no-store",
            "Pragma": "no-cache"
          },
          body: JSON.stringify({ action: "refresh" })
        }).then(response => {
          console.log("Auto-repair attempted for signature section");
        }).catch(error => {
          console.error("Failed auto-repair for signature section:", error);
          setSignatureSectionError(true);
        });
      } else {
        // Normal JSON data - parse it
        try {
          const parsed = JSON.parse(rawData);
          
          // If it's a valid object, use it; otherwise use the default
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            // Use parsed data directly without any merging with defaults
            // This ensures we're using exactly what's in the database
            console.log("Using existing signature section data");
            
            // Force component re-render by creating a new object reference
            // This ensures React detects the change even if values appear the same
            const freshSignatureData = {...parsed, _timestamp: Date.now()};
            setSignatureSection(freshSignatureData);
          } else {
            console.warn("Existing signature section data was invalid, using defaults");
            setSignatureSection({...defaultSignatureSection, _timestamp: Date.now()});
          }
        } catch (parseError) {
          console.error("Failed to parse signature section data:", parseError);
          setSignatureSection(defaultSignatureSection);
          setIsLoadingSignatureSection(false);
          setSignatureSectionError(true);
        }
      }
      
      // Note: "Final signatureSection" will be logged after state update in next render
      // End loading state for normal JSON data
      setIsLoadingSignatureSection(false);
    } catch (error) {
      console.error("Error processing signature section:", error);
      setSignatureSection(defaultSignatureSection);
      setIsLoadingSignatureSection(false);
      setSignatureSectionError(true);
    }
  }, [siteCustomization?.signatureSection]); // Re-run when site customization changes
  
  // Log the final values after state update
  useEffect(() => {
    console.log("Final signatureSection:", signatureSection);
    console.log("Signature section image URL:", signatureSection.imageUrl);
  }, [signatureSection]);
  
  // Function to forcibly update the signature section without relying on server-side refresh
  // This ensures immediate visual feedback when signature section is updated from admin panel
  useEffect(() => {
    // Add event listener for custom subtitle update events
    const handleSubtitleUpdate = (event: CustomEvent) => {
      const newSubtitle = event.detail?.subtitle;
      const timestamp = Date.now();
      const source = event.detail?.source || 'unknown';
      const forceRefresh = event.detail?.forceRefresh || false;
      
      console.log(`Received subtitle update event with subtitle: "${newSubtitle}" at ${timestamp} from source: ${source}`);
      
      if (newSubtitle && typeof newSubtitle === 'string') {
        // Force a complete re-render by creating a new object reference with timestamp to trigger AnimatePresence
        const updatedSection = {
          ...signatureSection,
          subtitle: newSubtitle,
          _timestamp: timestamp,
          _forceRefresh: Math.random(), // Add random value to force React to detect change
          _source: source  // Track source for debugging
        };
        
        // Set state with the new object - this will trigger AnimatePresence
        setSignatureSection(updatedSection);
        
        console.log("Subtitle updated via custom event:", newSubtitle, "with timestamp:", timestamp);
        
        // Apply enhanced luxury visual indicators for the update
        
        // Stage 1: Apply elegant golden glow effect to the entire signature section
        const signatureEl = document.querySelector('.signature-section');
        if (signatureEl) {
          // Add the enhanced glow animation
          signatureEl.classList.add('flash-update');
          
          // Remove the animation class after it completes to allow for future animations
          setTimeout(() => {
            signatureEl.classList.remove('flash-update');
          }, 1400); // Match duration with our updated CSS animation
        }
        
        // Stage 2: Add sophisticated underline reveal animation to the subtitle
        const subtitleEl = document.querySelector('.signature-subtitle');
        if (subtitleEl) {
          // Add the updating class that triggers the golden underline animation
          subtitleEl.classList.add('updating');
          
          // Schedule removal of the class after animation completes
          setTimeout(() => {
            subtitleEl.classList.remove('updating');
          }, 800);
        }
        
        // 3. For critical updates, force a complete refresh from the server
        if (forceRefresh) {
          console.log("Force refresh requested - refreshing content from server");
          refreshHomepageContent();
        }
      }
    };
    
    // Register the event listener
    window.addEventListener('signature-subtitle-updated' as any, handleSubtitleUpdate as EventListener);
    
    // Cleanup
    return () => {
      window.removeEventListener('signature-subtitle-updated' as any, handleSubtitleUpdate as EventListener);
    };
  }, []);
  
  // Fetch all products from API
  const { data: apiProducts = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['/api/products'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        return await response.json();
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
  
  // Use custom testimonials from site settings if available, otherwise fallback to default
  const displayTestimonials = reviewsSection.testimonials || homePageTestimonials;
  
  // Define product interfaces
  interface ApiProduct {
    id: string | number;
    name: string;
    description?: string;
    image?: string;
    basePrice: number;
    salePrice?: number;
    saleActive?: boolean;
    featured?: boolean;
    displayOrder?: number;
    badge?: "best-seller" | "premium" | "popular" | "new";
  }
  
  interface ProcessedProduct {
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
    saleActive: boolean;
    originalPrice?: number;
  }

  // Process products from the API
  const processedProducts = apiProducts.map((p: ApiProduct): ProcessedProduct => {
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
                      ? (p.salePrice ? p.salePrice / 100 : 0) 
                      : null;
    const finalPrice = hasSalePrice && salePrice ? salePrice : price;
    
    // Return a complete product object
    return {
      id: pid,
      name: name,
      description: p.description || "A delicious chocolate creation.",
      image: p.image || DEFAULT_PRODUCT_IMAGE,
      rating: calculateAverageRating(reviews),
      reviewCount: calculateReviewCount(reviews),
      basePrice: price,
      price: finalPrice, // Use sale price if active
      path: `/menu/${generateProductSlug(name)}`,
      displayOrder: p.displayOrder || 1000,
      badge: p.badge || badgeType,
      saleActive: p.saleActive || false,
      originalPrice: p.saleActive ? price : undefined // Only set original price if there's an active sale
    };
  });
  
  // Filter featured products if specified in site customization
  let displayedProducts = processedProducts;
  if (featuredSection.productIds && featuredSection.productIds.length > 0) {
    displayedProducts = processedProducts.filter((product: ProcessedProduct) => 
      featuredSection.productIds.includes(product.id)
    );
    
    // If no products match the filter, fall back to first 4 products
    if (displayedProducts.length === 0) {
      displayedProducts = processedProducts.slice(0, 4);
    }
  } else {
    // If no product IDs specified, always display first 4 products by default
    displayedProducts = processedProducts.slice(0, 4);
  }
  
  // Get display count from settings or use default values
  const mobileDisplayCount = featuredSection.displayCount?.mobile || 4;
  const desktopDisplayCount = featuredSection.displayCount?.desktop || 3;
  
  // Ensure we have enough products to display (at least 2 for mobile) 
  const minProductCount = Math.max(2, mobileDisplayCount);
  if (displayedProducts.length < minProductCount && processedProducts.length >= minProductCount) {
    displayedProducts = processedProducts.slice(0, minProductCount);
  }
  
  return (
    <>
      {/* Hero Section */}
      <section className="w-full relative hero-section">
        {/* Away Mode Custom Hero Banner */}
        {awayMode.enabled && awayMode.customHeroBanner ? (
          <div className="w-full">
            {/* Mobile away mode hero banner */}
            <div className="block md:hidden w-full h-[85vh]">
              <div className="relative w-full h-full">
                {/* Background image */}
                <div className="absolute inset-0">
                  {awayMode.heroBannerImage ? (
                    <img 
                      src={awayMode.heroBannerImage} 
                      alt="Away Mode Banner"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error(`Failed to load away mode hero image`);
                        e.currentTarget.style.backgroundColor = '#6b3f2e';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-amber-800"></div>
                  )}
                  {/* Darker overlay for text visibility */}
                  <div className="absolute inset-0 bg-black opacity-50"></div>
                </div>
                
                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-20">
                  <h1 className="text-3xl font-bold text-white mb-4">{awayMode.heroBannerTitle}</h1>
                  <p className="text-xl text-white mb-6">{awayMode.heroBannerSubtitle}</p>
                  {awayMode.showReturnDate && awayMode.returnDate && (
                    <p className="text-lg text-white font-medium mt-2">
                      We'll be back on {new Date(awayMode.returnDate).toLocaleDateString()}
                    </p>
                  )}
                  <Link to="/menu">
                    <Button 
                      onClick={handleClick}
                      className="mt-4 text-white bg-amber-600 hover:bg-amber-700 border-0"
                      disabled={awayMode.disableOrders}
                    >
                      Browse Our Menu
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Desktop away mode hero banner */}
            <div className="hidden md:block w-full h-[90vh]">
              <div className="relative w-full h-full">
                {/* Background image */}
                <div className="absolute inset-0">
                  {awayMode.heroBannerImage ? (
                    <img 
                      src={awayMode.heroBannerImage} 
                      alt="Away Mode Banner"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error(`Failed to load away mode hero image`);
                        e.currentTarget.style.backgroundColor = '#6b3f2e';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-amber-800"></div>
                  )}
                  {/* Darker overlay for text visibility */}
                  <div className="absolute inset-0 bg-black opacity-50"></div>
                </div>
                
                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-20">
                  <h1 className="text-5xl font-bold text-white mb-6">{awayMode.heroBannerTitle}</h1>
                  <p className="text-2xl text-white mb-8 max-w-3xl">{awayMode.heroBannerSubtitle}</p>
                  {awayMode.showReturnDate && awayMode.returnDate && (
                    <p className="text-xl text-white font-medium mt-4">
                      We'll be back on {new Date(awayMode.returnDate).toLocaleDateString()}
                    </p>
                  )}
                  <Link to="/menu">
                    <Button 
                      onClick={handleClick}
                      className="mt-6 text-white bg-amber-600 hover:bg-amber-700 border-0 text-lg px-8 py-6"
                      disabled={awayMode.disableOrders}
                      style={{ opacity: 1 }}
                    >
                      Browse Our Menu
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : heroSection.images && Array.isArray(heroSection.images) && heroSection.images.length > 0 ? (
          <div className="w-full">
            {/* Mobile hero section */}
            <div className="block md:hidden w-full h-[85vh]">
              <div 
                className={`relative w-full h-full swipe-container ${isSwiping ? 'swiping' : ''}`}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseLeave}
                style={{ cursor: mouseDown ? "grabbing" : "grab" }}
              >
                {/* Image Layer */}
                {heroSection.images.map((image: string, idx: number) => (
                  <div
                    key={`hero-image-mobile-${idx}`} 
                    className={`absolute inset-0 transition-opacity duration-1000 ${
                      idx === currentIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <img
                      // Remove timestamp query parameter
                      src={image.split('?')[0]}
                      alt={`Hero image ${idx + 1}`}
                      className="w-full h-full object-cover"
                      style={{
                        objectPosition: heroSection.cropSettings?.[image]?.['mobile']?.objectPosition || 'center center'
                      }}
                      onError={(e) => {
                        console.error(`Failed to load hero image: ${image}`);
                        e.currentTarget.style.backgroundColor = '#6b3f2e';
                      }}
                    />
                  </div>
                ))}
                
                {/* Darker overlay to ensure content visibility */}
                <div className="absolute inset-0 bg-black opacity-40" style={{ zIndex: 10 }}></div>
                
                {/* Content Layer - Hidden until images are loaded */}
                <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 20 }}>
                  <div className="container mx-auto px-4 text-center">
                    <div className="max-w-3xl mx-auto">
                      <div className={imagesLoaded ? "visible" : "invisible"}>
                        <motion.h1 
                          className="text-3xl sm:text-4xl font-montserrat font-bold text-white mb-5 leading-tight mt-8 pt-4 max-w-xs mx-auto" 
                          style={{ textShadow: 'none' }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                          {heroSection.title}
                        </motion.h1>
                        <motion.p 
                          className="text-xs sm:text-sm md:text-base text-[#f0e6c9] mb-8 max-w-xs mx-auto" 
                          style={{ textShadow: 'none' }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                        >
                          {heroSection.subtitle}
                        </motion.p>
                      </div>
                      <motion.div 
                        className="flex justify-center"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                      >
                        <Link href={heroSection.buttonLink || "/menu"} className="inline-block relative z-10" onClick={handleClick}>
                          <Button className="bg-[#D4AF37] hover:bg-[#B8860B] text-[#2A1A18] font-semibold px-8 py-3 text-lg transform transition hover:-translate-y-1 hover:shadow-lg" style={{ boxShadow: 'none', textShadow: 'none' }}>
                            {heroSection.buttonText || "Shop Now"}
                          </Button>
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                </div>
                
                {/* Carousel indicators */}
                {heroSection.images.length > 1 && (
                  <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-3" style={{ zIndex: 30 }}>
                    {/* Dot indicators */}
                    <div className="flex justify-center gap-2">
                      {heroSection.images.map((_: string, index: number) => (
                        <button
                          key={`mobile-indicator-${index}`}
                          className={`w-3 h-3 rounded-full transition-all ${
                            index === currentIndex 
                              ? 'bg-white scale-110' 
                              : 'bg-white/50 hover:bg-white/70'
                          }`}
                          onClick={() => setCurrentIndex(index)}
                          aria-label={`Go to slide ${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Desktop hero section */}
            <div className="hidden md:block w-full h-[75vh]">
              <div 
                className={`relative w-full h-full swipe-container ${isSwiping ? 'swiping' : ''}`}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseLeave}
                style={{ cursor: mouseDown ? "grabbing" : "grab" }}
              >
                {/* Image Layer */}
                {heroSection.images.map((image: string, idx: number) => (
                  <div
                    key={`hero-image-${idx}`} 
                    className={`absolute inset-0 transition-opacity duration-1000 ${
                      idx === currentIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <img
                      // Remove timestamp query parameter for desktop view
                      src={image.split('?')[0]}
                      alt={`Hero image ${idx + 1}`}
                      className="w-full h-full object-cover"
                      style={{
                        objectPosition: heroSection.cropSettings?.[image]?.['desktop']?.objectPosition || 'center center'
                      }}
                      onError={(e) => {
                        console.error(`Failed to load hero image: ${image}`);
                        e.currentTarget.style.backgroundColor = '#6b3f2e';
                      }}
                    />
                  </div>
                ))}
                
                {/* Darker overlay to ensure content visibility */}
                <div className="absolute inset-0 bg-black opacity-30 md:opacity-30" style={{ zIndex: 10 }}></div>
                
                {/* Content Layer - Hidden until images are loaded */}
                <div className="absolute inset-0 flex items-center justify-center md:justify-start" style={{ zIndex: 20 }}>
                  <div className="container mx-auto px-4 md:px-6 lg:px-8 text-center md:text-left">
                    <div className="max-w-3xl mx-auto md:mx-0 md:ml-8 lg:ml-16">
                      <div className={imagesLoaded ? "visible" : "invisible"}>
                        <motion.h1 
                          className="text-4xl md:text-5xl lg:text-6xl font-montserrat font-bold text-white mb-5 leading-tight mt-8 pt-4 max-w-xl" 
                          style={{ textShadow: 'none' }}
                          initial={{ opacity: 0, x: -30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                          {heroSection.title}
                        </motion.h1>
                        <motion.p 
                          className="text-xs sm:text-sm md:text-base lg:text-lg text-[#f0e6c9] mb-8 max-w-xl" 
                          style={{ textShadow: 'none' }}
                          initial={{ opacity: 0, x: -30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                        >
                          {heroSection.subtitle}
                        </motion.p>
                      </div>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                      >
                        <Link href={heroSection.buttonLink || "/menu"} className="inline-block relative z-10" onClick={handleClick}>
                          <Button className="bg-[#D4AF37] hover:bg-[#B8860B] text-[#2A1A18] font-semibold px-8 py-3 text-lg transform transition hover:-translate-y-1 hover:shadow-lg" style={{ boxShadow: 'none', textShadow: 'none' }}>
                            {heroSection.buttonText || "Shop Now"}
                          </Button>
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                </div>
                
                {/* Carousel indicators */}
                {heroSection.images.length > 1 && (
                  <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-3" style={{ zIndex: 30 }}>
                    {/* Dot indicators */}
                    <div className="flex justify-center gap-2">
                      {heroSection.images.map((_: string, index: number) => (
                        <button
                          key={`desktop-indicator-${index}`}
                          className={`w-3 h-3 rounded-full transition-all ${
                            index === currentIndex 
                              ? 'bg-white scale-110' 
                              : 'bg-white/50 hover:bg-white/70'
                          }`}
                          onClick={() => setCurrentIndex(index)}
                          aria-label={`Go to slide ${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Hero-style fallback with animated skeleton loading
          <div className="w-full">
            {/* Mobile fallback hero skeleton */}
            <div className="block md:hidden w-full h-[85vh]">
              <div className="relative w-full h-full bg-gradient-to-r from-amber-900 to-amber-800">
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="container mx-auto px-4 text-center">
                    <div className="max-w-3xl mx-auto">
                      {/* Animated title skeleton */}
                      <div className="w-4/5 h-10 bg-gradient-to-r from-stone-300 to-stone-200 rounded-md mx-auto mb-5 mt-8 pt-4 animate-pulse"></div>
                      
                      {/* Animated subtitle skeleton */}
                      <div className="w-3/5 h-6 bg-gradient-to-r from-stone-300 to-stone-200 rounded-md mx-auto mb-8 animate-pulse"></div>
                      
                      {/* Animated button skeleton */}
                      <div className="flex justify-center">
                        <div className="w-32 h-12 bg-gradient-to-r from-amber-600 to-amber-500 rounded-md animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Desktop fallback hero skeleton */}
            <div className="hidden md:block w-full h-[75vh]">
              <div className="relative w-full h-full bg-gradient-to-r from-amber-900 to-amber-800">
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="absolute inset-0 flex items-center justify-center md:justify-start">
                  <div className="container mx-auto px-4 md:px-6 lg:px-8 text-center md:text-left">
                    <div className="max-w-3xl mx-auto md:mx-0 md:ml-8 lg:ml-16">
                      {/* Animated title skeleton */}
                      <div className="w-4/5 h-12 bg-gradient-to-r from-stone-300 to-stone-200 rounded-md mb-5 mt-8 pt-4 animate-pulse"></div>
                      
                      {/* Animated subtitle skeleton */}
                      <div className="w-3/5 h-7 bg-gradient-to-r from-stone-300 to-stone-200 rounded-md mb-8 animate-pulse"></div>
                      
                      {/* Animated button skeleton */}
                      <div className="w-36 h-12 bg-gradient-to-r from-amber-600 to-amber-500 rounded-md animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Benefits section with enhanced animations */}
      <section 
        className="bg-[#F5EEE8] py-4 border-t border-b border-[#E8D7C9]"
        ref={(el) => {
          // Set up intersection observer for benefits section
          if (el && !el.dataset.observerAttached) {
            el.dataset.observerAttached = 'true';
            
            // Create intersection observer for benefits section animations
            const observer = new IntersectionObserver((entries) => {
              entries.forEach(entry => {
                if (entry.isIntersecting) {
                  console.log("Benefits section is now visible - triggering animations");
                  
                  // Animate all benefit cards with staggered delay
                  const benefitCards = el.querySelectorAll('.benefit-card');
                  benefitCards.forEach((card, index) => {
                    setTimeout(() => {
                      card.classList.add('animate-visible');
                    }, 100 + (index * 120)); // Stagger each benefit
                  });
                  
                  // Once animations are triggered, disconnect observer
                  observer.disconnect();
                }
              });
            }, { 
              threshold: 0.2,  // Trigger when 20% of section is visible since it's smaller
              rootMargin: "0px 0px -20px 0px" // Trigger slightly before element comes into view
            });
            
            observer.observe(el);
          }
        }}
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="benefit-card animate-element text-center flex flex-col items-center delay-0">
              <motion.div
                whileHover={{ rotate: 15, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Truck className="h-8 w-8 text-[#5A3A30] mb-2" />
              </motion.div>
              <h3 className="font-semibold text-[#5A3A30]">Fast Shipping</h3>
            </div>
            
            <div className="benefit-card animate-element text-center flex flex-col items-center delay-1">
              <motion.div
                whileHover={{ scale: 1.15 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Lock className="h-8 w-8 text-[#5A3A30] mb-2" />
              </motion.div>
              <h3 className="font-semibold text-[#5A3A30]">Secure Payment</h3>
            </div>
            
            <div className="benefit-card animate-element text-center flex flex-col items-center delay-2">
              <motion.div
                whileHover={{ y: -5, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Award className="h-8 w-8 text-[#5A3A30] mb-2" />
              </motion.div>
              <h3 className="font-semibold text-[#5A3A30]">Premium Quality</h3>
            </div>
            
            <div className="benefit-card animate-element text-center flex flex-col items-center delay-3">
              <motion.div
                whileHover={{ rotate: -10, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Gift className="h-8 w-8 text-[#5A3A30] mb-2" />
              </motion.div>
              <h3 className="font-semibold text-[#5A3A30]">Gift Ready</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Featured products section with enhanced animations */}
      {featuredSection.enabled !== false && displayedProducts.length > 0 && (
        <section 
          className="pt-28 pb-16 md:pb-24 bg-white"
          ref={(el) => {
            // Set up intersection observer for featured products section
            if (el && !el.dataset.observerAttached) {
              el.dataset.observerAttached = 'true';
              
              // Create intersection observer for featured product animations
              const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                  if (entry.isIntersecting) {
                    console.log("Featured products section is now visible - triggering animations");
                    
                    // Animate section title and subtitle first
                    const title = el.querySelector('.section-title');
                    const subtitle = el.querySelector('.section-subtitle');
                    
                    if (title) title.classList.add('animate-visible');
                    if (subtitle) setTimeout(() => subtitle.classList.add('animate-visible'), 100);
                    
                    // Then animate all product cards with staggered delay
                    const productCards = el.querySelectorAll('.product-card');
                    productCards.forEach((card, index) => {
                      setTimeout(() => {
                        card.classList.add('animate-visible');
                      }, 200 + (index * 120)); // Stagger each product
                    });
                    
                    // Finally animate the button
                    const button = el.querySelector('.section-button');
                    if (button) {
                      setTimeout(() => {
                        button.classList.add('animate-visible');
                      }, 600); // After all products are animated
                    }
                    
                    // Once animations are triggered, disconnect observer
                    observer.disconnect();
                  }
                });
              }, { 
                threshold: 0.1,  // Trigger when 10% of section is visible
                rootMargin: "0px 0px -50px 0px" // Trigger slightly before element comes into view
              });
              
              observer.observe(el);
            }
          }}
        >          
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-montserrat font-bold text-[#5A3A30] mb-4 section-title animate-element">
                {featuredSection.title || "Our Luxury Collections"}
              </h2>
              <p className="text-lg text-[#7D4E2C] max-w-3xl mx-auto section-subtitle animate-element">
                {featuredSection.subtitle || "Our handpicked selection of luxurious chocolates"}
              </p>
            </div>
            
            {/* Use 2×2 grid on mobile (4 products) and 3-column grid on desktop (3 products) */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
              {displayedProducts.slice(0, isMobile ? mobileDisplayCount : desktopDisplayCount).map((product: ProcessedProduct, index: number) => (
                <div key={product.id} className={`product-card animate-element delay-${index}`}>
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    description={product.description}
                    image={product.image}
                    rating={product.rating}
                    reviewCount={product.reviewCount}
                    price={product.price}
                    path={product.path}
                    badge={product.badge}
                    saleActive={product.saleActive}
                    originalPrice={product.originalPrice}
                  />
                </div>
              ))}
            </div>
            
            <div className="text-center mt-16">
              <Link href="/menu" className="inline-block" onClick={handleClick}>
                <Button className="section-button animate-element delay-8 bg-[#E5C976] hover:bg-[#D4AF37] text-[#442D29] font-semibold px-8 py-3 rounded-md transform transition hover:-translate-y-1 hover:shadow-lg">
                  View All Collections
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Signature Collection section - with loading state and error fallback */}
      {isLoadingSignatureSection ? (
        <section className="py-12 bg-[#5A3A30] text-white overflow-hidden signature-section">
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2 flex items-center justify-center">
                <div className="w-full max-w-md mx-auto md:mx-0 animate-pulse">
                  <div className="bg-gradient-to-br from-[#5A3A30] to-[#7D4E2C] rounded-lg shadow-lg w-full" style={{ minHeight: '300px' }}></div>
                </div>
              </div>
              <div className="md:w-1/2 space-y-5 px-4 md:px-0">
                <div className="h-10 w-3/4 bg-[#7D4E2C] animate-pulse rounded"></div>
                <div className="h-6 w-full bg-[#7D4E2C] animate-pulse rounded"></div>
                <div className="h-4 w-1/2 bg-[#E5C976] animate-pulse rounded"></div>
                <div className="h-10 w-32 bg-[#E5C976] animate-pulse rounded-md mt-4"></div>
              </div>
            </div>
          </div>
        </section>
      ) : signatureSectionError ? (
        // Error fallback - only show in development
        process.env.NODE_ENV === 'development' && (
          <section className="py-12 bg-[#5A3A30] text-white overflow-hidden signature-section">
            <div className="container mx-auto px-4 relative z-10">
              <div className="flex flex-col items-center gap-8">
                <p className="text-xl font-semibold text-center">Unable to load signature collection section</p>
                <button 
                  className="bg-[#E5C976] hover:bg-[#D4AF37] text-[#442D29] font-semibold px-6 py-2 rounded-md hover:shadow-lg"
                  onClick={() => {
                    console.log("Explicitly refreshing homepage content with server-side updates...");
                    fetch('/api/refresh-homepage-content')
                      .then(res => res.json())
                      .then(() => {
                        console.log("Received freshly updated homepage data");
                        window.location.reload();
                      });
                  }}
                >
                  Refresh Content
                </button>
              </div>
            </div>
          </section>
        )
      ) : signatureSection && signatureSection.enabled !== false && (
        <section className="py-12 bg-[#5A3A30] text-white overflow-hidden signature-section">
          <div className="container mx-auto px-4 relative z-10">
            <div 
              className="flex flex-col md:flex-row items-center gap-8"
            >
              {/* Left side image with Framer Motion animations */}
              <div className="md:w-1/2 flex items-center justify-center">
                <div className="w-full max-w-md mx-auto md:mx-0">
                  {signatureSection.imageUrl && signatureSection.imageUrl.trim() !== '' ? (
                    // Image is available
                    <motion.div 
                      className="relative signature-img-container signature-motion-trigger"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1.0] }}
                      whileHover={{ 
                        scale: 1.02, 
                        boxShadow: "0 20px 30px rgba(0, 0, 0, 0.15)",
                        transition: { duration: 0.3 }
                      }}
                    >
                      {/* Golden shimmer overlay */}
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-tr from-[#E5C976]/10 to-transparent rounded-lg z-10 pointer-events-none"
                        animate={{ 
                          background: [
                            "linear-gradient(to top right, rgba(229, 201, 118, 0.1), transparent)",
                            "linear-gradient(to top right, rgba(229, 201, 118, 0.2), transparent)",
                            "linear-gradient(to top right, rgba(229, 201, 118, 0.1), transparent)"
                          ]
                        }}
                        transition={{ duration: 3, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
                      />
                      
                      <motion.img 
                        src={signatureSection.imageUrl.split('?')[0]}
                        alt="Signature Collection" 
                        className="w-full h-auto rounded-lg shadow-lg object-cover relative z-0" 
                        style={{ minHeight: '300px', display: 'block' }}
                        whileHover={{ filter: "brightness(1.05)" }}
                        onLoad={(e) => {
                          const imgContainer = document.querySelector('.signature-img-container');
                          if (imgContainer) {
                            imgContainer.classList.remove('img-error');
                          }
                        }}
                        onError={(e) => {
                          console.error('Failed to load image:', signatureSection.imageUrl);
                          
                          const imgContainer = document.querySelector('.signature-img-container');
                          if (imgContainer) {
                            imgContainer.classList.add('img-error');
                          }
                          
                          // Handle external URLs
                          const isExternalUrl = !signatureSection.imageUrl.startsWith('/');
                          if (isExternalUrl) {
                            e.currentTarget.style.display = 'none';
                            return;
                          }
                          
                          // Refresh content
                          fetch(`/api/refresh-homepage-content`, {
                            headers: { "Cache-Control": "no-cache, no-store", "Pragma": "no-cache" }
                          })
                            .then(response => {
                              if (response.ok) {
                                refetchSiteCustomization();
                              }
                            })
                            .catch(err => {
                              console.error('Failed to refresh content:', err);
                            });
                          
                          // Try clean URL
                          const cleanUrl = signatureSection.imageUrl.split('?')[0];
                          if (e.currentTarget.src !== cleanUrl) {
                            e.currentTarget.src = cleanUrl;
                          }
                        }}
                      />
                      
                      {/* Fallback for failed image load */}
                      <div className="fallback-image absolute inset-0 bg-gradient-to-br from-[#5A3A30] to-[#7D4E2C] rounded-lg shadow-lg flex items-center justify-center hidden">
                        <p className="text-white text-center p-8">
                          Signature Collection<br/>
                          <span className="text-sm opacity-75">
                            Handcrafted with the finest ingredients
                          </span>
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    // Placeholder for missing image
                    <motion.div 
                      className="bg-gradient-to-br from-[#5A3A30] to-[#7D4E2C] rounded-lg shadow-lg w-full"
                      style={{ minHeight: '300px' }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.7 }}
                      whileHover={{ scale: 1.02, boxShadow: "0 20px 30px rgba(0, 0, 0, 0.15)" }}
                    >
                      <motion.div 
                        className="flex items-center justify-center h-full"
                        animate={{ 
                          background: [
                            "linear-gradient(135deg, rgba(90, 58, 48, 0), rgba(125, 78, 44, 0.1))",
                            "linear-gradient(135deg, rgba(90, 58, 48, 0.1), rgba(125, 78, 44, 0))",
                            "linear-gradient(135deg, rgba(90, 58, 48, 0), rgba(125, 78, 44, 0.1))"
                          ]
                        }}
                        transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
                      >
                        <motion.p 
                          className="text-white text-center p-8"
                          initial={{ opacity: 0.8 }}
                          animate={{ opacity: [0.8, 1, 0.8] }}
                          transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
                        >
                          Signature Collection Image<br/>
                          <span className="text-sm opacity-75">
                            (Upload an image in admin panel to display here)
                          </span>
                        </motion.p>
                      </motion.div>
                    </motion.div>
                  )}
                </div>
              </div>
              
              {/* Right side content with Framer Motion animations */}
              <div className="md:w-1/2 space-y-5 px-4 md:px-0">
                <motion.h2 
                  className="text-3xl md:text-4xl font-montserrat font-bold signature-title signature-motion-trigger"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ 
                    duration: 0.7, 
                    ease: [0.25, 0.1, 0.25, 1.0],
                    delay: 0.1
                  }}
                >
                  {signatureSection.title}
                </motion.h2>
                
                {/* Subtitle with animation but fixed display */}
                <div className="subtitle-container relative mb-6">
                  <motion.p 
                    className="text-base md:text-lg text-white max-w-2xl" 
                    style={{lineHeight: "1.6"}}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ 
                      opacity: 1, 
                      y: 0
                    }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{
                      type: "spring",
                      stiffness: 100,
                      damping: 15,
                      delay: 0.2
                    }}
                  >
                    {signatureSection.subtitle || "Handcrafted with the finest ingredients"}
                  </motion.p>
                </div>
                
                <motion.p 
                  className="text-[#E5C976] font-medium text-sm md:text-base signature-tagline signature-motion-trigger"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ 
                    opacity: 1, 
                    y: 0,
                    textShadow: ["0px 0px 0px rgba(229,201,118,0)", "0px 0px 8px rgba(229,201,118,0.5)", "0px 0px 0px rgba(229,201,118,0)"],
                    color: ["#E5C976", "#D4AF37", "#E5C976"],
                    transition: {
                      opacity: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1.0], delay: 0.3 },
                      y: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1.0], delay: 0.3 },
                      textShadow: { repeat: Infinity, duration: 2.5, ease: "easeInOut", delay: 1 },
                      color: { repeat: Infinity, duration: 2.5, ease: "easeInOut", delay: 1 }
                    }
                  }}
                  viewport={{ once: true, margin: "-50px" }}
                >
                  {signatureSection.tagline}
                </motion.p>
                
                <motion.div 
                  className="pt-2 signature-button signature-motion-trigger"
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  whileInView={{ 
                    opacity: 1, 
                    y: 0, 
                    scale: 1,
                    transition: { 
                      duration: 0.6,
                      ease: [0.25, 0.1, 0.25, 1.0],
                      delay: 0.4
                    }
                  }}
                  viewport={{ once: true, margin: "-50px" }}
                  animate={{
                    y: [0, -5, 0],
                    transition: {
                      y: { repeat: Infinity, duration: 3, ease: "easeInOut", delay: 1.5 }
                    }
                  }}
                >
                  <Link href={signatureSection.buttonLink} className="inline-block" onClick={handleClick}>
                    <Button className="bg-[#E5C976] hover:bg-[#D4AF37] text-[#442D29] font-semibold px-8 py-2.5 rounded-md transition-all duration-300 hover:shadow-lg hover:scale-105">
                      {signatureSection.buttonText}
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials section with animations */}
      {reviewsSection.enabled !== false && displayTestimonials.length > 0 && (
        <section 
          className="pt-28 pb-16 md:pb-24 bg-[#F5EEE8]"
          ref={(el) => {
            // Set up intersection observer for testimonials section
            if (el && !el.dataset.observerAttached) {
              el.dataset.observerAttached = 'true';
              
              // Create intersection observer for testimonial animations
              const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                  if (entry.isIntersecting) {
                    console.log("Testimonials section is now visible - triggering animations");
                    
                    // Animate section title and subtitle first
                    const title = el.querySelector('.section-title');
                    const subtitle = el.querySelector('.section-subtitle');
                    
                    if (title) title.classList.add('animate-visible');
                    if (subtitle) setTimeout(() => subtitle.classList.add('animate-visible'), 100);
                    
                    // Then animate all testimonials with staggered delay
                    const testimonials = el.querySelectorAll('.testimonial-card');
                    testimonials.forEach((card, index) => {
                      setTimeout(() => {
                        card.classList.add('animate-visible');
                      }, 200 + (index * 100)); // Stagger each testimonial
                    });
                    
                    // Once animations are triggered, disconnect observer
                    observer.disconnect();
                  }
                });
              }, { 
                threshold: 0.1,  // Trigger when 10% of section is visible
                rootMargin: "0px 0px -50px 0px" // Trigger slightly before element comes into view
              });
              
              observer.observe(el);
            }
          }}
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-montserrat font-bold text-[#5A3A30] mb-4 section-title animate-element">
                {reviewsSection.title || "What Our Customers Say"}
              </h2>
              <p className="text-lg text-[#7D4E2C] max-w-3xl mx-auto section-subtitle animate-element">
                {reviewsSection.subtitle || "Discover why chocolate lovers choose Sweet Moment"}
              </p>
            </div>
            
            {/* Mobile: Show testimonial carousel, Desktop: Show grid */}
            {isMobile ? (
              <div className="testimonial-card animate-element">
                <TestimonialCarousel testimonials={displayTestimonials} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                {displayTestimonials.slice(0, 4).map((testimonial: any, index: number) => (
                  <div 
                    key={`testimonial-${index}`} 
                    className="testimonial-card animate-element"
                  >
                    <Testimonial
                      name={testimonial.name}
                      author={testimonial.author}
                      location={testimonial.location}
                      rating={testimonial.rating}
                      text={testimonial.text}
                      date={testimonial.date}
                      avatar={testimonial.avatar}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}


    </>
  );
};

export default Home;