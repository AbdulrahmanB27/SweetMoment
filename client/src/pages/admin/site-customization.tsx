import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Trash2, Trash, Image as ImageIcon, ChevronDown, CropIcon, ArrowUp, ArrowDown, MoveVertical, RotateCcw, Loader2, Eye, CalendarIcon } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { formatPhoneNumber, validateEmail } from "@/utils/formatPhoneNumber";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "@/components/ui/image-upload";
import { ImageCropper } from "@/components/ImageCropper";
import { useToast } from "@/hooks/use-toast";
import { useAdminNotification } from "@/hooks/use-admin-notification";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { DEFAULT_HERO_IMAGES, DEFAULT_PRODUCT_IMAGE } from "./default-images";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import QRCodeRedirectManager from "@/components/admin/QRCodeRedirectManager";
import { ThemeCustomizer } from "@/components/admin/ThemeCustomizer";

import StaticSiteGeneratorPanel from "@/components/admin/StaticSiteGeneratorPanel";
import FullReactStaticGenerator from "@/components/admin/FullReactStaticGenerator";
import { SimpleStaticSiteTester } from "@/components/admin/SimpleStaticSiteTester";


// Admin auth header helper
function getAdminAuthHeaders() {
  const token = localStorage.getItem('adminToken');
  return {
    'Authorization': `Bearer ${token}`,
    'x-admin-access': 'sweetmoment-dev-secret'
  };
}

// Helper function to get a display name for an image
function getDisplayName(imageUrl: string): string {
  // If it's not an upload URL, just return the filename part
  if (!imageUrl.startsWith('/uploads/')) {
    return imageUrl.split('/').pop() || 'Unknown';
  }
  
  // For upload URLs, use the cached metadata if available
  const imageMetadata = window.__imageMetadata || {};
  if (imageMetadata[imageUrl]?.originalFilename) {
    return imageMetadata[imageUrl].originalFilename;
  }
  
  // Otherwise, just clean up the uploaded filename
  const filename = imageUrl.split('/').pop() || '';
  // Remove the timestamp-uniqueId prefix (everything before the first dash)
  const cleanedName = filename.replace(/^\d+-\d+\./, 'Image.');
  return cleanedName;
}

// Add global type for image metadata
declare global {
  interface Window {
    __imageMetadata?: Record<string, {originalFilename?: string}>;
  }
}

interface SiteCustomizationContentProps {
  initialActiveSection?: string;
  onActiveSectionChange?: (section: string) => void;
}

