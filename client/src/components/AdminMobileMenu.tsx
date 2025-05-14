import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  ShoppingBag, 
  Star, 
  Package, 
  BarChart3, 
  Settings,
  Tag,
  X,
  ChevronDown,
  ChevronRight,
  Gift,
  Key,
  ScanBarcode
} from 'lucide-react';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface AdminMobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onTabSelect: (tab: string) => void;
  onSiteCustomizationSubTabSelect: (subTab: string) => void;
}

export function AdminMobileMenu({
  isOpen,
  onClose,
  onTabSelect,
  onSiteCustomizationSubTabSelect
}: AdminMobileMenuProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Close menu when a tab is selected
  const handleTabSelect = (tab: string) => {
    onTabSelect(tab);
    onClose();
  };

  // Handle site customization subtab selection
  const handleSiteCustomizationSelect = (subTab: string) => {
    onTabSelect('site-customization');
    onSiteCustomizationSubTabSelect(subTab);
    onClose();
  };

  // Handle orders tab selection
  const handleOrdersSelect = (type: string) => {
    onTabSelect('orders');
    // Ideally, we would pass the order type to the orders component
    // This functionality would need to be implemented in the OrderManagement component
    onClose();
  };
  
  // Handle order type selection (regular vs custom)
  const handleOrderTypeSelect = (orderType: string) => {
    onTabSelect('orders');
    // Add logic to switch between regular and custom orders
    // You could use a URL parameter or context to store this state
    if (orderType === 'regular') {
      // Handle regular orders tab
      console.log('Selected regular orders tab');
    } else if (orderType === 'custom') {
      // Handle custom orders tab
      console.log('Selected custom orders tab');
    }
    onClose();
  };

  // Set up Escape key to close the menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Block scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Toggle a section's expanded state
  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40"
          />
          
          {/* Menu Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 bottom-0 w-4/5 max-w-xs bg-background z-50 shadow-xl"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-xl font-bold">Admin Menu</h2>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto">
                <nav className="space-y-4">
                  {/* Orders */}
                  <div 
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary cursor-pointer"
                    onClick={() => handleTabSelect('orders')}
                  >
                    <ShoppingBag className="h-5 w-5" />
                    <span className="font-medium">Orders</span>
                  </div>
                  
                  {/* Reviews */}
                  <div 
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary cursor-pointer"
                    onClick={() => handleTabSelect('reviews')}
                  >
                    <Star className="h-5 w-5" />
                    <span className="font-medium">Reviews</span>
                  </div>
                  
                  {/* Discounts */}
                  <div 
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary cursor-pointer"
                    onClick={() => handleTabSelect('discounts')}
                  >
                    <Tag className="h-5 w-5" />
                    <span className="font-medium">Discounts</span>
                  </div>
                  
                  {/* Products */}
                  <div 
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary cursor-pointer"
                    onClick={() => handleTabSelect('products')}
                  >
                    <Package className="h-5 w-5" />
                    <span className="font-medium">Products</span>
                  </div>
                  
                  {/* Analytics */}
                  <div 
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary cursor-pointer"
                    onClick={() => handleTabSelect('analytics')}
                  >
                    <BarChart3 className="h-5 w-5" />
                    <span className="font-medium">Analytics</span>
                  </div>
                  
                  {/* QR Codes */}
                  <div 
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary cursor-pointer"
                    onClick={() => handleTabSelect('qr-code')}
                  >
                    <ScanBarcode className="h-5 w-5" />
                    <span className="font-medium">QR Codes</span>
                  </div>
                  
                  {/* Credentials */}
                  <div 
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary cursor-pointer"
                    onClick={() => handleTabSelect('credentials')}
                  >
                    <Key className="h-5 w-5" />
                    <span className="font-medium">Credentials</span>
                  </div>
                  
                  {/* Site Customization with subtabs */}
                  <div className="space-y-2">
                    <div 
                      className="flex items-center justify-between p-2 rounded-md hover:bg-secondary cursor-pointer"
                      onClick={() => toggleSection('site-customization')}
                    >
                      <div className="flex items-center gap-3">
                        <Settings className="h-5 w-5" />
                        <span className="font-medium">Site Customization</span>
                      </div>
                      {expandedSection === 'site-customization' ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </div>
                    
                    <AnimatePresence>
                      {expandedSection === 'site-customization' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden pl-9 space-y-2"
                        >
                          <div 
                            className="py-2 px-3 rounded-md hover:bg-secondary/80 cursor-pointer"
                            onClick={() => handleSiteCustomizationSelect('hero')}
                          >
                            Hero Image
                          </div>
                          <div 
                            className="py-2 px-3 rounded-md hover:bg-secondary/80 cursor-pointer"
                            onClick={() => handleSiteCustomizationSelect('featured')}
                          >
                            Featured Products
                          </div>
                          <div 
                            className="py-2 px-3 rounded-md hover:bg-secondary/80 cursor-pointer"
                            onClick={() => handleSiteCustomizationSelect('signature')}
                          >
                            Signature Collection
                          </div>
                          <div 
                            className="py-2 px-3 rounded-md hover:bg-secondary/80 cursor-pointer"
                            onClick={() => handleSiteCustomizationSelect('reviews')}
                          >
                            Reviews Display
                          </div>
                          <div 
                            className="py-2 px-3 rounded-md hover:bg-secondary/80 cursor-pointer"
                            onClick={() => handleSiteCustomizationSelect('qrcode')}
                          >
                            QR Code
                          </div>
                          <div 
                            className="py-2 px-3 rounded-md hover:bg-secondary/80 cursor-pointer"
                            onClick={() => handleSiteCustomizationSelect('social')}
                          >
                            Social Media
                          </div>
                          <div 
                            className="py-2 px-3 rounded-md hover:bg-secondary/80 cursor-pointer"
                            onClick={() => handleSiteCustomizationSelect('navigation')}
                          >
                            Navigation
                          </div>
                          <div 
                            className="py-2 px-3 rounded-md hover:bg-secondary/80 cursor-pointer"
                            onClick={() => handleSiteCustomizationSelect('contact')}
                          >
                            Contact Info
                          </div>
                          <div 
                            className="py-2 px-3 rounded-md hover:bg-secondary/80 cursor-pointer"
                            onClick={() => handleSiteCustomizationSelect('legal')}
                          >
                            Legal Info
                          </div>
                          <div 
                            className="py-2 px-3 rounded-md hover:bg-secondary/80 cursor-pointer"
                            onClick={() => handleSiteCustomizationSelect('about')}
                          >
                            About Us
                          </div>
                          <div 
                            className="py-2 px-3 rounded-md hover:bg-secondary/80 cursor-pointer"
                            onClick={() => handleSiteCustomizationSelect('faqs')}
                          >
                            FAQs
                          </div>
                          <div 
                            className="py-2 px-3 rounded-md hover:bg-secondary/80 cursor-pointer"
                            onClick={() => handleSiteCustomizationSelect('awaymode')}
                          >
                            Away Mode
                          </div>
                          <div 
                            className="py-2 px-3 rounded-md hover:bg-secondary/80 cursor-pointer"
                            onClick={() => handleSiteCustomizationSelect('theme')}
                          >
                            Theme
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  {/* Log Out Button - Added at the bottom of the menu */}
                  <div className="mt-6 pt-6 border-t">
                    <button 
                      className="w-full flex items-center justify-center gap-2 p-3 rounded-md bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                      onClick={() => {
                        // Handle logout logic here
                        console.log('Logging out');
                        // Clear auth logged in flag
                        localStorage.removeItem('adminLoggedIn');
                        // Redirect to login page
                        window.location.href = '/admin/login';
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                      </svg>
                      Log Out
                    </button>
                  </div>
                </nav>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}