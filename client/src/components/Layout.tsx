import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Header from "./Header";
import Footer from "./Footer";
import MobileMenu from "./MobileMenu";
import CartModal from "./CartModal";
import DiscountBanner from "./DiscountBanner";
import { AwayModeBanner, AWAY_BANNER_HEIGHT_PX } from "./AwayModeBanner";
import { useAwayMode } from "../context/AwayModeContext";
import { useScrollReset } from "../hooks/useScrollReset";
import StaticSiteWrapper from "./StaticSiteWrapper";
import { useStaticData } from "../context/StaticDataContext";

interface LayoutProps {
  children: React.ReactNode;
  isStatic?: boolean;
}

const Layout = ({ children, isStatic: propIsStatic }: LayoutProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  
  // Use the Away Mode context to get settings
  const { settings: awayModeSettings } = useAwayMode();
  
  // Check if we're in static site mode - either from props or from context
  const staticData = useStaticData();
  const isStatic = propIsStatic || !!staticData.timestamp;
  
  // Use the scroll reset hook to ensure pages always start at the top
  useScrollReset();
  
  // Check if we're on an admin page to adjust layout
  const [location] = useLocation();
  const isAdminPage = location.includes('/admin');
  
  // Reset banner dismissed state when settings change
  useEffect(() => {
    setBannerDismissed(false);
  }, [awayModeSettings?.enabled, awayModeSettings?.message]);
  
  // Add a className to the body element to adjust spacing when away mode banner is active
  useEffect(() => {
    // Only add the class if the banner is enabled AND not dismissed
    if (awayModeSettings?.enabled && !bannerDismissed) {
      document.body.classList.add('away-mode-active');
    } else {
      document.body.classList.remove('away-mode-active');
    }
    
    return () => {
      document.body.classList.remove('away-mode-active');
    };
  }, [awayModeSettings?.enabled, bannerDismissed]);
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Add global styles for layout fixes and transitions
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      html {
        scroll-behavior: auto !important;
      }
      
      body {
        padding-top: 0;
        margin-top: 0;
      }
      
      /* Fixed header positioning */
      .fixed-header {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        width: 100%;
        z-index: 50;
        transition: top 0.3s ease;
        border-bottom: 0 !important;
        outline: none !important;
      }
      
      #away-mode-banner-root {
        top: 60px !important;
        margin-top: 0 !important;
        box-shadow: 0 1px 4px rgba(0,0,0,0.15) !important;
      }
      
      /* Synchronized banner and content transitions */
      .layout-spacer-transition {
        transition: height 600ms cubic-bezier(0.16, 1, 0.3, 1);
      }
      
      .main-content-transition {
        transition: transform 600ms cubic-bezier(0.16, 1, 0.3, 1),
                    margin-top 600ms cubic-bezier(0.16, 1, 0.3, 1);
      }
      
      /* Content spacing */
      .content-wrapper {
        padding-top: 80px; /* Ensure space for fixed header */
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      }
      
      /* Ensures no gap between elements */
      body {
        margin: 0;
        padding: 0;
        overflow-x: hidden;
      }
      
      /* Hero section fixes */
      .hero-section {
        position: relative;
        overflow: hidden;
      }
      
      .hero-section .hero-content {
        position: relative;
        z-index: 5;
      }
      
      .hero-section h1, 
      .hero-section p, 
      .hero-section a, 
      .hero-section button {
        position: relative;
        z-index: 5;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Fixed header - no wrapper divs */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white" style={{ borderBottom: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <Header 
          openMobileMenu={toggleMobileMenu}
          isMobileMenuOpen={isMobileMenuOpen}
          openCart={() => setIsCartOpen(true)}
          isStatic={isStatic}
        />
      </div>
      
      {/* Away Mode Banner - display always but with height 0 when hidden */}
      <div className="fixed top-[60px] left-0 right-0 w-full overflow-hidden z-50 bg-amber-500 shadow-md"
        style={{
          height: awayModeSettings?.enabled && !bannerDismissed ? '52px' : '0px',
          transition: 'height 600ms cubic-bezier(0.16, 1, 0.3, 1)',
          borderBottom: awayModeSettings?.enabled && !bannerDismissed ? '1px solid #d97706' : 'none'
        }}>
        {awayModeSettings && (
          <AwayModeBanner 
            settings={awayModeSettings} 
            onDismiss={() => setBannerDismissed(true)} 
          />
        )}
      </div>
      
      {/* Fixed height spacer with unified transition - no separate animations to sync */}
      <div className="w-full bg-white" style={{ 
        height: awayModeSettings?.enabled && !bannerDismissed ? '112px' : '0px',
        transition: 'height 600ms cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative',
        zIndex: 10,
        margin: 0,
        padding: 0
      }}></div>
      
      {/* Regular (non-fixed) banners */}
      <div>
        <DiscountBanner />
      </div>
      
      {/* Main layout with smooth transitions */}
      <div className="flex flex-col flex-grow main-content-transition">
        {/* Mobile menu and cart modals */}
        <MobileMenu 
          isOpen={isMobileMenuOpen} 
          onClose={() => setIsMobileMenuOpen(false)} 
        />
        <StaticSiteWrapper hideInStatic>
          <CartModal 
            isOpen={isCartOpen} 
            onClose={() => setIsCartOpen(false)} 
          />
        </StaticSiteWrapper>
        
        {/* Main content */}
        <main className="flex-grow w-full">
          {children}
        </main>
        
        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
