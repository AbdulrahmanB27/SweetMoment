/**
 * StaticApp Component
 * 
 * This is the entry point for the static version of the application.
 * It's similar to App.tsx but with static-specific wrappers and configuration.
 * 
 * v2.0: Enhanced with hash-based routing for better GitHub Pages compatibility
 */

import React, { useEffect } from 'react';
import { Route, Switch } from 'wouter';
import { StaticDataProvider } from '@/context/StaticDataContext';
import StaticHashRouter from '@/components/StaticHashRouter';

// Import pages that will be available in the static site
import Home from './pages/Home';
import Menu from './pages/Menu';
import Product from './pages/DynamicProduct';
import About from './pages/ComingSoon'; // Use ComingSoon as a placeholder for About
import NotFound from './pages/not-found';

// Import components
import Layout from '@/components/Layout';

interface StaticAppProps {
  /**
   * Pre-loaded static data (populated during the build process)
   */
  staticData?: any;
}

const StaticApp: React.FC<StaticAppProps> = ({ staticData }) => {
  useEffect(() => {
    // Log static app initialization
    console.log("[StaticApp] Initializing with hash-based routing for GitHub Pages compatibility");
    
    // Count page refreshes to detect and prevent refresh loops
    const refreshCount = sessionStorage.getItem('refreshCount');
    if (!refreshCount) {
      sessionStorage.setItem('refreshCount', '1');
      sessionStorage.setItem('initialPath', window.location.pathname);
      sessionStorage.setItem('refreshTime', Date.now().toString());
    } else {
      const count = parseInt(refreshCount, 10);
      const lastTime = parseInt(sessionStorage.getItem('refreshTime') || '0', 10);
      const timeDiff = Date.now() - lastTime;
      
      // If refreshing rapidly, increment counter
      if (timeDiff < 2000) {
        sessionStorage.setItem('refreshCount', (count + 1).toString());
        
        // If refreshed more than 3 times rapidly, might be in a loop
        if (count >= 3) {
          console.warn("[StaticApp] Detected possible refresh loop - resetting state");
          sessionStorage.clear();
          // Force hash-based URL to break out of any loops
          window.location.href = window.location.origin + window.location.pathname + '#/';
        }
      } else {
        // Reset counter if time between refreshes is normal
        sessionStorage.setItem('refreshCount', '1');
      }
      
      sessionStorage.setItem('refreshTime', Date.now().toString());
    }
  }, []);

  return (
    <StaticDataProvider data={staticData}>
      <StaticHashRouter>
        <Layout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/menu" component={Menu} />
            <Route path="/menu/:category" component={Menu} />
            <Route path="/product/:id">
              {(params) => <Product productId={params.id} />}
            </Route>
            <Route path="/about">
              {() => <About pageName="About Us" />}
            </Route>
            
            {/* Fallback route */}
            <Route>
              {() => <NotFound />}
            </Route>
          </Switch>
        </Layout>
      </StaticHashRouter>
    </StaticDataProvider>
  );
};

export default StaticApp;