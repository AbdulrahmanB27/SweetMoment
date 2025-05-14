/**
 * StaticApp Component
 * 
 * This is the entry point for the static version of the application.
 * It's similar to App.tsx but with static-specific wrappers and configuration.
 */

import React from 'react';
import { Route, Switch } from 'wouter';
import { StaticDataProvider } from '@/context/StaticDataContext';

// Import pages that will be available in the static site
import Home from '@/pages/Home';
import Menu from '@/pages/Menu';
import Product from '@/pages/Product';
import About from '@/pages/About';
import NotFound from '@/pages/NotFound';

// Import components
import Layout from '@/components/Layout';

interface StaticAppProps {
  /**
   * Pre-loaded static data (populated during the build process)
   */
  staticData?: any;
}

const StaticApp: React.FC<StaticAppProps> = ({ staticData }) => {
  return (
    <StaticDataProvider data={staticData}>
      <Layout>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/menu" component={Menu} />
          <Route path="/menu/:category" component={Menu} />
          <Route path="/product/:id" component={Product} />
          <Route path="/about" component={About} />
          
          {/* Fallback route */}
          <Route component={NotFound} />
        </Switch>
      </Layout>
    </StaticDataProvider>
  );
};

export default StaticApp;