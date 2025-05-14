import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';

// Away Mode settings interface
export interface AwayModeSettings {
  enabled: boolean;
  message: string;
  showReturnDate: boolean;
  returnDate: string;
  disableOrders: boolean;
  customHeroBanner?: boolean;
  heroBannerImage?: string;
  heroBannerTitle?: string;
  heroBannerSubtitle?: string;
}

// Default settings
const defaultSettings: AwayModeSettings = {
  enabled: false,
  message: "",
  showReturnDate: false,
  returnDate: "",
  disableOrders: false,
  customHeroBanner: false,
  heroBannerImage: "",
  heroBannerTitle: "Sweet Moment is Taking a Break",
  heroBannerSubtitle: "We'll be back soon with fresh chocolates and sweet treats"
};

// Away Mode context interface
interface AwayModeContextType {
  settings: AwayModeSettings;
  areOrdersDisabled: boolean;
  awayModeActive: boolean;
  disableOrdersReason: string | null;
}

// Create the context
const AwayModeContext = createContext<AwayModeContextType>({
  settings: defaultSettings,
  areOrdersDisabled: false,
  awayModeActive: false,
  disableOrdersReason: null
});

interface AwayModeProviderProps {
  children: ReactNode;
}

// Provider component
export function AwayModeProvider({ children }: AwayModeProviderProps) {
  const [settings, setSettings] = useState<AwayModeSettings>(defaultSettings);
  
  // Fetch site customization settings for away mode
  const { data: siteConfig } = useQuery<Record<string, any>>({
    queryKey: ['/api/site-customization'],
    refetchOnWindowFocus: false,
    staleTime: 300000, // 5 minutes
  });
  
  // Parse away mode settings when site config is loaded
  useEffect(() => {
    console.log("Site config received:", siteConfig);
    console.log("Away mode data:", siteConfig?.awayMode);
    
    if (siteConfig?.awayMode) {
      try {
        const parsedAwayMode = typeof siteConfig.awayMode === 'string'
          ? JSON.parse(siteConfig.awayMode)
          : siteConfig.awayMode;
        
        console.log("Parsed away mode settings:", parsedAwayMode);
        setSettings(parsedAwayMode);
      } catch (error) {
        console.error("Error parsing away mode settings:", error);
      }
    }
  }, [siteConfig]);
  
  // Determine if away mode is active
  const awayModeActive = settings.enabled;
  
  // Determine if orders should be disabled (only if away mode is enabled AND the disableOrders flag is true)
  const areOrdersDisabled = settings.enabled && settings.disableOrders;
  
  // Create a message to explain why orders are disabled
  const disableOrdersReason = areOrdersDisabled 
    ? "Orders are temporarily disabled while we're away. Please check back later." 
    : null;
  
  return (
    <AwayModeContext.Provider value={{ 
      settings, 
      areOrdersDisabled, 
      awayModeActive,
      disableOrdersReason
    }}>
      {children}
    </AwayModeContext.Provider>
  );
}

// Custom hook to use the Away Mode context
export function useAwayMode() {
  return useContext(AwayModeContext);
}