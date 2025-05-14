import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';

export function SimpleStaticSiteTester() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [error, setError] = useState('');
  const [baseUrlOption, setBaseUrlOption] = useState('github'); // github, custom, or root
  const [debugMode, setDebugMode] = useState(false);
  const [progressLog, setProgressLog] = useState<string[]>([]);
  const { toast } = useToast();

  const getBaseUrl = () => {
    switch (baseUrlOption) {
      case 'github':
        return '/SweetMoment/';
      case 'custom':
        return '/sweet-moment/';
      case 'root':
        return '/';
      default:
        return '/SweetMoment/';
    }
  };

  const generateFullStaticSite = async () => {
    setIsGenerating(true);
    setError('');
    setProgressLog([]);
    setDownloadUrl('');
    
    const baseUrl = getBaseUrl();
    addToLog(`Starting generation with base URL: ${baseUrl}`);
    addToLog(`Using robust file operations with absolute paths and permission checks`);
    
    try {
      // Use debug mode parameter if enabled
      const debugParam = debugMode ? '&debug=true' : '';
      
      // Call the API to generate the full static site package
      addToLog('Contacting API to generate package...');
      
      const response = await fetch(`/api/static-react/full-package?baseUrl=${baseUrl}${debugParam}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'x-admin-access': 'sweetmoment-dev-secret'
        },
      });
      
      if (!response.ok) {
        let errorMessage = 'Failed to generate static site package';
        try {
          const errorResponse = await response.json();
          errorMessage = errorResponse.error || errorMessage;
        } catch (parseError) {
          // If we can't parse JSON, try to get text
          const errorText = await response.text();
          if (errorText) errorMessage = errorText;
        }
        throw new Error(errorMessage);
      }
      
      addToLog('Response received, processing...');
      
      const data = await response.json();
      setDownloadUrl(data.downloadUrl);
      
      // Add any logs from the server if they exist
      if (data.logs && Array.isArray(data.logs)) {
        data.logs.forEach((log: string) => addToLog(`Server: ${log}`));
      }
      
      addToLog('Package generated successfully!');
      
      toast({
        title: "Static Site Package Ready",
        description: "The static site package has been generated successfully!",
      });
    } catch (error) {
      console.error('Error generating static site:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setError(errorMessage);
      addToLog(`ERROR: ${errorMessage}`);
      
      toast({
        title: "Error Generating Static Site",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      addToLog('Process completed');
    }
  };

  const addToLog = (message: string) => {
    setProgressLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <h3 className="text-lg font-medium mb-2">Static Site Generator Tester</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Generate a static version of the site that can be deployed to various hosting platforms.
      </p>
      
      <div className="flex flex-col gap-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="base-url-option">Base URL Configuration</Label>
            <Select 
              value={baseUrlOption} 
              onValueChange={setBaseUrlOption}
            >
              <SelectTrigger id="base-url-option">
                <SelectValue placeholder="Select base URL option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="github">GitHub Pages (/SweetMoment/)</SelectItem>
                <SelectItem value="custom">Custom Subdomain (/sweet-moment/)</SelectItem>
                <SelectItem value="root">Site Root (/)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Choose the base URL configuration based on your hosting setup.
            </p>
          </div>
          
          <div className="mt-8">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="debug-mode" 
                checked={debugMode} 
                onCheckedChange={(checked) => setDebugMode(checked as boolean)} 
              />
              <Label htmlFor="debug-mode">Enable debug mode (verbose logging)</Label>
            </div>
            <p className="text-xs text-muted-foreground mt-1 ml-6">
              Debug mode adds detailed server-side logs to the response. Useful for 
              troubleshooting generation issues on different environments.
            </p>
          </div>
        </div>
        
        <Button
          onClick={generateFullStaticSite}
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Package...
            </>
          ) : (
            'Generate Static Site Package'
          )}
        </Button>
        
        {error && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm overflow-auto max-h-40">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        {progressLog.length > 0 && (
          <div className="border rounded-md mt-2 overflow-hidden">
            <div className="bg-muted p-2 text-sm font-medium flex justify-between items-center">
              <span>Progress Log</span>
              {debugMode && <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">Debug Mode Active</span>}
            </div>
            <div className="p-2 text-xs font-mono overflow-auto max-h-60 bg-black text-green-400">
              {progressLog.map((log, i) => {
                // Format different types of log entries
                const isServerLog = log.includes('Server:');
                const isErrorLog = log.toLowerCase().includes('error');
                const isWarningLog = log.toLowerCase().includes('warning');
                
                let logClass = "py-0.5";
                let logText = log;
                
                if (isServerLog) {
                  // Server logs from debug mode
                  logClass += " text-blue-400";
                } else if (isErrorLog) {
                  // Error messages
                  logClass += " text-red-400 font-bold";
                } else if (isWarningLog) {
                  // Warning messages
                  logClass += " text-yellow-300";
                } else if (log.includes('success')) {
                  // Success messages
                  logClass += " text-emerald-400 font-bold";
                }
                
                return <div key={i} className={logClass}>{logText}</div>;
              })}
            </div>
          </div>
        )}
        
        {downloadUrl && (
          <div className="flex flex-col gap-2">
            <div className="p-3 bg-primary/10 rounded-md text-sm">
              <strong>Success!</strong> Your static site package is ready for download.
            </div>
            <Button asChild variant="outline">
              <a href={downloadUrl} download>
                Download Static Site Package
              </a>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}