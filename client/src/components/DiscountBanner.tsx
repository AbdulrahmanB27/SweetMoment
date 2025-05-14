import React, { useState, useEffect, useRef } from 'react';
import { useDiscount, Discount } from '../context/DiscountContext';
import { X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { parseProductDescription } from '../utils/descriptionParser';
import CountdownTimer from './CountdownTimer';

// Banner height as a constant for reuse
export const BANNER_HEIGHT = "2.5rem";
export const BANNER_HEIGHT_PX = 40; // Same as 2.5rem in pixels

const DiscountBanner = () => {
  const bannerRef = useRef<HTMLDivElement>(null);
  const { activeDiscount, removeDiscount, discountBannerVisible, setDiscountBannerVisible } = useDiscount();
  const [currentDiscountIndex, setCurrentDiscountIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  
  // Fetch all active discounts (one-time fetch without constant polling)
  const { data: activeDiscounts = [] } = useQuery<Discount[]>({
    queryKey: ['/api/discounts'],
    queryFn: async () => {
      const response = await fetch('/api/discounts');
      if (!response.ok) return [];
      return response.json();
    },
    // Don't automatically refetch - discounts will be loaded on page load
    // and refreshed only when the user navigates or reloads the page
    refetchInterval: false
  });
  
  // Determine if we have any discounts to show
  const hasActiveOffers = activeDiscount !== null || (Array.isArray(activeDiscounts) && activeDiscounts.length > 0);
  
  // Directly inject styles as a string to avoid any browser-specific CSS issues
  useEffect(() => {
    // Create a unique ID for our style element to easily reference it
    const styleId = 'discount-banner-styles';
    
    // Remove any existing style element with our ID
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }
    
    // Create a new style element
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      /* Force all elements to respect our layout */
      html, body, #root {
        margin: 0 !important;
        padding: 0 !important;
        overflow-x: hidden !important;
      }
      
      /* Banner animation is now handled with CSS transitions */
      
      /* Extremely direct selector to ensure our banner is positioned correctly */
      #discount-banner-root {
        display: block !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        width: 100% !important;
        height: ${BANNER_HEIGHT_PX}px !important;
        z-index: 5 !important; /* Low z-index to ensure it's below toast notifications but above most content */
        transform: translateZ(0) !important; /* Ensure it doesn't create a new stacking context that's too high */
        background-color: #5c3426 !important;
        color: white !important;
        line-height: 1 !important;
        border: 0 !important;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
        margin: 0 !important;
        padding: 0 !important;
        isolation: isolate !important; /* Create a stacking context to prevent overlap issues */
        will-change: transform !important; /* Optimize for animation */
      }
      
      /* Banner slide in animation - start offscreen at the top */
      #discount-banner-root.initial {
        transform: translateY(-100%) !important;
      }
      
      /* Banner visible state with animation */
      #discount-banner-root.showing {
        transform: translateY(0) !important;
        transition: transform 600ms cubic-bezier(0.16, 1, 0.3, 1) !important;
        z-index: 5 !important;
      }
      
      /* Banner slide out animation */
      #discount-banner-root.hiding {
        transform: translateY(-100%) !important;
        transition: transform 600ms cubic-bezier(0.16, 1, 0.3, 1) !important;
        z-index: 5 !important;
      }
      
      /* The header animation is now handled by CSS transitions */
      
      /* Always make header transitions smooth */
      .header-adjust {
        transition: transform 600ms cubic-bezier(0.16, 1, 0.3, 1) !important;
        will-change: transform !important;
      }
      
      /* Apply slide down transform to header when banner appears */
      body.has-discount-banner .header-adjust {
        transform: translateY(${BANNER_HEIGHT_PX}px) !important;
      }
      
      /* Apply slide up transform to header when banner disappears */
      body.removing-discount-banner .header-adjust {
        transform: translateY(0) !important;
      }
      
      /* Adjust content padding to make space for the banner */
      body.has-discount-banner #root > main {
        padding-top: ${BANNER_HEIGHT_PX}px !important;
        transition: padding-top 600ms cubic-bezier(0.16, 1, 0.3, 1) !important;
      }
      
      /* Reset content padding when banner is removed */
      body.removing-discount-banner #root > main {
        padding-top: 0 !important;
        transition: padding-top 600ms cubic-bezier(0.16, 1, 0.3, 1) !important;
      }
      
      /* Container class inside the banner */
      .discount-banner-content {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        width: 100% !important;
        height: 100% !important;
        padding: 0 1rem !important;
        margin: 0 !important;
      }

      /* Text fade animations */
      .discount-text {
        transition: opacity 400ms ease-in-out !important;
        opacity: 1 !important;
      }
      
      .discount-text.fading-out {
        opacity: 0 !important;
      }
      
      .discount-text.fading-in {
        opacity: 1 !important;
      }
    `;
    
    // Add the style to the document head
    document.head.appendChild(style);
    
    // Clean up function
    return () => {
      const styleToRemove = document.getElementById(styleId);
      if (styleToRemove) {
        styleToRemove.remove();
      }
      
      // Also remove any body classes we added
      document.body.classList.remove('has-discount-banner');
    };
  }, []); // Empty dependency array means this runs once on mount
  
  // State for the banner animation
  const [bannerAnimState, setBannerAnimState] = useState<'initial' | 'showing' | 'hiding' | 'hidden'>('initial');
  
  // Handle showing/hiding the banner with more explicit logging
  useEffect(() => {
    // Determine if we should show the banner
    const shouldShow = hasActiveOffers && discountBannerVisible;
    
    if (shouldShow) {
      // First render the banner in its initial state (offscreen)
      if (bannerAnimState === 'hidden' || bannerAnimState === 'hiding') {
        console.log('Preparing banner to appear');
        setBannerAnimState('initial');
        setShowBanner(true);
        
        // Then trigger the slide-in animation after a brief delay
        setTimeout(() => {
          console.log('Starting banner slide-in animation');
          setBannerAnimState('showing');
          
          // Add class to body to adjust layout
          document.body.classList.add('has-discount-banner');
          document.body.classList.remove('removing-discount-banner');
          
          // The animation will handle the header and content movement
        }, 50); // Small delay to ensure DOM is ready
      } else if (bannerAnimState === 'initial') {
        // If already in initial state, just trigger the animation
        console.log('Triggering banner slide-in from initial state');
        setBannerAnimState('showing');
        document.body.classList.add('has-discount-banner');
        document.body.classList.remove('removing-discount-banner');
      }
    } else {
      // Start the disappear animation if banner is currently visible
      if (bannerAnimState === 'showing') {
        console.log('Starting banner slide-out animation from showing state');
        
        // First, ensure we're in hiding state to trigger the animation
        setBannerAnimState('hiding');
        
        // Add the removing class to trigger the header slide up animation
        document.body.classList.add('removing-discount-banner');
        document.body.classList.remove('has-discount-banner');
        
        // After animation finishes, remove from DOM
        setTimeout(() => {
          console.log('Banner animation complete, removing from DOM');
          setBannerAnimState('hidden');
          setShowBanner(false);
          
          // Remove all animation-related classes
          document.body.classList.remove('removing-discount-banner');
        }, 700); // Timeout to match our 600ms animation duration + buffer
      } else if (bannerAnimState === 'initial') {
        console.log('Starting banner slide-out animation from initial state');
        
        // Set hiding state to trigger animation
        setBannerAnimState('hiding');
        
        // Add the removing class to trigger the header slide up animation
        document.body.classList.add('removing-discount-banner');
        document.body.classList.remove('has-discount-banner');
        
        // After animation finishes, remove from DOM
        setTimeout(() => {
          console.log('Banner animation complete, removing from DOM');
          setBannerAnimState('hidden');
          setShowBanner(false);
          
          // Remove all animation-related classes
          document.body.classList.remove('removing-discount-banner');
        }, 700); // Timeout to match our 600ms animation duration + buffer
      }
    }
  }, [hasActiveOffers, discountBannerVisible, activeDiscounts, activeDiscount, bannerAnimState]);
  
  const formatDiscount = (discount: Discount) => {
    if (discount.discountType === 'percentage') {
      return `${discount.value}% off`;
    } else if (discount.discountType === 'fixed') {
      return `$${discount.value.toFixed(2)} off`;
    }
    return "";
  };
  
  const getTextForDiscount = (discount: Discount | null) => {
    // No discount means no text should be shown
    if (!discount) return "";
    
    // Make sure we have a valid discount with required properties
    if (!discount.code) return "";
    
    if (discount.description) {
      return discount.description;
    } else {
      return `${formatDiscount(discount)} your order with code: ${discount.code}`;
    }
  };

  // Set display text when component mounts or discounts change
  useEffect(() => {
    if (activeDiscount) {
      setDisplayText(getTextForDiscount(activeDiscount));
    } else if (Array.isArray(activeDiscounts) && activeDiscounts.length > 0) {
      setDisplayText(getTextForDiscount(activeDiscounts[currentDiscountIndex]));
    } else {
      setDisplayText("");
    }
  }, [activeDiscount, activeDiscounts, currentDiscountIndex]);
  
  // Fade animation for text
  const [fadeState, setFadeState] = useState<'visible' | 'fading-out' | 'fading-in'>('visible');
  const [nextMessageText, setNextMessageText] = useState('');

  // Rotate through active discounts if no manually applied discount
  useEffect(() => {
    if (!activeDiscount && Array.isArray(activeDiscounts) && activeDiscounts.length > 1 && showBanner) {
      const interval = setInterval(() => {
        if (isAnimating) return; // Skip if already animating
        
        setIsAnimating(true);
        
        // Calculate next discount to display
        const nextIndex = (currentDiscountIndex + 1) % activeDiscounts.length;
        
        // Start the fade-out animation
        setFadeState('fading-out');
        
        // After fade-out completes, update the message text
        setTimeout(() => {
          const nextText = getTextForDiscount(activeDiscounts[nextIndex]);
          setNextMessageText(nextText);
          setCurrentDiscountIndex(nextIndex);
          setFadeState('fading-in');
          
          // After fade-in completes, update the actual display text
          setTimeout(() => {
            setDisplayText(nextText);
            setFadeState('visible');
            setIsAnimating(false);
          }, 400); // Duration of fade-in
          
        }, 400); // Duration of fade-out
        
      }, 7000); // Change message every 7 seconds
      
      return () => clearInterval(interval);
    }
  }, [activeDiscount, activeDiscounts, currentDiscountIndex, showBanner, isAnimating]);
  
  const handleClose = () => {
    // Trigger the disappear animation first
    setBannerAnimState('hiding');
    
    // Add the removing class to trigger the header slide up animation
    document.body.classList.add('removing-discount-banner');
    document.body.classList.remove('has-discount-banner');
    
    // Remove the discount after animation starts
    removeDiscount();
    
    // The banner will be hidden after the animation completes
    // by the setTimeout in removeDiscount() function
  };

  // Don't render anything if we shouldn't show the banner
  if (!showBanner) {
    return null;
  }

  // Simple fixed-positioned banner with no nested structure
  return (
    <div 
      id="discount-banner-root"
      className={
        bannerAnimState === 'initial' ? 'initial' :
        bannerAnimState === 'showing' ? 'showing' : 
        bannerAnimState === 'hiding' ? 'hiding' : ''
      }
      ref={bannerRef}
    >
      <div className="discount-banner-content">
        <div className="flex-grow overflow-hidden flex items-center justify-center">
          <div 
            className={`discount-text ${fadeState} text-sm md:text-base font-medium text-white max-w-full overflow-hidden flex items-center justify-center`}
            style={{ margin: 0 }}
          >
            {fadeState === 'fading-in' 
              ? parseProductDescription(
                  nextMessageText,
                  activeDiscount?.endDate || activeDiscounts?.[currentDiscountIndex]?.endDate || null,
                  true  // Force the active state to true for discount banners
                )
              : parseProductDescription(
                  displayText,
                  activeDiscount?.endDate || activeDiscounts?.[currentDiscountIndex]?.endDate || null,
                  true  // Force the active state to true for discount banners
                )
            }
          </div>
        </div>
        
        {activeDiscount && (
          <button 
            onClick={handleClose}
            aria-label="Close discount banner"
            className="text-[#f5e9d9] hover:text-white focus:outline-none transition-all duration-200 hover:scale-110 active:scale-95 ml-2 flex-shrink-0"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default DiscountBanner;