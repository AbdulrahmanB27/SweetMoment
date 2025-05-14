import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Share2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import StyledQRCodeWrapper from "@/components/admin/StyledQRCodeWrapper";

// Types for product data
interface ProductOption {
  id: string;
  label: string;
  price: number;
  value?: string;
  quantity?: number;
  boxTypeId?: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  basePrice: number;
  category: string;
  sizeOptions: ProductOption[];
  typeOptions: ProductOption[];
  mixedTypeEnabled: boolean;
  formattedPrice?: string;
  displayOrder?: number;
}

// Format a price in cents to dollars with $ sign
const formatPrice = (price: number): string => {
  // If price is already in dollars (less than 100), use as is
  const priceInDollars = price < 100 ? price : price / 100;
  return `$${priceInDollars.toFixed(2)}`;
};

// Parse JSON string options
const parseOptions = (optionsString: string): ProductOption[] => {
  try {
    return JSON.parse(optionsString);
  } catch (error) {
    console.error("Error parsing options:", optionsString, error);
    return [];
  }
};

const SocialMediaMenu = () => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>("");
  const [qrValue, setQrValue] = useState<string>("");

  // Get the current URL for sharing and QR code
  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentUrl = window.location.href;
      setShareUrl(currentUrl);
      setQrValue(currentUrl);
    }
  }, []);

  // Fetch products for the menu
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['/api/products'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        
        const data = await response.json();
        
        // Process the products data
        return data.map((product: any) => {
          // Parse size and type options
          const sizeOptions = parseOptions(product.sizeOptions || '[]');
          const typeOptions = parseOptions(product.typeOptions || '[]');
          
          // Format base price
          const basePrice = product.basePrice < 100 ? product.basePrice : product.basePrice / 100;
          const formattedPrice = `$${basePrice.toFixed(2)}`;
          
          return {
            ...product,
            sizeOptions,
            typeOptions,
            formattedPrice
          };
        }).sort((a: Product, b: Product) => {
          // Sort by displayOrder first, then by name for consistency
          const orderA = typeof a.displayOrder === 'number' && !isNaN(a.displayOrder) ? a.displayOrder : 1000;
          const orderB = typeof b.displayOrder === 'number' && !isNaN(b.displayOrder) ? b.displayOrder : 1000;
          
          if (orderA !== orderB) {
            return orderA - orderB;
          }
          
          return a.name.localeCompare(b.name);
        });
      } catch (error) {
        console.error("Error fetching products:", error);
        return [];
      }
    },
    staleTime: 60000 // Cache for 1 minute
  });

  // Fetch site customization settings
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

  // Parse contact info and logo data
  const contactInfo = siteCustomization?.contactInfo 
    ? JSON.parse(siteCustomization.contactInfo) 
    : { phone: "", email: "", address: "" };
  
  // Get social media section data if available
  const socialMediaSection = siteCustomization?.socialMediaSection 
    ? JSON.parse(siteCustomization.socialMediaSection) 
    : { headerImage: "", title: "Social Media Menu", enabled: true };
    
  // Get header image from signature section if available (fallback)
  const signatureSection = siteCustomization?.signatureSection 
    ? JSON.parse(siteCustomization.signatureSection) 
    : { image: "", title: "", description: "" };
  
  const headerImage = socialMediaSection?.headerImage || signatureSection?.image || "";

  // Handle print functionality as an alternative to download
  const handlePrint = () => {
    setDownloading(true);
    
    try {
      // Store the current body's overflow style
      const originalStyle = document.body.style.overflow;
      
      // Make sure all content is visible for printing
      document.body.style.overflow = 'visible';
      
      // Use browser's print functionality
      window.print();
      
      // Restore original style
      document.body.style.overflow = originalStyle;
    } catch (error) {
      console.error("Error printing menu:", error);
    } finally {
      setDownloading(false);
    }
  };
  


  // Process and organize products by box sizes and include other items
  const processProducts = () => {
    // Create size groups
    const sizeGroups: Record<string, any[]> = {
      'large': [],
      'medium': [],
      'small': [],
      'specialty': [] // For items that don't fit in standard boxes (nuts, bars, etc.)
    };
    
    // Group products by size
    products.forEach((product: any) => {
      const sizeOptions = Array.isArray(product.sizeOptions) 
        ? product.sizeOptions 
        : parseOptions(product.sizeOptions as string);
      
      // Handle special cases for non-box items first
      if (product.name.toLowerCase().includes('nuts') || 
          product.category === 'specialty' ||
          product.name.toLowerCase().includes('bar')) {
        // This is a specialty item
        sizeGroups['specialty'].push({
          ...product,
          sizeLabel: 'Standard',
          boxQuantity: 0,
          adjustedPrice: product.formattedPrice || formatPrice(product.basePrice)
        });
        return; // Skip the rest of the processing for this item
      }
      
      // For box-based items, process all size options
      let addedToGroup = false;
      
      sizeOptions.forEach((size: ProductOption) => {
        const sizeName = size.label.toLowerCase();
        // Make sure price is in cents before adding
        const basePrice = product.basePrice < 100 ? product.basePrice * 100 : product.basePrice;
        const sizePrice = size.price || 0;
        const totalPriceInCents = basePrice + sizePrice;
        
        // Create a modified product object with size info
        const productWithSize = {
          ...product,
          sizeLabel: size.label,
          boxQuantity: size.quantity || 0,
          adjustedPrice: formatPrice(totalPriceInCents / 100) // Convert back to dollars for display
        };
        
        // Add to appropriate size group
        if (sizeName.includes('large')) {
          sizeGroups['large'].push(productWithSize);
          addedToGroup = true;
        } else if (sizeName.includes('medium')) {
          sizeGroups['medium'].push(productWithSize);
          addedToGroup = true;
        } else if (sizeName.includes('small')) {
          sizeGroups['small'].push(productWithSize);
          addedToGroup = true;
        }
      });
      
      // If not added to any group but has standard size, add to specialty
      if (!addedToGroup && sizeOptions.length > 0) {
        sizeGroups['specialty'].push({
          ...product,
          sizeLabel: sizeOptions[0].label,
          boxQuantity: sizeOptions[0].quantity || 0,
          adjustedPrice: product.formattedPrice || formatPrice(product.basePrice)
        });
      }
    });
    
    return sizeGroups;
  };
  
  const sizeGroups = processProducts();

  return (
    <div className="bg-[#faf6f0] min-h-screen pt-28 pb-0 px-4 md:px-8">
      <div className="container mx-auto max-w-4xl flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-brown-800">Sweet Moment Menu</h1>
          <div className="flex gap-2">
            <Button
              onClick={handlePrint}
              disabled={downloading}
              className="bg-gradient-brown hover:bg-gradient-brown-hover text-white"
            >
              <Printer className="mr-2 h-4 w-4" /> 
              {downloading ? "Processing..." : "Print Menu"}
            </Button>
            <Button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'Sweet Moment Chocolate Menu',
                    url: shareUrl
                  }).catch(err => console.log("Error sharing:", err));
                } else {
                  navigator.clipboard.writeText(shareUrl)
                    .then(() => alert("Menu link copied to clipboard!"))
                    .catch(() => alert("Unable to copy link."));
                }
              }}
              variant="outline"
              className="border-brown-600 text-brown-800"
            >
              <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>

          </div>
        </div>

        {/* Actual menu content that will be captured for download - Instagram aspect ratio 4:5 */}
        <div 
          ref={menuRef}
          id="menuContent" 
          className="bg-white text-brown-800 rounded-lg shadow-xl overflow-hidden mb-0 max-w-md mx-auto"
          style={{
            aspectRatio: '4/5',
            maxHeight: '70vh', /* Further reduced from 75vh to ensure footer visibility */
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            justifyContent: 'space-between'
          }}
        >
          {/* Header with optional image */}
          <div 
            id="menuHeader"
            className={`bg-gray-900 text-white relative print-force-background`}
          >
            {/* Visible image for both screen and print */}
            {headerImage && (
              <img 
                src={headerImage} 
                alt="Sweet Moment Header" 
                className="absolute inset-0 w-full h-full object-cover"
                id="headerImage"
              />
            )}
            <div id="headerOverlay" className={`relative py-2 px-4 text-center ${headerImage ? 'py-8 bg-black bg-opacity-30' : ''}`}>
              <h1 id="menuTitle" className="text-2xl font-medium font-montserrat text-white">Sweet Moment</h1>
              <div id="menuBadge" className="inline-block px-3 py-0.5 bg-[#6F4E37] text-white rounded-sm text-xs font-medium mt-1">
                CHOCOLATE MENU
              </div>
            </div>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6F4E37]"></div>
            </div>
          )}

          {/* Menu Content with Clean Layout - Similar to the screenshot */}
          {!isLoading && (
            <div className="p-2 pb-0">
              {/* Boxed chocolates layout - more compact version */}
              <div className="mb-2">
                <div className="flex items-center mb-1">
                  <div className="flex-grow h-px bg-[#6F4E37]"></div>
                  <h2 className="px-4 text-[#6F4E37] text-sm font-medium uppercase mx-2">Boxed Chocolates</h2>
                  <div className="flex-grow h-px bg-[#6F4E37]"></div>
                </div>
                
                <div className="text-xxs text-gray-700 mb-1 text-center">(S = 5pc, M = 10pc, L = 25pc)</div>
                
                {/* Products grid - simple clean design */}
                {products.map((product: any) => {
                  // Skip specialty items (they'll be in their own section)
                  if (product.name.toLowerCase().includes('nuts') || 
                      product.category === 'specialty' ||
                      product.name.toLowerCase().includes('bar')) {
                    return null;
                  }
                  
                  // Get all size options
                  const sizeOptions = Array.isArray(product.sizeOptions) 
                    ? product.sizeOptions 
                    : parseOptions(product.sizeOptions as string);
                    
                  // Find prices for each size
                  const sizes: Record<string, string> = {
                    small: '-',
                    medium: '-',
                    large: '-'
                  };
                  
                  sizeOptions.forEach((size: any) => {
                    const sizeName = size.label.toLowerCase();
                    const basePrice = product.basePrice < 100 ? product.basePrice * 100 : product.basePrice;
                    const totalPriceInCents = basePrice + (size.price || 0);
                    const formattedPrice = formatPrice(totalPriceInCents / 100);
                    
                    if (sizeName.includes('small')) {
                      sizes.small = formattedPrice;
                    } else if (sizeName.includes('medium')) {
                      sizes.medium = formattedPrice;
                    } else if (sizeName.includes('large')) {
                      sizes.large = formattedPrice;
                    }
                  });
                  
                  return (
                    <div key={product.id} className="grid grid-cols-4 gap-x-2 text-xs border-b border-gray-300 py-1">
                      <div className="font-medium text-gray-800">{product.name}</div>
                      <div className="text-center text-gray-800">{sizes.small}</div>
                      <div className="text-center text-gray-800">{sizes.medium}</div>
                      <div className="text-center text-gray-800">{sizes.large}</div>
                    </div>
                  );
                })}
              </div>
              
              {/* PREMIUM SELECTIONS - more compact */}
              {sizeGroups.specialty.length > 0 && (
                <div className="mb-2">
                  <div className="flex items-center mb-1">
                    <div className="flex-grow h-px bg-[#6F4E37]"></div>
                    <h2 className="px-4 text-[#6F4E37] text-sm font-medium uppercase mx-2">Premium Selections</h2>
                    <div className="flex-grow h-px bg-[#6F4E37]"></div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-4 text-xs">
                    {sizeGroups.specialty.map((product: any) => (
                      <div key={`${product.id}-specialty`} className="flex justify-between items-center py-1 border-b border-gray-300">
                        <div className="font-medium text-gray-800">{product.name}</div>
                        <div className="font-medium text-gray-800">{product.adjustedPrice}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* AVAILABLE TYPES - more compact */}
              <div className="mb-0">
                <div className="flex items-center mb-1">
                  <div className="flex-grow h-px bg-[#6F4E37]"></div>
                  <h2 className="px-4 text-[#6F4E37] text-sm font-medium uppercase mx-2">Available Types</h2>
                  <div className="flex-grow h-px bg-[#6F4E37]"></div>
                </div>
                
                {/* Create the same exact structure as the header for alignment */}
                <div className="flex justify-between mt-2">
                  <div className="flex-shrink-0 w-1/2">
                    {products.length > 0 && products[0] && (
                      <div className="text-xs">
                        {(typeof products[0].typeOptions === 'string' 
                          ? JSON.parse(products[0].typeOptions) 
                          : products[0].typeOptions).map((option: any) => (
                          <div key={option.id} className="flex justify-between items-center py-0.5 border-b border-dotted border-gray-300">
                            <span className="font-medium text-gray-800">{option.label}</span>
                            {option.price > 0 && (
                              <span className="text-gray-800">+{formatPrice(option.price)}</span>
                            )}
                          </div>
                        ))}
                        
                        {/* Custom Orders Available text moved below chocolate types */}
                        <div className="mt-5 mb-0 text-center">
                          <div className="text-[#6F4E37] text-xs font-medium">
                            Custom Orders Available
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Spacer div that mimics the structure of the header */}
                  <div className="flex items-center invisible">
                    <div className="h-px"></div>
                    <h2 className="px-4 mx-2">Types</h2>
                  </div>
                  
                  {/* QR code div with the same width as the right brown line */}
                  <div className="flex-grow min-w-[150px] flex items-end justify-center pr-1 pl-4 -ml-4">
                    {/* Live QR Code */}
                    <div id="menuQrCode" className="mb-2">
                      <div className="flex flex-col items-center">
                        <StyledQRCodeWrapper 
                          value={qrValue} 
                          size={107} 
                          style={{
                            bodyShape: 'rounded',
                            eyeFrameShape: 'rounded',
                            eyeBallShape: 'rounded',
                            color: '#6F4E37',
                            backgroundColor: '#FFFFFF'
                          }}
                          className="print-qr"
                        />
                        {/* Extra buffer space below QR code */}
                        <div className="h-2"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Footer with contact info - ultra compact version */}
          <div className="mt-auto bg-gray-100 px-4 py-0.5 text-center border-t border-gray-300">
            <div className="flex flex-col text-gray-800 text-xxs leading-tight">
              <div className="flex justify-between items-start">
                <div>
                  <p className="my-0.5">© {new Date().getFullYear()} Sweet Moment</p>
                  <p className="my-0.5">Menu prices may vary</p>
                </div>
                <div className="text-right">
                  {contactInfo.phone && (
                    <p className="my-0.5">{contactInfo.phone}</p>
                  )}
                  {contactInfo.email && (
                    <p className="my-0.5 truncate max-w-xs">{contactInfo.email}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Print-only styles - added as a style element */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            /* Hide everything except the menu content */
            body * {
              visibility: hidden;
            }
            #menuContent, #menuContent * {
              visibility: visible;
            }
            
            /* Position the menu content for printing */
            #menuContent {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 1rem;
            }
            
            /* Print the background image */
            #menuHeader {
              display: block !important;
              position: relative !important;
            }
            
            /* Make the image visible */
            #headerImage {
              display: block !important;
              visibility: visible !important;
              position: absolute !important;
              z-index: 1 !important;
              opacity: 1 !important;
            }
            
            /* Make the text overlay visible over the image - exact match to screen */
            #headerOverlay {
              position: relative !important;
              z-index: 2 !important;
              background-color: rgba(0, 0, 0, 0.3) !important;
              background-blend-mode: overlay !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            /* Ensure the title stays white as it is on screen */
            #menuTitle {
              color: white !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            /* Fix the "CHOCOLATE MENU" badge */
            #menuBadge {
              color: white !important;
              background-color: #6F4E37 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            /* Fix section headers */
            #menuContent h2.text-\\[\\#6F4E37\\] {
              color: #6F4E37 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            /* Fix horizontal lines in section headers */
            #menuContent .flex-grow.h-px.bg-\\[\\#6F4E37\\] {
              background-color: #6F4E37 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            /* QR code visibility */
            #menuQrCode, #menuQrCode svg, #menuQrCode canvas {
              visibility: visible !important;
              display: block !important;
              page-break-inside: avoid !important;
            }
            
            /* Hide elements that shouldn't print */
            .no-print {
              display: none !important;
            }
          }
        `}} />
      </div>
    </div>
  );
};

export default SocialMediaMenu;