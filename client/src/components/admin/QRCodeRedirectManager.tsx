import React, { useState, useEffect } from 'react';
import StyledQRCodeWrapper from './StyledQRCodeWrapper';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../ui/dialog';
import { QRCodeStyleOptions, QRBodyShape, QREyeFrameShape, QREyeBallShape } from './CustomizableQRCode';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { ChevronDown, Upload } from 'lucide-react';
import { ImageUpload } from '../ui/image-upload';
import { QRCodeAnalytics } from './QRCodeAnalytics';

interface QRCodeRedirectManagerProps {
  setMainRedirectDestination?: (url: string) => void;
}

export default function QRCodeRedirectManager({ setMainRedirectDestination }: QRCodeRedirectManagerProps = {}) {
  const { toast } = useToast();
  
  // State for full-screen QR code dialog
  const [showFullScreen, setShowFullScreen] = useState(false);
  
  // State for dynamic QR code size based on screen width
  const [qrCodeSize, setQrCodeSize] = useState(Math.min(window.innerWidth - 80, 500));
  
  // Update QR code size when the dialog is opened or window is resized
  useEffect(() => {
    const updateFullScreenSize = () => {
      if (showFullScreen) {
        // Add more margin to prevent cutoff on any screen sizes
        setQrCodeSize(Math.min(window.innerWidth - 140, window.innerHeight - 140, 600));
      }
    };
    
    // Set the initial size
    updateFullScreenSize();
    
    // Add event listener for resize when dialog is open
    window.addEventListener('resize', updateFullScreenSize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', updateFullScreenSize);
    };
  }, [showFullScreen]);
  
  // Current origin for constructing URLs
  const [origin, setOrigin] = useState('');
  
  // Handle window resize to adjust QR code size
  useEffect(() => {
    const handleResize = () => {
      setQrCodeSize(Math.min(window.innerWidth - 80, 500));
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Get the current origin when the component mounts
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);
  
  const [destinationUrl, setDestinationUrl] = useState('https://sweetmoment.app/menu');
  
  // Update the parent component's state when the destination URL changes
  useEffect(() => {
    if (setMainRedirectDestination) {
      setMainRedirectDestination(destinationUrl);
    }
  }, [destinationUrl, setMainRedirectDestination]);
  
  // Combine origin with redirect path
  const qrCodeValue = `${origin}/redirect`;
  
  const [qrStyle, setQrStyle] = useState<Partial<QRCodeStyleOptions>>({
    // Shape options
    bodyShape: 'square',
    eyeFrameShape: 'square',
    eyeBallShape: 'square',
    
    // Basic color options
    color: '#000000',
    backgroundColor: '#FFFFFF',
    
    // Gradient options
    useGradient: false,
    gradientType: 'linear',
    gradientRotation: 0,
    gradientStart: '#000000',
    gradientEnd: '#6B46C1',
    
    // Custom eye color
    customEyeColor: false,
    eyeColor: '#000000',
    
    // Logo options
    logoUrl: '',
    logoSize: 25,
    logoMargin: 0
  });
  
  // State for collapsible sections
  const [openSections, setOpenSections] = useState({
    shape: false,
    color: false,
    logo: false
  });
  
  // Load existing redirect if available
  useEffect(() => {
    const fetchRedirect = async () => {
      try {
        const response = await apiRequest(`/api/redirects/main`, 'GET');
        if (response && response.destinationUrl) {
          setDestinationUrl(response.destinationUrl);
        }
      } catch (error) {
        // If the redirect doesn't exist yet, that's fine - we'll create it
        console.log(`No existing redirect found, will create one when saved`);
      }
    };
    
    fetchRedirect();
  }, []);
  
  // Function to update the destination URL on the server
  const updateDestination = async () => {
    try {
      await apiRequest(`/api/redirects/main`, 'PUT', {
        destinationUrl: destinationUrl
      });
      
      toast({
        title: "Redirect Updated",
        description: "The redirect destination has been updated successfully",
        variant: "default",
      });
    } catch (error) {
      console.error('Error updating redirect destination:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update the redirect destination",
        variant: "destructive",
      });
    }
  };
  
  // Function to test the redirect
  const testRedirect = () => {
    window.open(`${origin}/redirect`, '_blank');
  };

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader>
        <CardTitle>QR Code Redirect Manager</CardTitle>
        <CardDescription>
          Create QR codes that always point to your redirect URL. Change where they go anytime without recreating the code.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          <div className="flex flex-col items-center">
            <div 
              className="p-4 bg-white rounded-md shadow-sm mb-4 cursor-pointer relative group"
              onClick={() => setShowFullScreen(true)}
              title="Click to view full screen"
            >
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-md">
                <span className="text-white opacity-0 group-hover:opacity-100 font-medium">Click to enlarge</span>
              </div>
              <StyledQRCodeWrapper
                value={qrCodeValue}
                size={Math.min(250, window.innerWidth - 100)}
                style={qrStyle}
                className="qr-code-display max-w-full"
                enableDownload={true}
              />
            </div>
            
            {/* Full Screen QR Code Dialog */}
            <Dialog open={showFullScreen} onOpenChange={setShowFullScreen}>
              <DialogContent className="sm:max-w-4xl max-h-[90vh] w-full flex flex-col items-center justify-center p-0 overflow-hidden" aria-describedby="qr-dialog-description">
                <DialogTitle className="sr-only">QR Code Full View</DialogTitle>
                <div id="qr-dialog-description" className="sr-only">Preview of the QR code in full screen</div>
                <div className={`custom-qr-wrapper w-full h-full flex items-center justify-center p-8 ${qrStyle.logoInBlack ? 'dialog-logo-black-filter' : ''}`}>
                  <StyledQRCodeWrapper
                    value={qrCodeValue}
                    size={Math.min(window.innerWidth - 140, window.innerHeight - 140, 600)} // Ensure it fits both width and height with more margin
                    style={{
                      ...qrStyle, 
                      // Force black and white logo if option is selected
                      logoInBlack: qrStyle.logoInBlack
                    }} 
                    className={`qr-code-fullscreen max-w-full ${qrStyle.logoInBlack ? 'dialog-logo-black-filter' : ''}`}
                    enableDownload={false}
                  />
                </div>
              </DialogContent>
            </Dialog>
            
            <div className="w-full space-y-4 mt-2">
              {/* Shape Section */}
              <div className="border rounded-lg">
                <div 
                  className={`flex justify-between items-center w-full p-4 hover:bg-gray-50 cursor-pointer ${openSections.shape ? 'border-b border-gray-100' : ''}`}
                  onClick={() => setOpenSections({...openSections, shape: !openSections.shape})}
                >
                  <h3 className="text-sm font-semibold">Shape</h3>
                  <ChevronDown 
                    className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${
                      openSections.shape ? 'transform rotate-180' : ''
                    }`} 
                  />
                </div>
                
                <div 
                  className={`transition-all duration-300 ease-in-out ${
                    openSections.shape ? 'block opacity-100 h-auto' : 'hidden opacity-0 h-0'
                  }`}
                >
                  <div className="px-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Body Shape</Label>
                        <select 
                          className="w-full border rounded-md p-2 mt-1"
                          value={qrStyle.bodyShape}
                          onChange={(e) => setQrStyle({...qrStyle, bodyShape: e.target.value as QRBodyShape})}
                        >
                          <option value="square">Square</option>
                          <option value="rounded">Rounded</option>
                          <option value="dots">Dots</option>
                          <option value="classy">Classy</option>
                        </select>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Eye Frame Shape</Label>
                        <select 
                          className="w-full border rounded-md p-2 mt-1"
                          value={qrStyle.eyeFrameShape}
                          onChange={(e) => setQrStyle({...qrStyle, eyeFrameShape: e.target.value as QREyeFrameShape})}
                        >
                          <option value="square">Square</option>
                          <option value="rounded">Rounded</option>
                          <option value="circle">Circle</option>
                        </select>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Eye Ball Shape</Label>
                        <select 
                          className="w-full border rounded-md p-2 mt-1"
                          value={qrStyle.eyeBallShape}
                          onChange={(e) => setQrStyle({...qrStyle, eyeBallShape: e.target.value as QREyeBallShape})}
                        >
                          <option value="square">Square</option>
                          <option value="rounded">Rounded</option>
                          <option value="circle">Circle</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Color Section */}
              <div className="border rounded-lg">
                <div 
                  className={`flex justify-between items-center w-full p-4 hover:bg-gray-50 cursor-pointer ${openSections.color ? 'border-b border-gray-100' : ''}`}
                  onClick={() => setOpenSections({...openSections, color: !openSections.color})}
                >
                  <h3 className="text-sm font-semibold">Color</h3>
                  <ChevronDown 
                    className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${
                      openSections.color ? 'transform rotate-180' : ''
                    }`} 
                  />
                </div>
                
                <div 
                  className={`transition-all duration-300 ease-in-out ${
                    openSections.color ? 'block opacity-100 h-auto' : 'hidden opacity-0 h-0'
                  }`}
                >
                  <div className="px-4 py-4">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">QR Code Color</Label>
                        <div className="flex gap-2 mt-1">
                          <input 
                            type="color" 
                            className="w-10 h-10 border cursor-pointer"
                            value={qrStyle.color}
                            onChange={(e) => setQrStyle({...qrStyle, color: e.target.value})}
                          />
                          <select 
                            className="w-full border rounded-md p-2"
                            value={qrStyle.color}
                            onChange={(e) => setQrStyle({...qrStyle, color: e.target.value})}
                          >
                            <option value="#000000">Black</option>
                            <option value="#2B6CB0">Blue</option>
                            <option value="#2F855A">Green</option>
                            <option value="#C53030">Red</option>
                            <option value="#6B46C1">Purple</option>
                            <option value="#custom">Custom</option>
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Background</Label>
                        <div className="flex flex-col gap-2 mt-1">
                          <div className="flex items-center mb-1">
                            <input 
                              type="checkbox" 
                              id="use-background"
                              className="mr-2"
                              checked={qrStyle.backgroundColor !== 'transparent'}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setQrStyle({...qrStyle, backgroundColor: '#FFFFFF'});
                                } else {
                                  setQrStyle({...qrStyle, backgroundColor: 'transparent'});
                                }
                              }}
                            />
                            <label htmlFor="use-background" className="text-sm">
                              Use background color
                            </label>
                            {qrStyle.backgroundColor === 'transparent' && (
                              <span className="ml-2 text-xs text-muted-foreground italic">
                                (transparent background)
                              </span>
                            )}
                          </div>
                          
                          {qrStyle.backgroundColor !== 'transparent' && (
                            <div className="flex gap-2">
                              <input 
                                type="color" 
                                className="w-10 h-10 border cursor-pointer"
                                value={qrStyle.backgroundColor || '#FFFFFF'}
                                onChange={(e) => setQrStyle({...qrStyle, backgroundColor: e.target.value})}
                              />
                              <input 
                                type="text" 
                                className="w-full border rounded-md p-2"
                                value={qrStyle.backgroundColor || '#FFFFFF'}
                                onChange={(e) => setQrStyle({...qrStyle, backgroundColor: e.target.value})}
                                placeholder="#FFFFFF"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <Label className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            checked={qrStyle.useGradient || false}
                            onChange={(e) => setQrStyle({
                              ...qrStyle, 
                              useGradient: e.target.checked,
                              gradientType: qrStyle.gradientType || 'linear',
                              gradientRotation: qrStyle.gradientRotation || 0,
                              gradientStart: qrStyle.gradientStart || qrStyle.color || '#000000',
                              gradientEnd: qrStyle.gradientEnd || '#6B46C1'
                            })}
                          />
                          <span className="text-sm font-medium">Use Gradient</span>
                        </Label>
                        
                        {qrStyle.useGradient && (
                          <div className="mt-2 space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-xs">Type</Label>
                                <select 
                                  className="w-full border rounded-md p-2 mt-1 text-sm"
                                  value={qrStyle.gradientType || 'linear'}
                                  onChange={(e) => setQrStyle({...qrStyle, gradientType: e.target.value as 'linear' | 'radial'})}
                                >
                                  <option value="linear">Linear</option>
                                  <option value="radial">Radial</option>
                                </select>
                              </div>
                              
                              <div>
                                <Label className="text-xs">Rotation (°)</Label>
                                <input 
                                  type="number" 
                                  className="w-full border rounded-md p-2 mt-1 text-sm"
                                  value={qrStyle.gradientRotation || 0}
                                  min="0"
                                  max="360"
                                  onChange={(e) => setQrStyle({...qrStyle, gradientRotation: parseInt(e.target.value) || 0})}
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-xs">Start Color</Label>
                                <div className="flex gap-1 mt-1">
                                  <input 
                                    type="color" 
                                    className="w-8 h-8 border cursor-pointer"
                                    value={qrStyle.gradientStart || qrStyle.color || '#000000'}
                                    onChange={(e) => setQrStyle({...qrStyle, gradientStart: e.target.value})}
                                  />
                                  <input 
                                    type="text" 
                                    className="w-full border rounded-md p-1 text-sm"
                                    value={qrStyle.gradientStart || qrStyle.color || '#000000'}
                                    onChange={(e) => setQrStyle({...qrStyle, gradientStart: e.target.value})}
                                  />
                                </div>
                              </div>
                              
                              <div>
                                <Label className="text-xs">End Color</Label>
                                <div className="flex gap-1 mt-1">
                                  <input 
                                    type="color" 
                                    className="w-8 h-8 border cursor-pointer"
                                    value={qrStyle.gradientEnd || '#6B46C1'}
                                    onChange={(e) => setQrStyle({...qrStyle, gradientEnd: e.target.value})}
                                  />
                                  <input 
                                    type="text" 
                                    className="w-full border rounded-md p-1 text-sm"
                                    value={qrStyle.gradientEnd || '#6B46C1'}
                                    onChange={(e) => setQrStyle({...qrStyle, gradientEnd: e.target.value})}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Eye Color (Frames)</Label>
                        <div className="flex gap-2 mt-1">
                          <select 
                            className="w-full border rounded-md p-2"
                            value={
                              qrStyle.useGradientForEyes ? 'gradient' : 
                              qrStyle.customEyeColor ? 'custom' : 'default'
                            }
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === 'default') {
                                setQrStyle({
                                  ...qrStyle,
                                  customEyeColor: false,
                                  useGradientForEyes: false
                                });
                              } else if (value === 'custom') {
                                setQrStyle({
                                  ...qrStyle,
                                  customEyeColor: true,
                                  useGradientForEyes: false,
                                  eyeColor: qrStyle.eyeColor || qrStyle.color || '#000000'
                                });
                              } else if (value === 'gradient') {
                                setQrStyle({
                                  ...qrStyle,
                                  customEyeColor: false,
                                  useGradientForEyes: true
                                });
                              }
                            }}
                          >
                            <option value="default">Same as QR code</option>
                            <option value="custom">Custom color</option>
                            {qrStyle.useGradient && (
                              <option value="gradient">Use gradient colors</option>
                            )}
                          </select>
                        </div>
                        
                        {qrStyle.customEyeColor && (
                          <div className="flex gap-2 mt-2">
                            <input 
                              type="color" 
                              className="w-10 h-10 border cursor-pointer"
                              value={qrStyle.eyeColor || qrStyle.color || '#000000'}
                              onChange={(e) => setQrStyle({...qrStyle, eyeColor: e.target.value})}
                            />
                            <input 
                              type="text" 
                              className="w-full border rounded-md p-2"
                              value={qrStyle.eyeColor || qrStyle.color || '#000000'}
                              onChange={(e) => setQrStyle({...qrStyle, eyeColor: e.target.value})}
                              placeholder="#000000"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Logo Section */}
              <div className="border rounded-lg">
                <div 
                  className={`flex justify-between items-center w-full p-4 hover:bg-gray-50 cursor-pointer ${openSections.logo ? 'border-b border-gray-100' : ''}`}
                  onClick={() => setOpenSections({...openSections, logo: !openSections.logo})}
                >
                  <h3 className="text-sm font-semibold">Logo</h3>
                  <ChevronDown 
                    className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${
                      openSections.logo ? 'transform rotate-180' : ''
                    }`} 
                  />
                </div>
                
                <div 
                  className={`transition-all duration-300 ease-in-out ${
                    openSections.logo ? 'block opacity-100 h-auto' : 'hidden opacity-0 h-0'
                  }`}
                >
                  <div className="px-4 py-4">
                    <div className="space-y-4">
                      <div className="space-y-4">
                        {/* Using the new ImageUpload component */}
                        <ImageUpload
                          value={qrStyle.logoUrl}
                          onChange={(url: string) => {
                            setQrStyle({
                              ...qrStyle,
                              logoUrl: url
                            });
                          }}
                          onSizeChange={(size: number) => {
                            setQrStyle({
                              ...qrStyle,
                              logoSize: size
                            });
                          }}
                          showBlackWhiteOption={true}
                          isBlackWhite={qrStyle.logoInBlack || false}
                          onBlackWhiteChange={(isBlackWhite: boolean) => {
                            setQrStyle({
                              ...qrStyle,
                              logoInBlack: isBlackWhite
                            });
                          }}
                          label="Logo"
                          helpText="Drag & drop a logo image here, paste, or select a file"
                        />
                      </div>
                      
                      {qrStyle.logoUrl && (
                        <>
                          <div>
                            <Label className="text-sm font-medium">Logo Size</Label>
                            <div className="flex items-center gap-2">
                              <input 
                                type="range" 
                                min="5" 
                                max="50" 
                                className="w-full"
                                value={qrStyle.logoSize}
                                onChange={(e) => {
                                  const newSize = parseInt(e.target.value);
                                  setQrStyle(prevStyle => ({...prevStyle, logoSize: newSize}));
                                }}
                              />
                              <span className="text-sm w-10 text-center">{qrStyle.logoSize}%</span>
                            </div>
                          </div>
                          
                          <div>
                            <Label className="text-sm font-medium">Logo Margin</Label>
                            <div className="flex items-center gap-2">
                              <input 
                                type="range" 
                                min="0" 
                                max="25" 
                                className="w-full"
                                value={qrStyle.logoMargin || 0}
                                onChange={(e) => {
                                  const newMargin = parseInt(e.target.value);
                                  setQrStyle(prevStyle => ({...prevStyle, logoMargin: newMargin}));
                                }}
                              />
                              <span className="text-sm w-12 text-center">{qrStyle.logoMargin || 0}px</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col">
            <div className="p-6 border rounded-md mb-4">
              <h3 className="text-lg font-medium mb-4">Destination Management</h3>
              
              <div className="space-y-4">
                <div className="border rounded-md p-4 bg-slate-50 mb-4">
                  <p className="text-sm text-slate-500 mb-2">This QR code redirects to:</p>
                  <p className="font-medium text-slate-700 break-all">{qrCodeValue}</p>
                </div>
                
                <div>
                  <Label htmlFor="destination-url">Destination URL</Label>
                  <Input 
                    id="destination-url"
                    className="mt-1"
                    value={destinationUrl}
                    onChange={(e) => setDestinationUrl(e.target.value)}
                    placeholder="https://example.com/your-landing-page"
                  />
                  <p className="text-sm text-slate-500 mt-1">
                    Enter the full URL where visitors should be redirected
                  </p>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <Button onClick={updateDestination}>
                    Update Destination
                  </Button>
                  
                  <Button variant="outline" onClick={testRedirect}>
                    Test Redirect
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}