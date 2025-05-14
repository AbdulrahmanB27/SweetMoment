/**
 * ReactStaticSiteGenerator Component
 * 
 * This component is responsible for collecting data during the static site generation process.
 * It works by:
 * 1. Making API requests for key data
 * 2. Storing this data in the StaticDataContext
 * 3. Tracking progress of data collection
 * 
 * During the static site generation build process, this component will be rendered,
 * and the collected data will be saved to a JSON file to be included in the static site.
 */

import React, { useEffect, useState } from 'react';
import { useUpdateStaticData } from '@/hooks/useStaticDataQuery';
import { apiRequest } from '@/lib/queryClient';

interface ReactStaticSiteGeneratorProps {
  /**
   * Function to call when data collection is complete
   */
  onComplete?: (data: any) => void;
  
  /**
   * Whether to show debug UI during generation
   */
  showDebugUI?: boolean;
}

/**
 * List of API endpoints to fetch for the static site
 */
const API_ENDPOINTS = [
  // Site customization data
  '/api/site-customization',
  
  // Product data
  '/api/products',
  
  // Category data
  '/api/categories',
];

/**
 * Component that fetches data for static site generation
 */
const ReactStaticSiteGenerator: React.FC<ReactStaticSiteGeneratorProps> = ({
  onComplete,
  showDebugUI = false,
}) => {
  // Get the function to update static data
  const { updateData } = useUpdateStaticData();
  
  // State to track progress
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  
  // Add a log entry
  const addLog = (message: string) => {
    setLog((prevLog) => [...prevLog, `[${new Date().toISOString()}] ${message}`]);
  };
  
  // Effect to fetch data for static site generation
  useEffect(() => {
    const fetchData = async () => {
      addLog('Starting static site data collection...');
      const totalEndpoints = API_ENDPOINTS.length;
      let completedEndpoints = 0;
      
      try {
        // Basic endpoints
        for (const endpoint of API_ENDPOINTS) {
          try {
            addLog(`Fetching ${endpoint}...`);
            const data = await apiRequest('GET', endpoint);
            updateData(endpoint, data);
            addLog(`Successfully fetched ${endpoint}`);
          } catch (err: any) {
            addLog(`Error fetching ${endpoint}: ${err.message}`);
            setError(`Error fetching ${endpoint}: ${err.message}`);
          }
          
          completedEndpoints++;
          setProgress(Math.floor((completedEndpoints / totalEndpoints) * 100));
        }
        
        // Additional data needed - product reviews
        try {
          addLog('Fetching product data for reviews...');
          const products = await apiRequest('GET', '/api/products');
          
          // Get reviews for each product
          for (const product of products) {
            try {
              addLog(`Fetching reviews for product ${product.id}...`);
              const reviews = await apiRequest('GET', `/api/products/${product.id}/reviews`);
              updateData(`/api/products/${product.id}/reviews`, reviews);
              addLog(`Successfully fetched reviews for product ${product.id}`);
            } catch (err: any) {
              addLog(`Error fetching reviews for product ${product.id}: ${err.message}`);
            }
          }
        } catch (err: any) {
          addLog(`Error fetching product data for reviews: ${err.message}`);
        }
        
        // Mark as complete
        setIsComplete(true);
        addLog('Static site data collection complete!');
        
        // Call onComplete if provided
        if (onComplete) {
          // Get the static data from window (which the context updates)
          if (typeof window !== 'undefined' && window.STATIC_DATA) {
            onComplete(window.STATIC_DATA);
          }
        }
      } catch (err: any) {
        setError(`Error collecting static site data: ${err.message}`);
        addLog(`Error collecting static site data: ${err.message}`);
      }
    };
    
    fetchData();
  }, [updateData, onComplete]);
  
  // If showDebugUI is false, render nothing (but still fetch data)
  if (!showDebugUI) {
    return null;
  }
  
  // Otherwise, render the debug UI
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
        <h2 className="text-2xl font-bold mb-4">Static Site Data Collection</h2>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
          <div
            className="bg-blue-600 h-4 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Status */}
        <p className="mb-4">
          Status: {isComplete ? 'Complete' : error ? 'Error' : 'In Progress'} ({progress}%)
        </p>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}
        
        {/* Log */}
        <div className="bg-gray-100 p-3 rounded h-60 overflow-y-auto text-xs font-mono">
          {log.map((entry, index) => (
            <div key={index} className="mb-1">
              {entry}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReactStaticSiteGenerator;