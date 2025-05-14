import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { X, ChevronDown, Facebook, Twitter } from "lucide-react";
import { FaInstagram, FaTiktok } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import resetScroll from "../resetScroll";
import { generateProductSlug } from "../lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Helper component for smooth scroll behavior
const ScrollAwareLink = ({ href, children, className, onClick }: { href: string, children: React.ReactNode, className?: string, onClick?: () => void }) => {
  // Helper function for smooth scrolling to top
  const smoothScrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  return (
    <a
      href={href}
      onClick={(e) => {
        // Get the current path
        const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
        
        // If we're already on this page
        if (currentPath === href) {
          e.preventDefault(); // Prevent default navigation
          smoothScrollToTop();
        }
        
        // Call the additional onClick handler if provided
        if (onClick) {
          onClick();
        }
      }}
      className={className}
    >
      {children}
    </a>
  );
};

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Product {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  formattedPrice?: string;
  displayOrder?: number;
}

// Define interface for social media items
interface SocialMediaItem {
  enabled: boolean;
  url: string;
  displayInHeader?: boolean;
}

interface SocialMediaSettings {
  instagram: SocialMediaItem;
  tiktok: SocialMediaItem;
  facebook: SocialMediaItem;
  twitter: SocialMediaItem;
  displayInHeader: boolean;
  displayInFooter: boolean;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  // Get submenu state from localStorage if available
  const savedSubmenuState = typeof window !== "undefined" 
    ? localStorage.getItem("mobileSubmenuOpen") === "true" 
    : false;
  
  const menuRef = useRef<HTMLDivElement>(null);
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(savedSubmenuState);
  const [menuDropdownEnabled, setMenuDropdownEnabled] = useState(false);
  
  const [socialMedia, setSocialMedia] = useState<SocialMediaSettings>({
    instagram: { enabled: true, url: "https://www.instagram.com/sweetmomentchocolate/", displayInHeader: true },
    tiktok: { enabled: true, url: "https://www.tiktok.com/@sweetmomentchocolate", displayInHeader: true },
    facebook: { enabled: false, url: "", displayInHeader: true },
    twitter: { enabled: false, url: "", displayInHeader: true },
    displayInHeader: true,
    displayInFooter: true
  });
  
  // Fetch site customization settings including navigation settings
  const { data: siteCustomization } = useQuery({
    queryKey: ['/api/site-customization'],
    queryFn: async () => {
      const response = await fetch('/api/site-customization');
      if (!response.ok) {
        throw new Error("Failed to fetch site customization");
      }
      return response.json();
    },
    staleTime: 60000 // Cache for 1 minute
  });
  
  // Fetch products dynamically
  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        
        // Ensure correct ordering by normalizing displayOrder values
        const productsWithOrder = data.map((product: any) => {
          const p = {...product};
          
          // Handle price formatting properly
          // If price is less than 100, it's likely already in dollars
          const basePrice = p.basePrice < 100 ? p.basePrice : p.basePrice / 100;
          const formattedPrice = `$${basePrice.toFixed(2)}`;
          
          // Make sure all products have a valid displayOrder
          if (typeof p.displayOrder !== 'number' || isNaN(p.displayOrder) || p.displayOrder === null) {
            const numericId = parseInt(p.id.toString());
            p.displayOrder = !isNaN(numericId) ? numericId * 10 : 1000;
          }
          
          return {
            ...p,
            formattedPrice
          };
        });
        
        // Sort by displayOrder first, then by name for consistency
        const sortedProducts = productsWithOrder.sort((a: any, b: any) => {
          const orderA = typeof a.displayOrder === 'number' && !isNaN(a.displayOrder) ? a.displayOrder : 1000;
          const orderB = typeof b.displayOrder === 'number' && !isNaN(b.displayOrder) ? b.displayOrder : 1000;
          
          // Sort by display order first
          if (orderA !== orderB) {
            return orderA - orderB;
          }
          
          // Fall back to name if display orders are the same
          return a.name.localeCompare(b.name);
        });
        
