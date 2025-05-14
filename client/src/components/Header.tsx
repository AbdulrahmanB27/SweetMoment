import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingCart, Menu, X, Facebook, Twitter } from "lucide-react";
import { FaInstagram, FaTiktok } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { useQuery } from "@tanstack/react-query";
import resetScroll from "../resetScroll";
import { generateProductSlug } from "../lib/utils";

interface HeaderProps {
  openMobileMenu: () => void;
  isMobileMenuOpen: boolean;
  openCart: () => void;
  isStatic?: boolean;
}

interface Product {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  formattedPrice?: string;
  displayOrder?: number;
}

const Header = ({ openMobileMenu, isMobileMenuOpen, openCart, isStatic = false }: HeaderProps) => {
  const { cartItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  // Start with dropdown disabled until settings are loaded to prevent flash during navigation
  const [menuDropdownEnabled, setMenuDropdownEnabled] = useState(false);
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
        console.log("Header - Fetched products:", data);
        
        // Log raw products with displayOrder for debugging
        console.log("Header - Raw products with displayOrder:", 
          data.map((p: any) => ({ id: p.id, name: p.name, displayOrder: p.displayOrder }))
        );
        
        // Ensure correct ordering by normalizing displayOrder values
        const productsWithOrder = data.map((product: any) => {
          const p = {...product};
          
          // Handle price formatting properly
          // If price is less than 100, it's likely already in dollars
          const basePrice = p.basePrice < 100 ? p.basePrice : p.basePrice / 100;
          const formattedPrice = `$${basePrice.toFixed(2)}`;
          
          // Make sure all products have a valid displayOrder
          // If no displayOrder is set, use the product ID as a fallback to ensure everything has a position
          if (typeof p.displayOrder !== 'number' || isNaN(p.displayOrder) || p.displayOrder === null) {
            // Use product ID as a numeric basis for ordering if no displayOrder is set
            // This ensures all products will appear in a consistent order
            const numericId = parseInt(p.id.toString());
            p.displayOrder = !isNaN(numericId) ? numericId * 10 : 1000;
          }
          
          return {
            ...p,
            formattedPrice
          };
        });
        
        // Log products after displayOrder normalization
        console.log("Header - Products after normalization:", 
          productsWithOrder.map((p: any) => ({ id: p.id, name: p.name, displayOrder: p.displayOrder }))
        );
        
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
        
        // Log final sorted products
        console.log("Header - Final sorted products:", 
          sortedProducts.map((p: any) => ({ id: p.id, name: p.name, displayOrder: p.displayOrder }))
        );
        
        return sortedProducts;
      } catch (error) {
        console.error("Error fetching products in Header:", error);
        return [];
      }
    },
    staleTime: 60000 // Refresh every minute
  });
  
  // Add scroll to top behavior for navigation
  const handleNavClick = () => {
    resetScroll(); // Use our improved scroll utility
    setIsMenuOpen(false);
  };
  
  // Parse navigation settings and social media links from site customization data
  useEffect(() => {
    // Load navigation settings
    if (siteCustomization?.navigationSettings) {
      try {
        const parsedSettings = typeof siteCustomization.navigationSettings === 'string'
          ? JSON.parse(siteCustomization.navigationSettings)
          : siteCustomization.navigationSettings;
        
        // Update menu dropdown enabled state
        setMenuDropdownEnabled(parsedSettings.menuDropdownEnabled !== false); // Default to true if not specified
        console.log("Navigation settings loaded:", parsedSettings);
      } catch (error) {
        console.error("Error parsing navigation settings:", error);
        // Keep default value (true) if there's an error
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
        console.log("Social media links loaded:", parsedSocialMedia);
      } catch (error) {
        console.error("Error parsing social media links:", error);
        // Keep default values if there's an error
      }
    }
  }, [siteCustomization]);

  // Handle click outside to close the menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  // Helper function to convert product name to URL-friendly slug
  const getProductSlug = (product: Product) => {
    // Use the common slug generation function
    return generateProductSlug(product.name);
  };
  
  // Helper function for smooth scrolling to top
  const smoothScrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };
  
  // Helper function to create navigation links that scroll to top when clicked on the same page
  const ScrollAwareLink = ({ href, children, className }: { href: string, children: React.ReactNode, className?: string }) => {
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
        }}
        className={className}
      >
        {children}
      </a>
    );
  };

  return (
    <header className="bg-gradient-brown text-white py-3 fixed left-0 right-0 top-0 w-full header-adjust" style={{ margin: 0, padding: "0.75rem 0", zIndex: "var(--z-navbar)", borderBottom: "0", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", outline: "none", borderWidth: 0 }}>
      <div className="w-full flex items-center justify-between" style={{ margin: 0, padding: "0 0 0 1rem", bottom: 0, maxWidth: "100%" }}>
        <div className="block md:hidden">
          <button
            onClick={openMobileMenu}
            className="text-white focus:outline-none"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        <div className="hidden md:flex items-center space-x-6">
          <ScrollAwareLink href="/" className="text-white hover:text-[#F1E5AC] transition-colors">
            Home
          </ScrollAwareLink>
          <div className="relative group" ref={menuRef}>
            <div className="flex items-center space-x-1">
              <ScrollAwareLink 
                href="/menu" 
                className="text-white hover:text-[#F1E5AC] transition-colors"
              >
                Menu
              </ScrollAwareLink>
              {menuDropdownEnabled && (
                <button 
                  className="text-white hover:text-[#F1E5AC] transition-colors ml-1"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  aria-label="Toggle menu"
                >
                  <i className="fas fa-chevron-down text-xs"></i>
                </button>
              )}
            </div>
            {menuDropdownEnabled && (
              <div className={`absolute left-0 right-0 md:left-auto md:right-auto mt-2 w-56 rounded-md shadow-lg bg-[#5c3426] transition-all max-h-[70vh] overflow-y-auto ${isMenuOpen ? 'visible opacity-100' : 'invisible opacity-0 group-hover:visible group-hover:opacity-100'}`} style={{ zIndex: "var(--z-dropdown)" }}>
                <div className="py-1">
                  {/* Display all products sorted by their displayOrder from the admin panel */}
                  {[...products]
                    .sort((a: Product, b: Product) => {
                      // Get display order, with fallback to high number if not set
                      const orderA = typeof a.displayOrder === 'number' ? a.displayOrder : 1000;
                      const orderB = typeof b.displayOrder === 'number' ? b.displayOrder : 1000;
                      
                      // Sort by display order first, then by name for equal orders
                      return orderA !== orderB 
                        ? orderA - orderB 
                        : a.name.localeCompare(b.name);
                    })
                    .map((product: Product) => (
                      <Link 
                        key={product.id} 
                        href={`/menu/${getProductSlug(product)}`}
                        className="block px-4 py-2 text-sm text-[#f5e9d9] hover:bg-[#6b3f2e] cursor-pointer" 
                        onClick={() => {
                          // Close the menu
                          setIsMenuOpen(false);
                          // Scroll to top
                          window.scrollTo({
                            top: 0,
                            left: 0,
                            behavior: 'auto'
                          });
                        }}
                      >
                        <span>{product.name}</span>
                      </Link>
                    ))
                  }
                  {products.length === 0 && (
                    <div className="block px-4 py-2 text-sm text-[#f5e9d9]">
                      Loading products...
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          {!isStatic && (
            <ScrollAwareLink href="/custom-order" className="text-white hover:text-[#F1E5AC] transition-colors">
              Custom Orders
            </ScrollAwareLink>
          )}
          {!isStatic && (
            <ScrollAwareLink href="/order-status" className="text-white hover:text-[#F1E5AC] transition-colors">
              Order Status
            </ScrollAwareLink>
          )}
        </div>
        
        <div className="mx-auto md:mx-0">
          <ScrollAwareLink href="/" className="text-2xl md:text-3xl font-montserrat font-bold tracking-wider">
            Sweet Moment
          </ScrollAwareLink>
        </div>
        
        <div className="flex items-center space-x-2" style={{ marginRight: "20px" }}>
          {/* Social Media Links - Only visible on larger screens (md and up) */}
          <div className="hidden md:flex items-center space-x-2">
              {socialMedia.instagram.enabled && socialMedia.instagram.url && 
               socialMedia.instagram.displayInHeader && (
                <a 
                  href={socialMedia.instagram.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-white hover:text-[#F1E5AC] transition-colors"
                  aria-label="Instagram"
                >
                  <FaInstagram size={20} />
                </a>
              )}
              {socialMedia.tiktok.enabled && socialMedia.tiktok.url && 
               socialMedia.tiktok.displayInHeader && (
                <a 
                  href={socialMedia.tiktok.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-white hover:text-[#F1E5AC] transition-colors"
                  aria-label="TikTok"
                >
                  <FaTiktok size={18} />
                </a>
              )}
              {socialMedia.facebook.enabled && socialMedia.facebook.url && 
               socialMedia.facebook.displayInHeader && (
                <a 
                  href={socialMedia.facebook.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-white hover:text-[#F1E5AC] transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook size={20} />
                </a>
              )}
              {socialMedia.twitter.enabled && socialMedia.twitter.url && 
               socialMedia.twitter.displayInHeader && (
                <a 
                  href={socialMedia.twitter.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-white hover:text-[#F1E5AC] transition-colors"
                  aria-label="Twitter/X"
                >
                  <Twitter size={20} />
                </a>
              )}
          </div>
          
          {/* Shopping Cart - Only shown in dynamic mode */}
          {!isStatic && (
            <button
              onClick={openCart}
              className="text-white focus:outline-none relative"
              aria-label="Shopping cart"
            >
              <ShoppingCart size={24} />
              {totalCartItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#D4AF37] text-[#2A1A18] rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  {totalCartItems}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
