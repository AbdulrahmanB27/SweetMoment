import { Switch, Route, Link, useLocation } from "wouter";
import { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { DiscountProvider } from "./context/DiscountContext";
import { AwayModeProvider } from "./context/AwayModeContext";
import { AdminNotificationProvider } from "./hooks/use-admin-notification";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import DynamicProduct from "./pages/DynamicProduct";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CheckoutSuccess from "./pages/checkout/CheckoutSuccess";
import CheckoutCanceled from "./pages/checkout/CheckoutCanceled";
import ComingSoon from "./pages/ComingSoon";
import CustomOrder from "./pages/CustomOrder";
import SocialMediaMenu from "./pages/SocialMediaMenu";
import NotFound from "@/pages/not-found";
import OrderStatus from "@/pages/order-status";
import AdminPanel from "./pages/admin/AdminPanel";
import AdminLogin from "./pages/admin/AdminLogin";
import PrivacyPolicy from "./pages/privacy-policy";
import TermsOfService from "./pages/terms-of-service";
import ShippingPolicy from "./pages/shipping-policy";
import ScrollRestoration from "./components/ScrollRestoration";

// Modified to remove animations for consistent page loading
// Simple component without animation
const AnimatedPage = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full">
      {children}
    </div>
  );
};

// Utility that immediately scrolls to the top without animation
function smoothScrollToTop(callback: () => void) {
  // Using scrollTo with explicit behavior:auto to ensure immediate scrolling without animation
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'auto'  // 'auto' ensures no smooth scrolling animation
  });
  
  // Execute the callback immediately
  callback();
}

// Link component with animated scroll to top
export function LinkWithAnimation({ href, children, className, onClick }: { 
  href: string, 
  children: React.ReactNode, 
  className?: string,
  onClick?: () => void
}) {
  const [location, setLocation] = useLocation();
  
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault(); // Prevent default to handle navigation manually
    
    // Only navigate if we're going to a different location
    if (href !== location) {
      // Reset history state to ensure a fresh navigation
      window.history.replaceState(null, '', window.location.pathname);
      
      // Force location update by clearing and setting it
      setLocation('');
      setTimeout(() => {
        // Navigate to the new location
        setLocation(href);
        
        // Immediately scroll to top without animation for a clean initial view
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'auto'  // 'auto' ensures no smooth scrolling animation
        });
        
        if (onClick) {
          onClick();
        }
      }, 0);
    } else {
      // If we're already at this location, just scroll to top and run onClick
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto'
      });
      
      if (onClick) {
        onClick();
      }
    }
  };
  
  return (
    <a href={href} className={className} onClick={handleClick} style={{ cursor: 'pointer' }}>
      {children}
    </a>
  );
}

// Keep CustomLink for backward compatibility
export const CustomLink = LinkWithAnimation;

// Simple navigation hook that provides immediate scroll-to-top navigation
export function useNavigation() {
  const [location, setLocation] = useLocation();
  
  return {
    navigate: (to: string) => {
      // Only navigate if we're going to a different location
      if (to !== location) {
        // Reset history state to ensure a fresh navigation
        window.history.replaceState(null, '', window.location.pathname);
        
        // Force location update by clearing and setting it
        setLocation('');
        setTimeout(() => {
          // Navigate to the new location
          setLocation(to);
          
          // Immediately scroll to top without animation for a clean initial view
          window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'auto'  // 'auto' ensures no smooth scrolling animation
          });
        }, 0);
      } else {
        // If we're already at this location, just scroll to top
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'auto'
        });
      }
    },
    isNavigating: false
  };
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={() => <AnimatedPage><Home /></AnimatedPage>} />
        <Route path="/menu" component={() => <AnimatedPage><Menu /></AnimatedPage>} />
        <Route path="/menu/:slug">
          {(params) => (
            <AnimatedPage key={`product-${params.slug}`}>
              <DynamicProduct slug={params.slug} key={`product-${params.slug}`} />
            </AnimatedPage>
          )}
        </Route>
        <Route path="/cart" component={() => <AnimatedPage><Cart /></AnimatedPage>} />
        <Route path="/checkout" component={() => <AnimatedPage><Checkout /></AnimatedPage>} />
        <Route path="/checkout/success" component={() => <AnimatedPage><CheckoutSuccess /></AnimatedPage>} />
        <Route path="/checkout/canceled" component={() => <AnimatedPage><CheckoutCanceled /></AnimatedPage>} />
        <Route path="/payment-success" component={() => <AnimatedPage><PaymentSuccess /></AnimatedPage>} />
        <Route path="/login" component={() => <AnimatedPage><Login /></AnimatedPage>} />
        <Route path="/register" component={() => <AnimatedPage><Register /></AnimatedPage>} />
        
        {/* Coming Soon Pages */}
        <Route path="/shipping" component={() => <AnimatedPage><ComingSoon pageName="Coming Soon" /></AnimatedPage>} />
        <Route path="/custom-order" component={() => <AnimatedPage><CustomOrder /></AnimatedPage>} />
        <Route path="/socialmediamenu" component={() => <AnimatedPage><SocialMediaMenu /></AnimatedPage>} />
        {/* Empty /contact route that leads to 404 page */}
        <Route path="/contact" component={() => <AnimatedPage><NotFound /></AnimatedPage>} />
        <Route path="/about" component={() => <AnimatedPage><ComingSoon pageName="About Us" /></AnimatedPage>} />
        <Route path="/faq" component={() => <AnimatedPage><ComingSoon pageName="FAQ" /></AnimatedPage>} />
        <Route path="/coming-soon" component={() => <AnimatedPage><ComingSoon pageName="This Feature" /></AnimatedPage>} />
        
        {/* Order Status Page */}
        <Route path="/order-status" component={() => <AnimatedPage><OrderStatus /></AnimatedPage>} />
        
        {/* Legal Pages */}
        <Route path="/privacy-policy" component={() => <AnimatedPage><PrivacyPolicy /></AnimatedPage>} />
        <Route path="/terms-of-service" component={() => <AnimatedPage><TermsOfService /></AnimatedPage>} />
        <Route path="/shipping-policy" component={() => <AnimatedPage><ShippingPolicy /></AnimatedPage>} />
        
        {/* Admin Panel (hidden route) */}
        <Route path="/admin" component={() => <AdminPanel />} />
        <Route path="/admin/login" component={() => <AdminLogin />} />
        
        {/* 404 Page */}
        <Route component={() => <AnimatedPage><NotFound /></AnimatedPage>} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <DiscountProvider>
            <AwayModeProvider>
              <AdminNotificationProvider>
                {/* ScrollRestoration ensures pages always start at the top */}
                <ScrollRestoration />
                <Router />
                <Toaster />
              </AdminNotificationProvider>
            </AwayModeProvider>
          </DiscountProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;