import React, { useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload, Image } from 'lucide-react';

type RedirectUrl = {
  id: number;
  name: string;
  destinationUrl: string;
  accessCount: number;
  lastAccessed: string | null;
  qrCodeStyle?: string;
  createdAt: string;
  updatedAt: string;
};

interface QRCodeStylerProps {
  redirectUrls: RedirectUrl[];
  mainRedirectDestination: string;
  onStyleChange: () => void;
}

// Types for QR code styling
export type QRBodyShape = 'square' | 'rounded' | 'circle' | 'dots' | 'classy';
export type QREyeFrameShape = 'square' | 'rounded' | 'circle';
export type QREyeBallShape = 'square' | 'rounded' | 'circle';

export default function QRCodeStyler({ redirectUrls, mainRedirectDestination, onStyleChange }: QRCodeStylerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [logoSize, setLogoSize] = useState<number>(25); // Default to 25% of QR code size
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper function to apply style changes
  const applyStyleChange = async (styleType: string, styleValue: string) => {
    try {
      // If we have multiple redirects, update all of them with the same style to keep them in sync
      // This ensures consistent QR code styling across all redirects
      if (redirectUrls.length > 0) {
        // Update all existing redirects with the same style
        const updatePromises = redirectUrls.map(async (redirect) => {
          // Set up style object based on current style or defaults for this redirect
          const currentStyle = redirect?.qrCodeStyle ? 
            JSON.parse(redirect.qrCodeStyle) : 
            { color: '#000000', backgroundColor: '#ffffff' };
          
          // Apply the new style change
          const newStyle = { ...currentStyle, [styleType]: styleValue };
          
          // Update this redirect
          return apiRequest(`/api/admin/redirect-urls/${redirect.id}`, 'PATCH', {
            ...redirect,
            qrCodeStyle: JSON.stringify(newStyle)
          }, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'x-admin-access': 'sweetmoment-dev-secret'
            }
          });
        });
        
        // Wait for all updates to complete
        await Promise.all(updatePromises);
      } else {
        // No redirects exist yet, create a new one
        if (!mainRedirectDestination) {
          toast({
            title: "Enter a destination URL first",
            description: "Please enter a destination URL before customizing the QR code",
            variant: "destructive",
          });
          return;
        }
        
        // Create the primary redirect with default styles plus the new style change
        await apiRequest('/api/admin/redirect-urls', 'POST', { 
          name: '', 
          destinationUrl: mainRedirectDestination,
          qrCodeStyle: JSON.stringify({ 
            color: '#000000', 
            backgroundColor: '#ffffff',
            [styleType]: styleValue 
          })
        }, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'x-admin-access': 'sweetmoment-dev-secret'
          }
        });
      }
      
      // Refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/admin/redirect-urls'] });
      
      // Notify the parent component
      onStyleChange();
      
    } catch (error) {
      console.error('Error applying style change:', error);
      toast({
        title: "Style update failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  // Handle logo file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload the file to the server
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-admin-access': 'sweetmoment-dev-secret'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload logo');
      }
      
      const data = await response.json();
      const uploadedUrl = data.url;
      
      // Set logo URL and create preview
      setLogoUrl(uploadedUrl);
      setLogoPreview(uploadedUrl);
      
      // Apply the logo to the QR code style
      await applyStyleChange('logoUrl', uploadedUrl);
      
      toast({
        title: "Logo uploaded successfully",
        description: "The logo has been added to your QR code",
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Logo upload failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };
  
  // Handle logo size change
  const handleLogoSizeChange = async (size: number) => {
    setLogoSize(size);
    await applyStyleChange('logoSize', size.toString());
  };
  
  // Handle logo removal
  const handleRemoveLogo = async () => {
    setLogoUrl('');
    setLogoPreview(null);
    await applyStyleChange('logoUrl', '');
    
    toast({
      title: "Logo removed",
      description: "The logo has been removed from the QR code",
    });
  };

  // Get current styles for button highlighting
  // Determine what button should be highlighted by looking at the first redirect
  const currentStyles = {
    bodyShape: redirectUrls.length > 0 && redirectUrls[0]?.qrCodeStyle ? 
      JSON.parse(redirectUrls[0]?.qrCodeStyle || '{}')?.bodyShape || 'square' : 
      'square',
    eyeFrameShape: redirectUrls.length > 0 && redirectUrls[0]?.qrCodeStyle ? 
      JSON.parse(redirectUrls[0]?.qrCodeStyle || '{}')?.eyeFrameShape || 'square' : 
      'square',
    eyeBallShape: redirectUrls.length > 0 && redirectUrls[0]?.qrCodeStyle ? 
      JSON.parse(redirectUrls[0]?.qrCodeStyle || '{}')?.eyeBallShape || 'square' : 
      'square',
    logoUrl: redirectUrls.length > 0 && redirectUrls[0]?.qrCodeStyle ? 
      JSON.parse(redirectUrls[0]?.qrCodeStyle || '{}')?.logoUrl || '' : 
      '',
    logoSize: redirectUrls.length > 0 && redirectUrls[0]?.qrCodeStyle ? 
      parseInt(JSON.parse(redirectUrls[0]?.qrCodeStyle || '{}')?.logoSize || '25') : 
      25
  };

  return (
    <div className="space-y-4">
      {/* Body Shape Options */}
      <div>
        <h4 className="text-xs font-medium mb-2">Body Shape</h4>
        <div className="grid grid-cols-3 gap-1">
          {['square', 'rounded', 'circle', 'dots', 'classy'].map((shape, index) => (
            <button
              key={`body-${index}`}
              className={`h-7 w-full ${
                currentStyles.bodyShape === shape
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-800 border border-gray-200'
              } rounded-sm text-xs flex items-center justify-center`}
              onClick={() => applyStyleChange('bodyShape', shape)}
            >
              {shape === 'square' ? '■' : 
               shape === 'rounded' ? '▢' : 
               shape === 'circle' ? '●' : 
               shape === 'dots' ? '::' : '◆'}
            </button>
          ))}
        </div>
      </div>
      
      {/* Eye Frame Shape Options */}
      <div>
        <h4 className="text-xs font-medium mb-2">Eye Frame Shape</h4>
        <div className="grid grid-cols-3 gap-1">
          {['square', 'rounded', 'circle'].map((shape, index) => (
            <button
              key={`frame-${index}`}
              className={`h-7 w-full ${
                currentStyles.eyeFrameShape === shape
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-800 border border-gray-200'
              } rounded-sm text-xs flex items-center justify-center`}
              onClick={() => applyStyleChange('eyeFrameShape', shape)}
            >
              {shape === 'square' ? '□' : 
               shape === 'rounded' ? '▢' : 
               shape === 'circle' ? '○' : '□'}
            </button>
          ))}
        </div>
      </div>
      
      {/* Eye Ball Shape Options */}
      <div>
        <h4 className="text-xs font-medium mb-2">Eye Ball Shape</h4>
        <div className="grid grid-cols-3 gap-1">
          {['square', 'rounded', 'circle'].map((shape, index) => (
            <button
              key={`eye-${index}`}
              className={`h-7 w-full ${
                currentStyles.eyeBallShape === shape
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-800 border border-gray-200'
              } rounded-sm text-xs flex items-center justify-center`}
              onClick={() => applyStyleChange('eyeBallShape', shape)}
            >
              {shape === 'square' ? '■' : 
               shape === 'rounded' ? '▣' : 
               shape === 'circle' ? '●' : '■'}
            </button>
          ))}
        </div>
      </div>
      
      {/* Logo Upload Section */}
      <div className="mt-6 border-t pt-4">
        <h4 className="text-xs font-medium mb-2">Logo Image</h4>
        
        {/* Logo Preview */}
        {logoPreview || currentStyles.logoUrl ? (
          <div className="mb-3">
            <div className="relative w-16 h-16 mx-auto mb-2 border rounded flex items-center justify-center overflow-hidden">
              <img 
                src={logoPreview || currentStyles.logoUrl} 
                alt="Logo" 
                className="max-w-full max-h-full object-contain"
              />
              <button 
                onClick={handleRemoveLogo}
                className="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs"
                aria-label="Remove logo"
              >
                ×
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-3 w-16 h-16 mx-auto border border-dashed rounded flex items-center justify-center">
            <Image className="text-gray-400" size={20} />
          </div>
        )}
        
        {/* Logo Upload Button */}
        <div className="flex flex-col items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            id="logo-upload"
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 mb-2 w-full"
          >
            <Upload size={14} /> 
            {currentStyles.logoUrl ? 'Change Logo' : 'Upload Logo'}
          </Button>
          
          {/* Logo Size Slider */}
          {(logoPreview || currentStyles.logoUrl) && (
            <div className="w-full space-y-1">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Size</span>
                <span>{logoSize}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                value={logoSize}
                onChange={(e) => handleLogoSizeChange(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}