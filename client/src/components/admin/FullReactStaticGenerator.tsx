import { useState, useEffect } from "react";
import { Download, Check, Loader2, AlertCircle, Globe, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PageConfig {
  [key: string]: boolean;
}

interface FeatureConfig {
  [key: string]: boolean;
}

/**
 * FullReactStaticGenerator Component
 * 
 * This component creates a complete static version of the site preserving ALL frontend frameworks.
 * Rather than just generating static HTML, this exports the entire React application with:
 * 1. All React components and libraries
 * 2. CSS, JS, and assets with proper paths
 * 3. Static data files that replace API calls
 * 4. Full client-side navigation with wouter
 */
export default function FullReactStaticGenerator() {
  const { toast } = useToast();
  const [baseUrl, setBaseUrl] = useState<string>("/SweetMoment/");
  const [deploymentType, setDeploymentType] = useState<string>("github"); // github, custom
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [generationStatus, setGenerationStatus] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedPackage, setCompletedPackage] = useState<string | null>(null);
  const [pageConfig, setPageConfig] = useState<PageConfig>({
    home: true,
    products: true,
    product: true,
    about: true,
    contact: true,
    admin: false,
    checkout: false,
    cart: false,
    orderStatus: false,
  });
  
  const [featureConfig, setFeatureConfig] = useState<FeatureConfig>({
    carousel: true,
    animations: true,
    reviews: true,
    search: true,
    filter: true,
    socialMedia: false,
    customerData: false,
  });

  /**
   * Fetch all data needed for the static site
   */
  const generateStaticData = async () => {
    setIsGenerating(true);
    setGenerationProgress(5);
    setGenerationStatus("Starting static data generation...");
    setErrorMessage(null);
    setCompletedPackage(null);
    
    try {
      // Check admin authentication first
      setGenerationStatus("Checking authentication...");
      
      // Start data collection
      setGenerationStatus("Collecting site data...");
      setGenerationProgress(15);
      
      // Request to generate static data
      const response = await fetch(`/api/static-react/generate?baseUrl=${encodeURIComponent(baseUrl)}`);
      
      if (!response.ok) {
        throw new Error(`Failed to generate static data: ${response.statusText}`);
      }
      
      setGenerationProgress(50);
      setGenerationStatus("Static data generated successfully!");
      
      // Now generate the full package
      await generateStaticPackage();
      
    } catch (error) {
      console.error("Error generating static data:", error);
      setErrorMessage(`Failed to generate static data: ${error instanceof Error ? error.message : String(error)}`);
      setIsGenerating(false);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: `Could not generate static data: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  };

  /**
   * Generate a full static React site package
   */
  const generateStaticPackage = async () => {
    try {
      setGenerationStatus("Building complete static package...");
      setGenerationProgress(60);
      
      // Convert page and feature configs to URL params
      const pageParams = Object.entries(pageConfig)
        .map(([page, included]) => `page_${page}=${included ? 1 : 0}`)
        .join("&");
        
      const featureParams = Object.entries(featureConfig)
        .map(([feature, included]) => `feature_${feature}=${included ? 1 : 0}`)
        .join("&");
      
      // Create the full request URL with all parameters
      const url = `/api/static-react/full-package?baseUrl=${encodeURIComponent(baseUrl)}&${pageParams}&${featureParams}`;
      
      setGenerationStatus("Packaging static site files...");
      setGenerationProgress(75);
      
      // Request the package
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to generate package: ${response.statusText}`);
      }
      
      // Get download URL
      const data = await response.json();
      setCompletedPackage(data.downloadUrl);
      
      setGenerationProgress(100);
      setGenerationStatus("Package generated successfully!");
      
      toast({
        title: "Success!",
        description: "Static site package generated successfully",
        duration: 5000,
      });
    } catch (error) {
      console.error("Error generating package:", error);
      setErrorMessage(`Failed to generate package: ${error instanceof Error ? error.message : String(error)}`);
      setGenerationProgress(0);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: `Could not generate package: ${error instanceof Error ? error.message : String(error)}`,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Toggle an individual page inclusion
   */
  const togglePage = (page: string) => {
    setPageConfig(prev => ({
      ...prev,
      [page]: !prev[page]
    }));
  };

  /**
   * Toggle an individual feature exclusion
   */
  const toggleFeature = (feature: string) => {
    setFeatureConfig(prev => ({
      ...prev,
      [feature]: !prev[feature]
    }));
  };

  // Update baseUrl when deployment type changes
  useEffect(() => {
    if (deploymentType === "github") {
      setBaseUrl("/SweetMoment/");
    } else {
      setBaseUrl("/");
    }
  }, [deploymentType]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Complete React Static Site Generator</h3>
        <p className="text-sm text-muted-foreground">
          This tool generates a complete static version of your site with all React components
          and frontend frameworks intact. Perfect for GitHub Pages or custom static hosting.
        </p>
      </div>

      {/* Deployment Configuration */}
      <div className="space-y-4 border rounded-md p-4">
        <h4 className="font-medium">Deployment Configuration</h4>
        
        <RadioGroup 
          defaultValue="github" 
          value={deploymentType}
          onValueChange={setDeploymentType}
          className="flex flex-col space-y-2 mt-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="github" id="deployment-github" />
            <Label htmlFor="deployment-github" className="flex items-center space-x-2">
              <Github className="h-4 w-4" />
              <span>GitHub Pages</span>
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="custom" id="deployment-custom" />
            <Label htmlFor="deployment-custom" className="flex items-center space-x-2">
              <Globe className="h-4 w-4" />
              <span>Custom Domain</span>
            </Label>
          </div>
        </RadioGroup>
        
        <div className="space-y-2 mt-2">
          <Label htmlFor="base-url">Base URL</Label>
          <Input 
            id="base-url" 
            value={baseUrl} 
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder={deploymentType === "github" ? "/SweetMoment/" : "/"}
            className="max-w-md"
          />
          <p className="text-xs text-muted-foreground">
            {deploymentType === "github" 
              ? "For GitHub Pages, use /your-repo-name/ (e.g. /SweetMoment/)" 
              : "For custom domains, use / for root or /subfolder/ for a subdirectory"}
          </p>
        </div>
      </div>
      
      <Separator />

      {/* Page Configuration */}
      <div className="space-y-4">
        <h4 className="font-medium">Pages to Include</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="page-home" checked={pageConfig.home} onCheckedChange={() => togglePage('home')} />
            <Label htmlFor="page-home">Home</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="page-products" checked={pageConfig.products} onCheckedChange={() => togglePage('products')} />
            <Label htmlFor="page-products">Products</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="page-product" checked={pageConfig.product} onCheckedChange={() => togglePage('product')} />
            <Label htmlFor="page-product">Product Detail</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="page-about" checked={pageConfig.about} onCheckedChange={() => togglePage('about')} />
            <Label htmlFor="page-about">About</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="page-contact" checked={pageConfig.contact} onCheckedChange={() => togglePage('contact')} />
            <Label htmlFor="page-contact">Contact</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="page-admin" checked={pageConfig.admin} onCheckedChange={() => togglePage('admin')} />
            <Label htmlFor="page-admin">Admin</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="page-checkout" checked={pageConfig.checkout} onCheckedChange={() => togglePage('checkout')} />
            <Label htmlFor="page-checkout">Checkout</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="page-cart" checked={pageConfig.cart} onCheckedChange={() => togglePage('cart')} />
            <Label htmlFor="page-cart">Cart</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="page-order-status" checked={pageConfig.orderStatus} onCheckedChange={() => togglePage('orderStatus')} />
            <Label htmlFor="page-order-status">Order Status</Label>
          </div>
        </div>
      </div>
      
      <Separator />
      
      {/* Feature Configuration */}
      <div className="space-y-4">
        <h4 className="font-medium">Features to Include</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="feature-carousel" checked={featureConfig.carousel} onCheckedChange={() => toggleFeature('carousel')} />
            <Label htmlFor="feature-carousel">Product Carousel</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="feature-animations" checked={featureConfig.animations} onCheckedChange={() => toggleFeature('animations')} />
            <Label htmlFor="feature-animations">Animations</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="feature-reviews" checked={featureConfig.reviews} onCheckedChange={() => toggleFeature('reviews')} />
            <Label htmlFor="feature-reviews">Product Reviews</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="feature-search" checked={featureConfig.search} onCheckedChange={() => toggleFeature('search')} />
            <Label htmlFor="feature-search">Search Functionality</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="feature-filter" checked={featureConfig.filter} onCheckedChange={() => toggleFeature('filter')} />
            <Label htmlFor="feature-filter">Product Filtering</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="feature-social" checked={featureConfig.socialMedia} onCheckedChange={() => toggleFeature('socialMedia')} />
            <Label htmlFor="feature-social">Social Media</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="feature-customer" checked={featureConfig.customerData} onCheckedChange={() => toggleFeature('customerData')} />
            <Label htmlFor="feature-customer">Customer Data</Label>
          </div>
        </div>
      </div>
      
      <Separator />
      
      {/* Generation Controls */}
      <div className="space-y-4">
        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        
        {isGenerating && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{generationStatus}</span>
            </div>
            <Progress value={generationProgress} className="h-2" />
          </div>
        )}
        
        {completedPackage && !isGenerating && (
          <Alert className="bg-primary/10 text-primary border-primary">
            <Check className="h-4 w-4" />
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>Your static site package is ready to download.</p>
              <Button asChild size="sm" variant="outline">
                <a href={completedPackage} download>
                  <Download className="mr-2 h-4 w-4" />
                  Download Package
                </a>
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        <Button
          onClick={generateStaticData}
          disabled={isGenerating}
          className="w-full sm:w-auto"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Generate Static Site
            </>
          )}
        </Button>
      </div>
    </div>
  );
}