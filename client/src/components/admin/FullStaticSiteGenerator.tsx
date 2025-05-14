/**
 * FullStaticSiteGenerator Component
 * 
 * This component creates a fully functional static version of the site that
 * exactly matches the dynamic version but with API calls replaced by static data.
 * It generates a zip package containing all necessary HTML, CSS, JS, and assets.
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { saveAs } from 'file-saver';
import { AlertCircle, FileJson, Archive, Download, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

const FullStaticSiteGenerator: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const generateStaticSite = async () => {
    setIsGenerating(true);
    setProgress(10);
    setError(null);
    
    // Create the progress interval outside the try block so we can access it in catch
    let progressInterval: ReturnType<typeof setInterval> | undefined = undefined;

    try {
      toast({
        title: "Starting generation",
        description: "Preparing to download full static site package...",
      });

      // Simulate progress updates while the server generates the package
      progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 5, 90));
      }, 500);

      // Request the package from the server
      const response = await fetch('/api/static-site/full-package', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (progressInterval !== undefined) {
        clearInterval(progressInterval);
        progressInterval = undefined;
      }

      if (!response.ok) {
        try {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to generate static site package');
        } catch (parseError) {
          // Handle cases where response isn't valid JSON
          throw new Error(`Failed to generate static site (Status ${response.status} ${response.statusText})`);
        }
      }

      setProgress(95);

      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a more descriptive filename with date included
      const filename = `sweetmoment-static-site-${new Date().toISOString().slice(0, 10)}.zip`;
      
      // Use file-saver to save the zip file
      saveAs(blob, filename);
      
      setProgress(100);
      toast({
        title: "Package generated successfully",
        description: "Your static site package has been downloaded.",
      });

      // Reset progress after a delay
      setTimeout(() => {
        setProgress(0);
        setIsGenerating(false);
      }, 2000);
    } catch (err) {
      if (progressInterval !== undefined) {
        clearInterval(progressInterval);
        progressInterval = undefined;
      }
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Generation failed",
        description: errorMessage,
      });
      setIsGenerating(false);
      setProgress(0);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Archive className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-medium">Full Static Site Package</h3>
        </div>
        <Button
          onClick={generateStaticSite}
          disabled={isGenerating}
          className="space-x-2"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Generate & Download</span>
            </>
          )}
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Creates an exact visual copy of your site with all necessary files for static hosting.
        This package includes all HTML, CSS, JavaScript, assets, data files, and navigation between pages.
        Cart, admin, and order processing features are removed, but product browsing and all UI interactions remain fully functional.
      </p>

      {progress > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Generating package...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="text-xs text-muted-foreground mt-4">
        <p><strong>Note:</strong> This package is ready for direct upload to static hosting services like GitHub Pages.</p>
        <p className="mt-1">For GitHub Pages deployment, extract the ZIP file and follow the instructions in the included README.md file.</p>
        <p className="mt-1">The generated site is an exact copy of your dynamic site but with API calls replaced by static data files.</p>
      </div>
    </Card>
  );
};

export default FullStaticSiteGenerator;