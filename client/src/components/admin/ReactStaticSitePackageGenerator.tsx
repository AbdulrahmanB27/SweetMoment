import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Check, Github, Download, Archive } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import JSZip from 'jszip';

interface ReactStaticSitePackageGeneratorProps {
  staticData?: any;
  isGenerating?: boolean;
  baseUrl?: string;
}

// Define which pages should be included in the static site
interface StaticSitePages {
  home: boolean;
  menu: boolean;
  products: boolean;
  about: boolean;
  contact: boolean;
  faq: boolean;
  terms: boolean;
  privacy: boolean;
}

// Define which pages should be excluded from the static site
interface ExcludedFeatures {
  adminPanel: boolean;
  checkout: boolean;
  cart: boolean;
  orders: boolean;
  account: boolean;
  login: boolean;
  customOrders: boolean;
  socialMedia: boolean;
}

/**
 * Component to generate a complete React static site package for GitHub Pages
 * This takes the static data and creates a downloadable ZIP file with all React components
 */
const ReactStaticSitePackageGenerator: React.FC<ReactStaticSitePackageGeneratorProps> = ({ 
  staticData,
  isGenerating = false,
  baseUrl = '/SweetMoment/'
}) => {
  const { toast } = useToast();
  const [packageStatus, setPackageStatus] = useState<string>('');
  const [packageProgress, setPackageProgress] = useState<number>(0);
  const [isPackaging, setIsPackaging] = useState<boolean>(false);
  const [isPackageComplete, setIsPackageComplete] = useState<boolean>(false);
  const [packageError, setPackageError] = useState<string | null>(null);
  
  // Initialize included pages - all public pages are enabled by default
  const [includedPages, setIncludedPages] = useState<StaticSitePages>({
    home: true,
    menu: true,
    products: true,
    about: true,
    contact: true,
    faq: true,
    terms: true,
    privacy: true
  });
  
  // Initialize excluded features - all dynamic/admin features are excluded by default
  const [excludedFeatures, setExcludedFeatures] = useState<ExcludedFeatures>({
    adminPanel: true,
    checkout: true,
    cart: true,
    orders: true,
    account: true,
    login: true,
    customOrders: true,
    socialMedia: true
  });

  /**
   * Create a complete React static site package
   */
  const createReactStaticPackage = async () => {
    if (!staticData) {
      setPackageError('No static data available. Please generate the static site data first.');
      return;
    }

    try {
      setIsPackaging(true);
      setPackageError(null);
      setPackageProgress(0);
      setPackageStatus('Creating React static site package...');
      
      // Create a new JSZip instance
      const zip = new JSZip();
      
      // Create a README file
      setPackageProgress(5);
      setPackageStatus('Adding README file...');
      zip.file('README.md', `# Sweet Moment Chocolates React Static Site

This is a complete static version of the Sweet Moment Chocolates React website.

## Setup for GitHub Pages

1. Push these files to a new repository on GitHub
2. Enable GitHub Pages in the repository settings
3. Configure Pages to deploy from the main branch

## How This Works

This package contains a complete static build of the React application.
It includes:

- The compiled HTML, CSS, and JavaScript files
- All assets (images, fonts, etc.)
- Static data files to replace dynamic API calls

## Included Pages

${Object.entries(includedPages)
  .filter(([_, isIncluded]) => isIncluded)
  .map(([page]) => `- ${page.charAt(0).toUpperCase() + page.slice(1)}`)
  .join('\n')}

## Excluded Features

${Object.entries(excludedFeatures)
  .filter(([_, isExcluded]) => isExcluded)
  .map(([feature]) => `- ${feature.charAt(0).toUpperCase() + feature.slice(1)}`)
  .join('\n')}

Generated on: ${new Date().toISOString()}
`);
      
      // Fetch the pre-built static React site assets
      setPackageProgress(20);
      setPackageStatus('Fetching React static site assets...');
      
      try {
        // Get the index-template.html file
        const indexResponse = await fetch('/static-react-site/index-template.html');
        if (!indexResponse.ok) {
          throw new Error(`Failed to fetch index template: ${indexResponse.status}`);
        }
        
        let indexHtml = await indexResponse.text();
        
        // Replace placeholders in the template
        indexHtml = indexHtml.replace(
          '<!-- STATIC_DATA_PLACEHOLDER -->', 
          JSON.stringify(staticData)
        );
        
        indexHtml = indexHtml.replace(
          '<!-- STATIC_TIMESTAMP_PLACEHOLDER -->', 
          new Date().toISOString()
        );
        
        // Add page and feature configuration
        indexHtml = indexHtml.replace(
          '<!-- STATIC_PAGES_PLACEHOLDER -->', 
          JSON.stringify(includedPages)
        );
        
        indexHtml = indexHtml.replace(
          '<!-- STATIC_EXCLUDED_FEATURES_PLACEHOLDER -->', 
          JSON.stringify(excludedFeatures)
        );
        
        indexHtml = indexHtml.replace(
          'window.STATIC_SITE_BASE_URL = \'\';', 
          `window.STATIC_SITE_BASE_URL = '${baseUrl}';`
        );
        
        // Add the CSS path fix script
        const cssFixResponse = await fetch('/static-react-site/css-fix.js');
        if (cssFixResponse.ok) {
          const cssFixScript = await cssFixResponse.text();
          indexHtml = indexHtml.replace(
            '<!-- CSS_FIX_PLACEHOLDER -->', 
            `<script>${cssFixScript}</script>`
          );
        }
        
        // Add the resource fixer script
        const fixerResponse = await fetch('/static-react-site/resource-path-fixer.js');
        if (fixerResponse.ok) {
          const fixerScript = await fixerResponse.text();
          indexHtml = indexHtml.replace(
            '<!-- STATIC_RESOURCE_FIXER_PLACEHOLDER -->', 
            fixerScript
          );
        }
        
        // Add the index.html to the root of the ZIP
        zip.file('index.html', indexHtml);
        
        // Collect CSS and JS assets
        setPackageProgress(40);
        setPackageStatus('Collecting CSS and JavaScript assets...');
        
        // Get the CSS file
        const cssResponse = await fetch('/assets/index.css');
        if (cssResponse.ok) {
          const cssText = await cssResponse.text();
          // Create assets directory
          const assets = zip.folder('assets');
          assets?.file('index.css', cssText);
        }
        
        // Get the JS file
        const jsResponse = await fetch('/assets/index.js');
        if (jsResponse.ok) {
          const jsBlob = await jsResponse.blob();
          // Add to assets
          const assets = zip.folder('assets') || zip;
          assets.file('index.js', jsBlob);
        }
        
        // Get the build-export.js helper
        const buildExportResponse = await fetch('/static-react-site/build-export.js');
        if (buildExportResponse.ok) {
          const buildExportScript = await buildExportResponse.text();
          zip.file('build-export.js', buildExportScript);
        } else {
          console.warn('Failed to fetch build-export.js script');
        }
        
        // Get the static-app-wrapper.js helper
        const staticAppWrapperResponse = await fetch('/static-react-site/static-app-wrapper.js');
        if (staticAppWrapperResponse.ok) {
          const staticAppWrapperScript = await staticAppWrapperResponse.text();
          zip.file('static-app-wrapper.js', staticAppWrapperScript);
        } else {
          console.warn('Failed to fetch static-app-wrapper.js script');
        }
        
        // Get the component-export.js helper
        const componentExportResponse = await fetch('/static-react-site/component-export.js');
        if (componentExportResponse.ok) {
          const componentExportScript = await componentExportResponse.text();
          zip.file('component-export.js', componentExportScript);
        } else {
          console.warn('Failed to fetch component-export.js script');
        }
        
        // Get the main-styles.css file
        const mainStylesResponse = await fetch('/static-react-site/main-styles.css');
        if (mainStylesResponse.ok) {
          const mainStylesText = await mainStylesResponse.text();
          zip.file('main-styles.css', mainStylesText);
        } else {
          console.warn('Failed to fetch main-styles.css');
          
          // Create a simple fallback CSS file
          const fallbackCss = `
            body { font-family: system-ui, sans-serif; color: #44403c; background-color: #fafaf9; }
            .container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
            .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 2rem; }
            .product-card { background: white; border-radius: 0.5rem; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
            .product-card img { width: 100%; height: 200px; object-fit: cover; }
            .product-info { padding: 1.5rem; }
            h1, h2, h3 { color: #292524; }
            nav { background: #292524; color: white; padding: 1rem 0; }
            footer { background: #292524; color: white; padding: 2rem 0; margin-top: 2rem; }
          `;
          zip.file('main-styles.css', fallbackCss);
        }
        
        // Get the resource-path-fixer.js script
        const resourcePathFixerResponse = await fetch('/static-react-site/resource-path-fixer.js');
        if (resourcePathFixerResponse.ok) {
          const resourcePathFixerScript = await resourcePathFixerResponse.text();
          zip.file('resource-path-fixer.js', resourcePathFixerScript);
        } else {
          console.warn('Failed to fetch resource-path-fixer.js');
          
          // Create a simple fallback resource path fixer
          const fallbackResourceFixer = `
            (function() {
              // Simple resource path fixer for GitHub Pages
              document.addEventListener('DOMContentLoaded', function() {
                // Detect if we're on GitHub Pages and in a repo subdirectory
                const basePath = window.location.hostname.endsWith('github.io') 
                  ? '/' + window.location.pathname.split('/')[1] 
                  : '';
                if (basePath) {
                  // Fix all resource paths
                  document.querySelectorAll('link[href], script[src], img[src], a[href]').forEach(el => {
                    const attr = el.hasAttribute('href') ? 'href' : 'src';
                    const val = el.getAttribute(attr);
                    if (val && val.startsWith('/') && !val.startsWith('//') && !val.startsWith(basePath)) {
                      el.setAttribute(attr, basePath + val);
                    }
                  });
                }
              });
            })();
          `;
          zip.file('resource-path-fixer.js', fallbackResourceFixer);
        }
        
        // Create a components directory for React component exports
        const componentsDir = zip.folder('components');
        
        // Add core React component files from node_modules if possible
        try {
          const reactCorePath = '/node_modules/react/umd/react.production.min.js';
          const reactDomPath = '/node_modules/react-dom/umd/react-dom.production.min.js';
          
          const reactCoreResponse = await fetch(reactCorePath);
          if (reactCoreResponse.ok) {
            const reactCore = await reactCoreResponse.blob();
            componentsDir?.file('react.production.min.js', reactCore);
          }
          
          const reactDomResponse = await fetch(reactDomPath);
          if (reactDomResponse.ok) {
            const reactDom = await reactDomResponse.blob();
            componentsDir?.file('react-dom.production.min.js', reactDom);
          }
        } catch (e) {
          console.warn('Failed to fetch React core libraries:', e);
        }
        
        // Create static-data directory
        const staticDataDir = zip.folder('static-data');
        
        // Add the main static data file
        staticDataDir?.file('site-data.json', JSON.stringify(staticData, null, 2));
        
        // Add configuration for included pages and excluded features
        staticDataDir?.file('pages-config.json', JSON.stringify({
          includedPages,
          excludedFeatures,
          baseUrl
        }, null, 2));
        
        // Extract and collect images
        setPackageProgress(60);
        setPackageStatus('Collecting image assets...');
        
        // Create images directory
        const imagesDir = zip.folder('images');
        
        // Extract image URLs from static data
        const imageUrls = extractImageUrls(staticData);
        console.log('Extracted image URLs:', imageUrls);
        
        // Fetch each image and add to the ZIP
        await Promise.allSettled(
          imageUrls.map(async (url) => {
            try {
              const fullUrl = url.startsWith('/') ? url : '/' + url;
              const cleanUrl = fullUrl.split('?')[0]; // Remove query parameters
              const imageResponse = await fetch(cleanUrl);
              
              if (!imageResponse.ok) {
                console.warn(`Failed to fetch image: ${cleanUrl}`);
                return;
              }
              
              const imageBlob = await imageResponse.blob();
              
              // Extract filename from path
              const filename = cleanUrl.split('/').pop() || `image-${Math.random().toString(36).substring(7)}.jpg`;
              
              // Add to zip
              imagesDir?.file(filename, imageBlob);
            } catch (error) {
              console.error(`Error fetching image ${url}:`, error);
            }
          })
        );
        
        // Create 404.html for GitHub Pages SPA routing
        setPackageProgress(80);
        setPackageStatus('Adding GitHub Pages configuration...');
        
        // Copy the index.html to 404.html for SPA routing
        zip.file('404.html', indexHtml);
        
        // Add .nojekyll file for GitHub Pages
        zip.file('.nojekyll', '');
        
        // Add GitHub Pages CNAME file if custom domain is used
        if (baseUrl === '/') {
          zip.file('CNAME', 'www.sweetmomentchocolates.com');
        }
        
        // Generate the ZIP file
        setPackageProgress(90);
        setPackageStatus('Generating ZIP file...');
        const content = await zip.generateAsync({ 
          type: 'blob',
          compression: 'DEFLATE',
          compressionOptions: {
            level: 6
          }
        });
        
        // Create download link
        setPackageProgress(100);
        setPackageStatus('Package complete!');
        setIsPackageComplete(true);
        
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sweet-moment-react-static-${new Date().toISOString().split('T')[0]}.zip`;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);
        
        toast({
          title: "React static site package created successfully",
          description: "Your complete React static site is ready for GitHub Pages",
        });
        
      } catch (fetchError: any) {
        console.error('Error fetching static site assets:', fetchError);
        throw new Error(`Failed to create static site package: ${fetchError.message}`);
      }
      
    } catch (error: any) {
      console.error('React static site package generation error:', error);
      setPackageError(`Error generating package: ${error.message}`);
      setIsPackageComplete(false);
      
      toast({
        title: "Package generation failed",
        description: error.message,
        variant: "destructive",
      });
      
    } finally {
      setIsPackaging(false);
    }
  };
  
  /**
   * Extract all image URLs from the static data
   */
  const extractImageUrls = (data: any): string[] => {
    const urls: Set<string> = new Set();
    
    // Function to recursively extract URLs from objects
    const extractFromObject = (obj: any) => {
      if (!obj || typeof obj !== 'object') return;
      
      // Check all keys
      Object.keys(obj).forEach(key => {
        const value = obj[key];
        
        // Check if it's an image URL (common patterns)
        if (typeof value === 'string' && 
            (key.includes('image') || key.includes('url') || key.includes('background') || key.includes('icon')) && 
            (value.startsWith('/uploads/') || value.match(/\.(jpg|jpeg|png|gif|svg|webp)(\?.*)?$/i))) {
          urls.add(value);
        }
        
        // For arrays (including image arrays)
        if (Array.isArray(value)) {
          // Check if it's an array of image URLs
          if (value.length > 0 && typeof value[0] === 'string' && 
              (value[0].startsWith('/uploads/') || value[0].match(/\.(jpg|jpeg|png|gif|svg|webp)(\?.*)?$/i))) {
            value.forEach(url => {
              if (typeof url === 'string') urls.add(url);
            });
          }
          
          // Recurse into array items
          value.forEach(item => {
            if (item && typeof item === 'object') {
              extractFromObject(item);
            }
          });
        } 
        // Recurse into nested objects
        else if (value && typeof value === 'object') {
          extractFromObject(value);
        }
      });
    };
    
    // Start extraction from the root object
    extractFromObject(data);
    
    return Array.from(urls);
  };

  // Handler for toggling page inclusion
  const handlePageToggle = (page: keyof StaticSitePages) => {
    setIncludedPages(prev => ({
      ...prev,
      [page]: !prev[page]
    }));
  };

  return (
    <Card className="p-4 md:p-6">
      <div className="flex flex-col space-y-4">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Github className="w-5 h-5" />
              Complete React Static Site
            </h3>
            
            <Button
              onClick={createReactStaticPackage}
              disabled={isPackaging || !staticData || isGenerating}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
            >
              <Archive className="w-4 h-4" />
              Create Complete React Package
            </Button>
          </div>
          
          <Alert className="bg-amber-50 border-amber-100">
            <AlertDescription className="text-amber-800">
              This will create a complete downloadable React application package with all your pages, components, 
              and assets intact. Perfect for GitHub Pages deployment with the exact same look and functionality as your 
              dynamic site.
            </AlertDescription>
          </Alert>
          
          {/* Page Configuration Section */}
          <div className="mt-4 border rounded-md p-4">
            <h4 className="font-medium mb-3">Pages to Include in Static Site</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="include-home" 
                  checked={includedPages.home}
                  onCheckedChange={() => handlePageToggle('home')}
                  disabled={true} // Home page is always included
                />
                <Label htmlFor="include-home">Home Page</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="include-menu" 
                  checked={includedPages.menu}
                  onCheckedChange={() => handlePageToggle('menu')}
                />
                <Label htmlFor="include-menu">Menu</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="include-products" 
                  checked={includedPages.products}
                  onCheckedChange={() => handlePageToggle('products')}
                />
                <Label htmlFor="include-products">Product Pages</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="include-about" 
                  checked={includedPages.about}
                  onCheckedChange={() => handlePageToggle('about')}
                />
                <Label htmlFor="include-about">About Us</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="include-contact" 
                  checked={includedPages.contact}
                  onCheckedChange={() => handlePageToggle('contact')}
                />
                <Label htmlFor="include-contact">Contact Us</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="include-faq" 
                  checked={includedPages.faq}
                  onCheckedChange={() => handlePageToggle('faq')}
                />
                <Label htmlFor="include-faq">FAQ</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="include-terms" 
                  checked={includedPages.terms}
                  onCheckedChange={() => handlePageToggle('terms')}
                />
                <Label htmlFor="include-terms">Terms of Service</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="include-privacy" 
                  checked={includedPages.privacy}
                  onCheckedChange={() => handlePageToggle('privacy')}
                />
                <Label htmlFor="include-privacy">Privacy Policy</Label>
              </div>
            </div>
            
            <h4 className="font-medium mb-3 mt-5">Features Excluded from Static Site</h4>
            <p className="text-sm text-muted-foreground mb-3">
              These features require database access and will be automatically excluded from the static site.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="flex items-center space-x-2 opacity-60">
                <Switch id="exclude-admin" checked={true} disabled />
                <Label htmlFor="exclude-admin">Admin Panel</Label>
              </div>
              
              <div className="flex items-center space-x-2 opacity-60">
                <Switch id="exclude-checkout" checked={true} disabled />
                <Label htmlFor="exclude-checkout">Checkout</Label>
              </div>
              
              <div className="flex items-center space-x-2 opacity-60">
                <Switch id="exclude-cart" checked={true} disabled />
                <Label htmlFor="exclude-cart">Cart</Label>
              </div>
              
              <div className="flex items-center space-x-2 opacity-60">
                <Switch id="exclude-orders" checked={true} disabled />
                <Label htmlFor="exclude-orders">Order Status</Label>
              </div>
              
              <div className="flex items-center space-x-2 opacity-60">
                <Switch id="exclude-account" checked={true} disabled />
                <Label htmlFor="exclude-account">Account</Label>
              </div>
              
              <div className="flex items-center space-x-2 opacity-60">
                <Switch id="exclude-login" checked={true} disabled />
                <Label htmlFor="exclude-login">Login/Register</Label>
              </div>
              
              <div className="flex items-center space-x-2 opacity-60">
                <Switch id="exclude-custom" checked={true} disabled />
                <Label htmlFor="exclude-custom">Custom Orders</Label>
              </div>
              
              <div className="flex items-center space-x-2 opacity-60">
                <Switch id="exclude-social" checked={true} disabled />
                <Label htmlFor="exclude-social">Social Media Features</Label>
              </div>
            </div>
          </div>
        </div>
        
        {isPackaging && (
          <div className="space-y-2">
            <Progress value={packageProgress} className="h-2" />
            <p className="text-sm text-muted-foreground">{packageStatus}</p>
          </div>
        )}
        
        {isPackageComplete && !isPackaging && !packageError && (
          <Alert className="bg-green-50 border-green-200">
            <Check className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Complete React Package Created!</AlertTitle>
            <AlertDescription className="text-green-700">
              Your complete React static site package has been downloaded. It contains all components, pages, and assets
              from your site. Extract and upload to GitHub for deployment.
            </AlertDescription>
          </Alert>
        )}
        
        {packageError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Generation Failed</AlertTitle>
            <AlertDescription>
              {packageError}
            </AlertDescription>
          </Alert>
        )}
        
        {!staticData && !isGenerating && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Static Data Required</AlertTitle>
            <AlertDescription>
              Please generate the static site data before creating a React package.
            </AlertDescription>
          </Alert>
        )}
        
        {isGenerating && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Generation in Progress</AlertTitle>
            <AlertDescription>
              Please wait for the static site data generation to complete before creating a package.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </Card>
  );
};

export default ReactStaticSitePackageGenerator;