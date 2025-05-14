import { useLocation, Link } from "wouter";
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail, Send } from "lucide-react";
import { FaTiktok } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";
import { LinkWithAnimation } from "../App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

// Define social media link types
interface SocialMediaLink {
  enabled: boolean;
  url: string;
  displayInFooter: boolean;
}

interface SocialMediaLinks {
  instagram: SocialMediaLink;
  tiktok: SocialMediaLink;
  facebook: SocialMediaLink;
  twitter: SocialMediaLink;
  displayInHeader: boolean;
  displayInFooter: boolean;
}

const Footer = () => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // State for contact, legal and social media information
  const [contactInfo, setContactInfo] = useState({
    address: "13720 Atlantis St, Herndon, VA 20171",
    phone: "+971 4 123 4567",
    email: "info@sweetmoment.ae",
    areaCode: "+1"
  });
  
  const [legalInfo, setLegalInfo] = useState({
    privacyPolicy: "",
    termsOfService: "",
    shippingPolicy: ""
  });
  
  const [socialMedia, setSocialMedia] = useState<SocialMediaLinks>({
    instagram: { enabled: true, url: "https://www.instagram.com/sweetmomentchocolate/", displayInFooter: true },
    tiktok: { enabled: true, url: "https://www.tiktok.com/@sweetmomentchocolate", displayInFooter: true },
    facebook: { enabled: false, url: "", displayInFooter: false },
    twitter: { enabled: false, url: "", displayInFooter: false },
    displayInHeader: true,
    displayInFooter: true
  });
  
  // Fetch site customization data
  const { data: siteConfig } = useQuery({
    queryKey: ["/api/site-customization"],
    queryFn: async () => {
      const response = await fetch("/api/site-customization");
      if (!response.ok) {
        throw new Error("Failed to fetch site customization data");
      }
      return response.json();
    }
  });
  
  // Initialize state with fetched data
  useEffect(() => {
    if (siteConfig) {
      // Parse contact information
      if (siteConfig.contactInfo) {
        try {
          const parsedContactInfo = typeof siteConfig.contactInfo === 'string'
            ? JSON.parse(siteConfig.contactInfo)
            : siteConfig.contactInfo;
          
          setContactInfo(parsedContactInfo);
        } catch (e) {
          console.error("Error parsing contactInfo:", e);
        }
      }
      
      // Parse legal information
      if (siteConfig.legalInfo) {
        try {
          const parsedLegalInfo = typeof siteConfig.legalInfo === 'string'
            ? JSON.parse(siteConfig.legalInfo)
            : siteConfig.legalInfo;
          
          setLegalInfo(parsedLegalInfo);
        } catch (e) {
          console.error("Error parsing legalInfo:", e);
        }
      }
      
      // Parse social media links
      if (siteConfig.socialMediaLinks) {
        try {
          const parsedSocialMedia = typeof siteConfig.socialMediaLinks === 'string'
            ? JSON.parse(siteConfig.socialMediaLinks) as SocialMediaLinks
            : siteConfig.socialMediaLinks as SocialMediaLinks;
          
          // Ensure all social media links have displayInFooter property
          const validatedSocialMedia: SocialMediaLinks = {
            ...parsedSocialMedia,
            instagram: {
              ...parsedSocialMedia.instagram,
              displayInFooter: parsedSocialMedia.instagram.displayInFooter ?? true
            },
            facebook: {
              ...parsedSocialMedia.facebook,
              displayInFooter: parsedSocialMedia.facebook.displayInFooter ?? false
            },
            twitter: {
              ...parsedSocialMedia.twitter,
              displayInFooter: parsedSocialMedia.twitter.displayInFooter ?? false
            },
            tiktok: {
              ...parsedSocialMedia.tiktok,
              displayInFooter: parsedSocialMedia.tiktok.displayInFooter ?? true
            }
          };
          
          setSocialMedia(validatedSocialMedia);
          console.log("Footer - Social media links loaded:", parsedSocialMedia);
        } catch (e) {
          console.error("Error parsing socialMediaLinks:", e);
        }
      }
    }
  }, [siteConfig]);
  
  const showComingSoonToast = (feature: string) => {
    toast({
      title: "Coming Soon!",
      description: `${feature} will be available shortly.`,
      duration: 2000,
    });
  };

  // Smooth scroll to top with animation
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

  // Check if we're on admin page to adjust position
  const [location] = useLocation();
  const isAdmin = location.includes('/admin');
  
  // Apply proper styling to ensure footer is attached to content
  // Use a different styling for admin pages to guarantee it stays below content
  const footerClasses = `bg-[#2A1A18] text-white py-12 w-full mt-0 ${
    isAdmin ? 'border-t-2 border-[#3A1F1D]' : ''
  }`;

  return (
    <footer className={footerClasses}>
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-4 xl:gap-x-8 gap-y-8 justify-items-start">
          {/* Company section */}
          <div className="w-full col-span-1 lg:col-span-3">
            <h3 className="text-xl font-montserrat font-bold mb-4">Sweet Moment</h3>
            <p className="text-[#E8D9B5] mb-4">Experience life's sweetest moments with our premium handcrafted chocolates.</p>
            <div className="flex space-x-4">
              {socialMedia.facebook.enabled && socialMedia.facebook.url && 
               socialMedia.facebook.displayInFooter && (
                <a 
                  href={socialMedia.facebook.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white hover:text-[#D4AF37] transition-colors"
                >
                  <Facebook size={20} />
                </a>
              )}
              
              {socialMedia.instagram.enabled && socialMedia.instagram.url && 
               socialMedia.instagram.displayInFooter && (
                <a 
                  href={socialMedia.instagram.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-white hover:text-[#D4AF37] transition-colors"
                >
                  <Instagram size={20} />
                </a>
              )}
              
              {socialMedia.twitter.enabled && socialMedia.twitter.url && 
               socialMedia.twitter.displayInFooter && (
                <a 
                  href={socialMedia.twitter.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white hover:text-[#D4AF37] transition-colors"
                >
                  <Twitter size={20} />
                </a>
              )}
              
              {socialMedia.tiktok.enabled && socialMedia.tiktok.url && 
               socialMedia.tiktok.displayInFooter && (
                <a 
                  href={socialMedia.tiktok.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white hover:text-[#D4AF37] transition-colors"
                >
                  <FaTiktok size={18} />
                </a>
              )}
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="w-full col-span-1 lg:col-span-2">
            <h3 className="text-xl font-montserrat font-semibold mb-4 text-left">Quick Links</h3>
            <ul className="space-y-2 text-left">
              <li>
                <ScrollAwareLink 
                  href="/" 
                  className="text-[#E8D9B5] hover:text-white transition-colors"
                >
                  Home
                </ScrollAwareLink>
              </li>
              <li>
                <ScrollAwareLink 
                  href="/menu" 
                  className="text-[#E8D9B5] hover:text-white transition-colors"
                >
                  Shop All
                </ScrollAwareLink>
              </li>
              <li>
                <ScrollAwareLink 
                  href="/custom-order" 
                  className="text-[#E8D9B5] hover:text-white transition-colors"
                >
                  Custom Orders
                </ScrollAwareLink>
              </li>
              <li>
                <ScrollAwareLink 
                  href="/about" 
                  className="text-[#E8D9B5] hover:text-white transition-colors"
                >
                  About Us
                </ScrollAwareLink>
              </li>
              <li>
                <ScrollAwareLink 
                  href="/faq" 
                  className="text-[#E8D9B5] hover:text-white transition-colors"
                >
                  FAQs
                </ScrollAwareLink>
              </li>
            </ul>
          </div>
          
          {/* Contact Us */}
          <div className="w-full col-span-1 lg:col-span-4">
            <h3 className="text-xl font-montserrat font-semibold mb-4 text-left">Contact Us</h3>
            <ul className="space-y-2">
              {contactInfo.address && contactInfo.address.trim() !== "" && (
                <li className="flex items-start">
                  <MapPin className="mt-1 mr-2 text-[#D4AF37] flex-shrink-0" size={16} />
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contactInfo.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#D4AF37] transition-colors cursor-pointer text-left"
                    aria-label="View our location on Google Maps"
                  >
                    {contactInfo.address}
                  </a>
                </li>
              )}
              {contactInfo.phone && contactInfo.phone.trim() !== "" && (
                <li className="flex items-start">
                  <Phone className="mt-1 mr-2 text-[#D4AF37] flex-shrink-0" size={16} />
                  <a 
                    href={`tel:${contactInfo.areaCode}${contactInfo.phone ? contactInfo.phone.replace(/\D/g, '') : ''}`} 
                    className="hover:text-[#D4AF37] transition-colors cursor-pointer text-left"
                    aria-label="Call our phone number"
                  >
                    {contactInfo.areaCode} {contactInfo.phone}
                  </a>
                </li>
              )}
              {contactInfo.email && contactInfo.email.trim() !== "" && (
                <li className="flex items-start">
                  <Mail className="mt-1 mr-2 text-[#D4AF37] flex-shrink-0" size={16} />
                  <a 
                    href={`mailto:${contactInfo.email}`}
                    className="hover:text-[#D4AF37] transition-colors cursor-pointer text-left break-words w-full"
                    aria-label="Email us"
                  >
                    {contactInfo.email}
                  </a>
                </li>
              )}
            </ul>
          </div>
          
          {/* Newsletter */}
          <div className="w-full col-span-1 lg:col-span-3">
            <h3 className="text-xl font-montserrat font-semibold mb-4">Newsletter</h3>
            <p className="text-[#E8D9B5] mb-4">Subscribe to receive updates, special offers, and more.</p>
            <div className="flex">
              <Input
                type="email"
                placeholder="Your email address"
                className="rounded-l-md rounded-r-none px-4 py-2 w-full text-[#2A1A18] focus:outline-none focus:ring-0 focus:ring-offset-0 focus:border-0 border-r-0"
                style={{ boxShadow: 'none' }}
              />
              <Button 
                onClick={() => showComingSoonToast("Newsletter subscription")}
                className="bg-[#D4AF37] hover:bg-[#B8860B] transition-colors rounded-l-none py-2 px-4"
                aria-label="Subscribe"
              >
                <Send size={16} />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-[#3A1F1D] mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-[#E8D9B5] text-sm mb-4 md:mb-0">&copy; {new Date().getFullYear()} Sweet Moment. All rights reserved.</p>
          <div className="flex space-x-4 text-sm text-[#E8D9B5]">
            <ScrollAwareLink 
              href="/privacy-policy"
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </ScrollAwareLink>
            <ScrollAwareLink 
              href="/terms-of-service"
              className="hover:text-white transition-colors"
            >
              Terms of Service
            </ScrollAwareLink>
            <ScrollAwareLink 
              href="/shipping-policy"
              className="hover:text-white transition-colors"
            >
              Shipping Policy
            </ScrollAwareLink>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
