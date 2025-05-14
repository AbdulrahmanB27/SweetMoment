import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Check, AlertCircle, Download, Github } from 'lucide-react';
// Card components removed as they're no longer needed
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface StaticSiteStatus {
  exists: boolean;
  path?: string;
  fileCount?: number;
  totalSize?: number;
  generationDate?: string;
  message: string;
}

export function StaticSiteGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState<StaticSiteStatus | null>(null);
  const [generationOutput, setGenerationOutput] = useState('');
  const [mainSiteUrl, setMainSiteUrl] = useState('');
  const [error, setError] = useState('');
  const { toast } = useToast();

  // Fetch site status on load
  useEffect(() => {
    fetchSiteStatus();
  }, []);

  // Get current site URL for default value
  useEffect(() => {
    setMainSiteUrl(window.location.origin);
  }, []);

  async function fetchSiteStatus() {
    try {
      // First parameter should be URL, second parameter is method (method is optional and defaults to GET)
      // The apiRequest function automatically parses JSON by default, so we can directly use the result
      const data = await apiRequest('/api/static-site/status');
      
      // Log parsed data for debugging
      console.log('Static site status data:', data);
      
      // Update component state with the response data
      setStatus(data);
      
      // Clear any previous errors when successful
      setError('');
    } catch (err) {
      console.error('Error fetching site status:', err);
      setError('Failed to fetch static site status. Please try again.');
    }
  }

  async function generateStaticSite() {
    try {
      setIsGenerating(true);
      setError('');
      setGenerationOutput('');
      
      // First parameter should be URL, second is method, third is data
      // apiRequest parses JSON by default so we get the data directly
      const data = await apiRequest('/api/static-site/generate', 'POST', {
        mainSiteUrl: mainSiteUrl || window.location.origin,
      });
      
      console.log('Generation response data:', data);
      
      if (data.success) {
        toast({
          title: 'Static Site Generated',
          description: 'The static site has been successfully generated.',
          variant: 'default',
        });
        
        // Update the status after generation
        fetchSiteStatus();
        setGenerationOutput(data.output);
      } else {
        setError(`Generation failed: ${data.message}`);
        setGenerationOutput(data.error || data.output || 'No output available');
      }
    } catch (err: any) {
      console.error('Error generating static site:', err);
      setError(`Failed to generate static site: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  }

  function formatDate(dateString: string) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  }
  
  // Function to download the static site as a ZIP file
  function downloadStaticSite() {
    // Create a URL to the download endpoint
    const downloadUrl = `/api/static-site/download`;
    
    // Open the URL in a new tab or window to trigger the download
    window.open(downloadUrl, '_blank');
    
    toast({
      title: 'Downloading Static Site',
      description: 'Your download should begin shortly.',
      variant: 'default',
    });
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Static Site Generator</h2>
        <p className="text-muted-foreground mt-1">
          Generate a static version of the website that can be hosted on GitHub Pages or other static hosting services.
        </p>
      </div>
      
      <div className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {status && (
          <div className="rounded-md bg-muted p-4">
            <h3 className="font-medium mb-2">Static Site Status</h3>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">Status:</span>
              <span>{status.exists ? 'Generated' : 'Not Generated'}</span>
              
              {status.exists && (
                <>
                  <span className="text-muted-foreground">Files:</span>
                  <span>{status.fileCount}</span>
                  
                  <span className="text-muted-foreground">Size:</span>
                  <span>{status.totalSize} KB</span>
                  
                  <span className="text-muted-foreground">Last Generated:</span>
                  <span>{formatDate(status.generationDate!)}</span>
                  
                  <span className="text-muted-foreground">Path:</span>
                  <span className="truncate">{status.path}</span>
                </>
              )}
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="mainSiteUrl">Main Site URL</Label>
          <Input
            id="mainSiteUrl"
            placeholder="https://yourdomain.com"
            value={mainSiteUrl}
            onChange={(e) => setMainSiteUrl(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            This URL will be used as the API base URL for the static site generator.
          </p>
        </div>
        
        {generationOutput && (
          <div className="mt-4">
            <Label>Generation Output</Label>
            <div className="mt-1 bg-muted p-3 rounded-md text-sm font-mono h-48 overflow-y-auto whitespace-pre-wrap">
              {generationOutput}
            </div>
          </div>
        )}
      </div>
      
      <div className="flex justify-between pt-4 border-t">
        <div className="flex space-x-3">
          <Button variant="outline" onClick={fetchSiteStatus} disabled={isGenerating}>
            Refresh Status
          </Button>
          
          {status && status.exists && (
            <>
              <Button variant="outline" onClick={downloadStaticSite} disabled={isGenerating}>
                <Download className="mr-2 h-4 w-4" />
                Download as ZIP
              </Button>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" disabled={true}>
                      <Github className="mr-2 h-4 w-4" />
                      Upload to GitHub
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>GitHub integration requires API credentials.<br />Please add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        </div>
        
        <Button onClick={generateStaticSite} disabled={isGenerating}>
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Generate Static Site
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default StaticSiteGenerator;