import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Check, Github, Download, Archive } from 'lucide-react';
import JSZip from 'jszip';

interface GitHubPackageGeneratorProps {
  staticData?: any;
  isGenerating?: boolean;
}

/**
 * Component to generate a GitHub-ready static site package
 * This takes the static data and creates a downloadable ZIP file with all the necessary files
 */
const GitHubPackageGenerator: React.FC<GitHubPackageGeneratorProps> = ({ 
  staticData,
  isGenerating = false
}) => {
  const { toast } = useToast();
  const [packageStatus, setPackageStatus] = useState<string>('');
  const [packageProgress, setPackageProgress] = useState<number>(0);
  const [isPackaging, setIsPackaging] = useState<boolean>(false);
  const [isPackageComplete, setIsPackageComplete] = useState<boolean>(false);
  const [packageError, setPackageError] = useState<string | null>(null);

  /**
   * Create a GitHub-ready static site package
   */
  const createGitHubPackage = async () => {
    if (!staticData) {
      setPackageError('No static data available. Please generate the static site data first.');
      return;
    }

    try {
      setIsPackaging(true);
      setPackageError(null);
      setPackageProgress(0);
      setPackageStatus('Creating GitHub package...');
      
      // Create a new JSZip instance
      const zip = new JSZip();
      
      // Add a basic README file
      setPackageProgress(10);
      setPackageStatus('Adding README file...');
      zip.file('README.md', `# Sweet Moment Chocolates Static Site

This is a statically generated version of the Sweet Moment Chocolates website.

## Setup

1. Push these files to a new repository on GitHub
2. Enable GitHub Pages in the repository settings
3. Configure Pages to deploy from the main branch

## Generated on

${new Date().toISOString()}
`);
      
      // Add a basic index.html file
      setPackageProgress(30);
      setPackageStatus('Adding HTML files...');
      zip.file('index.html', `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sweet Moment Chocolates</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #6b3f23; }
    .products { display: flex; flex-wrap: wrap; gap: 20px; }
    .product { border: 1px solid #ddd; padding: 10px; border-radius: 5px; width: 200px; }
    .footer { margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px; }
  </style>
</head>
<body>
  <h1>Sweet Moment Chocolates</h1>
  <p>Welcome to our handcrafted chocolate collection.</p>
  
  <h2>Our Products</h2>
  <div class="products" id="products">
    <!-- Products will be added here by JavaScript -->
  </div>
  
  <div class="footer">
    <p>© ${new Date().getFullYear()} Sweet Moment Chocolates</p>
    <p>This is a static version of the website</p>
  </div>

  <script>
    // Static data
    const data = ${JSON.stringify(staticData, null, 2)};
    
    // Populate products
    const productsContainer = document.getElementById('products');
    if (data.products && Array.isArray(data.products)) {
      data.products.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.className = 'product';
        productDiv.innerHTML = \`
          <h3>\${product.name}</h3>
          <p>\${product.description || ''}</p>
          <p><strong>Price:</strong> $\${(product.basePrice / 100).toFixed(2)}</p>
        \`;
        productsContainer.appendChild(productDiv);
      });
    }
  </script>
</body>
</html>`);
      
      // Add the static data as JSON
      setPackageProgress(50);
      setPackageStatus('Adding data files...');
      zip.file('static-data.json', JSON.stringify(staticData, null, 2));
      
      // Generate the ZIP
      setPackageProgress(80);
      setPackageStatus('Generating ZIP file...');
      const content = await zip.generateAsync({ 
        type: 'blob',
        compression: 'DEFLATE' 
      });
      
      // Create download link
      setPackageProgress(100);
      setPackageStatus('Package complete!');
      setIsPackageComplete(true);
      
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sweet-moment-github-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      toast({
        title: "GitHub package created successfully",
        description: "Your static site package is ready for GitHub Pages",
      });
      
    } catch (error: any) {
      console.error('GitHub package generation error:', error);
      setPackageError(`Error generating GitHub package: ${error.message}`);
      setIsPackageComplete(false);
      
      toast({
        title: "GitHub package generation failed",
        description: error.message,
        variant: "destructive",
      });
      
    } finally {
      setIsPackaging(false);
    }
  };

  return (
    <Card className="p-4 md:p-6">
      <div className="flex flex-col space-y-4">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Github className="w-5 h-5" />
              GitHub Pages Package
            </h3>
            
            <Button
              onClick={createGitHubPackage}
              disabled={isPackaging || !staticData || isGenerating}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
            >
              <Archive className="w-4 h-4" />
              Create GitHub ZIP Package
            </Button>
          </div>
          
          <Alert className="bg-amber-50 border-amber-100">
            <AlertDescription className="text-amber-800">
              This will create a complete downloadable ZIP package with all the necessary files for GitHub Pages deployment.
              After downloading, extract the ZIP and upload the contents to your GitHub repository.
            </AlertDescription>
          </Alert>
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
            <AlertTitle className="text-green-800">Package created successfully</AlertTitle>
            <AlertDescription className="text-green-700">
              Your GitHub Pages ready package has been downloaded. You can now unzip and upload it to GitHub.
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
              Please generate the static site data before creating a GitHub package.
            </AlertDescription>
          </Alert>
        )}
        
        {isGenerating && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Generation in Progress</AlertTitle>
            <AlertDescription>
              Please wait for the static site data generation to complete before creating a GitHub package.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </Card>
  );
};

export default GitHubPackageGenerator;