import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { FileDown, Globe } from 'lucide-react';

/**
 * Simple Static Site Generator component for the admin panel
 * This provides a basic HTML version of the site that can be deployed anywhere
 */
const BasicStaticSiteGenerator: React.FC = () => {
  const { toast } = useToast();
  
  const handleGenerateClick = async () => {
    try {
      toast({
        title: "Generating static site...",
        description: "Please wait while we create your static site.",
      });
      
      // Make a request to download the static site
      const response = await fetch('/api/static-site-generator/generate-static-site');
      
      if (!response.ok) {
        throw new Error(`Failed to generate static site: ${response.statusText}`);
      }
      
      // Get the blob data
      const blob = await response.blob();
      
      // Create a download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sweet-moment-static-site-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      toast({
        title: "Static site generated!",
        description: "Your static site HTML file has been downloaded.",
      });
    } catch (error) {
      console.error("Error generating static site:", error);
      toast({
        title: "Error generating static site",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Basic Static Site Generator
        </CardTitle>
        <CardDescription>
          Generate a simple HTML version of your site that can be deployed anywhere
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          This will create a complete static HTML file of your site including all products, 
          styles, and content. The file will work as a standalone website when deployed to 
          any static hosting service.
        </p>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span className="text-sm">All product data included</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span className="text-sm">Complete styling - looks exactly like your main site</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span className="text-sm">No server or database required</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
            <span className="text-sm">Checkout features excluded (static only)</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleGenerateClick}
          className="w-full flex items-center gap-2"
        >
          <FileDown className="h-4 w-4" />
          Generate Static Site
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BasicStaticSiteGenerator;