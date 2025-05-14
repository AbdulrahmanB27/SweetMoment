import React, { useState, useEffect, useRef } from 'react';
import { useDiscount, Discount } from '../context/DiscountContext';
import { X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

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
  
  // Fetch all active discounts
  const { data: activeDiscounts = [] } = useQuery<Discount[]>({
    queryKey: ['/api/discounts'],
    queryFn: async () => {
      const response = await fetch('/api/discounts');
      if (!response.ok) return [];
      return response.json();
    },
    // Increase refetch frequency to see changes immediately
    refetchInterval: 2000
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
      
      /* Banner container with slide animations */
      @keyframes bannerSlideIn {
        0% { transform: translateY(-${BANNER_HEIGHT_PX}px); opacity: 0; }
        30% { transform: translateY(-${BANNER_HEIGHT_PX * 0.7}px); opacity: 0.3; }
        60% { transform: translateY(-${BANNER_HEIGHT_PX * 0.4}px); opacity: 0.7; }
        100% { transform: translateY(0); opacity: 1; }
      }
      
      @keyframes bannerSlideOut {
        0% { transform: translateY(0); opacity: 1; }
        30% { transform: translateY(-${BANNER_HEIGHT_PX * 0.2}px); opacity: 0.9; }
        60% { transform: translateY(-${BANNER_HEIGHT_PX * 0.5}px); opacity: 0.6; }
        100% { transform: translateY(-${BANNER_HEIGHT_PX}px); opacity: 0; }
      }
      
      /* Extremely direct selector to ensure our banner is positioned correctly */
      #discount-banner-root {
        display: block !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        width: 100% !important;
        height: ${BANNER_HEIGHT_PX}px !important;
        z-index: var(--z-banner) !important; /* Use the CSS variable for z-index */
        background-color: #5c3426 !important;
        color: white !important;
        line-height: 1 !important;
        border: 0 !important;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      
      /* Banner slide in animation - start offscreen at the top */
      #discount-banner-root.initial {
        transform: translateY(-100%) !important;
        opacity: 0 !important;
      }
      
      /* Banner visible state with animation */
      #discount-banner-root.showing {
        animation: bannerSlideIn 800ms cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
        z-index: var(--z-banner) !important;
      }
      
      /* Banner slide out animation */
      #discount-banner-root.hiding {
        animation: bannerSlideOut 800ms cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
        z-index: var(--z-banner) !important;
      }
      
      /* When the banner is active, push header down with animation */
      @keyframes headerSlideDown {
        0% { top: 0 !important; }
        30% { top: ${BANNER_HEIGHT_PX * 0.3}px !important; }
        60% { top: ${BANNER_HEIGHT_PX * 0.6}px !important; }
        100% { top: ${BANNER_HEIGHT_PX}px !important; }
      }
      
      @keyframes headerSlideUp {
        0% { top: ${BANNER_HEIGHT_PX}px !important; }
        /* Stay at the top longer to let the banner complete its animation */
        40% { top: ${BANNER_HEIGHT_PX}px !important; }
        70% { top: ${BANNER_HEIGHT_PX * 0.5}px !important; }
        100% { top: 0 !important; }
      }
      
      /* Apply slide down animation to header when banner appears */
      body.has-discount-banner .header-adjust {
        animation: headerSlideDown 800ms cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
        top: ${BANNER_HEIGHT_PX}px !important;
      }
      
      /* Apply slide up animation to header when banner disappears */
      body.removing-discount-banner .header-adjust {
        animation: headerSlideUp 800ms cubic-bezier(0.16, 1, 0.3, 1) forwards !important; 
        /* Keep this top: 0 for final state but animation will control the timing */
        top: 0 !important;
      }
      
      /* Adjust content padding to make space for the banner */
      body.has-discount-banner #root > main {
        padding-top: ${BANNER_HEIGHT_PX}px !important;
        transition: padding-top 800ms cubic-bezier(0.16, 1, 0.3, 1) !important;
      }
      
      /* Reset content padding when banner is removed */
      body.removing-discount-banner #root > main {
        padding-top: 0 !important;
        transition: padding-top 800ms cubic-bezier(0.16, 1, 0.3, 1) !important;
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
        }, 900); // Increased timeout to match our 800ms header animation duration + buffer
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
        }, 900); // Increased timeout to match our 800ms header animation duration + buffer
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
          <p 
            className={`discount-text ${fadeState} text-sm md:text-base font-medium text-white max-w-full overflow-hidden text-ellipsis whitespace-nowrap`}
            style={{ margin: 0 }}
          >
            {fadeState === 'fading-in' ? nextMessageText : displayText}
          </p>
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