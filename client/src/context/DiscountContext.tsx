import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useToast } from '../hooks/use-toast';

export interface Discount {
  id: number;
  code: string;
  description: string | null;
  discountType: 'percentage' | 'fixed' | 'buy_one_get_one';
  value: number;
  minPurchase: number | null;
  maxUses: number | null;
  usedCount: number;
  productIds: string[] | null;
  categoryIds: string[] | null;
  active: boolean;
  hidden: boolean;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  buyQuantity?: number; // Number of items to buy (for BOGO discounts)
  getQuantity?: number; // Number of items to get discounted (for BOGO discounts)
}

interface DiscountContextType {
  activeDiscount: Discount | null;
  applyDiscount: (code: string) => Promise<boolean>;
  removeDiscount: () => void;
  getDiscountedPrice: (originalPrice: number, productId?: string, category?: string) => number;
  discountBannerVisible: boolean;
  setDiscountBannerVisible: (visible: boolean) => void;
}

const DiscountContext = createContext<DiscountContextType | undefined>(undefined);

export const DiscountProvider = ({ children }: { children: ReactNode }) => {
  const [activeDiscount, setActiveDiscount] = useState<Discount | null>(null);
  const [discountBannerVisible, setDiscountBannerVisible] = useState<boolean>(true); // Start visible by default
  const { toast } = useToast();

  // Check for stored discount on initial load
  useEffect(() => {
    const storedDiscount = localStorage.getItem('activeDiscount');
    if (storedDiscount) {
      try {
        const discount = JSON.parse(storedDiscount);
        // Verify the discount is still valid (not expired)
        const isValid = validateDiscount(discount);
        if (isValid) {
          setActiveDiscount(discount);
          // Only show banner if the discount is not hidden
          setDiscountBannerVisible(!discount.hidden);
        } else {
          localStorage.removeItem('activeDiscount');
        }
      } catch (error) {
        localStorage.removeItem('activeDiscount');
      }
    }
  }, []);

  const validateDiscount = (discount: Discount): boolean => {
    if (!discount.active) return false;

    // Check if discount has expired
    if (discount.endDate) {
      const endDate = new Date(discount.endDate);
      if (endDate < new Date()) return false;
    }

    // Check if discount has not started yet
    if (discount.startDate) {
      const startDate = new Date(discount.startDate);
      if (startDate > new Date()) return false;
    }

    // Check if discount has reached max uses
    if (discount.maxUses !== null && discount.usedCount >= discount.maxUses) return false;

    return true;
  };

  const applyDiscount = async (code: string): Promise<boolean> => {
    try {
      // Always convert code to uppercase
      const uppercaseCode = code.toUpperCase();
      
      const response = await fetch(`/api/discounts/${uppercaseCode}`);
      
      if (!response.ok) {
        throw new Error('Invalid discount code');
      }
      
      const discount: Discount = await response.json();
      
      if (!validateDiscount(discount)) {
        throw new Error('This discount code has expired or is no longer valid');
      }
      
      setActiveDiscount(discount);
      // Only show banner if the discount is not hidden
      setDiscountBannerVisible(!discount.hidden);
      localStorage.setItem('activeDiscount', JSON.stringify(discount));
      
      // No toast notification for success cases, just return true
      return true;
    } catch (error) {
      if (error instanceof Error) {
        // Only show error toasts (keeping this for user feedback on errors)
        toast({
          title: "Discount Error",
          description: error.message,
          variant: "destructive",
        });
      }
      return false;
    }
  };

  const removeDiscount = () => {
    // First, just remove the discount from state (this triggers the slide animation)
    setActiveDiscount(null);
    localStorage.removeItem('activeDiscount');
    
    // The banner animation takes 600ms to complete, so wait a bit longer
    // before completely hiding the banner to ensure the animation finishes
    // Don't set discountBannerVisible to false immediately to allow animation to run
    setTimeout(() => {
      setDiscountBannerVisible(false);
    }, 700); // Wait for animation duration (600ms) + small buffer (100ms)
    
    // No toast notification as requested
  };

  const getDiscountedPrice = (originalPrice: number, productId?: string, category?: string): number => {
    if (!activeDiscount) return originalPrice;

    // Check minimum purchase requirement
    if (activeDiscount.minPurchase && originalPrice < activeDiscount.minPurchase) {
      return originalPrice;
    }
    
    // Check if discount is restricted to specific products
    if (activeDiscount.productIds && activeDiscount.productIds.length > 0) {
      if (!productId || !activeDiscount.productIds.includes(productId)) {
        return originalPrice; // Product not eligible for this discount
      }
    }
    
    // Check if discount is restricted to specific categories
    if (activeDiscount.categoryIds && activeDiscount.categoryIds.length > 0) {
      if (!category || !activeDiscount.categoryIds.includes(category)) {
        return originalPrice; // Category not eligible for this discount
      }
    }

    // Apply the discount
    if (activeDiscount.discountType === 'percentage') {
      return originalPrice * (1 - activeDiscount.value / 100);
    } else if (activeDiscount.discountType === 'fixed') {
      return Math.max(0, originalPrice - activeDiscount.value);
    } else if (activeDiscount.discountType === 'buy_one_get_one') {
      // For BOGO discounts, we need to check cart items and apply the discount differently
      // This requires access to the cart items, so we'll implement a basic version here
      // and enhance it in the Cart and Checkout components
      
      // A very basic implementation of BOGO - assuming we're only applying to the total
      // for more complex implementations, we need cart item quantities and product IDs
      // This will be replaced with a proper implementation in Cart.tsx and Checkout.tsx
      
      // If total is enough for 2+ items, discount the second item by value%
      if (originalPrice >= 2 * (originalPrice / 2)) { // Simplification - assumes equal price items
        // Apply discount to half of the cart (representing the "second" items)
        const discountPercentage = activeDiscount.value / 100;
        const halfPrice = originalPrice / 2;
        const discountAmount = halfPrice * discountPercentage;
        return originalPrice - discountAmount;
      }
      
      return originalPrice; // Not enough for BOGO
    } else {
      return originalPrice; // Unknown discount type
    }
  };

  return (
    <DiscountContext.Provider
      value={{
        activeDiscount,
        applyDiscount,
        removeDiscount,
        getDiscountedPrice,
        discountBannerVisible,
        setDiscountBannerVisible,
      }}
    >
      {children}
    </DiscountContext.Provider>
  );
};

export const useDiscount = () => {
  const context = useContext(DiscountContext);
  if (context === undefined) {
    throw new Error('useDiscount must be used within a DiscountProvider');
  }
  return context;
};