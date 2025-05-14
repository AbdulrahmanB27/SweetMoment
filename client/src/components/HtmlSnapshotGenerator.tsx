import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Check, Info, X, AlertTriangle, Download, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

/**
 * HTML Snapshot Generator Component
 * 
 * This component provides UI for generating and downloading static HTML snapshots
 * that exactly match the look and feel of the current site.
 */
export default function HtmlSnapshotGenerator() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'generating' | 'complete' | 'error'>('idle');
  const [snapshotExists, setSnapshotExists] = useState(false);
  const [lastGeneratedDate, setLastGeneratedDate] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [pages, setPages] = useState({
    home: true,
    about: true,
    menu: true,
    products: true
  });
  const [options, setOptions] = useState({
    includeAssets: true,
    createCheckoutBridge: true,
    includeReadme: true,
    createZip: true
  });

  const { toast } = useToast();

  // Check if snapshot exists on load
  useEffect(() => {
    async function checkSnapshotStatus() {
      try {
        const response = await apiRequest("/api/html-snapshot/status", "GET");
        console.log('Snapshot status response:', response);
        setSnapshotExists(response.exists);
        setLastGeneratedDate(response.lastGenerated);
      } catch (error) {
        console.error('Error checking snapshot status:', error);
      }
    }

    checkSnapshotStatus();
  }, []);

  async function generateSnapshot() {
    try {
      setLoading(true);
      setStatus('generating');
      setProgress(5);
      setMessage('Starting snapshot generation...');

      // Build the pages and options to generate
      const pagesToGenerate = Object.entries(pages)
        .filter(([_, enabled]) => enabled)
        .map(([page]) => page);

      // Start the generation process
      const response = await fetch('/api/html-snapshot/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token') || '',
          'x-admin-access': 'sweetmoment-dev-secret'
        },
        body: JSON.stringify({
          pages: pagesToGenerate,
          options
        })
      });
      
      // Handle the response
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      
      const responseData = await response.json();

      // Set up polling to check status
      const pollStatusInterval = setInterval(async () => {
        try {
          const progressResponse = await fetch('/api/html-snapshot/progress', {
            headers: {
              'Authorization': localStorage.getItem('token') || '',
              'x-admin-access': 'sweetmoment-dev-secret'
            }
          });
          
          if (!progressResponse.ok) {
            console.error(`Error polling status: ${progressResponse.status}`);
            return;
          }
          
          const statusData = await progressResponse.json();
          
          if (!statusData) {
            console.error('Error polling status: No data received');
            return;
          }
          
          setProgress(statusData.progress || 0);
          setMessage(statusData.message || 'Processing...');
          
          if (statusData.progress >= 100 || statusData.status === 'complete') {
            clearInterval(pollStatusInterval);
            setStatus('complete');
            setSnapshotExists(true);
            setLastGeneratedDate(new Date().toISOString());
            
            toast({
              title: "Snapshot Generated",
              description: "Your static HTML snapshot has been generated successfully.",
              variant: "default",
            });
          }
          
          if (statusData.status === 'error') {
            clearInterval(pollStatusInterval);
            setStatus('error');
            setMessage(statusData.message || 'An error occurred during generation.');
            
            toast({
              title: "Generation Failed",
              description: statusData.message || "There was an error generating the snapshot.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error('Error polling status:', error);
        }
      }, 1000);

      // Clear interval after 5 minutes as a safety measure
      setTimeout(() => {
        clearInterval(pollStatusInterval);
        if (status === 'generating') {
          setStatus('error');
          setMessage('Generation timed out after 5 minutes.');
        }
      }, 5 * 60 * 1000);

    } catch (error) {
      console.error('Error generating snapshot:', error);
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'An unknown error occurred');
      
      toast({
        title: "Generation Failed",
        description: "There was an error generating the HTML snapshot.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function downloadSnapshot() {
    try {
      setLoading(true);
      setMessage('Preparing download...');
      
      // Use fetch to get a blob response
      const response = await fetch('/api/html-snapshot/download', {
        method: 'GET',
        headers: {
          'Authorization': localStorage.getItem('token') || '',
          'x-admin-access': 'sweetmoment-dev-secret'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      
      // Create a blob from the response
      const blob = await response.blob();
      
      // Create a download link and trigger it
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'sweet-moment-static-site.zip';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download Started",
        description: "Your static site ZIP file is downloading.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error downloading snapshot:', error);
      
      toast({
        title: "Download Failed",
        description: "There was an error downloading the HTML snapshot.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setMessage('');
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">HTML Snapshot Generator</CardTitle>
        <CardDescription>
          Create static HTML versions of your site that look and function exactly like the main site.
          No preview banners or indicators - ready for GitHub Pages or other static hosting.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status display */}
        {snapshotExists && (
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertTitle>Snapshot Available</AlertTitle>
            <AlertDescription>
              A static site that looks exactly like the main site {lastGeneratedDate && `was last generated on ${new Date(lastGeneratedDate).toLocaleString()}`}. Ready for GitHub Pages.
            </AlertDescription>
          </Alert>
        )}
        
        {status === 'error' && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Generation Failed</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
        
        {status === 'generating' && (
          <div className="space-y-2 mb-4">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
        )}
        
        {/* Pages to include */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Pages to Include</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="home"
                checked={pages.home} 
                onCheckedChange={(checked) => setPages({...pages, home: checked})}
              />
              <Label htmlFor="home">Home Page</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="about"
                checked={pages.about} 
                onCheckedChange={(checked) => setPages({...pages, about: checked})}
              />
              <Label htmlFor="about">About Page</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="menu"
                checked={pages.menu} 
                onCheckedChange={(checked) => setPages({...pages, menu: checked})}
              />
              <Label htmlFor="menu">Menu Page</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="products" 
                checked={pages.products} 
                onCheckedChange={(checked) => setPages({...pages, products: checked})}
              />
              <Label htmlFor="products">Product Pages</Label>
            </div>
          </div>
        </div>
        
        {/* Options */}
        <div className="space-y-4 mt-6">
          <h3 className="text-lg font-medium">Generation Options</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="includeAssets" 
                checked={options.includeAssets} 
                onCheckedChange={(checked) => setOptions({...options, includeAssets: checked})}
              />
              <Label htmlFor="includeAssets">Include Assets (CSS, Images)</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="createCheckoutBridge" 
                checked={options.createCheckoutBridge} 
                onCheckedChange={(checked) => setOptions({...options, createCheckoutBridge: checked})}
              />
              <Label htmlFor="createCheckoutBridge">Create Checkout Bridge</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="includeReadme" 
                checked={options.includeReadme} 
                onCheckedChange={(checked) => setOptions({...options, includeReadme: checked})}
              />
              <Label htmlFor="includeReadme">Include README</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="createZip" 
                checked={options.createZip} 
                onCheckedChange={(checked) => setOptions({...options, createZip: checked})}
              />
              <Label htmlFor="createZip">Create ZIP Archive</Label>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          onClick={generateSnapshot}
          disabled={loading || status === 'generating' || !Object.values(pages).some(v => v)}
        >
          {status === 'generating' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : status === 'complete' ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Generate Again
            </>
          ) : (
            'Generate HTML Snapshot'
          )}
        </Button>
        
        {snapshotExists && (
          <Button 
            variant="outline"
            onClick={downloadSnapshot}
            disabled={loading}
          >
            <Download className="mr-2 h-4 w-4" />
            Download ZIP
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}