        return sortedProducts;
      } catch (error) {
        console.error("Error fetching products in MobileMenu:", error);
        return [];
      }
    },
    staleTime: 60000 // Refresh every minute
  });
  
  // Add click outside handler to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If the menu is open and the click is outside the menu
      if (isOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose(); // Close the mobile menu
      }
    };

    // Add the event listener when the menu is open
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Clean up
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Parse navigation settings and social media links from site customization data
  useEffect(() => {
    // Load navigation settings
    if (siteCustomization?.navigationSettings) {
      try {
        const parsedSettings = typeof siteCustomization.navigationSettings === 'string'
          ? JSON.parse(siteCustomization.navigationSettings)
          : siteCustomization.navigationSettings;
        
        // Update menu dropdown enabled state
        setMenuDropdownEnabled(parsedSettings.menuDropdownEnabled === true); // Default to false unless explicitly set to true
      } catch (error) {
        console.error("Error parsing navigation settings in MobileMenu:", error);
        // Keep default value (false) if there's an error
      }
    }
    
    // Load social media links
    if (siteCustomization?.socialMediaLinks) {
      try {
        const parsedSocialMedia = typeof siteCustomization.socialMediaLinks === 'string'
          ? JSON.parse(siteCustomization.socialMediaLinks)
          : siteCustomization.socialMediaLinks;
          
        // Update social media links
        setSocialMedia(parsedSocialMedia);
      } catch (error) {
        console.error("Error parsing social media links in MobileMenu:", error);
        // Keep default values if there's an error
      }
    }
  }, [siteCustomization]);
  
  // Combined handler for closing menu and scrolling to top
  const handleNavClick = () => {
    resetScroll(); // Use our improved scroll utility
    onClose();
  };
  
  // Helper function to convert product name to URL-friendly slug
  const getProductSlug = (product: Product) => {
    // Use the common slug generation function
    return generateProductSlug(product.name);
  };

  // Animation variants
  const menuVariants = {
    hidden: { x: "-100%" },
    visible: { 
      x: 0,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        when: "beforeChildren",
        staggerChildren: 0.05
      }
    },
    exit: {
      x: "-100%",
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        when: "afterChildren",
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    }
  };
  
  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 500, 
        damping: 30
      }
    },
    exit: { 
      x: -20, 
      opacity: 0,
      transition: { 
        type: "spring", 
        stiffness: 500, 
        damping: 30
      }
    }
  };
  
  // Submenu animation variants
  const submenuVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: { 
      height: "auto", 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        duration: 0.3
      }
    },
    exit: { 
      height: 0, 
      opacity: 0,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        duration: 0.3
      }
    }
  };
  
  // Staggered product items animation
  const productItemVariants = {
    hidden: { x: -10, opacity: 0 },
    visible: (custom: number) => ({ 
      x: 0, 
      opacity: 1,
      transition: { 
        delay: custom * 0.05,
        type: "spring", 
        stiffness: 400, 
        damping: 30
      }
    }),
    exit: { 
      x: -10, 
      opacity: 0
    }
  };
  
  // Social media icons animation
  const socialIconVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: (custom: number) => ({ 
      scale: 1, 
      opacity: 1,
      transition: { 
        delay: custom * 0.1,
        type: "spring", 
        stiffness: 500, 
        damping: 20
      }
    }),
    hover: { 
      scale: 1.2, 
      color: "#D4AF37", 
      transition: { duration: 0.2 }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Add overlay to capture outside clicks on the rest of the screen */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            style={{ zIndex: "var(--z-mobile-menu-overlay)" }}
            onClick={onClose}
          />
          
          {/* Menu panel */}
          <motion.div 
            ref={menuRef}
            className="fixed left-0 h-full w-64 bg-[#3A1F1D] header-adjust" 
            style={{ zIndex: "var(--z-mobile-menu)" }}
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div 
              className="flex justify-end p-4"
              variants={itemVariants}
            >
              <motion.button 
                onClick={onClose} 
                className="text-white focus:outline-none" 
                aria-label="Close menu"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
              >
                <X size={24} />
              </motion.button>
            </motion.div>
            <div className="mt-8 flex flex-col space-y-4 px-4">
              <motion.div variants={itemVariants}>
                <ScrollAwareLink
                  href="/" 
                  className="text-white hover:text-[#D4AF37] transition-colors py-2 border-b border-[#4A2C2A] block" 
                  onClick={onClose}
                >
                  Home
                </ScrollAwareLink>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <div className="flex justify-between items-center w-full">
                  <ScrollAwareLink 
                    href="/menu" 
                    className="text-white hover:text-[#D4AF37] transition-colors py-2"
                    onClick={onClose}
                  >
                    Menu
                  </ScrollAwareLink>
                  {menuDropdownEnabled && (
                    <motion.button 
                      className="text-white hover:text-[#D4AF37] p-2"
                      onClick={() => {
                        const newState = !isSubmenuOpen;
                        setIsSubmenuOpen(newState);
                        // Store preference in localStorage
                        if (typeof window !== "undefined") {
                          localStorage.setItem("mobileSubmenuOpen", newState.toString());
                        }
                      }}
                      aria-label="Toggle submenu"
                      whileTap={{ scale: 0.9 }}
                    >
                      <motion.div
                        animate={{ rotate: isSubmenuOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown size={16} />
                      </motion.div>
                    </motion.button>
                  )}
                </div>
                <div className="border-b border-[#4A2C2A] w-full"></div>
                
                {menuDropdownEnabled && (
                  <AnimatePresence>
                    {isSubmenuOpen && (
                      <motion.div 
                        className="pl-4 py-2 space-y-2 bg-[#5c3426] rounded-md max-h-[40vh] overflow-y-auto"
                        variants={submenuVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      >
                        {/* Display all products sorted by their displayOrder from the admin panel */}
                        {[...products]
                          .sort((a: Product, b: Product) => {
                            // Get display order, with fallback to high number if not set
                            const orderA = typeof a.displayOrder === 'number' && !isNaN(a.displayOrder) ? a.displayOrder : 1000;
                            const orderB = typeof b.displayOrder === 'number' && !isNaN(b.displayOrder) ? b.displayOrder : 1000;
                            
                            // Sort by display order first, then by name for equal orders
                            return orderA !== orderB 
                              ? orderA - orderB 
                              : a.name.localeCompare(b.name);
                          })
                          .map((product: Product, index: number) => (
                            <motion.div
                              key={product.id}
                              custom={index}
                              variants={productItemVariants}
                            >
                              <ScrollAwareLink 
                                href={`/menu/${getProductSlug(product)}`}
                                className="block text-[#f5e9d9] hover:text-[#D4AF37] py-2 cursor-pointer" 
                                onClick={onClose}
                              >
                                <span>{product.name}</span>
                              </ScrollAwareLink>
                            </motion.div>
                          ))
                        }
                        {products.length === 0 && (
                          <motion.div 
                            className="block text-[#f5e9d9] py-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            Loading products...
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <ScrollAwareLink 
                  href="/custom-order" 
                  className="text-white hover:text-[#D4AF37] transition-colors py-2 border-b border-[#4A2C2A] block"
                  onClick={onClose}
                >
                  Custom Orders
                </ScrollAwareLink>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <ScrollAwareLink 
                  href="/order-status" 
                  className="text-white hover:text-[#D4AF37] transition-colors py-2 border-b border-[#4A2C2A] block"
                  onClick={onClose}
                >
                  Order Status
                </ScrollAwareLink>
              </motion.div>
              
              {/* Social Media Links - Always show in mobile menu regardless of header settings */}
              {((socialMedia.instagram.enabled && socialMedia.instagram.url) || 
                (socialMedia.tiktok.enabled && socialMedia.tiktok.url) ||
                (socialMedia.facebook.enabled && socialMedia.facebook.url) ||
                (socialMedia.twitter.enabled && socialMedia.twitter.url)) && (
                  <motion.div 
                    className="flex items-center space-x-6 pt-4"
                    variants={itemVariants}
                  >
                    {socialMedia.instagram.enabled && socialMedia.instagram.url && (
                      <motion.a 
                        href={socialMedia.instagram.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-white"
                        aria-label="Instagram"
                        custom={0}
                        variants={socialIconVariants}
                        whileHover="hover"
                      >
                        <FaInstagram size={20} />
                      </motion.a>
                    )}
                    
                    {socialMedia.tiktok.enabled && socialMedia.tiktok.url && (
                      <motion.a 
                        href={socialMedia.tiktok.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-white"
                        aria-label="TikTok"
                        custom={1}
                        variants={socialIconVariants}
                        whileHover="hover"
                      >
                        <FaTiktok size={18} />
                      </motion.a>
                    )}
                    
                    {socialMedia.facebook.enabled && socialMedia.facebook.url && (
                      <motion.a 
                        href={socialMedia.facebook.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-white"
                        aria-label="Facebook"
                        custom={2}
                        variants={socialIconVariants}
                        whileHover="hover"
                      >
                        <Facebook size={20} />
                      </motion.a>
                    )}
                    
                    {socialMedia.twitter.enabled && socialMedia.twitter.url && (
                      <motion.a 
                        href={socialMedia.twitter.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-white"
                        aria-label="Twitter/X"
                        custom={3}
                        variants={socialIconVariants}
                        whileHover="hover"
                      >
                        <Twitter size={20} />
                      </motion.a>
                    )}
                  </motion.div>
                )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;