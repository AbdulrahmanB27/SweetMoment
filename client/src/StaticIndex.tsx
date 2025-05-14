/**
 * StaticIndex Component
 * 
 * This is the entrypoint for static site generation.
 * It works by:
 * 1. Setting up the static data context
 * 2. Running the ReactStaticSiteGenerator to collect data
 * 3. Providing functions to save the collected data
 */

import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StaticDataProvider, type StaticData } from '@/context/StaticDataContext';
import ReactStaticSiteGenerator from '@/components/ReactStaticSiteGenerator';
import StaticApp from './StaticApp';

// Create a client for react-query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

/**
 * StaticIndex Component - Entry point for static site generation
 */
const StaticIndex: React.FC = () => {
  // State to hold the collected data
  const [staticData, setStaticData] = useState<StaticData | null>(null);
  
  // Handler for when data collection is complete
  const handleDataReady = (data: StaticData) => {
    console.log('Static data collection complete:', data);
    setStaticData(data);
    
    // Attach the data to the window for debugging
    if (typeof window !== 'undefined') {
      window.STATIC_DATA = data;
    }
    
    // In a real build process, we would save this data to a file
    // This is handled by the backend build script
  };
  
  return (
    <QueryClientProvider client={queryClient}>
      <StaticDataProvider>
        {/* Data Collection Component */}
        <ReactStaticSiteGenerator 
          onComplete={handleDataReady}
          showDebugUI={true}
        />
        
        {/* Preview of the static site */}
        {staticData && (
          <div style={{ marginTop: '2rem' }}>
            <h2>Preview of static site:</h2>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <StaticApp staticData={staticData} />
            </div>
          </div>
        )}
      </StaticDataProvider>
    </QueryClientProvider>
  );
};

// Only render in the browser, not during SSR
if (typeof window !== 'undefined') {
  ReactDOM.render(
    <React.StrictMode>
      <StaticIndex />
    </React.StrictMode>,
    document.getElementById('root')
  );
}

export default StaticIndex;