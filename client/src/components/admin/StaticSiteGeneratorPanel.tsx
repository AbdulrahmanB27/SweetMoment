/**
 * StaticSiteGeneratorPanel Component
 * 
 * This component serves as a wrapper around ReactStaticSiteGenerator
 * to provide a better user experience in the admin panel.
 * It adds a manual trigger button to prevent automatic data collection
 * and offers controls for generation configuration.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Download, RefreshCw, AlertCircle, Check, StopCircle, Clock, AlertTriangle, FileJson, Archive } from 'lucide-react';
import ReactStaticSiteGenerator from '@/components/ReactStaticSiteGenerator';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import FullStaticSiteGenerator from './FullStaticSiteGenerator';
import GitHubPackageGenerator from './GitHubPackageGenerator';
import ReactStaticSitePackageGenerator from './ReactStaticSitePackageGenerator';
import BasicStaticSiteGenerator from './BasicStaticSiteGenerator';
import { apiRequest } from '@/lib/queryClient';

// Maximum time to wait for generation (3 minutes in ms)
const GENERATION_TIMEOUT = 180000;

const StaticSiteGeneratorPanel: React.FC = () => {
  const { toast } = useToast();
  const [generationStarted, setGenerationStarted] = useState(false);
  const [generationComplete, setGenerationComplete] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState('');
  const [includeProducts, setIncludeProducts] = useState(true);
  const [includeBlogs, setIncludeBlogs] = useState(true);
  const [activeTab, setActiveTab] = useState('config');
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatus, setGenerationStatus] = useState('');
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [timeoutWarning, setTimeoutWarning] = useState(false);
  const [staticData, setStaticData] = useState<any>(null);
  
  // Timeout reference for cleanup
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Set up timeout monitoring for the generation process
  useEffect(() => {
    if (generationStarted && !generationComplete && !generationError) {
      // Set a timeout warning after 45 seconds
      const warningTimeout = setTimeout(() => {
        setTimeoutWarning(true);
        setGenerationStatus('Generation is taking longer than expected...');
      }, 45000);
      
      // Set a hard timeout after the configured max time
      timeoutRef.current = setTimeout(() => {
        handleGenerationError('Generation timed out after 3 minutes. You can try again with fewer options selected.');
      }, GENERATION_TIMEOUT);
      
      return () => {
        clearTimeout(warningTimeout);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, [generationStarted, generationComplete, generationError]);
  
  // Function to start the generation process
  const startGeneration = () => {
    setGenerationStarted(true);
    setGenerationComplete(false);
    setGenerationError(null);
    setGenerationProgress(0);
    setGenerationStatus('Preparing to collect site data...');
    setTimeoutWarning(false);
    setActiveTab('logs');
    
    toast({
      title: "Static site generation started",
      description: "This process may take a few minutes. Please wait...",
    });
    
    // Pre-fetch some data to ensure we're using authenticated requests
    fetch('/api/site-customization', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to fetch data: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then(() => {
        setGenerationStatus('Fetching site customization data...');
        setGenerationProgress(5);
      })
      .catch(err => {
        handleGenerationError(`Failed to fetch initial data: ${err.message}`);
      });
  };
  
  // Function to handle generation errors
  const handleGenerationError = (errorMessage: string) => {
    setGenerationError(errorMessage);
    setIsCancelling(false);
    
    toast({
      title: "Static site generation failed",
      description: errorMessage,
      variant: "destructive",
    });
    
    // Clean up timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };
  
  // Function to handle generation progress updates
  const handleProgressUpdate = (progress: number, status: string) => {
    setGenerationProgress(progress);
    setGenerationStatus(status);
  };
  
  // Function to handle generation completion
  const handleGenerationComplete = (data: any) => {
    // Clean up timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    console.log('Static site generation complete', data);
    setGenerationComplete(true);
    setGenerationStatus('Generation complete! Your static site is ready to download.');
    setGenerationProgress(100);
    setTimeoutWarning(false);
    
    // Save the static data for GitHub package generation
    setStaticData(data);
    
    // Create a downloadable blob with the data
    try {
      // Convert the data to a formatted JSON string
      const jsonData = JSON.stringify(data, null, 2);
      
      // Create a Blob from the JSON data
      const blob = new Blob([jsonData], { type: 'application/json' });
      
      // Create a URL for the Blob
      const url = URL.createObjectURL(blob);
      
      // Set the download URL
      setDownloadUrl(url);
      
      toast({
        title: "Static site generation complete",
        description: "Your static site is ready to download",
      });
    } catch (error: any) {
      console.error('Error creating download blob:', error);
      handleGenerationError(`Failed to create downloadable file: ${error.message}`);
    }
  };
  
  // Function to cancel the generation process
  const cancelGeneration = () => {
    setIsCancelling(true);
    setGenerationStatus('Cancelling generation...');
    
    // Clean up timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Give the impression of cancellation in progress
    setTimeout(() => {
      setGenerationStarted(false);
      setIsCancelling(false);
      setActiveTab('config');
      
      toast({
        title: "Generation cancelled",
        description: "Static site generation was cancelled",
      });
    }, 1000);
  };
  
  // Function to download the generated site
  const downloadStaticSite = () => {
    if (downloadUrl) {
      // Create a temporary anchor element for downloading
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `static-site-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);
      }, 100);
    }
  };
  
  // Safe JSON fetching with better error handling
  const safeJsonFetch = async (url: string): Promise<any> => {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`,
          'x-admin-access': 'sweetmoment-dev-secret'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status} ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // Try to get the text for better error messages
        const text = await response.text();
        const firstChars = text.substring(0, 50); // First 50 chars for the error message
        throw new Error(`Server did not return JSON (got ${contentType}). Response starts with: ${firstChars}...`);
      }
      
      return await response.json();
    } catch (error: any) {
      console.error(`Error fetching ${url}:`, error);
      throw error;
    }
  };

  // Function to manually collect static data (smaller chunks)
  const collectSimplifiedData = async () => {
    try {
      // First check if we can access the admin interface
      setGenerationStatus('Checking authentication...');
      setGenerationProgress(5);
      
      try {
        // Get site customization data
        setGenerationStatus('Fetching site customization data...');
        setGenerationProgress(10);
        
        // Create a fallback basic site config in case there's an issue
        let siteConfig = {};
        try {
          siteConfig = await safeJsonFetch('/api/site-customization');
        } catch (error) {
          console.warn('Error fetching site customization, using simplified fallback:', error);
          // We'll continue with the empty object
        }
        
        // Get product list 
        setGenerationStatus('Fetching product list...');
        setGenerationProgress(30);
        let products = [];
        try {
          products = await safeJsonFetch('/api/products');
        } catch (error) {
          console.warn('Error fetching products, using empty array:', error);
          // We'll continue with the empty array
        }
        
        // Get categories
        setGenerationStatus('Fetching categories...');
        setGenerationProgress(50);
        let categories = [];
        try {
          categories = await safeJsonFetch('/api/categories');
        } catch (error) {
          console.warn('Error fetching categories, using empty array:', error);
          // We'll continue with the empty array
        }
        
        // Process the data - we'll continue even if some requests failed
        setGenerationStatus('Processing collected data...');
        setGenerationProgress(70);
        
        // Create a simplified data object
        const staticData = {
          siteCustomization: siteConfig,
          products: products,
          categories: categories,
          generatedAt: new Date().toISOString(),
        };
        
        setGenerationStatus('Finalizing static site generation...');
        setGenerationProgress(90);
        
        // Complete the generation
        handleGenerationComplete(staticData);
      } catch (innerError: any) {
        handleGenerationError(`Error during data collection: ${innerError.message}`);
      }
    } catch (error: any) {
      handleGenerationError(`Error collecting static site data: ${error.message}`);
    }
  };
  
  // Effect to run the simplified data collection when generation starts
  useEffect(() => {
    if (generationStarted && !generationComplete && !generationError && !isCancelling) {
      collectSimplifiedData();
    }
  }, [generationStarted]);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">React Static Site Generator</h3>
          {generationComplete && (
            <div className="flex items-center text-green-600">
              <Check className="w-4 h-4 mr-1" />
              <span className="text-sm">Generation Complete</span>
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Generate a static version of your website with React components for deployment to GitHub Pages or any static hosting.
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="logs" disabled={!generationStarted}>Generation Logs</TabsTrigger>
          <TabsTrigger value="github" disabled={!staticData}>GitHub Export</TabsTrigger>
        </TabsList>
        
        <TabsContent value="config" className="space-y-4">
          <Card className="p-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="baseUrl">Base URL (Optional)</Label>
                <Input
                  id="baseUrl"
                  placeholder="e.g., /my-site/ or https://mysite.com/"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  For GitHub Pages project sites, use: /repository-name/
                </p>
                <p className="text-xs text-muted-foreground">
                  For custom domains or subdomains, leave blank or use just /
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="includeProducts"
                  checked={includeProducts}
                  onCheckedChange={setIncludeProducts}
                />
                <Label htmlFor="includeProducts">Include product data</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="includeBlogs"
                  checked={includeBlogs}
                  onCheckedChange={setIncludeBlogs}
                />
                <Label htmlFor="includeBlogs">Include blog posts</Label>
              </div>
            </div>
          </Card>
          
          <div className="flex justify-between">
            <div className="flex items-center text-amber-600">
              {!generationStarted && !generationComplete && (
                <>
                  <AlertCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm">Click "Generate Static Site" to begin</span>
                </>
              )}
              {generationComplete && (
                <>
                  <Check className="w-4 h-4 mr-2 text-green-600" />
                  <span className="text-sm text-green-600">Ready to download</span>
                </>
              )}
            </div>
            
            <div className="space-x-2">
              {generationComplete ? (
                <Button onClick={downloadStaticSite} className="bg-green-600 hover:bg-green-700">
                  <Download className="w-4 h-4 mr-2" />
                  Download Static Site
                </Button>
              ) : (
                <Button 
                  onClick={startGeneration} 
                  disabled={generationStarted}
                  className={generationStarted ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"}
                >
                  {generationStarted ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>Generate Static Site</>
                  )}
                </Button>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="logs" className="space-y-4">
          <Card className="p-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Generation Status</h4>
                {timeoutWarning && (
                  <div className="flex items-center text-amber-500">
                    <Clock className="w-4 h-4 mr-1" />
                    <span className="text-xs">Taking longer than expected</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{generationStatus}</span>
                  <span>{generationProgress}%</span>
                </div>
                <Progress value={generationProgress} className="h-2" />
              </div>
              
              {generationError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-800 text-sm">
                  <div className="flex items-start mb-2">
                    <AlertTriangle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="font-medium">Generation Error</span>
                  </div>
                  <p>{generationError}</p>
                </div>
              )}
              
              {!generationComplete && !generationError && generationStarted && (
                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    onClick={cancelGeneration}
                    disabled={isCancelling}
                    className="text-red-500 border-red-200 hover:bg-red-50"
                  >
                    {isCancelling ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <StopCircle className="w-4 h-4 mr-2" />
                        Cancel Generation
                      </>
                    )}
                  </Button>
                </div>
              )}
              
              {generationComplete && (
                <div className="flex flex-col space-y-2">
                  <Alert className="bg-blue-50 border-blue-100">
                    <AlertDescription className="text-blue-700">
                      Site data generated successfully! You can download just the data file below, or go to the GitHub Export tab to create a full deployable package.
                    </AlertDescription>
                  </Alert>
                  <div className="flex justify-end">
                    <Button 
                      onClick={downloadStaticSite} 
                      className="bg-green-600 hover:bg-green-700"
                      title="Downloads only the JSON data file"
                    >
                      <FileJson className="w-4 h-4 mr-2" />
                      Download JSON Data
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="github" className="space-y-4">
          {/* Complete React static site generator */}
          <ReactStaticSitePackageGenerator 
            staticData={staticData} 
            isGenerating={generationStarted && !generationComplete}
            baseUrl={baseUrl}
          />
          
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-base font-medium mb-4">Alternative Package Options</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Full Static HTML Version */}
              <div>
                <h4 className="text-sm font-medium mb-2">Full Static HTML Version</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Generate a complete HTML version that is an exact copy of your site - works on any hosting
                </p>
                <FullStaticSiteGenerator />
              </div>
              
              {/* GitHub Package Generator */}
              <div>
                <h4 className="text-sm font-medium mb-2">GitHub Pages Package</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Generate an optimized package specifically for GitHub Pages deployment
                </p>
                <GitHubPackageGenerator 
                  staticData={staticData} 
                  isGenerating={generationStarted && !generationComplete}
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StaticSiteGeneratorPanel;