export function SiteCustomizationContent({ 
  initialActiveSection = "hero", 
  onActiveSectionChange 
}: SiteCustomizationContentProps) {
  const { toast } = useToast();
  const { showNotification } = useAdminNotification();
  // Use the provided initial section or default to hero tab
  const [activeSection, setActiveSection] = useState<string>(initialActiveSection || "hero");
  
  // Update active section when initialActiveSection prop changes
  useEffect(() => {
    if (initialActiveSection && initialActiveSection !== activeSection) {
      setActiveSection(initialActiveSection);
    }
  }, [initialActiveSection]);
  
  // Sync the active section with the parent component if needed
  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    if (onActiveSectionChange) {
      onActiveSectionChange(section);
    }
  };
  
  // Navigation Settings
  const [navigationSettings, setNavigationSettings] = useState({
    menuDropdownEnabled: true
  });
  
  // Social Media Links
  const [socialMediaLinks, setSocialMediaLinks] = useState({
    instagram: {
      enabled: true,
      url: "https://www.instagram.com/sweetmomentchocolate/",
      displayInHeader: true,
      displayInFooter: true
    },
    tiktok: {
      enabled: true,
      url: "https://www.tiktok.com/@sweetmomentchocolate",
      displayInHeader: true,
      displayInFooter: true
    },
    facebook: {
      enabled: false,
      url: "",
      displayInHeader: false,
      displayInFooter: false
    },
    twitter: {
      enabled: false,
      url: "",
      displayInHeader: false,
      displayInFooter: false
    }
  });
  
  // Size Customization Section
  const [sizeCustomization, setSizeCustomization] = useState({
    imageUrl: "",
    title: "Size Options",
    description: "Choose from our selection of premium packaging sizes"
  });

  // Contact Information Section
  const [contactInfo, setContactInfo] = useState({
    address: "123 Luxury Lane, Dubai, UAE",
    phone: "123 4567",
    areaCode: "+971 4",
    email: "info@sweetmoment.ae"
  });
  
  // Away Mode Section
  const [awayMode, setAwayMode] = useState({
    enabled: false,
    message: "We're currently on a short break! Orders are still open, but processing may be delayed.",
    showReturnDate: false,
    returnDate: "",
    disableOrders: false,
    customHeroBanner: false,
    heroBannerImage: "",
    heroBannerTitle: "Sweet Moment is Taking a Break",
    heroBannerSubtitle: "We'll be back soon with fresh chocolates and sweet treats"
  });
  
  // Theme Customization Section
  const [themeSettings, setThemeSettings] = useState({
    primary: "hsl(25, 37%, 25%)",
    variant: "professional",
    appearance: "light",
    radius: 0.5,
    font: "default",
    logo: ""
  });
  
  // Legal Information Section
  const [legalInfo, setLegalInfo] = useState({
    privacyPolicy: "",
    termsOfService: "",
    shippingPolicy: "",
    aboutUs: "",
    faqs: [
      { id: 1, question: "", answer: "" }
    ]
  });
  

  
  // Reviews Display Section
  const [reviewsSection, setReviewsSection] = useState({
    enabled: true,
    title: "What Our Customers Say",
    subtitle: "Discover why chocolate lovers choose Sweet Moment",
    displayCount: 3,
    testimonials: [
      {
        id: 1,
        text: "The most luxurious chocolate I've ever tasted. The richness and complexity of flavors is outstanding. Highly recommend!",
        author: "Elena G.",
        location: "Dubai",
        rating: 5,
        initial: "E"
      },
      {
        id: 2,
        text: "These chocolates make the perfect gift. The packaging is exquisite and the quality is unmatched.",
        author: "James B.",
        location: "London",
        rating: 5,
        initial: "J"
      },
      {
        id: 3,
        text: "Premium quality in every bite. Worth every penny for a special occasion.",
        author: "Sophia L.",
        location: "Paris",
        rating: 5,
        initial: "S"
      }
    ]
  });
  
  // Featured Products Section
  const [featuredSection, setFeaturedSection] = useState({
    enabled: true,
    title: "Featured Products",
    subtitle: "Our handpicked selection of luxurious chocolates",
    productIds: [] as string[],
    mobileProductIds: [] as string[],
    desktopProductIds: [] as string[],
    displayCount: {
      mobile: 2,  // Fixed to 2 products side by side on mobile
      desktop: 3  // Fixed to 3 products per row on desktop
    }
  });
  
  // Signature Collection Section - Use exact values that match the database
  const [signatureSection, setSignatureSection] = useState({
    enabled: true,
    title: "Our Signature Collection",
    subtitle: "Handcrafted with the finest ingredients",
    tagline: "Limited Edition - Exclusively from Dubai",
    buttonText: "Shop Now",
    buttonLink: "/menu",
    imageUrl: "" // Don't use default fallback images
  });
  
  // Social Media Menu Section - For the Instagram menu design
  const [socialMediaSection, setSocialMediaSection] = useState({
    enabled: true,
    title: "Social Media Menu",
    headerImage: "", // Image for the top of the social media menu
    description: "Customize the appearance of your social media menu"
  });
  
  // Hero Image Section
  const [heroSection, setHeroSection] = useState<{
    title: string;
    subtitle: string;
    buttonText: string;
    buttonLink: string;
    imageUrl: string;
    images: string[]; // Properly typed as string array
    autoplayInterval: number;
    cropSettings?: Record<string, Record<string, {
      objectPosition?: string;
      focalPoint?: {x: number; y: number};
    }>>; // Maps image URLs to device settings
  }>({
    title: "Luxury Dubai Chocolates",
    subtitle: "Handcrafted with the finest ingredients",
    buttonText: "Shop Now",
    buttonLink: "/menu",
    imageUrl: "", // Don't use default images
    images: [], // Start with an empty array, don't add default images
    autoplayInterval: 5000,
    cropSettings: {} // Initialize empty crop settings
  });
  
  // Track pending image removals and additions
  const [pendingRemovals, setPendingRemovals] = useState<string[]>(() => {
    try {
      // Load any saved pending removals from localStorage
      const saved = localStorage.getItem('hero-pending-removals');
      console.log("INIT: Loading saved pending removals:", saved);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load pending removals from localStorage:", e);
      return [];
    }
  });
  
  // Track images in the process of being removed for animation
  const [removingImages, setRemovingImages] = useState<string[]>([]);
  
  // State for tracking save operation
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // State for image cropping
  const [imageBeingEdited, setImageBeingEdited] = useState<string | null>(null);
  const [showImageCropper, setShowImageCropper] = useState(false);
  
  // State for selected carousel image (for preview without opening crop dialog)
  const [selectedCarouselImage, setSelectedCarouselImage] = useState<string | null>(null);
  
  // State for manual image URL input
  const [manualImageUrl, setManualImageUrl] = useState("");
  
  // Products for featured selection
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ["/api/products"],
    queryFn: async () => {
      try {
        const response = await apiRequest("/api/products", "GET");
        return response;
      } catch (error) {
        console.error("Error fetching products:", error);
        return [];
      }
    }
  });
  
  // Load existing site customization data (if available)
  const { data: siteConfig, isLoading: isLoadingSiteConfig } = useQuery({
    queryKey: ["/api/admin/site-customization"],
    queryFn: async () => {
      try {
        console.log("INITIAL LOAD: Fetching site customization data...");
        
        // First get the public site customization data which we know exists
        const publicResponse = await fetch("/api/site-customization", {
          headers: getAdminAuthHeaders()
        });
        
        if (!publicResponse.ok) {
          throw new Error(`Failed to fetch public site customization: ${publicResponse.status}`);
        }
        
        const publicData = await publicResponse.json();
        console.log("INITIAL LOAD: Public site data:", JSON.stringify(publicData, null, 2));
        
        // Now get the admin site customization data
        // Note: The admin GET endpoint was just added, so we'll handle failure gracefully
        let adminData: Record<string, any> = {};
        try {
          const adminResponse = await fetch("/api/admin/site-customization", {
            method: "GET",
            headers: getAdminAuthHeaders()
          });
          
          if (adminResponse.ok) {
            adminData = await adminResponse.json();
            console.log("INITIAL LOAD: Admin site data fetched successfully:", JSON.stringify(adminData, null, 2));
          } else {
            console.log(`INITIAL LOAD: Failed to fetch admin site customization: ${adminResponse.status}`);
            // We'll continue with just public data
          }
        } catch (error) {
          console.warn("INITIAL LOAD: Error fetching admin site customization, using only public data:", error);
        }
        
        // Merge data, giving preference to admin data
        const mergedData = { ...publicData, ...adminData };
        console.log("INITIAL LOAD: Merged data:", mergedData);
        
        // Parse the JSON strings into objects
        if (mergedData.reviewsSection) {
          try {
            mergedData.reviewsSection = JSON.parse(mergedData.reviewsSection);
            console.log("INITIAL LOAD: Parsed reviewsSection:", mergedData.reviewsSection);
          } catch (e) {
            console.error("Could not parse reviewsSection:", e);
          }
        }
        
        if (mergedData.featuredSection) {
          try {
            mergedData.featuredSection = JSON.parse(mergedData.featuredSection);
            console.log("INITIAL LOAD: Parsed featuredSection:", mergedData.featuredSection);
          } catch (e) {
            console.error("Could not parse featuredSection:", e);
          }
        }
        
        // Process hero section data from both sources
        let adminHeroSection: any = {};
        let publicHeroSection: any = {};
        let adminImages: string[] = [];
        let publicImages: string[] = [];
        
        // Parse admin hero section (TypeScript needs explicit check for existence)
        if (adminData && 'heroSection' in adminData && adminData.heroSection) {
          try {
            console.log("INITIAL LOAD: Raw admin heroSection:", adminData.heroSection);
            adminHeroSection = JSON.parse(adminData.heroSection);
            console.log("INITIAL LOAD: Parsed admin heroSection:", adminHeroSection);
            
            if (adminHeroSection.images && Array.isArray(adminHeroSection.images)) {
              adminImages = adminHeroSection.images.filter((url: any) => 
                typeof url === 'string' && url.trim() !== ''
              );
              console.log("INITIAL LOAD: Admin images:", adminImages);
            }
          } catch (e) {
            console.error("Could not parse admin heroSection:", e);
          }
        }
        
        // Parse public hero section
        if (publicData.heroSection) {
          try {
            console.log("INITIAL LOAD: Raw public heroSection:", publicData.heroSection);
            publicHeroSection = JSON.parse(publicData.heroSection);
            console.log("INITIAL LOAD: Parsed public heroSection:", publicHeroSection);
            
            if (publicHeroSection.images && Array.isArray(publicHeroSection.images)) {
              publicImages = publicHeroSection.images.filter((url: any) => 
                typeof url === 'string' && url.trim() !== ''
              );
              console.log("INITIAL LOAD: Public images:", publicImages);
            }
          } catch (e) {
            console.error("Could not parse public heroSection:", e);
          }
        }
        
        // Choose which hero section to use as base (prefer admin data)
        let baseHeroSection = adminHeroSection;
        if (Object.keys(baseHeroSection).length === 0) {
          baseHeroSection = publicHeroSection;
        }
        
        // IMPORTANT CHANGE: Don't automatically merge images from different sources
        // This was causing image deletions to be ineffective
        // Prioritize admin images, and only use public images if no admin images are available
        let finalImages: string[] = [];
        
        // Start with admin images if available
        if (adminImages.length > 0) {
          console.log(`INITIAL LOAD: Using admin-specific images (${adminImages.length} found)`);
          finalImages = [...adminImages];
        } 
        // Only use public images if we don't have admin images
        else if (publicImages.length > 0) {
          console.log(`INITIAL LOAD: Using public images as fallback (${publicImages.length} found)`);
          finalImages = [...publicImages];
        }
        // Don't add any images if both sources have empty arrays - respect the empty state
        else {
          console.log("INITIAL LOAD: Both admin and public sources have empty image arrays, respecting that");
          finalImages = [];
        }
        
        // Filter out any invalid entries
        finalImages = finalImages.filter(url => url && typeof url === 'string' && url.trim() !== '');
        
        // Remove duplicates if any exist (without losing order)
        const uniqueSet = new Set<string>();
        finalImages = finalImages.filter(url => {
          if (uniqueSet.has(url)) {
            return false;
          }
          uniqueSet.add(url);
          return true;
        });
        
        console.log("INITIAL LOAD: Final filtered images array:", finalImages);
        
        // Create the final hero section
        if (mergedData.heroSection) {
          try {
            // Parse the hero section from JSON string
            mergedData.heroSection = JSON.parse(mergedData.heroSection);
            
            // Set the images array to our filtered collection
            mergedData.heroSection.images = finalImages;
            
            // If we have no images and the main imageUrl is valid, use that
            if (finalImages.length === 0 && 
                mergedData.heroSection.imageUrl && 
                typeof mergedData.heroSection.imageUrl === 'string' && 
                mergedData.heroSection.imageUrl.trim() !== '') {
              
              console.log("INITIAL LOAD: Previously would have used main imageUrl as fallback, but now respecting empty state");
              // Don't add the main image automatically - respect when all images are explicitly removed
              // mergedData.heroSection.images = [mergedData.heroSection.imageUrl];
            }
            
            // If images array is empty, also clear the imageUrl to be consistent
            if (mergedData.heroSection.images.length === 0) {
              mergedData.heroSection.imageUrl = '';
              console.log("INITIAL LOAD: Clearing imageUrl to match empty images array");
            }
            
            // Set default autoplay interval if missing
            if (!mergedData.heroSection.autoplayInterval) {
              mergedData.heroSection.autoplayInterval = 5000;
              console.log("INITIAL LOAD: Set default autoplay interval:", mergedData.heroSection.autoplayInterval);
            }
            
            console.log("INITIAL LOAD: Final parsed heroSection:", mergedData.heroSection);
            console.log("INITIAL LOAD: Final images array:", mergedData.heroSection.images);
          } catch (e) {
            console.error("Could not process heroSection:", e);
          }
        }
        
        return mergedData;
      } catch (error) {
        console.error("Error fetching site customization:", error);
        // Return default configuration if unable to fetch
        return {
          reviewsSection,
          featuredSection,
          heroSection
        };
      }
    }
  });
  
  // Helper function to fix image paths using default fallbacks
  const ensureValidImagePaths = (images: string[], addDefaultsIfEmpty: boolean = false): string[] => {
    console.log("RAW IMAGES INPUT:", images);
    
    // Handle invalid input cases
    if (!images || !Array.isArray(images)) {
      console.log("Images input was invalid, returning empty array");
      return [];
    }
    
    // CRITICAL FIX: Always respect empty arrays and never add default images
    // This ensures when users delete all images, they stay deleted
    if (images.length === 0) {
      console.log("Images array was empty, ALWAYS respecting empty state regardless of flag");
      return [];
    }
    
    // First, filter out any images that are in the pendingRemovals list
    // Also filter out removingImages which are being animated out
    const filteredImages = images.filter(url => {
      if (pendingRemovals.includes(url)) {
        console.log(`Skipping image marked for pending removal: ${url}`);
        return false;
      }
      if (removingImages.includes(url)) {
        console.log(`Skipping image marked as currently removing: ${url}`);
        return false;
      }
      return true;
    });
    
    // If all images have been removed, return empty array
    if (filteredImages.length === 0) {
      console.log("All images were marked for removal, respecting empty state");
      return [];
    }
    
    // Map through images and only keep valid ones (don't add defaults)
    let validImages = filteredImages.map((url, index) => {
      // Skip null or undefined values
      if (!url) {
        console.log(`Skipping null/undefined image at index ${index}`);
        return null; // Will be filtered out later
      }
      
      // Check if URL starts with old path format
      if (url.startsWith('/images/')) {
        console.log(`Found old format image path: ${url} - skipping`);
        return null; // Skip
      }
      
      // If URL starts with /static/ or /uploads/, it's valid
      if (url.startsWith('/static/') || url.startsWith('/uploads/') || url.startsWith('http')) {
        console.log(`Valid image path format: ${url}`);
        return url;
      }
      
      // For unusual formats, skip
      console.log(`Skipping non-standard URL: ${url}`);
      return null; // Skip
    }).filter(url => url !== null); // Remove any null entries
    
    // If we have more than 3 images, just keep the first 3 to match the UI
    if (validImages.length > 3) {
      console.log(`Limiting carousel to first 3 images (had ${validImages.length})`);
      validImages = validImages.slice(0, 3);
    }
    
    // Remove duplicates by creating a Set and converting back to array
    const uniqueImagesSet = new Set<string>(validImages);
    const uniqueImages = Array.from(uniqueImagesSet);
    if (uniqueImages.length !== validImages.length) {
      console.log(`Removed ${validImages.length - uniqueImages.length} duplicate images`);
    }
    
    // Log the final valid images array
    console.log("Final unique valid images array:", uniqueImages);
    
    return uniqueImages;
  };

  // Initialize state with fetched data (if available)
  useEffect(() => {
    if (siteConfig) {
      // Theme settings are loaded further down
      
      // Load away mode settings
      if (siteConfig.awayMode) {
        try {
          console.log("LOAD DEBUG: Setting away mode from config:", siteConfig.awayMode);
          
          const awayModeData = JSON.parse(siteConfig.awayMode);
          setAwayMode({
            enabled: awayModeData.enabled || false,
            message: awayModeData.message || "We're currently on a short break! Orders are still open, but processing may be delayed.",
            showReturnDate: awayModeData.showReturnDate || false,
            returnDate: awayModeData.returnDate || "",
            disableOrders: awayModeData.disableOrders || false,
            customHeroBanner: awayModeData.customHeroBanner || false,
            heroBannerImage: awayModeData.heroBannerImage || "",
            heroBannerTitle: awayModeData.heroBannerTitle || "Sweet Moment is Taking a Break",
            heroBannerSubtitle: awayModeData.heroBannerSubtitle || "We'll be back soon with fresh chocolates and sweet treats"
          });
        } catch (error) {
          console.error("Failed to parse away mode settings:", error);
        }
      }
      
      // Load navigation settings
      if (siteConfig.navigationSettings) {
        try {
          console.log("LOAD DEBUG: Setting navigation settings from config:", siteConfig.navigationSettings);
          const parsedNavigationSettings = typeof siteConfig.navigationSettings === 'string'
            ? JSON.parse(siteConfig.navigationSettings)
            : siteConfig.navigationSettings;
            
          setNavigationSettings(parsedNavigationSettings);
        } catch (e) {
          console.error("Error parsing navigationSettings:", e);
        }
      }
      
      // Load social media links
      if (siteConfig.socialMediaLinks) {
        try {
          console.log("LOAD DEBUG: Setting social media links from config:", siteConfig.socialMediaLinks);
          const parsedSocialMediaLinks = typeof siteConfig.socialMediaLinks === 'string'
            ? JSON.parse(siteConfig.socialMediaLinks)
            : siteConfig.socialMediaLinks;
            
          setSocialMediaLinks(parsedSocialMediaLinks);
        } catch (e) {
          console.error("Error parsing socialMediaLinks:", e);
        }
      }
      

      
      // Load size customization settings
      if (siteConfig.sizeCustomization) {
        try {
          console.log("LOAD DEBUG: Setting size customization from config:", siteConfig.sizeCustomization);
          const parsedSizeCustomization = typeof siteConfig.sizeCustomization === 'string'
            ? JSON.parse(siteConfig.sizeCustomization)
            : siteConfig.sizeCustomization;
            
          setSizeCustomization(parsedSizeCustomization);
        } catch (e) {
          console.error("Error parsing sizeCustomization:", e);
        }
      }
      
      // Load theme settings
      if (siteConfig.themeSettings) {
        try {
          console.log("LOAD DEBUG: Setting theme customization from config:", siteConfig.themeSettings);
          const parsedThemeSettings = typeof siteConfig.themeSettings === 'string'
            ? JSON.parse(siteConfig.themeSettings)
            : siteConfig.themeSettings;
            
          // Get existing theme.json values as defaults
          const existingTheme = {
            primary: "hsl(25, 37%, 25%)",
            variant: "professional",
            appearance: "light",
            radius: 0.5,
            font: "default",
            logo: ""
          };
          
          try {
            // Try to load values from theme.json (client-side only)
            fetch('/theme.json')
              .then(res => res.json())
              .then(themeJson => {
                // Create merged theme with theme.json as base and saved settings overriding
                const mergedTheme = {
                  ...existingTheme,
                  ...themeJson,
                  ...parsedThemeSettings
                };
                
                setThemeSettings(mergedTheme);
              })
              .catch(err => {
                console.error("Error loading theme.json:", err);
                // If theme.json can't be loaded, just use the saved settings
                setThemeSettings({
                  ...existingTheme,
                  ...parsedThemeSettings
                });
              });
          } catch (err) {
            console.error("Error in theme.json loading:", err);
            // Fallback to just parsed settings
            setThemeSettings({
              ...existingTheme,
              ...parsedThemeSettings
            });
          }
        } catch (e) {
          console.error("Error parsing themeSettings:", e);
        }
      }
      
      // Load contact information
      if (siteConfig.contactInfo) {
        try {
          console.log("LOAD DEBUG: Setting contact info from config:", siteConfig.contactInfo);
          const parsedContactInfo = typeof siteConfig.contactInfo === 'string' 
            ? JSON.parse(siteConfig.contactInfo) 
            : siteConfig.contactInfo;
            
          // If we have a phone number but no areaCode, try to split it
          if (parsedContactInfo.phone && !parsedContactInfo.areaCode) {
            const fullPhone = parsedContactInfo.phone;
            console.log("Splitting phone number into area code and phone parts:", fullPhone);
            
            // Try to extract area code from existing phone number
            // Look for pattern like +XX or +XXX at the beginning or area code in parentheses
            const areaCodeMatch = fullPhone.match(/^(\+\d+\s*\d*|\(\d+\))/) || [];
            
            if (areaCodeMatch && areaCodeMatch[1]) {
              const areaCode = areaCodeMatch[1].trim();
              // Remove the area code from the phone number
              const phone = fullPhone.replace(areaCode, '').trim();
              
              parsedContactInfo.areaCode = areaCode;
              parsedContactInfo.phone = phone;
              console.log("Split phone number into areaCode:", areaCode, "and phone:", phone);
            } else {
              // If no clear area code pattern found, default to +1 and keep phone as is
              parsedContactInfo.areaCode = "+1";
              console.log("No area code pattern found, defaulting to +1");
            }
          }
          
          setContactInfo(parsedContactInfo);
        } catch (e) {
          console.error("Error parsing contactInfo:", e);
        }
      }
      
      // Load legal information
      if (siteConfig.legalInfo) {
        try {
          console.log("LOAD DEBUG: Setting legal info from config:", siteConfig.legalInfo);
          const parsedLegalInfo = typeof siteConfig.legalInfo === 'string' 
            ? JSON.parse(siteConfig.legalInfo) 
            : siteConfig.legalInfo;
          
          // Ensure our new fields exist in the loaded object
          const updatedLegalInfo = {
            privacyPolicy: parsedLegalInfo.privacyPolicy || "",
            termsOfService: parsedLegalInfo.termsOfService || "",
            shippingPolicy: parsedLegalInfo.shippingPolicy || "",
            aboutUs: parsedLegalInfo.aboutUs || "",
            faqs: parsedLegalInfo.faqs || [{ id: 1, question: "", answer: "" }]
          };
          
          setLegalInfo(updatedLegalInfo);
        } catch (e) {
          console.error("Error parsing legalInfo:", e);
        }
      }
      
      if (siteConfig.reviewsSection) {
        // Ensure testimonials array is preserved when loading from database
        const defaultTestimonials = [
          {
            id: 1,
            text: "The most luxurious chocolate I've ever tasted. The richness and complexity of flavors is outstanding. Highly recommend!",
            author: "Elena G.",
            location: "Dubai",
            rating: 5,
            initial: "E"
          },
          {
            id: 2,
            text: "These chocolates make the perfect gift. The packaging is exquisite and the quality is unmatched.",
            author: "James B.",
            location: "London",
            rating: 5,
            initial: "J"
          },
          {
            id: 3,
            text: "Premium quality in every bite. Worth every penny for a special occasion.",
            author: "Sophia L.",
            location: "Paris",
            rating: 5,
            initial: "S"
          }
        ];
        
        // Merge loaded data with default testimonials if missing
        setReviewsSection({
          ...siteConfig.reviewsSection,
          testimonials: siteConfig.reviewsSection.testimonials || defaultTestimonials
        });
      }
      if (siteConfig.featuredSection) {
        // Ensure proper initialization of all product ID arrays
        const parsedFeaturedSection = typeof siteConfig.featuredSection === 'string'
          ? JSON.parse(siteConfig.featuredSection)
          : siteConfig.featuredSection;
        
        // Initialize with the main product IDs array
        let productIds = parsedFeaturedSection.productIds || [];
        
        // Initialize separate mobile and desktop arrays if they don't exist
        const mobileIds = parsedFeaturedSection.mobileProductIds || [...productIds];
        const desktopIds = parsedFeaturedSection.desktopProductIds || [...productIds];
        
        // Ensure the display counts are always fixed to our desired values
        setFeaturedSection({
          ...parsedFeaturedSection,
          productIds: productIds,
          mobileProductIds: mobileIds,
          desktopProductIds: desktopIds,
          displayCount: {
            mobile: 2,  // Always 2 for mobile (2 side by side)
            desktop: 3  // Always 3 for desktop (3 per row)
          }
        });
        console.log("LOAD DEBUG: Setting featuredSection with fixed display counts and separate mobile/desktop product lists");
      }
      if (siteConfig.signatureSection) {
        try {
          console.log("LOAD DEBUG: Setting signature section from config:", siteConfig.signatureSection);
          const parsedSignatureSection = typeof siteConfig.signatureSection === 'string'
            ? JSON.parse(siteConfig.signatureSection)
            : siteConfig.signatureSection;
            
          // Simply use the parsed data directly to avoid default values overriding what's saved
          console.log("LOAD DEBUG: Using parsed signature section directly:", parsedSignatureSection);
          
          // Only use the parsed section data directly without any merging with defaults
          // This ensures we're using exactly what's in the database and not accidentally 
          // resetting fields with default values
          setSignatureSection(parsedSignatureSection);
        } catch (e) {
          console.error("Error parsing signatureSection:", e);
        }
      }
      
      // Load social media menu settings
      if (siteConfig.socialMediaSection) {
        try {
          console.log("LOAD DEBUG: Setting social media menu section from config:", siteConfig.socialMediaSection);
          const parsedSocialMediaSection = typeof siteConfig.socialMediaSection === 'string'
            ? JSON.parse(siteConfig.socialMediaSection)
            : siteConfig.socialMediaSection;
            
          // Use the parsed data directly
          console.log("LOAD DEBUG: Using parsed social media menu section directly:", parsedSocialMediaSection);
          
          // Set state with parsed data
          setSocialMediaSection(parsedSocialMediaSection);
        } catch (e) {
          console.error("Error parsing socialMediaSection:", e);
        }
      }
      
      if (siteConfig.heroSection) {
        // Convert from string to object if needed
        const parsedHeroSection = typeof siteConfig.heroSection === 'string'
          ? JSON.parse(siteConfig.heroSection)
          : siteConfig.heroSection;
        
        console.log("LOAD DEBUG: Setting hero section from config:", parsedHeroSection);
        
        // Ensure images array exists and is properly set
        if (!parsedHeroSection.images) {
          parsedHeroSection.images = parsedHeroSection.imageUrl ? [parsedHeroSection.imageUrl] : [];
        } else if (!Array.isArray(parsedHeroSection.images)) {
          // Convert to array if it's not already
          parsedHeroSection.images = [parsedHeroSection.images];
        }
        
        // Fix any invalid image paths
        // Use the updated function with explicit flag set to false to prevent auto-populating with defaults
        parsedHeroSection.images = ensureValidImagePaths(parsedHeroSection.images, false);
        
        // Handle main imageUrl if needed
        if (parsedHeroSection.imageUrl) {
          if (parsedHeroSection.imageUrl.startsWith('/images/')) {
            console.log(`Invalid old format main image: ${parsedHeroSection.imageUrl}, clearing it`);
            parsedHeroSection.imageUrl = '';
          } else if (!parsedHeroSection.imageUrl.startsWith('/uploads/') && 
                     !parsedHeroSection.imageUrl.startsWith('/static/')) {
            console.log(`Invalid format main image: ${parsedHeroSection.imageUrl}, clearing it`);
            parsedHeroSection.imageUrl = '';
          }
        }
        
        // If we have a valid image in the images array but no imageUrl, use the first image
        if (!parsedHeroSection.imageUrl && 
            parsedHeroSection.images && 
            parsedHeroSection.images.length > 0) {
          parsedHeroSection.imageUrl = parsedHeroSection.images[0];
        }
        
        console.log("LOAD DEBUG: Processed images array:", parsedHeroSection.images);
        
        // Set the state with the properly processed hero section
        setHeroSection(parsedHeroSection);
      }
    }
  }, [siteConfig]);
  
  // Save site customization changes and sync with homepage in real-time
  const handleSaveChanges = async () => {
    try {
      // Set saving state to true to show the spinner
      setIsSaving(true);
      
      showNotification({
        title: "Saving Changes",
        message: "Saving changes and syncing with homepage...",
        variant: "info"
      });
      
      // First, fetch the latest site customization data to ensure we have the most up-to-date images
      console.log("Fetching current site customization before saving...");
      const currentResponse = await fetch("/api/site-customization", {
        headers: getAdminAuthHeaders()
      });
      
      if (!currentResponse.ok) {
        throw new Error(`Failed to fetch current site customization: ${currentResponse.status}`);
      }
      
      // Get the current data from the server
      const currentData = await currentResponse.json();
      let currentHeroSection = {};
      let existingImages: string[] = [];
      
      // Parse the current hero section if it exists
      if (currentData.heroSection) {
        try {
          currentHeroSection = JSON.parse(currentData.heroSection);
          if (currentHeroSection && (currentHeroSection as any).images) {
            existingImages = (currentHeroSection as any).images;
            console.log("Found existing hero images on server:", existingImages);
          }
        } catch (e) {
          console.error("Could not parse existing heroSection:", e);
        }
      }
      
      // First, ensure images array exists with at least the main image
      const updatedHeroSection = {
        ...heroSection,
        images: Array.isArray(heroSection.images) && heroSection.images.length > 0 
          ? [...heroSection.images] // Create a new array to avoid reference issues
          : (heroSection.imageUrl ? [heroSection.imageUrl] : [])
      };
      
      // Make sure there are no duplicates in the images array and respect removals
      const uniqueImages = new Set<string>();
      
      // IMPORTANT: Track which images should be excluded (those in pendingRemovals)
      console.log("Pending image removals to respect:", pendingRemovals);
      
      // Start with our current component state as the source of truth
      if (Array.isArray(updatedHeroSection.images)) {
        updatedHeroSection.images.forEach((url: string) => {
          if (typeof url === 'string' && url.trim() !== '' && !pendingRemovals.includes(url)) {
            uniqueImages.add(url);
            console.log(`Added current image to merged set: ${url}`);
          } else if (pendingRemovals.includes(url)) {
            console.log(`Skipping removed image: ${url}`);
          }
        });
      }
      
      // Only add images from the server that aren't in pendingRemovals
      // and aren't already in our current state
      if (Array.isArray(existingImages)) {
        existingImages.forEach((url: any) => {
          if (typeof url === 'string' && 
              url.trim() !== '' && 
              !pendingRemovals.includes(url) && 
              !updatedHeroSection.images.includes(url)) {
            uniqueImages.add(url);
            console.log(`Added existing server image to merged set: ${url}`);
          } else if (pendingRemovals.includes(url)) {
            console.log(`Skipping server image marked for removal: ${url}`);
          }
        });
      }
      
      // Convert set back to array
      updatedHeroSection.images = Array.from(uniqueImages);
      
      console.log("Current heroSection state:", heroSection);
      console.log("Merged and cleaned images array:", updatedHeroSection.images);
      console.log("Saving site customization with hero section:", updatedHeroSection);
      
      // Convert each section to JSON string - ensuring proper serialization 
      const navigationSettingsString = JSON.stringify(navigationSettings);
      const sizeCustomizationString = JSON.stringify(sizeCustomization);
      const socialMediaLinksString = JSON.stringify(socialMediaLinks);
      
      // Prepare the contactInfo for saving
      // Store areaCode and phone separately without combining them
      const contactInfoToSave = {
        ...contactInfo,
        // Keep phone as-is without prepending the areaCode
        phone: contactInfo.phone ? contactInfo.phone.replace(/^\+1\s*/, '') : contactInfo.phone
      };
      const contactInfoString = JSON.stringify(contactInfoToSave);
      
      const legalInfoString = JSON.stringify(legalInfo);
      
      // Prepare Away Mode settings for saving
      const awayModeString = JSON.stringify(awayMode);
      console.log("Saving away mode settings:", awayModeString);
      
      const reviewsSectionString = JSON.stringify(reviewsSection);
      
      // Ensure featured products always use the desired display settings
      // and preserve the separate mobile and desktop product arrays
      const enhancedFeaturedSection = {
        ...featuredSection,
        // Ensure all product arrays are explicitly included
        productIds: featuredSection.productIds || [],
        mobileProductIds: featuredSection.mobileProductIds || [],
        desktopProductIds: featuredSection.desktopProductIds || [],
        displayCount: {
          mobile: 2,  // Fixed to 2 for mobile (2 side by side)
          desktop: 3  // Fixed to 3 for desktop (3 per row)
        }
      };
      console.log("Saving featured section with device-specific product lists:", enhancedFeaturedSection);
      const featuredSectionString = JSON.stringify(enhancedFeaturedSection);
      
      // Parse the current signature section data from the server if it exists
      let currentSignatureSection = {};
      if (currentData.signatureSection) {
        try {
          currentSignatureSection = JSON.parse(currentData.signatureSection);
          console.log("Found existing signature section on server:", currentSignatureSection);
        } catch (e) {
          console.error("Could not parse existing signatureSection:", e);
        }
      }
      
      // Create an updated signature section that correctly merges server and client state
      // IMPORTANT: We need to apply the server data first as base, then override with client changes
      // This ensures our edited values take precedence but we don't lose other properties that might exist in the DB
      const updatedSignatureSection = {
        // First apply existing server data as the base
        ...currentSignatureSection,
        
        // Then apply our current state to ensure our edits take precedence
        enabled: signatureSection.enabled,
        title: signatureSection.title,
        subtitle: signatureSection.subtitle,
        tagline: signatureSection.tagline,
        buttonText: signatureSection.buttonText,
        buttonLink: signatureSection.buttonLink,
        imageUrl: signatureSection.imageUrl
      };
      
      console.log("Original server signatureSection:", currentSignatureSection);
      console.log("Current form signatureSection:", signatureSection);
      console.log("Merged updatedSignatureSection:", updatedSignatureSection);
      
      // Ensure we're using a clean JSON string with no formatting issues
      const signatureSectionString = JSON.stringify(updatedSignatureSection);
      const heroSectionString = JSON.stringify(updatedHeroSection);
      
      // Create a timestamp for cache-busting
      // We'll use Date.now() directly in the API calls
      
      // IMPORTANT: Make sure we're passing any pending removals to the server
      console.log("Pending image removals to send to server:", pendingRemovals);
      
      // Save navigationSettings
      console.log("Saving navigationSettings...");
      await fetch("/api/admin/site-customization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store",
          ...getAdminAuthHeaders()
        },
        body: JSON.stringify({ 
          key: "navigationSettings", 
          value: navigationSettingsString,
          timestamp: Date.now()
        })
      });
      
      // Save sizeCustomization
      console.log("Saving sizeCustomization...");
      await fetch("/api/admin/site-customization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store",
          ...getAdminAuthHeaders()
        },
        body: JSON.stringify({ 
          key: "sizeCustomization", 
          value: sizeCustomizationString,
          timestamp: Date.now()
        })
      });
      
      // Save socialMediaLinks
      console.log("Saving socialMediaLinks...");
      await fetch("/api/admin/site-customization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store",
          ...getAdminAuthHeaders()
        },
        body: JSON.stringify({ 
          key: "socialMediaLinks", 
          value: socialMediaLinksString,
          timestamp: Date.now()
        })
      });
      
      // Save contactInfo
      console.log("Saving contactInfo...");
      await fetch("/api/admin/site-customization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store",
          ...getAdminAuthHeaders()
        },
        body: JSON.stringify({ 
          key: "contactInfo", 
          value: contactInfoString,
          timestamp: Date.now()
        })
      });
      
      // Save legalInfo
      console.log("Saving legalInfo...");
      await fetch("/api/admin/site-customization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store",
          ...getAdminAuthHeaders()
        },
        body: JSON.stringify({ 
          key: "legalInfo", 
          value: legalInfoString,
          timestamp: Date.now()
        })
      });
      
      // Save theme settings
      console.log("Saving theme settings...");
      const themeSettingsString = JSON.stringify(themeSettings);
      await fetch("/api/admin/site-customization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store",
          ...getAdminAuthHeaders()
        },
        body: JSON.stringify({ 
          key: "themeSettings", 
          value: themeSettingsString,
          timestamp: Date.now()
        })
      });
      
      // Save awayMode settings
      console.log("Saving awayMode settings...");
      await fetch("/api/admin/site-customization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store",
          ...getAdminAuthHeaders()
        },
        body: JSON.stringify({ 
          key: "awayMode", 
          value: awayModeString,
          timestamp: Date.now()
        })
      });
      
      // Save reviewsSection
      console.log("Saving reviewsSection...");
      await fetch("/api/admin/site-customization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store",
          ...getAdminAuthHeaders()
        },
        body: JSON.stringify({ 
          key: "reviewsSection", 
          value: reviewsSectionString,
          timestamp: Date.now()
        })
      });
      
      // Save featuredSection
      console.log("Saving featuredSection...");
      await fetch("/api/admin/site-customization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store",
          ...getAdminAuthHeaders()
        },
        body: JSON.stringify({ 
          key: "featuredSection", 
          value: featuredSectionString,
          timestamp: Date.now()
        })
      });
      
      // Save signatureSection and sync with homepage
      console.log("Saving signatureSection...");
      console.log("Using updatedSignatureSection:", updatedSignatureSection);
      const signatureResponse = await fetch("/api/admin/site-customization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store",
          ...getAdminAuthHeaders()
        },
        body: JSON.stringify({ 
          key: "signatureSection", 
          value: signatureSectionString,
          timestamp: Date.now()
        })
      });
      
      // Save socialMediaSection for the Instagram menu
      console.log("Saving socialMediaSection...");
      const socialMediaSectionString = JSON.stringify(socialMediaSection);
      console.log("Using socialMediaSection:", socialMediaSection);
      
      const socialMediaResponse = await fetch("/api/admin/site-customization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store",
          ...getAdminAuthHeaders()
        },
        body: JSON.stringify({ 
          key: "socialMediaSection", 
          value: socialMediaSectionString,
          timestamp: Date.now()
        })
      });
      
      if (!socialMediaResponse.ok) {
        console.error("Failed to save social media section");
      }
      
      if (!signatureResponse.ok) {
        console.error("Failed to save signature section");
      } else {
        // Call refresh-homepage-content to make sure the homepage sees the updates
        try {
          console.log("Refreshing homepage content to apply signature section changes...");
          const refreshResponse = await fetch("/api/refresh-homepage-content", {
            headers: {
              "Cache-Control": "no-cache, no-store",
              "Pragma": "no-cache",
              ...getAdminAuthHeaders()
            }
          });
          
          if (refreshResponse.ok) {
            console.log("Homepage content refreshed with new signature section data");
          } else {
            console.error("Failed to refresh homepage content:", await refreshResponse.text());
          }
        } catch (error) {
          console.error("Error refreshing homepage content:", error);
        }
      }
      
      // Save heroSection and sync with live site - pass pendingRemovals to ensure they are respected
      console.log("Saving heroSection...");
      console.log("heroSection images before save:", updatedHeroSection.images);
      console.log("pendingRemovals to be sent with save request:", pendingRemovals);
      
      // Double check images array is valid before saving
      if (!updatedHeroSection.images || !Array.isArray(updatedHeroSection.images)) {
        console.log("CRITICAL FIX: Images array is invalid, creating a new empty array");
        updatedHeroSection.images = [];  // Create empty array, don't auto-populate
      }
      
      // Do NOT automatically add images back - respect the empty array state
      // If all images were deleted, make sure imageUrl is also cleared
      if (updatedHeroSection.images.length === 0) {
        console.log("IMPORTANT: Empty images array detected, clearing imageUrl as well");
        updatedHeroSection.imageUrl = '';
      }
      
      console.log("Final heroSection images for sync:", updatedHeroSection.images);
      
      // Use our sync function to save the hero section and invalidate caches
      const syncSuccess = await syncWithHomepage(updatedHeroSection);
      
      if (!syncSuccess) {
        throw new Error("Failed to sync hero section with homepage");
      }
      
      // Verify the changes worked by fetching latest data
      console.log("Verifying saved site customization data...");
      const verifyResponse = await fetch("/api/site-customization");
      
      if (verifyResponse.ok) {
        const latestData = await verifyResponse.json();
        
        // Check all sections were saved properly
        if (latestData.heroSection) {
          const parsedHeroSection = JSON.parse(latestData.heroSection);
          console.log("✅ Verified saved hero section:", parsedHeroSection);
          
          if (parsedHeroSection.images && Array.isArray(parsedHeroSection.images)) {
            console.log(`✅ Verified ${parsedHeroSection.images.length} images were saved correctly:`, 
                      parsedHeroSection.images);
          }
        }
      }
      
      // Set state to match what was saved (in case server modified anything)
      setHeroSection(updatedHeroSection);
      setSignatureSection(updatedSignatureSection);
      
      // Clear localStorage cache to ensure fresh data
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (
            key.includes('hero') || 
            key.includes('carousel') || 
            key.includes('image') || 
            key.includes('site-customization') ||
            key.includes('react-query')
          )) {
            console.log(`Clearing potentially stale localStorage key: ${key}`);
            localStorage.removeItem(key);
          }
        }
      } catch (e) {
        console.error("Error clearing localStorage:", e);
      }
      
      // Invalidate all relevant cache entries to ensure updated content is displayed
      console.log("Invalidating cache for site customization...");
      queryClient.invalidateQueries({ queryKey: ['/api/site-customization'] });
      queryClient.invalidateQueries({ queryKey: ['/api/home-settings'] });
      
      // Force browser to reload the data with direct fetch and cache busting
      try {
        // Force a direct fetch with cache busting to ensure the homepage gets fresh data
        const refreshTimestamp = Date.now();
        
        // First call the refresh-homepage-content endpoint to update the server-side data
        console.log("Calling refresh-homepage-content endpoint to update server-side data...");
        const refreshResponse = await fetch(`/api/refresh-homepage-content`, {
          headers: {
            "Cache-Control": "no-cache, no-store",
            "Pragma": "no-cache"
          }
        });
        
        if (refreshResponse.ok) {
          console.log("Successfully refreshed homepage content on server");
        } else {
          console.warn("Failed to refresh homepage content on server");
        }
        
        // Then refresh the local site customization data
        const response = await fetch(`/api/site-customization?t=${refreshTimestamp}`, {
          headers: {
            "Cache-Control": "no-cache, no-store",
            "Pragma": "no-cache"
          }
        });
        
        if (response.ok) {
          console.log("Successfully refreshed site customization data.");
        }
      } catch (error) {
        console.error("Error refreshing site customization data:", error);
      }
      
      // Show success notification
      showNotification({
        title: "Changes Saved",
        message: "Your changes have been saved and synced with the homepage.",
        variant: "success"
      });
      
      // Reset the saving state
      setIsSaving(false);
    } catch (error) {
      console.error("Error saving site customization:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Unknown error occurred";
      
      showNotification({
        title: "Error",
        message: `Failed to save changes: ${errorMessage}. Please try again.`,
        variant: "error"
      });
      
      // Reset the saving state in case of error
      setIsSaving(false);
    }
  };
  
  // Handle editing a carousel image
  const handleEditCarouselImage = (imageUrl: string) => {
    console.log(`Editing image: ${imageUrl}`);
    setImageBeingEdited(imageUrl);
    setShowImageCropper(true);
  };
  
  // Handle completing image crop
  // State for device-specific cropping mode
  const [cropDevice, setCropDevice] = useState<'mobile' | 'desktop'>('mobile');
  
  const handleCropComplete = async (croppedImageUrl: string, cropInfo?: any, originalImage?: string) => {
    if (!imageBeingEdited || !croppedImageUrl) {
      console.error("Missing required image data for crop completion");
      return;
    }
    
    console.log(`Replacing image ${imageBeingEdited} with cropped version`);
    console.log(`Device type: ${cropInfo?.deviceType}, Focal point:`, cropInfo?.focalPoint);
    
    // Get current crop settings or create new object
    const updatedHeroSection = { ...heroSection };
    
    // Initialize cropSettings object if it doesn't exist
    if (!updatedHeroSection.cropSettings) {
      updatedHeroSection.cropSettings = {};
    }
    
    // Initialize image entry if it doesn't exist
    if (!updatedHeroSection.cropSettings[imageBeingEdited]) {
      updatedHeroSection.cropSettings[imageBeingEdited] = {};
    }
    
    // Store the device-specific crop settings
    if (cropInfo?.deviceType) {
      updatedHeroSection.cropSettings[imageBeingEdited][cropInfo.deviceType] = {
        focalPoint: cropInfo.focalPoint,
        objectPosition: cropInfo.objectPosition
      };
      
      // Update the hero section state with new crop settings
      setHeroSection(updatedHeroSection);
    }
    
    try {
      // Create a fetch request to upload the base64 image
      const response = await fetch('/api/admin/upload-base64', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAdminAuthHeaders()
        },
        body: JSON.stringify({
          image: croppedImageUrl,
          originalPath: imageBeingEdited // Pass the original path for potential optimization
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to upload cropped image: ${response.status}`);
      }
      
      const data = await response.json();
      const newImageUrl = data.url;
      
      // Update the image in heroSection
      const updatedImages = [...heroSection.images];
      const imageIndex = updatedImages.findIndex(img => img === imageBeingEdited);
      
      if (imageIndex !== -1) {
        updatedImages[imageIndex] = newImageUrl;
        
        // Also update primaryImage if necessary
        let updatedImageUrl = heroSection.imageUrl;
        if (heroSection.imageUrl === imageBeingEdited) {
          updatedImageUrl = newImageUrl;
        }
        
        // Create or update crop settings for this image
        const existingCropSettings = heroSection.cropSettings || {};
        
        // Define type for crop settings to fix type errors
        interface CropSetting {
          focalPoint?: { x: number; y: number };
          objectPosition?: string;
        }
        
        interface CropSettings {
          [imageUrl: string]: {
            [deviceType: string]: CropSetting;
          };
        }
        
        // Save the focal point or object position to cropSettings
        const updatedCropSettings: CropSettings = {
          ...existingCropSettings as CropSettings,
          [newImageUrl]: {
            ...(existingCropSettings[newImageUrl as string] || {}),
            [cropDevice]: cropInfo?.focalPoint 
              ? { focalPoint: cropInfo.focalPoint } 
              : { objectPosition: cropInfo?.objectPosition || 'center center' }
          }
        };
        
        // If we're updating an image URL and had crop settings for the old URL, transfer them
        if (imageBeingEdited !== newImageUrl && existingCropSettings[imageBeingEdited as string]) {
          // Copy any device settings we're not currently editing
          const devicesToTransfer = cropDevice === 'mobile' ? ['desktop'] : ['mobile'];
          devicesToTransfer.forEach(device => {
            if (existingCropSettings[imageBeingEdited as string]?.[device]) {
              if (!updatedCropSettings[newImageUrl]) {
                updatedCropSettings[newImageUrl] = {};
              }
              updatedCropSettings[newImageUrl][device] = existingCropSettings[imageBeingEdited as string][device];
            }
          });
          
          // Remove old image's crop settings
          delete updatedCropSettings[imageBeingEdited as string];
        }
        
        console.log('Updated crop settings:', updatedCropSettings);
        
        const updatedHeroSection = {
          ...heroSection,
          images: updatedImages,
          imageUrl: updatedImageUrl,
          cropSettings: updatedCropSettings
        };
        
        setHeroSection(updatedHeroSection);
        
        // Sync with homepage
        const success = await syncWithHomepage(updatedHeroSection);
        if (success) {
          showNotification({
            title: "Image Updated",
            message: "The carousel image has been recropped successfully",
            variant: "success"
          });
        } else {
          showNotification({
            title: "Update Pending",
            message: "Image updated but not yet synced. Click 'Save Changes' to apply.",
            variant: "info"
          });
        }
      }
    } catch (error) {
      console.error("Error updating cropped image:", error);
      showNotification({
        title: "Error",
        message: "Failed to update cropped image. Please try again.",
        variant: "error"
      });
    } finally {
      // Reset state
      setImageBeingEdited(null);
      setShowImageCropper(false);
    }
  };

  // Remove an image from the carousel and live sync with homepage
  const handleRemoveHeroImage = async (imageUrl: string) => {
    console.log("Removing hero image:", imageUrl);
    
    // Show a loading notification
    showNotification({
      title: "Removing Image",
      message: "Removing image and syncing with homepage...",
      variant: "info"
    });
    
    // Add the image to the removing list to trigger animation
    setRemovingImages(prev => [...prev, imageUrl]);
    
    try {
      // Direct server call without pendingRemovals logic
      // This ensures immediate database update without relying on local state
      const response = await fetch("/api/admin/site-customization/remove-hero-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAdminAuthHeaders()
        },
        body: JSON.stringify({ imageUrl })
      });
      
      if (!response.ok) {
        // Parse error response if possible
        try {
          const errorData = await response.json();
          
          // Special handling for "image not found" errors
          if (response.status === 404 && errorData.error === 'image_not_found') {
            console.log("Image not found in carousel. Available images:", errorData.existingImages);
            
            // Update local state with the actual images from the server to ensure sync
            if (errorData.heroSection) {
              console.log("Updating local heroSection with server data:", errorData.heroSection);
              setHeroSection(errorData.heroSection);
              
              // Show notification with improved message
              showNotification({
                title: "Image Already Removed",
                message: "The image was not found in the carousel. Your display has been updated to show current images.",
                variant: "info"
              });
              
              // Clear animation state for removed image
              setRemovingImages(prev => prev.filter(img => img !== imageUrl));
              
              // Force refresh queries
              queryClient.invalidateQueries({ queryKey: ["/api/admin/site-customization"] });
              queryClient.invalidateQueries({ queryKey: ["/api/site-customization"] });
              
              // Return early since we've handled this specific case
              return;
            }
          }
          
          // General error handling for other cases
          if (response.status === 400) {
            throw new Error(errorData.message || "Invalid request");
          } else if (response.status === 404) {
            throw new Error("Image not found. It may have already been removed.");
          } else {
            throw new Error(errorData.message || `Server error: ${response.status}`);
          }
        } catch (parseError) {
          // If we can't parse the response, fall back to generic error
          console.error("Failed to parse error response:", parseError);
          throw new Error(`Server error: ${response.status}`);
        }
      }
      
      // Get the updated hero section from the response
      const result = await response.json();
      console.log("Server returned updated hero section:", result.heroSection);
      
      // Update local state with the hero section returned from the server
      setHeroSection(result.heroSection);
      
      // Clear any pending removals
      setPendingRemovals([]);
      localStorage.removeItem('hero-pending-removals');
      
      // Remove the image from the removing animations list after a delay
      setTimeout(() => {
        setRemovingImages(prev => prev.filter(img => img !== imageUrl));
      }, 600);
      
      // Show success notification
      showNotification({
        title: "Image Removed",
        message: "The image has been successfully removed and synced with the homepage.",
        variant: "success"
      });
      
      // Force a refresh of the site customization data to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["/api/admin/site-customization"] });
      queryClient.invalidateQueries({ queryKey: ["/api/site-customization"] });
      
      // Verify the image was actually removed by checking the returned data
      if (result.heroSection.images && result.heroSection.images.includes(imageUrl)) {
        console.error("Image was not actually removed despite successful response!");
        
        // Make one more attempt to remove it
        await fetch("/api/admin/site-customization/remove-hero-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAdminAuthHeaders()
          },
          body: JSON.stringify({ imageUrl })
        });
        
        // Refresh the queries again
        queryClient.invalidateQueries({ queryKey: ["/api/admin/site-customization"] });
        queryClient.invalidateQueries({ queryKey: ["/api/site-customization"] });
      }
      
    } catch (error) {
      console.error("Error removing hero image:", error);
      
      // Show error notification
      showNotification({
        title: "Error Removing Image",
        message: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "error" 
      });
      
      // Remove the image from the removing animations list
      setRemovingImages(prev => prev.filter(img => img !== imageUrl));
      
      // Clear any pending removals to ensure clean state
      setPendingRemovals([]);
      localStorage.removeItem('hero-pending-removals');
      
      // Re-fetch the latest data from server to ensure UI is in sync
      queryClient.invalidateQueries({ queryKey: ["/api/admin/site-customization"] });
      queryClient.invalidateQueries({ queryKey: ["/api/site-customization"] });
    }
  };
  
  // Handle featured products selection
  const handleFeaturedProductChange = (productId: string, checked: boolean, deviceType: 'mobile' | 'desktop') => {
    if (deviceType === 'mobile') {
      if (checked) {
        setFeaturedSection({
          ...featuredSection,
          mobileProductIds: [...featuredSection.mobileProductIds, productId],
          // Also update the common productIds list for backward compatibility
          productIds: [...featuredSection.productIds, productId]
        });
      } else {
        setFeaturedSection({
          ...featuredSection,
          mobileProductIds: featuredSection.mobileProductIds.filter((id: string) => id !== productId),
          // Also update the common productIds list for backward compatibility
          productIds: featuredSection.productIds.filter((id: string) => id !== productId)
        });
      }
    } else if (deviceType === 'desktop') {
      if (checked) {
        setFeaturedSection({
          ...featuredSection,
          desktopProductIds: [...featuredSection.desktopProductIds, productId],
          // Also update the common productIds list for backward compatibility
          productIds: [...featuredSection.productIds, productId]
        });
      } else {
        setFeaturedSection({
          ...featuredSection,
          desktopProductIds: featuredSection.desktopProductIds.filter((id: string) => id !== productId),
          // Also update the common productIds list for backward compatibility
          productIds: featuredSection.productIds.filter((id: string) => id !== productId)
        });
      }
    }
  };
  
  // Handle hero image upload for main image with live sync
  const handleHeroImageUpload = async (imageUrl: string) => {
    // Show loading notification
    showNotification({
      title: "Updating Primary Image",
      message: "Setting primary image and syncing with homepage...",
      variant: "info"
    });
    
    // Add the image to the images array if it's not already there
    let updatedImages = [...heroSection.images];
    if (!updatedImages.includes(imageUrl)) {
      updatedImages = [imageUrl, ...updatedImages];
    }
    
    // Create updated hero section
    const newHeroSection = {
      ...heroSection,
      imageUrl,
      images: updatedImages
    };
    
    // Update local state
    setHeroSection(newHeroSection);
    
    // Sync with homepage
    const syncSuccess = await syncWithHomepage(newHeroSection);
    
    if (syncSuccess) {
      showNotification({
        title: "Primary Image Updated",
        message: "The primary image has been updated and synced with the homepage",
        variant: "success"
      });
    } else {
      showNotification({
        title: "Primary Image Updated (Sync Failed)",
        message: "The primary image was updated but syncing failed. Try clicking 'Save Changes'.",
        variant: "warning"
      });
    }
  };
  
  // Handle signature collection image upload
  const handleSignatureImageUpload = async (imageUrl: string) => {
    // Set saving state to show loading indicator
    setIsSaving(true);
    
    showNotification({
      title: "Updating Signature Collection Image",
      message: "Setting signature collection image and saving changes...",
      variant: "info"
    });
    
    try {
      // Create a temporary Image object to verify the image loads correctly
      const img = new Image();
      const imageLoadPromise = new Promise((resolve, reject) => {
        img.onload = () => resolve(true);
        img.onerror = () => reject(new Error("Failed to load image"));
        
        // Add cache-busting parameter to force refresh
        if (imageUrl.includes('?')) {
          img.src = `${imageUrl}&t=${Date.now()}`;
        } else {
          img.src = `${imageUrl}?t=${Date.now()}`;
        }
      });
      
      // Wait for image to load with 5 second timeout
      try {
        await Promise.race([
          imageLoadPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error("Image load timeout")), 5000))
        ]);
        console.log("Image loaded successfully before saving");
      } catch (imgError) {
        console.warn("Image pre-verification failed, but continuing:", imgError);
        // We'll continue anyway and let the server handle it
      }
      
      // Get current signature section data from server if available
      let currentSignatureSection = {};
      try {
        const siteCustomization = await fetch("/api/site-customization", {
          headers: {
            "Cache-Control": "no-cache, no-store",
            "Pragma": "no-cache"
          }
        }).then(r => r.json());
        
        if (siteCustomization && siteCustomization.signatureSection) {
          currentSignatureSection = JSON.parse(siteCustomization.signatureSection);
          console.log("Fetched current server signatureSection:", currentSignatureSection);
        }
      } catch (error) {
        console.error("Error fetching current signature section from server:", error);
      }
      
      // Create the updated signature section by explicitly setting all properties
      // This ensures we preserve server-side data while properly updating the image
      const updatedSignatureSection = {
        // First apply existing server data as the base
        ...currentSignatureSection,
        
        // Then apply our current state to ensure latest values take precedence
        enabled: signatureSection.enabled,
        title: signatureSection.title,
        subtitle: signatureSection.subtitle,
        tagline: signatureSection.tagline,
        buttonText: signatureSection.buttonText,
        buttonLink: signatureSection.buttonLink,
        
        // Finally apply the new image URL which is the primary purpose of this update
        imageUrl
      };
      
      console.log("Original server signatureSection:", currentSignatureSection);
      console.log("Current form signatureSection:", signatureSection);
      console.log("Merged updatedSignatureSection with new image:", updatedSignatureSection);
      
      // Update local state with the properly merged data
      setSignatureSection(updatedSignatureSection);
      
      // Immediately save the change to the server
      const signatureSectionString = JSON.stringify(updatedSignatureSection);
      
      // Save signatureSection directly and sync with homepage
      console.log("Immediately saving signatureSection...");
      const response = await fetch("/api/admin/site-customization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store",
          "Pragma": "no-cache",
          ...getAdminAuthHeaders()
        },
        body: JSON.stringify({ 
          key: "signatureSection", 
          value: signatureSectionString,
          timestamp: Date.now()
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save signature section: ${response.status}`);
      }
      
      // Call refresh-homepage-content to make sure the homepage sees the updates
      try {
        console.log("Refreshing homepage content to apply signature section changes...");
        const refreshResponse = await fetch("/api/refresh-homepage-content", {
          headers: {
            "Cache-Control": "no-cache, no-store",
            "Pragma": "no-cache",
            ...getAdminAuthHeaders()
          }
        });
        
        if (refreshResponse.ok) {
          console.log("Homepage content refreshed with new signature section data");
          
          // Invalidate queries to ensure UI updates
          queryClient.invalidateQueries({ queryKey: ["/api/site-customization"] });
        } else {
          console.error("Failed to refresh homepage content:", await refreshResponse.text());
        }
      } catch (error) {
        console.error("Error refreshing homepage content:", error);
      }
      
      // Force invalidate all relevant caches
      console.log("Invalidating caches after signature section update...");
      queryClient.invalidateQueries({ queryKey: ['/api/site-customization'] });
      queryClient.invalidateQueries({ queryKey: ['/api/home-settings'] });
      
      // Force a page reload of the site customization data with explicit cache busting
      console.log("Forcing data refresh after signature section update...");
      
      // Call our new special endpoint that performs server-side refreshes
      try {
        console.log("Calling refresh-homepage-content to update image URLs in database...");
        const homepageRefreshResponse = await fetch(`/api/refresh-homepage-content?t=${Date.now()}`, {
          headers: {
            "Cache-Control": "no-cache, no-store",
            "Pragma": "no-cache"
          }
        });
        
        if (homepageRefreshResponse.ok) {
          console.log("Homepage content refresh succeeded");
        } else {
          console.error("Homepage content refresh failed:", await homepageRefreshResponse.text());
        }
      } catch (homepageRefreshError) {
        console.error("Error refreshing homepage content:", homepageRefreshError);
      }
      
      // Try to use the refresh-signature-section endpoint first
      try {
        // Add delay to ensure database has time to complete the previous write operation
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log("Calling refresh-signature-section endpoint with timestamp:", Date.now());
        const refreshResponse = await fetch(`/api/refresh-signature-section`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store",
            "Pragma": "no-cache",
            ...getAdminAuthHeaders()
          },
          body: JSON.stringify({ 
            timestamp: Date.now(),
            imageUrl: signatureSection.imageUrl 
          })
        });
        
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          console.log("Signature section refreshed successfully:", refreshData);
          
          // If the refresh was successful, update our local state with the returned data
          if (refreshData.data) {
            // Update the signature section with the refreshed data including cache busting
            // While preserving any user changes that haven't been saved yet
            setSignatureSection(prevState => ({
              ...prevState, // Keep current user changes
              ...refreshData.data, // Apply refreshed server data with timestamps
            }));
            
            // Invalidate all queries to force new data to load everywhere
            queryClient.invalidateQueries();
          }
        } else {
          // If refresh failed, log the response
          const errorText = await refreshResponse.text();
          console.error("Refresh signature section failed:", refreshResponse.status, errorText);
          
          // Try the general force-refresh endpoint as fallback
          console.log("Falling back to general refresh");
          await fetch(`/api/force-refresh`, {
            method: "POST",
            headers: {
              "Cache-Control": "no-cache, no-store",
              "Pragma": "no-cache",
              ...getAdminAuthHeaders()
            },
            body: JSON.stringify({ timestamp: Date.now() })
          });
        }
      } catch (refreshError) {
        console.error("Refresh endpoints failed with error:", refreshError);
      }
      
      // Add additional delay for database consistency
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Then also do a direct fetch with cache busting to ensure the home page gets fresh data
      try {
        console.log("Performing direct cache-busted fetch to ensure fresh data");
        const directResponse = await fetch(`/api/site-customization?t=${Date.now()}`, {
          headers: {
            "Cache-Control": "no-cache, no-store",
            "Pragma": "no-cache"
          }
        });
        
        if (directResponse.ok) {
          console.log("Direct cache-busted fetch succeeded");
        } else {
          console.warn("Direct cache-busted fetch returned status:", directResponse.status);
        }
      } catch (directFetchError) {
        console.error("Direct fetch failed:", directFetchError);
      }
      
      showNotification({
        title: "Signature Collection Image Updated",
        message: "The image has been updated and changes have been saved.",
        variant: "success"
      });
      
      // Reset saving state on success
      setIsSaving(false);
    } catch (error) {
      console.error("Error updating signature collection image:", error);
      showNotification({
        title: "Error",
        message: "Failed to update signature collection image. Please try again.",
        variant: "error"
      });
      
      // Reset saving state on error
      setIsSaving(false);
    }
  };
  
  // Handle size customization image upload
  const handleSizeCustomizationImageUpload = async (imageUrl: string) => {
    // Set saving state to show loading indicator
    setIsSaving(true);
    
    showNotification({
      title: "Updating Size Customization Image",
      message: "Setting size customization image and saving changes...",
      variant: "info"
    });
    
    try {
      // Update size customization with new image
      const updatedSizeCustomization = {
        ...sizeCustomization,
        imageUrl
      };
      
      // Update local state
      setSizeCustomization(updatedSizeCustomization);
      
      // Immediately save the change to the server
      const sizeCustomizationString = JSON.stringify(updatedSizeCustomization);
      const sizeTimestamp = Date.now(); // For cache busting
      
      // Save sizeCustomization directly
      console.log("Immediately saving sizeCustomization...");
      const response = await fetch("/api/admin/site-customization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store",
          "Pragma": "no-cache",
          ...getAdminAuthHeaders()
        },
        body: JSON.stringify({ 
          key: "sizeCustomization", 
          value: sizeCustomizationString,
          timestamp: Date.now()
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save size customization: ${response.status}`);
      }
      
      // Force invalidate all relevant caches
      queryClient.invalidateQueries({ queryKey: ['/api/site-customization'] });
      queryClient.invalidateQueries({ queryKey: ['/api/home-settings'] });
      
      // Force browser to reload the data with cache busting
      await fetch(`/api/site-customization?t=${Date.now()}`, {
        headers: {
          "Cache-Control": "no-cache, no-store",
          "Pragma": "no-cache"
        }
      });
      
      showNotification({
        title: "Size Customization Image Updated",
        message: "The image has been updated and changes have been saved.",
        variant: "success"
      });
      
      // Reset saving state on success
      setIsSaving(false);
    } catch (error) {
      console.error("Error updating size customization image:", error);
      showNotification({
        title: "Error",
        message: "Failed to update size customization image. Please try again.",
        variant: "error"
      });
      
      // Reset saving state on error
      setIsSaving(false);
    }
  };
  
  // Check if an image URL is valid and accessible
  const validateImageUrl = async (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        console.log(`Image validation successful for: ${url}`);
        resolve(true);
      };
      img.onerror = () => {
        console.error(`Image validation failed for: ${url}`);
        resolve(false);
      };
      img.src = url;
      
      // Set a timeout in case the image takes too long to load
      setTimeout(() => {
        if (!img.complete) {
          console.warn(`Image validation timed out for: ${url}`);
          resolve(false);
        }
      }, 5000);
    });
  };

  // Sync changes with the homepage in real-time
  const syncWithHomepage = async (newHeroSection: any) => {
    try {
      // Use spread operator for shallow clone (more memory efficient than deep clone)
      const heroSectionToSync = { 
        ...newHeroSection,
        images: Array.isArray(newHeroSection.images) ? [...newHeroSection.images] : []
      };
      
      
      // IMPORTANT: First handle any pending removals
      // This must be done before we handle the primary image to ensure removals take priority
      if (pendingRemovals.length > 0) {
        console.log("Filtering out images that should be removed:", pendingRemovals);
        const filteredImages = heroSectionToSync.images.filter((img: string) => {
          if (pendingRemovals.includes(img)) {
            console.log(`Removing image from sync: ${img}`);
            return false;
          }
          return true;
        });
        heroSectionToSync.images = filteredImages;
        
        // If the primary image is among those to be removed, update it
        if (pendingRemovals.includes(heroSectionToSync.imageUrl)) {
          console.log(`Primary image ${heroSectionToSync.imageUrl} is marked for removal`);
          if (filteredImages.length > 0) {
            console.log(`Setting new primary image to ${filteredImages[0]}`);
            heroSectionToSync.imageUrl = filteredImages[0];
          } else {
            console.log("All images were removed, maintaining empty state");
            heroSectionToSync.imageUrl = ""; // Use empty string instead of default
            heroSectionToSync.images = []; // Keep the array empty
          }
        }
      }
      
      // CRITICAL FIX: Do NOT automatically add the primary image to the images array
      // This was causing deleted images to come back and preventing empty arrays
      // The primary image should only be in the carousel if explicitly added
      console.log("SKIPPING auto-add of primary image to carousel - respect user deletions");
      
      // Ensure there are no duplicate images
      const uniqueImages = Array.from(new Set(heroSectionToSync.images));
      if (uniqueImages.length !== heroSectionToSync.images.length) {
        heroSectionToSync.images = uniqueImages;
      }
      
      // Filter out any empty strings or non-string values
      heroSectionToSync.images = heroSectionToSync.images.filter((url: any) => 
        typeof url === 'string' && url.trim() !== ''
      );
      
      // CRITICAL CHANGE: Never run ensureValidImagePaths with the flag to add defaults
      // We want to respect empty arrays, so we need to keep them empty
      if (heroSectionToSync.images.length === 0) {
        console.log("EMPTY ARRAY DETECTED IN SYNC: Preserving empty state");
        // Keep images as empty array
      } else {
        // Only validate existing images, never add defaults
        heroSectionToSync.images = ensureValidImagePaths(heroSectionToSync.images, false);
      }
      
      // Fix main imageUrl if needed
      if (heroSectionToSync.imageUrl) {
        // If the main image was supposed to be removed, update it
        if (pendingRemovals.includes(heroSectionToSync.imageUrl)) {
          // Use first image from remaining images or set to empty string (no default)
          heroSectionToSync.imageUrl = heroSectionToSync.images.length > 0 
            ? heroSectionToSync.images[0] 
            : ""; // Don't auto-add default images
        }
        
        // Fix old format paths but don't auto-populate with defaults
        if (heroSectionToSync.imageUrl.startsWith('/images/')) {
          console.log(`Main image has old path format: ${heroSectionToSync.imageUrl}`);
          // Use empty string if we detect an old path format
          heroSectionToSync.imageUrl = "";
        } else if (!heroSectionToSync.imageUrl.startsWith('/uploads/') && 
                  !heroSectionToSync.imageUrl.startsWith('/static/') &&
                  !heroSectionToSync.imageUrl.startsWith('http')) {
          console.log(`Main image has invalid path format: ${heroSectionToSync.imageUrl}`);
          // Use empty string if the path is invalid
          heroSectionToSync.imageUrl = "";
        }
      } else {
        // Allow empty image URL (don't auto-set default)
        heroSectionToSync.imageUrl = "";
      }
      
      // IMPORTANT: No longer forcing default image when array is empty
      // This allows us to properly remove all images if that's what was intended
      console.log("Current images length in sync:", heroSectionToSync.images.length);
      
      // Enforce the 2-image limit
      if (heroSectionToSync.images.length > 2) {
        heroSectionToSync.images = heroSectionToSync.images.slice(-2);
      }
      
      // CRITICAL FIX: Do NOT automatically add the main image to the images array
      // Even if the main image URL doesn't match any carousel images, we should RESPECT that
      // as it's likely user deliberately deleted it from the carousel
      console.log("SKIPPING auto-add of main image to carousel array - respect user intent");
      
      // Convert to JSON string for saving to database
      const heroSectionString = JSON.stringify(heroSectionToSync);
      
      // Clear localStorage cache before saving
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('react-query')) {
          localStorage.removeItem(key);
        }
      }
      
      // Save to the database with a direct approach - passing pendingRemovals to ensure they're respected
      const saveResponse = await fetch("/api/admin/site-customization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAdminAuthHeaders(),
          "Cache-Control": "no-cache, no-store"
        },
        body: JSON.stringify({ 
          key: "heroSection", 
          value: heroSectionString,
          timestamp: Date.now(), // Add timestamp to prevent caching
          removedImages: pendingRemovals // Pass the list of images that should be removed
        })
      });
      
      if (!saveResponse.ok) {
        throw new Error(`Failed to save hero section: ${await saveResponse.text()}`);
      }
      
      // Force invalidate all cached data to ensure all components reload with latest data
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/site-customization"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/site-customization"] });
      
      // Verify the data was saved correctly by fetching it back
      const verifyResponse = await fetch("/api/site-customization", {
        headers: {
          "Cache-Control": "no-cache, no-store",
          "Pragma": "no-cache"
        }
      });
      
      if (verifyResponse.ok) {
        const verifyData = await verifyResponse.json();
        
        if (verifyData.heroSection) {
          try {
            const parsedHeroSection = JSON.parse(verifyData.heroSection);
            
            // If the verification shows the image was properly removed, update local state
            setHeroSection({
              ...parsedHeroSection,
              images: [...parsedHeroSection.images] // Create a new array to avoid reference issues
            });
          } catch (e) {
            console.error("Error parsing verification data:", e);
          }
        }
      }
      
      // After successful save, update the local state to match what was saved
      // and clear the pending removals list since they've been synchronized
      setHeroSection({
        ...heroSectionToSync,
        images: [...heroSectionToSync.images] // Create a new array to avoid reference issues
      });
      
      // Clear the pending removals list and remove from localStorage
      setPendingRemovals([]);
      localStorage.removeItem('hero-pending-removals');
      
      // Clear any localStorage data that might be causing stale images to reappear
      try {
        // Clear all image-related localStorage keys to prevent stale data persistence
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (
              key.includes('hero') || 
              key.includes('carousel') || 
              key.includes('image') || 
              key.includes('site-customization')
          )) {
            console.log(`Clearing potentially stale localStorage key: ${key}`);
            localStorage.removeItem(key);
          }
        }
      } catch (e) {
        console.error("Error clearing localStorage:", e);
      }
      
      // Invalidate cache to ensure fresh data is displayed on the home page
      console.log("Invalidating cache after syncing with homepage...");
      queryClient.invalidateQueries({ queryKey: ['/api/site-customization'] });
      // Add cache-busting to force a refresh of the data
      queryClient.invalidateQueries({ queryKey: ['/api/home-settings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/site-customization'] });
      
      // Force homepage to refetch all data with cache-busting timestamp
      const timestamp = Date.now();
      console.log("Explicitly refreshing homepage content with server-side updates...");
      
      // First call the refresh-homepage-content endpoint to get fresh data on the server
      const refreshResponse = await fetch(`/api/refresh-homepage-content?t=${timestamp}`, {
        headers: {
          "Cache-Control": "no-cache, no-store",
          "Pragma": "no-cache"
        }
      });
      
      // Then call force-refresh for additional cache busting on client side
      await fetch(`/api/force-refresh?t=${timestamp}`, { 
        method: 'POST',
        headers: getAdminAuthHeaders()
      });
      
      return true;
    } catch (error) {
      console.error("Error syncing with homepage:", error);
      return false;
    }
  };

  // Handle adding a new hero image to the carousel - simplified approach using dedicated endpoint
  const handleAddHeroImage = async (imageUrl: string) => {
    console.log("Adding hero image:", imageUrl);
    
    // Set saving state
    setIsSaving(true);
    
    // Input validation
    if (!imageUrl) {
      console.error("Attempted to add empty image URL");
      showNotification({
        title: "Error",
        message: "Cannot add empty image URL",
        variant: "error"
      });
      setIsSaving(false);
      return;
    }
    
    // Get current images to check for duplicates and max limit
    const currentImages = heroSection.images || [];
    
    // Check if the image already exists in the carousel
    if (currentImages.includes(imageUrl)) {
      showNotification({
        title: "Duplicate Image",
        message: "This image is already in the carousel.",
        variant: "warning"
      });
      setIsSaving(false);
      return;
    }
    
    // No limit on carousel images - removed the 2-image limit
    
    // Show a loading notification
    showNotification({
      title: "Adding Image",
      message: "Adding image to carousel...",
      variant: "info"
    });
    
    // Check if the image URL is valid and accessible
    const isValid = await validateImageUrl(imageUrl);
    
    if (!isValid) {
      showNotification({
        title: "Invalid Image",
        message: "The image URL couldn't be loaded. Please check the URL and try again.",
        variant: "error"
      });
      setIsSaving(false);
      return;
    }
    
    try {
      // Use the dedicated endpoint for adding carousel images
      const response = await fetch("/api/admin/site-customization/add-hero-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAdminAuthHeaders()
        },
        body: JSON.stringify({ imageUrl })
      });
      
      if (!response.ok) {
        // Check for specific error responses
        if (response.status === 400) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Invalid request");
        } else {
          throw new Error(`Server error: ${response.status}`);
        }
      }
      
      // Get the updated hero section from the response
      const result = await response.json();
      console.log("Server returned updated hero section:", result.heroSection);
      
      // Update local state with the hero section returned from the server
      if (result.heroSection) {
        setHeroSection(result.heroSection);
        
        // Force a refresh of all site customization data
        queryClient.invalidateQueries({ queryKey: ["/api/admin/site-customization"] });
        queryClient.invalidateQueries({ queryKey: ["/api/site-customization"] });
        
        // Also directly hit the refresh endpoint to ensure homepage content is updated
        try {
          console.log("Explicitly refreshing homepage content with server-side updates...");
          const refreshTimestamp = Date.now();
          await fetch(`/api/refresh-homepage-content?t=${refreshTimestamp}`, {
            headers: {
              "Cache-Control": "no-cache, no-store",
              "Pragma": "no-cache"
            }
          });
        } catch (refreshError) {
          console.error("Error refreshing homepage content:", refreshError);
        }
        
        // Show success notification
        showNotification({
          title: "Image Added",
          message: "The image has been successfully added to the carousel.",
          variant: "success"
        });
        
        // Reset saving state on success
        setIsSaving(false);
        
        // Verify the image was actually added by checking the returned data
        if (!result.heroSection.images || !result.heroSection.images.includes(imageUrl)) {
          console.error("Image was not actually added despite successful response!");
          
          // Try once more
          try {
            await fetch("/api/admin/site-customization/add-hero-image", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...getAdminAuthHeaders()
              },
              body: JSON.stringify({ imageUrl, forceAdd: true })
            });
            
            // Refresh the queries again
            queryClient.invalidateQueries({ queryKey: ["/api/admin/site-customization"] });
            queryClient.invalidateQueries({ queryKey: ["/api/site-customization"] });
          } catch (retryError) {
            console.error("Error in retry attempt:", retryError);
            // Make sure saving state is reset even if retry fails
            setIsSaving(false);
          }
        }
      } else {
        // If for some reason the server didn't return the updated hero section
        // Reset saving state before throwing error
        setIsSaving(false);
        throw new Error("Server returned an incomplete response without hero section data");
      }
    } catch (error) {
      console.error("Error adding hero image:", error);
      
      // Show error notification
      showNotification({
        title: "Error Adding Image",
        message: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "error"
      });
      
      // Re-fetch the latest data from server to ensure UI is in sync
      queryClient.invalidateQueries({ queryKey: ["/api/admin/site-customization"] });
      // Reset saving state
      setIsSaving(false);
      queryClient.invalidateQueries({ queryKey: ["/api/site-customization"] });
    }
  };
  
  // Handle drag and drop reordering of carousel images
  const handleDragEnd = async (result: DropResult) => {
    // If dropped outside the droppable area or no destination, do nothing
    if (!result.destination) return;
    
    // Get the source and destination indices
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    // If the item was dropped in the same position, do nothing
    if (sourceIndex === destinationIndex) return;
    
    // Create a copy of the images array
    const updatedImages = [...heroSection.images];
    
    // Remove the image from the source position and insert at destination
    const [movedImage] = updatedImages.splice(sourceIndex, 1);
    updatedImages.splice(destinationIndex, 0, movedImage);
    
    try {
      // Update local state first for immediate feedback
      setHeroSection({
        ...heroSection,
        images: updatedImages,
        // If the primary image was moved, make sure we update its reference
        imageUrl: heroSection.imageUrl === movedImage ? movedImage : heroSection.imageUrl
      });
      
      // Send update to server to persist changes
      const response = await fetch("/api/admin/site-customization", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAdminAuthHeaders()
        },
        body: JSON.stringify({
          heroSection: {
            ...heroSection,
            images: updatedImages
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      // Show success notification
      showNotification({
        title: "Images Reordered",
        message: "Images have been reordered successfully.",
        variant: "success"
      });
      
      // Update queries to ensure UI consistency
      queryClient.invalidateQueries({ queryKey: ["/api/admin/site-customization"] });
      queryClient.invalidateQueries({ queryKey: ["/api/site-customization"] });
    } catch (error) {
      console.error("Error reordering images:", error);
      
      // Show error notification
      showNotification({
        title: "Error Reordering Images",
        message: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "error"
      });
      
      // Revert to previous state
      setHeroSection({
        ...heroSection
      });
    }
  };
  
  // Handle reordering of carousel images using Up/Down buttons
  const handleReorderImage = async (index: number, direction: 'up' | 'down') => {
    if (!heroSection.images || heroSection.images.length < 2) {
      return; // No need to reorder if there are less than 2 images
    }
    
    // Check if the move is valid
    if ((direction === 'up' && index === 0) || 
        (direction === 'down' && index === heroSection.images.length - 1)) {
      return; // Can't move first item up or last item down
    }
    
    // Create a copy of the images array
    const updatedImages = [...heroSection.images];
    
    // Calculate the index to swap with
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap the images
    [updatedImages[index], updatedImages[targetIndex]] = 
      [updatedImages[targetIndex], updatedImages[index]];
    
    try {
      // Update local state first for immediate feedback
      setHeroSection({
        ...heroSection,
        images: updatedImages
      });
      
      // Send update to server to persist changes
      const response = await fetch("/api/admin/site-customization", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAdminAuthHeaders()
        },
        body: JSON.stringify({
          heroSection: {
            ...heroSection,
            images: updatedImages
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      // Show success notification
      showNotification({
        title: "Images Reordered",
        message: `Image moved ${direction} successfully.`,
        variant: "success"
      });
      
      // Update queries to ensure UI consistency
      queryClient.invalidateQueries({ queryKey: ["/api/admin/site-customization"] });
      queryClient.invalidateQueries({ queryKey: ["/api/site-customization"] });
    } catch (error) {
      console.error("Error reordering images:", error);
      
      // Show error notification
      showNotification({
        title: "Error Reordering Images",
        message: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "error"
      });
      
      // Revert to previous state
      setHeroSection({
        ...heroSection
      });
    }
  };
  
  // Force initialization of images array and autoplayInterval if they don't exist
  useEffect(() => {
    if (!heroSection.images || !Array.isArray(heroSection.images)) {
      // Initialize with an empty array - don't force primary image
      setHeroSection(prev => ({
        ...prev,
        images: [], // Always initialize as empty array (don't auto-populate with defaults)
        autoplayInterval: prev.autoplayInterval || 5000
      }));
    }
    
    // Also handle the case where array is empty
    if (Array.isArray(heroSection.images) && heroSection.images.length === 0) {
      console.log("Empty image array detected in hero section - respecting empty state");
      // No need to update the state as we're keeping the empty array
    }
  }, [heroSection]);
  
  // Safeguard to ensure carousel images persist through page navigation
  useEffect(() => {
    if (siteConfig && siteConfig.heroSection) {
      try {
        console.log("SITE CONFIG UPDATE: Processing hero section from config");
        
        // Parse the hero section from string if needed
        let parsedHeroSection: any;
        if (typeof siteConfig.heroSection === 'string') {
          parsedHeroSection = JSON.parse(siteConfig.heroSection);
        } else {
          parsedHeroSection = siteConfig.heroSection;
        }
        
        // CRITICAL FIX: Properly handle images array state
        // Initialize as empty array if not present, but NEVER auto-populate with defaults
        if (!parsedHeroSection.images) {
          console.log("SITE CONFIG UPDATE: No images array found, initializing as empty");
          parsedHeroSection.images = []; // Initialize as empty with no defaults
        } else if (!Array.isArray(parsedHeroSection.images)) {
          console.log("SITE CONFIG UPDATE: Images not an array, converting single item to array");
          parsedHeroSection.images = [parsedHeroSection.images];
        }
        
        // Filter out any invalid images
        const filteredImages = parsedHeroSection.images.filter((url: any) => 
          typeof url === 'string' && url.trim() !== ''
        );
        
        // IMPORTANT: Check if we're actually removing valid images
        if (filteredImages.length !== parsedHeroSection.images.length) {
          console.log(`SITE CONFIG UPDATE: Filtered out ${parsedHeroSection.images.length - filteredImages.length} invalid images`);
          parsedHeroSection.images = filteredImages;
        }
        
        // No image limit is enforced
        console.log(`SITE CONFIG UPDATE: Using all ${parsedHeroSection.images.length} carousel images`);
        
        // Create a deep copy of the parsed hero section to avoid reference issues
        const updatedHeroSection = {
          ...parsedHeroSection,
          images: [...parsedHeroSection.images], // Create new array to avoid reference issues
          // Handle imageUrl properly - IMPORTANT: respect empty states
          imageUrl: parsedHeroSection.images.length > 0 
                    ? (parsedHeroSection.imageUrl || parsedHeroSection.images[0]) 
                    : "" // If no images, set empty string, not a default image
        };
        
        console.log("SITE CONFIG UPDATE: Final hero section state:", updatedHeroSection);
        
        setHeroSection(updatedHeroSection);
      } catch (error) {
        console.error("Error processing hero section from site config:", error);
      }
    }
  }, [siteConfig]);
  
  // Handle updating autoplay interval with live sync
  const handleIntervalChange = async (value: number) => {
    // Create updated hero section with new interval
    const newHeroSection = {
      ...heroSection,
      autoplayInterval: value
    };
    
    // Update local state
    setHeroSection(newHeroSection);
    
    // Don't show notification for every keystroke - instead auto-sync in the background
    // and only show notifications for errors
    try {
      await syncWithHomepage(newHeroSection);
      // Success is silent to avoid too many notifications for interval changes
    } catch (error) {
      console.error("Failed to sync autoplay interval:", error);
      // Only show notification on error
      showNotification({
        title: "Sync Failed",
        message: "Autoplay interval was updated but syncing failed. Try clicking 'Save Changes'.",
        variant: "warning"
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Site Customization</CardTitle>
          <CardDescription>
            Customize how your website appears to customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeSection} onValueChange={handleSectionChange}>
            {/* Desktop tabs - hidden on mobile */}
            <div className="hidden md:block">
              <div className="overflow-x-auto pb-2 mb-2">
                <TabsList className="mb-2 flex min-w-max w-full justify-start">
                  <TabsTrigger value="hero">Hero Image</TabsTrigger>
                  <TabsTrigger value="featured">Featured Products</TabsTrigger>
                  <TabsTrigger value="signature">Signature Collection</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews Display</TabsTrigger>
                  <TabsTrigger value="qrcode">QR Code</TabsTrigger>
                  <TabsTrigger value="social">Social Media</TabsTrigger>
                  <TabsTrigger value="navigation">Navigation</TabsTrigger>
                  <TabsTrigger value="contact">Contact Info</TabsTrigger>
                  <TabsTrigger value="legal">Legal Info</TabsTrigger>
                  <TabsTrigger value="about">About Us</TabsTrigger>
                  <TabsTrigger value="faqs">FAQs</TabsTrigger>
                  <TabsTrigger value="awaymode">Away Mode</TabsTrigger>
                  <TabsTrigger value="theme">Theme</TabsTrigger>
                  <TabsTrigger value="staticsite">Static Site</TabsTrigger>
                </TabsList>
              </div>
            </div>
            
            {/* Mobile dropdown menu */}
            <div className="mb-4 md:hidden">
              <div className="relative">
                <select 
                  value={activeSection}
                  onChange={(e) => handleSectionChange(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="hero">Hero Image</option>
                  <option value="featured">Featured Products</option>
                  <option value="signature">Signature Collection</option>
                  <option value="reviews">Reviews Display</option>
                  <option value="qrcode">QR Code</option>
                  <option value="social">Social Media</option>
                  <option value="navigation">Navigation</option>
                  <option value="contact">Contact Info</option>
                  <option value="legal">Legal Info</option>
                  <option value="about">About Us</option>
                  <option value="faqs">FAQs</option>
                  <option value="awaymode">Away Mode</option>
                  <option value="theme">Theme</option>
                  <option value="staticsite">Static Site</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
              </div>
            </div>
            
            {/* Navigation Settings Section */}
            {/* QR Code Section */}
            <TabsContent value="qrcode" className="space-y-4">
              <div className="space-y-6 pb-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">QR Code Management</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Create and customize QR codes that link to your Sweet Moment experience. Track performance statistics and manage redirect destinations.
                  </p>
                  
                  {/* QR Code Manager Component */}
                  <div className="mt-4 mb-16">
                    <QRCodeRedirectManager />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="navigation" className="space-y-4">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Navigation Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="menu-dropdown-enabled"
                        checked={navigationSettings.menuDropdownEnabled}
                        onCheckedChange={(checked) => {
                          setNavigationSettings({...navigationSettings, menuDropdownEnabled: checked});
                        }}
                      />
                      <label htmlFor="menu-dropdown-enabled" className="text-sm font-medium">
                        Enable menu dropdown functionality
                      </label>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      When disabled, menu items will still be visible but dropdown functionality will be turned off.
                      This affects both desktop and mobile navigation menus.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Contact Information Section */}
            <TabsContent value="contact" className="space-y-4">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="contact-address" className="text-sm font-medium">Address</label>
                      <div className="relative">
                        <Input
                          id="contact-address"
                          value={contactInfo.address || ""}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContactInfo({...contactInfo, address: e.target.value})}
                          placeholder="Enter your address or leave empty to hide"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Leave this field empty to hide the address in the footer
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="contact-phone" className="text-sm font-medium">Phone Number</label>
                      <div className="flex gap-2">
                        <div className="w-24">
                          <Select
                            value={contactInfo.areaCode || "+1"}
                            onValueChange={(value) => {
                              setContactInfo({...contactInfo, areaCode: value});
                            }}
                          >
                            <SelectTrigger id="contact-area-code">
                              <SelectValue placeholder="+1" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="+1">+1</SelectItem>
                              <SelectItem value="+44">+44</SelectItem>
                              <SelectItem value="+49">+49</SelectItem>
                              <SelectItem value="+33">+33</SelectItem>
                              <SelectItem value="+81">+81</SelectItem>
                              <SelectItem value="+86">+86</SelectItem>
                              <SelectItem value="+91">+91</SelectItem>
                              <SelectItem value="+971">+971</SelectItem>
                              <SelectItem value="+966">+966</SelectItem>
                              <SelectItem value="+965">+965</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex-1">
                          <Input
                            id="contact-phone"
                            value={contactInfo.phone}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              // Format the phone number as it's typed using our imported function
                              // Make sure we're not adding any country code prefix in the input field
                              const inputValue = e.target.value.replace(/^\+1\s*/, '');
                              const formattedPhone = formatPhoneNumber(inputValue);
                              setContactInfo({...contactInfo, phone: formattedPhone});
                            }}
                            placeholder="(555) 123-4567"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">Select your country code and enter your phone number</p>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="contact-email" className="text-sm font-medium">Email Address</label>
                      <Input
                        id="contact-email"
                        value={contactInfo.email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          // Store the email as typed, validation will happen on save/blur
                          setContactInfo({...contactInfo, email: e.target.value});
                        }}
                        placeholder="info@example.com"
                        className={validateEmail(contactInfo.email) || contactInfo.email === '' ? '' : 'border-red-500'}
                      />
                      {contactInfo.email !== '' && !validateEmail(contactInfo.email) && (
                        <p className="text-xs text-red-500">Please enter a valid email address</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Legal Information Section */}
            <TabsContent value="legal" className="space-y-4">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Legal Information</h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label htmlFor="privacy-policy" className="text-sm font-medium">Privacy Policy</label>
                      <Textarea
                        id="privacy-policy"
                        value={legalInfo.privacyPolicy}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setLegalInfo({...legalInfo, privacyPolicy: e.target.value})}
                        className="min-h-[200px]"
                        placeholder="Enter your privacy policy text here..."
                      />
                      <p className="text-xs text-muted-foreground">
                        This will be displayed on the Privacy Policy page.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="terms-of-service" className="text-sm font-medium">Terms of Service</label>
                      <Textarea
                        id="terms-of-service"
                        value={legalInfo.termsOfService}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setLegalInfo({...legalInfo, termsOfService: e.target.value})}
                        className="min-h-[200px]"
                        placeholder="Enter your terms of service text here..."
                      />
                      <p className="text-xs text-muted-foreground">
                        This will be displayed on the Terms of Service page.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="shipping-policy" className="text-sm font-medium">Shipping Policy</label>
                      <Textarea
                        id="shipping-policy"
                        value={legalInfo.shippingPolicy}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setLegalInfo({...legalInfo, shippingPolicy: e.target.value})}
                        className="min-h-[200px]"
                        placeholder="Enter your shipping policy text here..."
                      />
                      <p className="text-xs text-muted-foreground">
                        This will be displayed on the Shipping Policy page.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* About Us Section */}
            <TabsContent value="about" className="space-y-4">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">About Us Content</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Share your company's story, values, and mission to connect with your customers.
                  </p>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="about-us-content" className="text-sm font-medium">Content</label>
                      <Textarea
                        id="about-us-content"
                        value={legalInfo.aboutUs}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                          setLegalInfo({...legalInfo, aboutUs: e.target.value})
                        }
                        className="min-h-[300px]"
                        placeholder="Enter your About Us content here..."
                      />
                      <p className="text-xs text-muted-foreground">
                        This content will be displayed on the About Us page. You can use line breaks to format your text.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* FAQs Section */}
            <TabsContent value="faqs" className="space-y-4">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Frequently Asked Questions</h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        // Generate a unique ID for the new FAQ
                        const newId = legalInfo.faqs.length > 0 
                          ? Math.max(...legalInfo.faqs.map(faq => faq.id)) + 1 
                          : 1;
                        
                        // Add a new empty FAQ at the end of the list
                        setLegalInfo({
                          ...legalInfo,
                          faqs: [
                            ...legalInfo.faqs,
                            { id: newId, question: "", answer: "" }
                          ]
                        });
                      }}
                      className="flex items-center gap-2"
                    >
                      <span>Add FAQ</span>
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">
                    Add and manage frequently asked questions to help your customers find the information they need.
                  </p>
                  
                  <div className="space-y-4">
                    {legalInfo.faqs.map((faq, index) => (
                      <div key={faq.id} className="border rounded-md p-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">FAQ #{index + 1}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // Remove this FAQ from the list
                              setLegalInfo({
                                ...legalInfo,
                                faqs: legalInfo.faqs.filter(item => item.id !== faq.id)
                              });
                            }}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                        
                        <div className="space-y-2">
                          <label htmlFor={`faq-question-${faq.id}`} className="text-sm font-medium">Question</label>
                          <Input
                            id={`faq-question-${faq.id}`}
                            value={faq.question}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              // Update this specific FAQ's question
                              setLegalInfo({
                                ...legalInfo,
                                faqs: legalInfo.faqs.map(item => 
                                  item.id === faq.id 
                                    ? { ...item, question: e.target.value } 
                                    : item
                                )
                              });
                            }}
                            placeholder="Enter the question here..."
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label htmlFor={`faq-answer-${faq.id}`} className="text-sm font-medium">Answer</label>
                          <Textarea
                            id={`faq-answer-${faq.id}`}
                            value={faq.answer}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                              // Update this specific FAQ's answer
                              setLegalInfo({
                                ...legalInfo,
                                faqs: legalInfo.faqs.map(item => 
                                  item.id === faq.id 
                                    ? { ...item, answer: e.target.value } 
                                    : item
                                )
                              });
                            }}
                            className="min-h-[100px]"
                            placeholder="Enter the answer here..."
                          />
                        </div>
                      </div>
                    ))}
                    
                    {legalInfo.faqs.length === 0 && (
                      <div className="text-center py-8 border rounded-md">
                        <p className="text-muted-foreground">No FAQs yet. Click "Add FAQ" to create your first question and answer.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Theme Customization Section */}
            <TabsContent value="theme" className="space-y-4">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Theme Customization</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Customize the look and feel of your store by selecting color schemes, fonts, and uploading your logo.
                    The theme will automatically generate coordinating colors based on your logo.
                  </p>
                  <div className="mt-4">
                    <ThemeCustomizer 
                      initialTheme={{
                        primary: themeSettings.primary,
                        variant: themeSettings.variant as "professional" | "tint" | "vibrant",
                        appearance: themeSettings.appearance as "light" | "dark" | "system",
                        radius: themeSettings.radius,
                        font: themeSettings.font,
                        logo: themeSettings.logo
                      }}
                      onSave={async (updatedTheme) => {
                        setThemeSettings(updatedTheme);
                        
                        // Immediately save theme settings to the server
                        console.log("Saving theme settings to server...");
                        const themeSettingsString = JSON.stringify(updatedTheme);
                        const response = await fetch("/api/admin/site-customization", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            "Cache-Control": "no-cache, no-store",
                            ...getAdminAuthHeaders()
                          },
                          body: JSON.stringify({ 
                            key: "themeSettings", 
                            value: themeSettingsString,
                            timestamp: Date.now()
                          })
                        });
                        
                        if (response.ok) {
                          showNotification({
                            title: "Theme saved",
                            message: "Your theme changes have been saved and applied.",
                            variant: "success"
                          });
                        } else {
                          showNotification({
                            title: "Error saving theme",
                            message: "There was a problem saving your theme changes.",
                            variant: "error"
                          });
                        }
                        
                        return Promise.resolve();
                      }}
                      isSaving={isSaving}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Away Mode Section */}

            <TabsContent value="awaymode" className="space-y-4">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Away Mode Settings</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Enable Away Mode when your store is on a break. This will display a notification banner to your customers.
                  </p>
                  
                  <div className="space-y-6">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="away-mode-enabled"
                        checked={awayMode.enabled}
                        onCheckedChange={(checked) => {
                          setAwayMode({...awayMode, enabled: checked});
                        }}
                      />
                      <label htmlFor="away-mode-enabled" className="text-sm font-medium">
                        Enable Away Mode
                      </label>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="away-mode-message" className="text-sm font-medium">Banner Message</label>
                      <Textarea
                        id="away-mode-message"
                        value={awayMode.message}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                          setAwayMode({...awayMode, message: e.target.value})
                        }
                        className="min-h-[100px]"
                        placeholder="We're currently on a short break! Orders are still open, but processing may be delayed."
                      />
                      <p className="text-xs text-muted-foreground">
                        This message will be displayed in a banner at the top of your site when Away Mode is enabled.
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="show-return-date"
                        checked={awayMode.showReturnDate}
                        onCheckedChange={(checked) => {
                          setAwayMode({...awayMode, showReturnDate: checked});
                        }}
                      />
                      <label htmlFor="show-return-date" className="text-sm font-medium">
                        Show Expected Return Date
                      </label>
                    </div>
                    
                    {awayMode.showReturnDate && (
                      <div className="space-y-2 pl-6">
                        <label htmlFor="return-date" className="text-sm font-medium">Expected Return Date</label>
                        <div className="grid gap-2">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                id="return-date"
                                variant={"outline"}
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !awayMode.returnDate && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {awayMode.returnDate ? format(new Date(awayMode.returnDate), "PPP") : <span>Pick a date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={awayMode.returnDate ? new Date(awayMode.returnDate) : undefined}
                                onSelect={(date) => {
                                  if (date) {
                                    const formattedDate = format(date, "yyyy-MM-dd");
                                    setAwayMode({...awayMode, returnDate: formattedDate});
                                  }
                                }}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          This date will be displayed in the banner to inform customers when you'll be back.
                        </p>
                      </div>
                    )}
                    
                    <div className="space-y-2 border-t pt-4 mt-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="disable-orders"
                          checked={awayMode.disableOrders}
                          onCheckedChange={(checked) => {
                            setAwayMode({...awayMode, disableOrders: checked});
                          }}
                        />
                        <label htmlFor="disable-orders" className="text-sm font-medium">
                          Disable New Orders
                        </label>
                      </div>
                      <p className="text-xs text-muted-foreground pl-6">
                        When enabled, customers will not be able to place new orders while Away Mode is active.
                        The checkout button will be disabled and a message will explain why.
                      </p>
                    </div>
                    
                    {/* Custom Hero Banner Section */}
                    <div className="space-y-2 border-t pt-4 mt-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="custom-hero-banner"
                          checked={awayMode.customHeroBanner}
                          onCheckedChange={(checked) => {
                            setAwayMode({...awayMode, customHeroBanner: checked});
                          }}
                        />
                        <label htmlFor="custom-hero-banner" className="text-sm font-medium">
                          Enable Custom Hero Banner During Away Mode
                        </label>
                      </div>
                      <p className="text-xs text-muted-foreground pl-6">
                        When enabled, a special hero banner will be displayed on your home page while Away Mode is active.
                      </p>
                      
                      {awayMode.customHeroBanner && (
                        <div className="space-y-4 pl-6 mt-4">
                          <div className="space-y-2">
                            <label htmlFor="hero-banner-image" className="text-sm font-medium">Banner Image</label>
                            <ImageUpload
                              value={awayMode.heroBannerImage}
                              onChange={(url: string) => {
                                setAwayMode({...awayMode, heroBannerImage: url});
                              }}
                              helpText="Upload an image for your away mode hero banner"
                              label="Hero Banner Image"
                            />
                            <p className="text-xs text-muted-foreground">
                              Upload an image to display in the away mode hero banner. This will replace your regular hero section.
                            </p>
                          </div>
                          
                          <div className="space-y-2">
                            <label htmlFor="hero-banner-title" className="text-sm font-medium">Banner Title</label>
                            <Input
                              id="hero-banner-title"
                              value={awayMode.heroBannerTitle}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                setAwayMode({...awayMode, heroBannerTitle: e.target.value})
                              }
                              placeholder="Sweet Moment is Taking a Break"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label htmlFor="hero-banner-subtitle" className="text-sm font-medium">Banner Subtitle</label>
                            <Textarea
                              id="hero-banner-subtitle"
                              value={awayMode.heroBannerSubtitle}
                              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                                setAwayMode({...awayMode, heroBannerSubtitle: e.target.value})
                              }
                              placeholder="We'll be back soon with fresh chocolates and sweet treats"
                              className="min-h-[80px]"
                            />
                          </div>
                          
                          {/* Preview of custom hero banner */}
                          <div className="mt-4 border rounded-md overflow-hidden">
                            <div className="relative bg-gray-100 h-[200px]">
                              {awayMode.heroBannerImage ? (
                                <img 
                                  src={awayMode.heroBannerImage} 
                                  alt="Away Mode Banner" 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full bg-gray-200">
                                  <ImageIcon className="w-12 h-12 text-gray-400" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white px-4 text-center">
                                <h3 className="text-xl font-bold">{awayMode.heroBannerTitle}</h3>
                                <p className="mt-2">{awayMode.heroBannerSubtitle}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {awayMode.enabled && (
                      <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mt-4">
                        <h4 className="text-sm font-semibold text-amber-800 mb-2">Preview</h4>
                        <div className="bg-amber-100 border border-amber-300 rounded-md p-3 text-sm text-amber-800">
                          <p>{awayMode.message}</p>
                          {awayMode.showReturnDate && awayMode.returnDate && (
                            <p className="mt-1">
                              <span className="font-medium">Expected return:</span> {new Date(awayMode.returnDate).toLocaleDateString()}
                            </p>
                          )}
                          {awayMode.disableOrders && (
                            <p className="font-medium mt-1">New orders are currently disabled.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Social Media Links Section */}
            <TabsContent value="social" className="space-y-4">
              <div className="space-y-6">
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Social Media Menu Settings</h3>
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2 text-amber-700 border-amber-200 hover:bg-amber-50"
                      onClick={() => window.location.href = '/socialmediamenu'}
                    >
                      <Eye size={16} />
                      <span>Preview Social Media Menu</span>
                    </Button>
                  </div>
                  <Separator className="my-4" />
                  <div className="space-y-6">
                    <div className="grid gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="socialMediaHeaderImage">Header Image</Label>
                          <p className="text-sm text-muted-foreground mb-2">
                            This image will appear at the top of your social media menu
                          </p>
                          <div className="mt-2">
                            <ImageUpload
                              value={socialMediaSection.headerImage || ''}
                              onChange={(url: string) => {
                                setSocialMediaSection({
                                  ...socialMediaSection,
                                  headerImage: url
                                });
                              }}
                              label="Social Media Header"
                              helpText="Drag & drop an image here, paste, or select a file"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Social Media Links</h3>
                  <div className="space-y-6">
                    
                    <div className="space-y-4 pt-2">
                      {/* Instagram Settings */}
                      <div className="border rounded-md p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <Checkbox 
                            id="enable-instagram" 
                            checked={socialMediaLinks.instagram.enabled}
                            onCheckedChange={(checked) => 
                              setSocialMediaLinks({
                                ...socialMediaLinks, 
                                instagram: {
                                  ...socialMediaLinks.instagram,
                                  enabled: checked as boolean
                                }
                              })
                            }
                          />
                          <label htmlFor="enable-instagram" className="text-sm font-medium">
                            Instagram
                          </label>
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="instagram-url" className="text-sm font-medium">URL</label>
                          <Input
                            id="instagram-url"
                            value={socialMediaLinks.instagram.url}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                              setSocialMediaLinks({
                                ...socialMediaLinks,
                                instagram: {
                                  ...socialMediaLinks.instagram,
                                  url: e.target.value
                                }
                              })
                            }
                            placeholder="https://www.instagram.com/yourprofile"
                          />
                        </div>
                        <div className="space-y-2 mt-4">
                          <p className="text-sm font-medium mb-2">Display Location:</p>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="instagram-header" 
                              checked={socialMediaLinks.instagram.displayInHeader}
                              onCheckedChange={(checked) => 
                                setSocialMediaLinks({
                                  ...socialMediaLinks, 
                                  instagram: {
                                    ...socialMediaLinks.instagram,
                                    displayInHeader: checked as boolean
                                  }
                                })
                              }
                            />
                            <label htmlFor="instagram-header" className="text-sm">
                              Show in header
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="instagram-footer" 
                              checked={socialMediaLinks.instagram.displayInFooter}
                              onCheckedChange={(checked) => 
                                setSocialMediaLinks({
                                  ...socialMediaLinks, 
                                  instagram: {
                                    ...socialMediaLinks.instagram,
                                    displayInFooter: checked as boolean
                                  }
                                })
                              }
                            />
                            <label htmlFor="instagram-footer" className="text-sm">
                              Show in footer
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      {/* TikTok Settings */}
                      <div className="border rounded-md p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <Checkbox 
                            id="enable-tiktok" 
                            checked={socialMediaLinks.tiktok.enabled}
                            onCheckedChange={(checked) => 
                              setSocialMediaLinks({
                                ...socialMediaLinks, 
                                tiktok: {
                                  ...socialMediaLinks.tiktok,
                                  enabled: checked as boolean
                                }
                              })
                            }
                          />
                          <label htmlFor="enable-tiktok" className="text-sm font-medium">
                            TikTok
                          </label>
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="tiktok-url" className="text-sm font-medium">URL</label>
                          <Input
                            id="tiktok-url"
                            value={socialMediaLinks.tiktok.url}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                              setSocialMediaLinks({
                                ...socialMediaLinks,
                                tiktok: {
                                  ...socialMediaLinks.tiktok,
                                  url: e.target.value
                                }
                              })
                            }
                            placeholder="https://www.tiktok.com/@yourprofile"
                          />
                        </div>
                        <div className="space-y-2 mt-4">
                          <p className="text-sm font-medium mb-2">Display Location:</p>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="tiktok-header" 
                              checked={socialMediaLinks.tiktok.displayInHeader}
                              onCheckedChange={(checked) => 
                                setSocialMediaLinks({
                                  ...socialMediaLinks, 
                                  tiktok: {
                                    ...socialMediaLinks.tiktok,
                                    displayInHeader: checked as boolean
                                  }
                                })
                              }
                            />
                            <label htmlFor="tiktok-header" className="text-sm">
                              Show in header
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="tiktok-footer" 
                              checked={socialMediaLinks.tiktok.displayInFooter}
                              onCheckedChange={(checked) => 
                                setSocialMediaLinks({
                                  ...socialMediaLinks, 
                                  tiktok: {
                                    ...socialMediaLinks.tiktok,
                                    displayInFooter: checked as boolean
                                  }
                                })
                              }
                            />
                            <label htmlFor="tiktok-footer" className="text-sm">
                              Show in footer
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      {/* Facebook Settings */}
                      <div className="border rounded-md p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <Checkbox 
                            id="enable-facebook" 
                            checked={socialMediaLinks.facebook.enabled}
                            onCheckedChange={(checked) => 
                              setSocialMediaLinks({
                                ...socialMediaLinks, 
                                facebook: {
                                  ...socialMediaLinks.facebook,
                                  enabled: checked as boolean
                                }
                              })
                            }
                          />
                          <label htmlFor="enable-facebook" className="text-sm font-medium">
                            Facebook
                          </label>
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="facebook-url" className="text-sm font-medium">URL</label>
                          <Input
                            id="facebook-url"
                            value={socialMediaLinks.facebook.url}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                              setSocialMediaLinks({
                                ...socialMediaLinks,
                                facebook: {
                                  ...socialMediaLinks.facebook,
                                  url: e.target.value
                                }
                              })
                            }
                            placeholder="https://www.facebook.com/yourpage"
                          />
                        </div>
                        <div className="space-y-2 mt-4">
                          <p className="text-sm font-medium mb-2">Display Location:</p>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="facebook-header" 
                              checked={socialMediaLinks.facebook.displayInHeader}
                              onCheckedChange={(checked) => 
                                setSocialMediaLinks({
                                  ...socialMediaLinks, 
                                  facebook: {
                                    ...socialMediaLinks.facebook,
                                    displayInHeader: checked as boolean
                                  }
                                })
                              }
                            />
                            <label htmlFor="facebook-header" className="text-sm">
                              Show in header
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="facebook-footer" 
                              checked={socialMediaLinks.facebook.displayInFooter}
                              onCheckedChange={(checked) => 
                                setSocialMediaLinks({
                                  ...socialMediaLinks, 
                                  facebook: {
                                    ...socialMediaLinks.facebook,
                                    displayInFooter: checked as boolean
                                  }
                                })
                              }
                            />
                            <label htmlFor="facebook-footer" className="text-sm">
                              Show in footer
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      {/* Twitter/X Settings */}
                      <div className="border rounded-md p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <Checkbox 
                            id="enable-twitter" 
                            checked={socialMediaLinks.twitter.enabled}
                            onCheckedChange={(checked) => 
                              setSocialMediaLinks({
                                ...socialMediaLinks, 
                                twitter: {
                                  ...socialMediaLinks.twitter,
                                  enabled: checked as boolean
                                }
                              })
                            }
                          />
                          <label htmlFor="enable-twitter" className="text-sm font-medium">
                            Twitter/X
                          </label>
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="twitter-url" className="text-sm font-medium">URL</label>
                          <Input
                            id="twitter-url"
                            value={socialMediaLinks.twitter.url}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                              setSocialMediaLinks({
                                ...socialMediaLinks,
                                twitter: {
                                  ...socialMediaLinks.twitter,
                                  url: e.target.value
                                }
                              })
                            }
                            placeholder="https://twitter.com/yourprofile"
                          />
                        </div>
                        <div className="space-y-2 mt-4">
                          <p className="text-sm font-medium mb-2">Display Location:</p>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="twitter-header" 
                              checked={socialMediaLinks.twitter.displayInHeader}
                              onCheckedChange={(checked) => 
                                setSocialMediaLinks({
                                  ...socialMediaLinks, 
                                  twitter: {
                                    ...socialMediaLinks.twitter,
                                    displayInHeader: checked as boolean
                                  }
                                })
                              }
                            />
                            <label htmlFor="twitter-header" className="text-sm">
                              Show in header
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="twitter-footer" 
                              checked={socialMediaLinks.twitter.displayInFooter}
                              onCheckedChange={(checked) => 
                                setSocialMediaLinks({
                                  ...socialMediaLinks, 
                                  twitter: {
                                    ...socialMediaLinks.twitter,
                                    displayInFooter: checked as boolean
                                  }
                                })
                              }
                            />
                            <label htmlFor="twitter-footer" className="text-sm">
                              Show in footer
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Reviews Display Section */}
            <TabsContent value="reviews" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="reviews-enabled"
                    checked={reviewsSection.enabled}
                    onCheckedChange={(checked) => {
                      setReviewsSection({...reviewsSection, enabled: checked});
                    }}
                  />
                  <label htmlFor="reviews-enabled" className="text-sm font-medium">
                    Display reviews section on homepage
                  </label>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="reviews-title" className="text-sm font-medium">Section Title</label>
                  <Input
                    id="reviews-title"
                    value={reviewsSection.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReviewsSection({...reviewsSection, title: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="reviews-subtitle" className="text-sm font-medium">Section Subtitle</label>
                  <Input
                    id="reviews-subtitle"
                    value={reviewsSection.subtitle}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReviewsSection({...reviewsSection, subtitle: e.target.value})}
                  />
                </div>
                

                
                {/* Testimonials Editor */}
                <div className="space-y-3 mt-8">
                  <h3 className="text-base font-semibold">Homepage Testimonials</h3>
                  <p className="text-sm text-muted-foreground">
                    These testimonials are displayed in the reviews section of the homepage.
                  </p>
                  
                  {reviewsSection.testimonials?.map((testimonial, index) => (
                    <Card key={testimonial.id} className="p-4 mb-4">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">Testimonial {index + 1}</h4>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Button
                                  key={star}
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="px-1 h-6"
                                  onClick={() => {
                                    const updatedTestimonials = [...reviewsSection.testimonials];
                                    updatedTestimonials[index] = {
                                      ...updatedTestimonials[index],
                                      rating: star
                                    };
                                    setReviewsSection({
                                      ...reviewsSection,
                                      testimonials: updatedTestimonials
                                    });
                                  }}
                                >
                                  <svg
                                    width="16"
                                    height="16"
                                    fill={star <= testimonial.rating ? "gold" : "none"}
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                                    />
                                  </svg>
                                </Button>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label htmlFor={`testimonial-text-${index}`} className="text-sm font-medium">Testimonial Text</label>
                          <textarea
                            id={`testimonial-text-${index}`}
                            className="w-full min-h-[80px] p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={testimonial.text}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                              const updatedTestimonials = [...reviewsSection.testimonials];
                              updatedTestimonials[index] = {
                                ...updatedTestimonials[index],
                                text: e.target.value
                              };
                              setReviewsSection({
                                ...reviewsSection,
                                testimonials: updatedTestimonials
                              });
                            }}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label htmlFor={`testimonial-author-${index}`} className="text-sm font-medium">Author Name</label>
                            <Input
                              id={`testimonial-author-${index}`}
                              value={testimonial.author}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const updatedTestimonials = [...reviewsSection.testimonials];
                                updatedTestimonials[index] = {
                                  ...updatedTestimonials[index],
                                  author: e.target.value,
                                  initial: e.target.value.charAt(0).toUpperCase()
                                };
                                setReviewsSection({
                                  ...reviewsSection,
                                  testimonials: updatedTestimonials
                                });
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor={`testimonial-location-${index}`} className="text-sm font-medium">Location</label>
                            <Input
                              id={`testimonial-location-${index}`}
                              value={testimonial.location}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const updatedTestimonials = [...reviewsSection.testimonials];
                                updatedTestimonials[index] = {
                                  ...updatedTestimonials[index],
                                  location: e.target.value
                                };
                                setReviewsSection({
                                  ...reviewsSection,
                                  testimonials: updatedTestimonials
                                });
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            {/* Featured Products Section */}
            <TabsContent value="featured" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured-enabled"
                    checked={featuredSection.enabled}
                    onCheckedChange={(checked) => {
                      setFeaturedSection({...featuredSection, enabled: checked});
                    }}
                  />
                  <label htmlFor="featured-enabled" className="text-sm font-medium">
                    Display featured products section on homepage
                  </label>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="featured-title" className="text-sm font-medium">Section Title</label>
                  <Input
                    id="featured-title"
                    value={featuredSection.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFeaturedSection({...featuredSection, title: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="featured-subtitle" className="text-sm font-medium">Section Subtitle</label>
                  <Input
                    id="featured-subtitle"
                    value={featuredSection.subtitle}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFeaturedSection({...featuredSection, subtitle: e.target.value})}
                  />
                </div>
                

                
                <div className="p-4 border border-border rounded-md bg-muted/10 space-y-4">
                  <h3 className="text-sm font-medium">Select Featured Products</h3>
                  
                  <Tabs defaultValue="mobile" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="mobile">Mobile Product List</TabsTrigger>
                      <TabsTrigger value="desktop">Desktop Product List</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="mobile" className="mt-4 space-y-4">
                      <div className="space-y-2">
                        <div className="border rounded-md p-4 max-h-72 overflow-y-auto">
                          {isLoadingProducts ? (
                            <p>Loading products...</p>
                          ) : (
                            <div className="space-y-2">
                              {products.map((product: any) => (
                                <div key={product.id} className="flex items-center space-x-2 hover:bg-muted/50 p-1 rounded-md">
                                  <Checkbox 
                                    id={`product-mobile-${product.id}`}
                                    checked={featuredSection.mobileProductIds?.includes(product.id)}
                                    onCheckedChange={(checked) => handleFeaturedProductChange(product.id, checked === true, 'mobile')}
                                  />
                                  <label htmlFor={`product-mobile-${product.id}`} className="text-sm cursor-pointer font-medium flex-1">
                                    {product.name}
                                  </label>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Select the products that will be featured on mobile view
                        </p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="desktop" className="mt-4 space-y-4">
                      <div className="space-y-2">
                        <div className="border rounded-md p-4 max-h-72 overflow-y-auto">
                          {isLoadingProducts ? (
                            <p>Loading products...</p>
                          ) : (
                            <div className="space-y-2">
                              {products.map((product: any) => (
                                <div key={product.id} className="flex items-center space-x-2 hover:bg-muted/50 p-1 rounded-md">
                                  <Checkbox 
                                    id={`product-desktop-${product.id}`}
                                    checked={featuredSection.desktopProductIds?.includes(product.id)}
                                    onCheckedChange={(checked) => handleFeaturedProductChange(product.id, checked === true, 'desktop')}
                                  />
                                  <label htmlFor={`product-desktop-${product.id}`} className="text-sm cursor-pointer font-medium flex-1">
                                    {product.name}
                                  </label>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Select the products that will be featured on desktop view
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </TabsContent>
            
            {/* Signature Collection Section */}
            <TabsContent value="signature" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="signature-enabled"
                    checked={signatureSection.enabled}
                    onCheckedChange={(checked) => {
                      setSignatureSection(prevState => ({...prevState, enabled: checked}));
                    }}
                  />
                  <label htmlFor="signature-enabled" className="text-sm font-medium">
                    Display signature collection section on homepage
                  </label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="signature-title" className="text-sm font-medium">Section Title</label>
                      <Input
                        id="signature-title"
                        value={signatureSection.title}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSignatureSection(prevState => ({...prevState, title: e.target.value}))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="signature-subtitle" className="text-sm font-medium">Section Description</label>
                      <Textarea
                        id="signature-subtitle"
                        value={signatureSection.subtitle}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                          const newValue = e.target.value;
                          console.log("Updating signature subtitle to:", newValue);
                          setSignatureSection(prevState => ({...prevState, subtitle: newValue}));
                        }}
                        className="min-h-[100px]"
                      />

                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="signature-tagline" className="text-sm font-medium">Tagline (Secondary Text)</label>
                      <Input
                        id="signature-tagline"
                        value={signatureSection.tagline}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSignatureSection(prevState => ({...prevState, tagline: e.target.value}))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="signature-button-text" className="text-sm font-medium">Button Text</label>
                      <Input
                        id="signature-button-text"
                        value={signatureSection.buttonText}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSignatureSection(prevState => ({...prevState, buttonText: e.target.value}))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="signature-button-link" className="text-sm font-medium">Button Link</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 pointer-events-none">
                          /
                        </span>
                        <Input
                          id="signature-button-link"
                          value={signatureSection.buttonLink.startsWith('/') ? signatureSection.buttonLink.substring(1) : signatureSection.buttonLink}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSignatureSection(prevState => ({
                            ...prevState, 
                            buttonLink: e.target.value.startsWith('/') ? e.target.value : '/' + e.target.value
                          }))}
                          className="pl-6"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Signature Collection Image</label>
                      <div className="border rounded-md p-4">
                        <div className="flex flex-col space-y-2">
                          <ImageUpload
                            value={signatureSection.imageUrl}
                            onChange={handleSignatureImageUpload}
                            label="Signature Collection Image"
                            helpText="Drag & drop an image here, paste, or select a file"
                          />
                          

                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        The signature collection section features your premium chocolate selection.
                        Use a high-quality image that showcases your product in the best way.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Hero Image Section */}
            <TabsContent value="hero" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="hero-title" className="text-sm font-medium">Hero Title</label>
                    <Input
                      id="hero-title"
                      value={heroSection.title}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHeroSection({...heroSection, title: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="hero-subtitle" className="text-sm font-medium">Hero Subtitle</label>
                    <Input
                      id="hero-subtitle"
                      value={heroSection.subtitle}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHeroSection({...heroSection, subtitle: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="hero-button-text" className="text-sm font-medium">Button Text</label>
                    <Input
                      id="hero-button-text"
                      value={heroSection.buttonText}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHeroSection({...heroSection, buttonText: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="hero-button-link" className="text-sm font-medium">Button Link</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 pointer-events-none">
                        /
                      </span>
                      <Input
                        id="hero-button-link"
                        value={heroSection.buttonLink.startsWith('/') ? heroSection.buttonLink.substring(1) : heroSection.buttonLink}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHeroSection({
                          ...heroSection, 
                          buttonLink: e.target.value.startsWith('/') ? e.target.value : '/' + e.target.value
                        })}
                        className="pl-6"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium">Carousel Images</label>
                        {/* The first "Clear All Images" button was removed - functionality consolidated into one button below */}
                      </div>
                      <div className="flex items-center space-x-2">
                        <label htmlFor="autoplay-interval" className="text-xs text-muted-foreground">
                          Slide interval (ms):
                        </label>
                        <Input
                          id="autoplay-interval"
                          type="number"
                          min={2000}
                          max={10000}
                          step={500}
                          value={heroSection.autoplayInterval}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleIntervalChange(parseInt(e.target.value) || 5000)}
                          className="w-24"
                        />
                      </div>
                    </div>
                    
                    {/* Visual carousel preview - shows exactly how it will appear on the home page */}
                    <div className="border rounded-md p-4 mb-4">
                      <h3 className="text-sm font-medium mb-2 flex justify-between items-center">
                        <span>Home Page Carousel Preview</span>
                        <span className="text-xs text-muted-foreground">Use drag and drop to reorder</span>
                      </h3>
                      
                      <div className="bg-gray-900 rounded-md overflow-hidden relative" style={{ height: "150px" }}>
                        {heroSection.images && heroSection.images.length > 0 ? (
                          <div className="relative w-full h-full">
                            {/* If a specific image is selected, show that one, otherwise show the first one */}
                            {(selectedCarouselImage ? 
                              // Show only the selected image if one is selected
                              [selectedCarouselImage] 
                              : 
                              // Otherwise show all images starting with the first one
                              heroSection.images
                                // Never show images that are marked for removal
                                .filter(image => !pendingRemovals.includes(image) && !removingImages.includes(image))
                            ).map((image, idx) => (
                                <div 
                                  key={`preview-${idx}-${image}`}
                                  className="absolute inset-0 transition-opacity duration-700"
                                  style={{ opacity: 1, zIndex: 2 }}
                                >
                                  <img 
                                    src={image} 
                                    alt={`Preview ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                    onLoad={() => console.log(`Successfully loaded carousel preview image: ${image}`)}
                                    onError={(e) => {
                                      console.error(`Failed to load carousel preview image: ${image}`);
                                      const target = e.currentTarget;
                                      target.style.backgroundColor = '#333';
                                      target.alt = 'Image failed to load';
                                    }}
                                  />
                                </div>
                              ))}
                            <div className="absolute inset-0 bg-black bg-opacity-30 z-10"></div>
                            <div className="absolute inset-0 z-20 flex items-center justify-center">
                              <div className="text-white text-center">
                                <h4 className="text-lg font-bold">{heroSection.title}</h4>
                                <p className="text-sm opacity-90">{heroSection.subtitle}</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <p className="text-white text-sm">No images in carousel</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <h3 className="text-sm font-medium mb-2">Manage Carousel Images</h3>
                      <div className="flex flex-col space-y-2 mb-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">
                            {heroSection.images.filter(image => !removingImages.includes(image) && !pendingRemovals.includes(image)).length} 
                            {' '} images in carousel
                          </span>
                          {/* Clear All Carousel Images button removed as requested */}
                        </div>
                        
                        {/* Device selector for cropping */}
                        <div className="flex items-center space-x-3">
                          <span className="text-xs font-medium">Crop for device:</span>
                          <div className="flex items-center">
                            <RadioGroup 
                              value={cropDevice} 
                              onValueChange={(value) => setCropDevice(value as 'mobile' | 'desktop')}
                              className="flex items-center space-x-3"
                            >
                              <div className="flex items-center space-x-1">
                                <RadioGroupItem value="mobile" id="crop-mobile" />
                                <Label htmlFor="crop-mobile" className="text-xs cursor-pointer">Mobile</Label>
                              </div>
                              <div className="flex items-center space-x-1">
                                <RadioGroupItem value="desktop" id="crop-desktop" />
                                <Label htmlFor="crop-desktop" className="text-xs cursor-pointer">Desktop</Label>
                              </div>
                            </RadioGroup>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Carousel Images</span>
                        {/* Second "Clear All Images" button removed - consolidated functionality */}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2 flex items-center">
                        <MoveVertical className="h-3 w-3 mr-1" /> Drag images to reorder using the handle icon
                      </p>
                      
                      <div className="space-y-3 mb-4 max-h-72 overflow-y-auto">
                        {/* Calculate and display active images */}
                        {heroSection.images
                          .filter(image => !removingImages.includes(image) && !pendingRemovals.includes(image))
                          .length > 0 ? (
                          <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="carousel-images">
                              {(provided) => (
                                <div
                                  {...provided.droppableProps}
                                  ref={provided.innerRef}
                                  className="space-y-2"
                                >
                                  <AnimatePresence>
                                    {heroSection.images
                                      .filter(image => !removingImages.includes(image) && !pendingRemovals.includes(image))
                                      .map((image, index) => (
                                        <Draggable key={image} draggableId={image} index={index}>
                                          {(provided) => (
                                            <div
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              {...provided.dragHandleProps}
                                              className="mb-2"
                                            >
                                              <motion.div 
                                                key={image}
                                                className={`flex items-center justify-between p-2 rounded-md ${heroSection.imageUrl === image ? 'border border-gray-200' : 'hover:bg-blue-50'} cursor-pointer`}
                                                initial={{ opacity: 1, height: "auto" }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ 
                                                  opacity: 0, 
                                                  height: 0,
                                                  marginTop: 0,
                                                  marginBottom: 0,
                                                  overflow: "hidden"
                                                }}
                                                transition={{ 
                                                  opacity: { duration: 0.3 },
                                                  height: { duration: 0.4, delay: 0.1 }
                                                }}
                                                onClick={() => {
                                                  console.log("Card clicked, selecting image:", image);
                                                  setSelectedCarouselImage(image);
                                                }}
                                              >
                                                <div className="flex items-center space-x-3">
                                                  <div className="flex-shrink-0 flex items-center">
                                                    <div className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-gray-100 cursor-grab active:cursor-grabbing">
                                                      <MoveVertical className="h-4 w-4 text-gray-400" aria-hidden="true" />
                                                    </div>
                                                  </div>
                                                  <div className="flex-shrink-0 border rounded bg-white overflow-hidden h-14 w-14 relative group hover:border-blue-500 hover:shadow-md transition-all">
                                                    {/* Display image preview in thumbnail */}
                                                    {image ? (
                                                      <>
                                                        {/* Highlight border on hover to indicate clickable image */}
                                                        <div 
                                                          className="absolute inset-0 z-30 cursor-pointer bg-transparent group-hover:bg-blue-300/20"
                                                          onClick={(e) => {
                                                            e.stopPropagation(); // Stop and prevent parent onClick
                                                            console.log("Image thumbnail clicked for edit");
                                                            handleEditCarouselImage(image);
                                                          }}
                                                        >
                                                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <span className="bg-blue-500 text-white text-xs p-1 rounded">
                                                              Edit
                                                            </span>
                                                          </div>
                                                        </div>
                                                        
                                                        <div className="absolute top-0 right-0 z-40">
                                                          <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-5 w-5 bg-white/90 hover:bg-white shadow-sm text-red-500"
                                                            onClick={(e) => {
                                                              e.stopPropagation(); // Prevent parent onClick from firing
                                                              console.log("Delete button clicked");
                                                              handleRemoveHeroImage(image);
                                                            }}
                                                            title="Remove image"
                                                          >
                                                            <Trash2 className="h-3 w-3" />
                                                          </Button>
                                                        </div>
                                                        <div className="relative w-full h-14">
                                                          <img 
                                                            src={image}
                                                            alt={`Image ${index + 1}`}
                                                            className="w-full h-full object-cover"
                                                            onLoad={() => {
                                                              console.log(`Image ${index + 1} loaded successfully:`, image);
                                                            }}
                                                            onError={(e) => {
                                                              console.error(`Error loading image ${index + 1}:`, image);
                                                              const target = e.currentTarget as HTMLImageElement;
                                                              
                                                              // If it's an upload URL, try adding a cache buster
                                                              if (image.startsWith('/uploads/')) {
                                                                console.log(`Adding cache buster for ${image}`);
                                                                const cacheBuster = `?t=${Date.now()}`;
                                                                target.src = `${image}${cacheBuster}`;
                                                                
                                                                // If that fails too, then show the error state
                                                                target.onerror = () => {
                                                                  console.error(`Reload with cache buster failed for ${image}`);
                                                                  target.style.display = 'none';
                                                                  
                                                                  // Find the error element and show it
                                                                  const parent = target.parentElement;
                                                                  if (parent) {
                                                                    const errorElement = parent.querySelector('.image-error-fallback');
                                                                    if (errorElement instanceof HTMLElement) {
                                                                      errorElement.style.display = 'flex';
                                                                    }
                                                                  }
                                                                  
                                                                  // Clear the error handler
                                                                  target.onerror = null;
                                                                };
                                                              } else {
                                                                // Just show error message instead of using default fallbacks
                                                                console.error(`Image failed to load: ${image}`);
                                                                target.style.display = 'none';
                                                                
                                                                // Find the error element and show it
                                                                const parent = target.parentElement;
                                                                if (parent) {
                                                                  const errorElement = parent.querySelector('.image-error-fallback');
                                                                  if (errorElement instanceof HTMLElement) {
                                                                    errorElement.style.display = 'flex';
                                                                  }
                                                                }
                                                              }
                                                            }}
                                                          />
                                                          <div 
                                                            className="image-error-fallback hidden absolute inset-0 items-center justify-center bg-gray-100 text-xs text-gray-500"
                                                          >
                                                            Image Error
                                                          </div>
                                                        </div>
                                                      </>
                                                    ) : (
                                                      <div className="flex items-center justify-center h-full w-full bg-gray-100 text-xs text-gray-500">
                                                        No Image
                                                      </div>
                                                    )}
                                                  </div>
                                                  <div className="flex items-center space-x-2">
                                                    <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium">
                                                      {index + 1}
                                                    </div>
                                                    <span className="text-sm truncate max-w-[150px]">
                                                      {heroSection.imageUrl === image 
                                                        ? <span className="text-primary font-medium">Primary: {getDisplayName(image)}</span>
                                                        : getDisplayName(image)}
                                                    </span>
                                                  </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                  {/* All buttons removed per user's request */}
                                                </div>
                                              </motion.div>
                                            </div>
                                          )}
                                        </Draggable>
                                      ))}
                                  </AnimatePresence>
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          </DragDropContext>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-2">No images added yet.</p>
                        )}
                      </div>
                      
                      <div className="pt-4 border-t">
                        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                          <h5 className="text-sm font-semibold text-amber-800 mb-1">Troubleshooting Images</h5>
                          <p className="text-xs text-amber-700 mb-2">
                            If images aren't displaying correctly, try these steps:
                          </p>
                          <ol className="text-xs text-amber-700 list-decimal pl-4 space-y-1">
                            <li>Upload images that are 2000x800 pixels or similar ratio for best results</li>
                            <li>Make sure the image URL is publicly accessible</li>
                            <li>Check browser console for any image loading errors</li>
                            <li>After uploading, click "Save Changes" at the bottom to persist your changes</li>
                          </ol>
                        </div>
                        
                        <div className="bg-gray-50 border rounded-md p-4">
                          <label className="text-sm font-medium block mb-3">Upload New Image</label>
                          <ImageUpload
                            value=""
                            onChange={async (url) => {
                              console.log("New image uploaded:", url);
                              if (url) {
                                await handleAddHeroImage(url);
                              }
                            }}
                            label="Hero Image"
                            helpText="Drag & drop an image here, paste, or select a file"
                          />
                          <p className="text-xs text-muted-foreground mt-2">
                            The first image you add will be set as the primary image by default.
                            Use the drag and drop feature to rearrange images in the desired order.
                          </p>
                        </div>
                        

                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 border rounded-md">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-medium">Preview</h4>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          // Force reload images by creating a new array with same content
                          const refreshedImages = [...heroSection.images];
                          setHeroSection({
                            ...heroSection,
                            images: refreshedImages
                          });
                          showNotification({
                            title: "Images Refreshed",
                            message: "Trying to reload all images in the carousel",
                            variant: "info"
                          });
                        }}
                      >
                        Refresh Images
                      </Button>
                    </div>

                    {/* Responsive Preview with Device Simulation */}
                    <div className="mb-4">
                      <Tabs defaultValue="desktop" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="mobile">Mobile</TabsTrigger>
                          <TabsTrigger value="desktop">Desktop</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="mobile" className="mt-2">
                          <div className="relative w-[375px] h-[812px] mx-auto border-8 border-gray-800 rounded-2xl overflow-hidden bg-white shadow-xl">
                            {/* Phone top notch */}
                            <div className="absolute top-0 w-full h-8 bg-gray-800 flex items-center justify-center">
                              <div className="w-32 h-5 bg-black rounded-b-2xl"></div>
                            </div>
                            {/* Bottom home indicator */}
                            <div className="absolute bottom-0 w-full h-8 bg-gray-800 flex items-center justify-center">
                              <div className="w-16 h-1 bg-gray-400 rounded-full"></div>
                            </div>
                            <div className="relative w-full h-full pt-8 pb-8 overflow-hidden bg-white">
                              <div className="responsive-preview-container overflow-auto h-full">
                                {/* Hero Section Preview - Full height without header */}
                                <div className="relative w-full h-[700px] bg-gray-100">
                                  {/* Loading indicator */}
                                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 z-0">
                                    <div className="text-sm">Loading...</div>
                                  </div>
                                  
                                  {/* Current selected image - Use an image not marked for removal */}
                                  <img 
                                    src={pendingRemovals.includes(heroSection.imageUrl) || removingImages.includes(heroSection.imageUrl)
                                        ? (heroSection.images.find(img => !pendingRemovals.includes(img) && !removingImages.includes(img)) || "")
                                        : heroSection.imageUrl}
                                    alt="Hero image"
                                    className="absolute inset-0 w-full h-full object-cover z-10"
                                    loading="lazy"
                                    decoding="async"
                                    onLoad={() => console.log("Mobile preview image loaded")}
                                    onError={(e) => {
                                      console.error("Mobile preview image failed to load:", heroSection.imageUrl);
                                      const target = e.currentTarget as HTMLImageElement;
                                      target.style.display = "none";
                                    }}
                                  />
                                  
                                  {/* Dark semi-transparent overlay */}
                                  <div className="absolute inset-0 bg-black/30 z-20"></div>
                                  
                                  {/* Mobile header */}
                                  <div className="absolute top-0 left-0 right-0 z-40 p-4 flex justify-between items-center">
                                    <div className="text-white font-semibold text-xl">Sweet Moment</div>
                                    <div className="w-6 h-6 flex items-center justify-center text-white">
                                      <div className="w-5 h-5 border border-white rounded-sm"></div>
                                    </div>
                                  </div>
                                  
                                  {/* Content overlay - Centered */}
                                  <div className="absolute inset-0 z-30 flex items-center justify-center">
                                    <div className="flex flex-col items-center justify-center text-center px-6">
                                      <h3 className="text-white text-xl font-bold mb-2">
                                        {heroSection.title || "Experience Life's Sweetest Moments"}
                                      </h3>
                                      <p className="text-white text-sm mb-4">
                                        {heroSection.subtitle || "Curated treats and heartfelt gifts that brighten every day"}
                                      </p>
                                      <button className="mt-1 px-6 py-2 text-sm bg-[#D4AF37] text-[#2A1A18] rounded-md font-medium">
                                        {heroSection.buttonText || "Discover Your Moment"}
                                      </button>
                                    </div>
                                  </div>
                                  
                                  {/* Bottom UI elements/indicators */}
                                  <div className="absolute bottom-6 left-0 right-0 z-40 flex justify-center space-x-1">
                                    <div className="w-2 h-2 bg-white rounded-full opacity-100"></div>
                                    <div className="w-2 h-2 bg-white rounded-full opacity-60"></div>
                                  </div>
                                  
                                  {/* Bottom service info */}
                                  <div className="absolute bottom-0 left-0 right-0 z-30 bg-[#FAF3E0] py-2 flex justify-center">
                                    <div className="flex flex-col items-center">
                                      <div className="text-amber-700">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-truck">
                                          <path d="M5 18a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path>
                                          <path d="M19 18a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path>
                                          <path d="M5 18h14"></path>
                                          <path d="M16 18v-14h-14v14"></path>
                                          <path d="M16 4h3l4 4v10h-3"></path>
                                        </svg>
                                      </div>
                                      <div className="text-xs font-medium text-amber-800 mt-1">Fast Shipping</div>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Simple content placeholder */}
                                <div className="p-4">
                                  <div className="h-4 bg-gray-200 rounded-full w-3/4 mb-6"></div>
                                  <div className="h-3 bg-gray-200 rounded-full w-full mb-3"></div>
                                  <div className="h-3 bg-gray-200 rounded-full w-5/6 mb-3"></div>
                                  <div className="h-3 bg-gray-200 rounded-full w-4/5 mb-6"></div>
                                  
                                  <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="h-20 bg-gray-200 rounded-md"></div>
                                    <div className="h-20 bg-gray-200 rounded-md"></div>
                                  </div>
                                  
                                  <div className="h-4 bg-gray-200 rounded-full w-2/3 mb-4"></div>
                                  <div className="grid grid-cols-3 gap-2 mb-4">
                                    <div className="h-12 bg-gray-200 rounded-md"></div>
                                    <div className="h-12 bg-gray-200 rounded-md"></div>
                                    <div className="h-12 bg-gray-200 rounded-md"></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="desktop" className="mt-2">
                          <div className="relative w-full max-w-[900px] h-[500px] mx-auto border-t-8 border-gray-800 rounded-lg overflow-hidden bg-white shadow-xl">
                            <div className="absolute top-[-8px] left-0 w-full h-6 bg-gray-800 flex items-center px-2">
                              <div className="flex gap-1">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                              </div>
                              <div className="w-64 h-4 bg-gray-700 rounded mx-auto"></div>
                            </div>
                            <div className="relative w-full h-full pt-6 overflow-hidden bg-gray-100">
                              <div className="responsive-preview-container overflow-auto h-full">
                                {/* Hero Section Preview */}
                                <div className="relative w-full h-64 bg-gray-100">
                                  {/* Loading indicator */}
                                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 z-0">
                                    <div className="text-sm">Loading...</div>
                                  </div>
                                  
                                  {/* Current selected image - Use an image not marked for removal, with lazy loading */}
                                  <img 
                                    src={pendingRemovals.includes(heroSection.imageUrl) || removingImages.includes(heroSection.imageUrl)
                                        ? (heroSection.images.find(img => !pendingRemovals.includes(img) && !removingImages.includes(img)) || "")
                                        : heroSection.imageUrl}
                                    alt="Hero image"
                                    className="absolute inset-0 w-full h-full object-cover z-10"
                                    loading="lazy"
                                    decoding="async"
                                    onLoad={() => console.log("Desktop preview image loaded")}
                                    onError={(e) => {
                                      console.error("Desktop preview image failed to load:", heroSection.imageUrl);
                                      const target = e.currentTarget as HTMLImageElement;
                                      target.style.display = "none";
                                    }}
                                  />
                                  
                                  {/* Overlay Text */}
                                  <div className="absolute inset-0 bg-black/30 z-20 p-3">
                                    <div className="container mx-auto h-full flex flex-col justify-center px-4">
                                      <div className="max-w-xl">
                                        <h1 className="text-2xl lg:text-3xl font-montserrat font-bold leading-tight text-white">{heroSection.title || "Luxury Dubai Chocolates"}</h1>
                                        <p className="text-sm mt-2 text-[#F5F5DC]">{heroSection.subtitle || "Handcrafted with the finest ingredients"}</p>
                                        <button className="mt-3 px-4 py-1 bg-[#D4AF37] text-[#2A1A18] text-sm rounded-md font-semibold">
                                          {heroSection.buttonText || "Shop Now"}
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Rest of page mockup */}
                                <div className="p-6">
                                  <div className="h-10 bg-gray-200 rounded-md w-1/2 mb-6"></div>
                                  <div className="grid grid-cols-4 gap-4">
                                    <div className="h-36 bg-gray-200 rounded-md"></div>
                                    <div className="h-36 bg-gray-200 rounded-md"></div>
                                    <div className="h-36 bg-gray-200 rounded-md"></div>
                                    <div className="h-36 bg-gray-200 rounded-md"></div>
                                    <div className="h-36 bg-gray-200 rounded-md"></div>
                                    <div className="h-36 bg-gray-200 rounded-md"></div>
                                    <div className="h-36 bg-gray-200 rounded-md"></div>
                                    <div className="h-36 bg-gray-200 rounded-md"></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                      
                      <div className="mt-2 text-xs text-muted-foreground">
                        <p>* Preview shows how the hero section appears on different devices</p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-col sm:flex-row sm:justify-between items-center">
                      <p className="text-xs text-muted-foreground text-center">
                        {/* Calculate actual image count after pending removals */}
                        {(() => {
                          // Filter out any images pending removal for accurate count
                          const actualImageCount = heroSection.images.filter(img => !pendingRemovals.includes(img)).length;
                          return actualImageCount > 1 
                            ? `Auto-sliding carousel with ${actualImageCount} images, changing every ${heroSection.autoplayInterval/1000}s`
                            : 'Add more images to enable the carousel effect';
                        })()}
                      </p>
                      
                      {/* Buttons removed for a cleaner interface */}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Static Site Generator Section */}
            <TabsContent value="staticsite" className="space-y-4">
              <div className="space-y-8">
                {/* Static Site Generator (Unified) */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Static Site Generator</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Generate static versions of your website for easy deployment to GitHub Pages or custom domains.
                    Choose between a simple HTML version or a feature-rich React version.
                  </p>
                  
                  <div className="border rounded-md p-6 bg-card">
                    <StaticSiteGeneratorPanel />
                    
                    <div className="mt-8 mb-4">
                      <Separator />
                    </div>
                    
                    <div className="mt-8 space-y-8">
                      <Card>
                        <CardHeader>
                          <CardTitle>Full React Static Site Generator</CardTitle>
                          <CardDescription>
                            Generate a complete static version of your site with all React components and frontend frameworks intact.
                            This creates an exact copy of your site that can be deployed directly to GitHub Pages or any static hosting provider.
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <FullReactStaticGenerator />
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle>Simplified Static Site Tester</CardTitle>
                          <CardDescription>
                            A simpler version of the static site generator for testing purposes.
                            This creates a basic package with GitHub Pages deployment settings.
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <SimpleStaticSiteTester />
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

          </Tabs>
        </CardContent>
        {activeSection !== "staticsite" && (
          <CardFooter className="flex flex-col gap-4 w-full">
            <div className="flex justify-between w-full">
              <div className="text-sm text-muted-foreground">
                <p>⚠️ Remember to save your changes before navigating away</p>
              </div>
              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveChanges} 
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <div className="flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </div>
                  ) : "Save Changes"}
                </Button>
              </div>
            </div>
          </CardFooter>
        )}
      </Card>
      
      {/* Image Cropper for editing carousel images */}
      {showImageCropper && imageBeingEdited && (
        <ImageCropper
          image={imageBeingEdited}
          isOpen={showImageCropper}
          onClose={() => setShowImageCropper(false)}
          onCropComplete={handleCropComplete}
          initialDeviceType={cropDevice}
        />
      )}
    </div>
  );
}

export default SiteCustomizationContent;