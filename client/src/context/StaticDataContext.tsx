/**
 * StaticDataContext
 * 
 * This context provides access to static data in the static site mode.
 * It handles both:
 * 1. Client-side usage in the static site, where data comes from window.STATIC_DATA
 * 2. Dynamic mode, where it is mostly a pass-through
 * 3. Generation mode, where it collects data to be saved for the static site
 */

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

/**
 * Static Data interface that defines the shape of the static site data
 */
export interface StaticData {
  /**
   * Site customization settings (hero sections, colors, etc.)
   */
  siteCustomization?: any;
  
  /**
   * All products data
   */
  products?: any[];
  
  /**
   * All categories data
   */
  categories?: any[];
  
  /**
   * Featured products for the homepage
   */
  featuredProducts?: any[];
  
  /**
   * Reviews data indexed by product ID
   */
  productReviews?: Record<string, any[]>;
  
  /**
   * When the static data was generated (ISO date string)
   */
  generatedAt?: string;

  /**
   * Any additional data needed for the static site
   */
  [key: string]: any;
}

/**
 * Context type definition for StaticDataContext
 */
export interface StaticDataContextType {
  /**
   * Flag indicating whether we're in static site mode
   */
  isStatic: boolean;
  
  /**
   * The static data object (null in dynamic mode)
   */
  staticData: StaticData | null;
  
  /**
   * Function to update static data (useful during static site generation)
   */
  updateStaticData: (path: string, data: any) => void;
}

// Create the context with a default value
const StaticDataContext = createContext<StaticDataContextType>({
  isStatic: false,
  staticData: null,
  updateStaticData: () => {}, // No-op default
});

/**
 * Props for the StaticDataProvider component
 */
export interface StaticDataProviderProps {
  children: ReactNode;
  data?: StaticData;
}

/**
 * Determine if we're in static site mode by checking the window object
 */
function isStaticSiteMode(): boolean {
  return typeof window !== 'undefined' && 
    (window.STATIC_SITE_MODE === true || window.location.pathname.includes('/static-site/'));
}

/**
 * Provider component for the StaticDataContext
 */
export const StaticDataProvider: React.FC<StaticDataProviderProps> = ({ 
  children, 
  data: initialData 
}) => {
  // Initialize state with data from props or window
  const [staticData, setStaticData] = useState<StaticData | null>(() => {
    // If we're in the browser and window.STATIC_DATA exists, use it
    if (typeof window !== 'undefined' && window.STATIC_DATA) {
      return window.STATIC_DATA;
    }
    
    // Otherwise, use data from props if provided
    if (initialData) {
      return initialData;
    }
    
    // Default to null (used in development/dynamic mode)
    return null;
  });
  
  // Flag to determine if we're in static site mode
  const [isStatic, setIsStatic] = useState<boolean>(isStaticSiteMode());
  
  // Update static data for a specific API path
  const updateStaticData = (path: string, data: any) => {
    setStaticData((prevData) => {
      if (!prevData) {
        const result: StaticData = {};
        
        // Map API paths to static data structure
        if (path === '/api/site-customization') {
          result.siteCustomization = data;
        } else if (path === '/api/products') {
          result.products = data;
        } else if (path === '/api/categories') {
          result.categories = data;
        } else if (path.match(/\/api\/products\/featured/)) {
          result.featuredProducts = data;
        } else if (path.match(/\/api\/products\/(\d+)\/reviews/)) {
          const productId = path.match(/\/api\/products\/(\d+)\/reviews/)?.[1];
          if (productId) {
            result.productReviews = { [productId]: data };
          }
        } else {
          // Store any other data under the path key
          result[path] = data;
        }
        
        // Add generation timestamp
        result.generatedAt = new Date().toISOString();
        
        return result;
      }
      
      // Otherwise, update existing data
      const newData = { ...prevData };
      
      // Map API paths to static data structure
      if (path === '/api/site-customization') {
        newData.siteCustomization = data;
      } else if (path === '/api/products') {
        newData.products = data;
      } else if (path === '/api/categories') {
        newData.categories = data;
      } else if (path.match(/\/api\/products\/featured/)) {
        newData.featuredProducts = data;
      } else if (path.match(/\/api\/products\/(\d+)\/reviews/)) {
        const productId = path.match(/\/api\/products\/(\d+)\/reviews/)?.[1];
        if (productId) {
          newData.productReviews = { 
            ...(newData.productReviews || {}),
            [productId]: data 
          };
        }
      } else {
        // Store any other data under the path key
        newData[path] = data;
      }
      
      // Always update generation timestamp
      newData.generatedAt = new Date().toISOString();
      
      // If in the browser, update window.STATIC_DATA
      if (typeof window !== 'undefined') {
        window.STATIC_DATA = newData;
      }
      
      return newData;
    });
  };
  
  // Effect to check for static mode changes (e.g., URL changes)
  useEffect(() => {
    const checkStaticMode = () => {
      setIsStatic(isStaticSiteMode());
    };
    
    // Check on mount
    checkStaticMode();
    
    // Check on URL changes if we're in the browser
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', checkStaticMode);
      
      return () => {
        window.removeEventListener('popstate', checkStaticMode);
      };
    }
  }, []);
  
  // Create the context value object
  const value: StaticDataContextType = {
    isStatic,
    staticData,
    updateStaticData,
  };
  
  return (
    <StaticDataContext.Provider value={value}>
      {children}
    </StaticDataContext.Provider>
  );
};

/**
 * Hook to use the StaticDataContext
 */
export const useStaticData = () => useContext(StaticDataContext);