import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../lib/queryClient';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '../ui/card';
import { useToast } from '../../hooks/use-toast';
import { Trash2, Edit, RefreshCw, QrCode, Settings, Copy as ClipboardCopy, ExternalLink, Plus, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '../ui/dialog';
import StyledQRCodeWrapper from './StyledQRCodeWrapper';
import { 
  QRCodeStyleOptions, 
  QRBodyShape, 
  QREyeFrameShape, 
  QREyeBallShape 
} from './CustomizableQRCode';
import QRCodeStyler from './QRCodeStyler';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '../ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format, formatDistance } from 'date-fns';

// Define the schema for redirect URLs
const redirectUrlSchema = z.object({
  name: z.string().min(1, "Name is required"),
  destinationUrl: z.string().url("Please enter a valid URL"),
  qrCodeStyle: z.string().optional()
});

// Schema for site settings
const settingsSchema = z.object({
  basePath: z.string().min(1, "Base path is required")
    .refine(val => val.startsWith('/'), "Path must start with /")
    .refine(val => !val.endsWith('/'), "Path should not end with /"),
  mainRedirectDestination: z.string().url("Please enter a valid URL").optional()
});

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

export function RedirectManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedRedirect, setSelectedRedirect] = useState<RedirectUrl | null>(null);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  
  const baseUrl = window.location.origin;
  const [basePath, setBasePath] = useState('/redirect');
  const [mainRedirectDestination, setMainRedirectDestination] = useState<string>('');
  const [customBaseUrl, setCustomBaseUrl] = useState<string | null>(null);
  // Use the custom base URL if set, otherwise use the detected one
  const effectiveBaseUrl = customBaseUrl || baseUrl;
  const redirectUrl = effectiveBaseUrl + basePath;

  // Fetch redirect URLs
  const { data: redirectUrls = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/redirect-urls'],
    queryFn: () => apiRequest('/api/admin/redirect-urls', 'GET', null, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'x-admin-access': 'sweetmoment-dev-secret'
      }
    }),
  });
  
  // Fetch redirect statistics
  const { data: redirectStats = [], isLoading: isStatsLoading } = useQuery({
    queryKey: ['/api/redirect-stats'],
    queryFn: () => apiRequest('/api/redirect-stats', 'GET'),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: z.infer<typeof redirectUrlSchema>) => {
      // Include authentication headers
      return apiRequest('/api/admin/redirect-urls', 'POST', data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-admin-access': 'sweetmoment-dev-secret'
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/redirect-urls'] });
      toast({
        title: "Redirect URL created",
        description: "The redirect URL has been created successfully.",
      });
    },
    onError: (error) => {
      console.error('Error creating redirect URL:', error);
      toast({
        title: "Failed to create redirect URL",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: z.infer<typeof redirectUrlSchema> }) => {
      return apiRequest(`/api/admin/redirect-urls/${id}`, 'PATCH', data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-admin-access': 'sweetmoment-dev-secret'
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/redirect-urls'] });
      toast({
        title: "Redirect URL updated",
        description: "The redirect URL has been updated successfully.",
      });
    },
    onError: (error) => {
      console.error('Error updating redirect URL:', error);
      toast({
        title: "Failed to update redirect URL",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest(`/api/admin/redirect-urls/${id}`, 'DELETE', null, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-admin-access': 'sweetmoment-dev-secret'
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/redirect-urls'] });
      toast({
        title: "Redirect URL deleted",
        description: "The redirect URL has been deleted successfully.",
      });
    },
    onError: (error) => {
      console.error('Error deleting redirect URL:', error);
      toast({
        title: "Failed to delete redirect URL",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });



  // Settings form
  const settingsForm = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      basePath: basePath
    }
  });
  
  // Fetch site settings
  const { data: siteSettings } = useQuery({
    queryKey: ['/api/admin/site-settings'],
    queryFn: () => apiRequest('/api/admin/site-settings', 'GET', null, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'x-admin-access': 'sweetmoment-dev-secret'
      }
    })
  });
  
  // Update settings when site settings are loaded
  React.useEffect(() => {
    if (siteSettings) {
      // Find the redirect base path setting
      const pathSetting = siteSettings.find((setting: any) => setting.key === 'redirectBasePath');
      if (pathSetting) {
        setBasePath(pathSetting.value);
        
        // Find the main redirect destination
        const mainRedirectSetting = siteSettings.find((setting: any) => setting.key === 'mainRedirectDestination');
        const mainRedirectValue = mainRedirectSetting?.value || '';
        
        // Reset the form with all current values
        settingsForm.reset({ 
          basePath: pathSetting.value,
          mainRedirectDestination: mainRedirectValue
        });
        
        // Update the state
        setMainRedirectDestination(mainRedirectValue);
      }
    }
  }, [siteSettings]);

  // Update site settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (data: { key: string, value: string }) => {
      // Make sure we include the authorization token in the headers
      return apiRequest('/api/admin/site-settings', 'POST', data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-admin-access': 'sweetmoment-dev-secret'
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/site-settings'] });
      toast({
        title: "Settings updated",
        description: "The redirect base path has been updated successfully.",
      });
      setIsSettingsDialogOpen(false);
    },
    onError: (error) => {
      console.error('Error updating settings:', error);
      toast({
        title: "Failed to update settings",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });

  // Update settings
  const updateSettings = async (data: z.infer<typeof settingsSchema>) => {
    try {
      // Keep the base path as "/redirect" as requested by user
      // Don't update the base path, it should remain "/redirect"
      
      // Update the main redirect destination if provided
      if (data.mainRedirectDestination) {
        await updateSettingsMutation.mutateAsync({
          key: 'mainRedirectDestination',
          value: data.mainRedirectDestination
        });
        
        // Update state
        setMainRedirectDestination(data.mainRedirectDestination);
      }
      
      // Close the dialog
      setIsSettingsDialogOpen(false);
      
      // Show success message
      toast({
        title: "Settings updated",
        description: "Redirect settings have been updated successfully."
      });
    } catch (error) {
      // Error handling is done by the mutation
    }
  };



  const openQrDialog = (redirect: RedirectUrl) => {
    setSelectedRedirect(redirect);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy h:mm a');
    } catch (e) {
      return 'Invalid date';
    }
  };

  const formatTimeAgo = (dateString: string | null) => {
    if (!dateString) return 'Never';
    try {
      const date = new Date(dateString);
      return formatDistance(date, new Date(), { addSuffix: true });
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">QR Code Redirect</h2>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              settingsForm.reset({
                basePath: basePath,
                mainRedirectDestination: mainRedirectDestination
              });
              setIsSettingsDialogOpen(true);
            }}
            variant="outline"
            size="sm"
            className="flex gap-1 items-center"
          >
            <Settings className="h-4 w-4 mr-1" />
            Redirect Settings
          </Button>
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            className="flex gap-1 items-center"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>



      {/* Only keeping the necessary dialogs */}

      {/* Settings Dialog */}
      <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Redirect System Settings</DialogTitle>
            <DialogDescription>
              Configure your dynamic QR code redirect system.
            </DialogDescription>
          </DialogHeader>
          <Form {...settingsForm}>
            <form onSubmit={settingsForm.handleSubmit(updateSettings)} className="space-y-4">
              <FormField
                control={settingsForm.control}
                name="basePath"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Path</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        value="/redirect" 
                        disabled 
                      />
                    </FormControl>
                    <FormDescription>
                      The base path for all redirect URLs is fixed to <code>/redirect</code> as requested.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={settingsForm.control}
                name="mainRedirectDestination"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Main Redirect Destination</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://example.com/landing-page" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      The URL where visitors will be redirected to when they visit {baseUrl}{basePath} without a name parameter.
                      This is the primary redirect URL for your QR code system.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Base URL Customization Section */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 my-4">
                <h3 className="font-medium text-blue-800 mb-2">Base URL Configuration</h3>
                <p className="text-sm text-blue-700 mb-3">
                  Current base URL: <code className="bg-white px-2 py-1 rounded">{customBaseUrl || baseUrl}</code>
                </p>
                <div className="flex items-center gap-2 mb-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Reset to the automatic detected URL
                      setCustomBaseUrl(null);
                      toast({
                        title: "Base URL reset",
                        description: "Using automatic URL detection: " + window.location.origin,
                        duration: 3000,
                      });
                    }}
                  >
                    Use Current Domain
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      // Prompt for a custom base URL
                      const newBaseUrl = window.prompt("Enter custom base URL (e.g., https://example.com)", customBaseUrl || baseUrl);
                      if (newBaseUrl && newBaseUrl.trim() !== "") {
                        setCustomBaseUrl(newBaseUrl.trim());
                        toast({
                          title: "Base URL updated",
                          description: "Using custom URL: " + newBaseUrl.trim(),
                          duration: 3000,
                        });
                      }
                    }}
                  >
                    Customize Base URL
                  </Button>
                </div>
                <p className="text-xs text-blue-600">
                  Modify the base URL if your site is deployed to a different domain. This affects all QR codes displayed in the admin panel.
                </p>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsSettingsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={!!selectedRedirect} onOpenChange={(open) => !open && setSelectedRedirect(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedRedirect?.id === 0 ? 
                "QR Code for Primary Redirect" : 
                `QR Code for ${selectedRedirect?.name}`
              }
            </DialogTitle>
            <DialogDescription>
              Scan this QR code to be redirected to {selectedRedirect?.destinationUrl}
            </DialogDescription>
          </DialogHeader>
          <div>
            <div className="flex flex-col items-center space-y-4 p-4">
              {selectedRedirect && (
                <>
                  <div className="bg-white p-4 rounded-md flex flex-col items-center">
                    <StyledQRCodeWrapper 
                      value={selectedRedirect.name ? `${redirectUrl}/${selectedRedirect.name}` : redirectUrl}
                      size={200}
                      style={selectedRedirect.qrCodeStyle ? JSON.parse(selectedRedirect.qrCodeStyle) : undefined}
                      className="max-w-[200px]"
                      enableDownload={true}
                    />
                    <Button
                      variant="link"
                      size="sm"
                      className="mt-2"
                      onClick={() => window.open(selectedRedirect.name ? `${redirectUrl}/${selectedRedirect.name}` : redirectUrl, '_blank')}
                    >
                      Test Link
                    </Button>
                  </div>
                  <div className="w-full bg-gray-50 p-4 rounded-md border border-gray-200">
                    <p className="text-sm text-gray-600">
                      This QR code can be customized from the main redirect management panel. Click the Close button to return.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQrDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
                            <Input 
                              type="number"
                              min="0"
                              max="10"
                              placeholder="2" 
                              defaultValue={selectedRedirect.qrCodeStyle ? 
                                JSON.parse(selectedRedirect.qrCodeStyle).logoMargin || "2" : 
                                "2"
                              }
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                if (isNaN(value) || value < 0 || value > 10) return;
                                
                                const currentStyle = selectedRedirect.qrCodeStyle ? 
                                  JSON.parse(selectedRedirect.qrCodeStyle) : 
                                  { color: '#000000', backgroundColor: '#ffffff' };
                                
                                const newStyle = { ...currentStyle, logoMargin: value };
                                if (selectedRedirect.id) {
                                  updateMutation.mutate({
                                    id: selectedRedirect.id,
                                    data: {
                                      ...selectedRedirect,
                                      qrCodeStyle: JSON.stringify(newStyle)
                                    }
                                  });
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Body Shape Selection */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Shape Style</label>
                        <Select 
                          defaultValue={selectedRedirect.qrCodeStyle ? 
                            JSON.parse(selectedRedirect.qrCodeStyle).bodyShape || "square" : 
                            "square"
                          }
                          onValueChange={(value: QRBodyShape) => {
                            const currentStyle = selectedRedirect.qrCodeStyle ? 
                              JSON.parse(selectedRedirect.qrCodeStyle) : 
                              { color: '#000000', backgroundColor: '#ffffff' };
                            
                            const newStyle = { ...currentStyle, bodyShape: value };
                            if (selectedRedirect.id) {
                              updateMutation.mutate({ 
                                id: selectedRedirect.id, 
                                data: { 
                                  name: selectedRedirect.name, 
                                  destinationUrl: selectedRedirect.destinationUrl,
                                  qrCodeStyle: JSON.stringify(newStyle)
                                } 
                              });
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select body shape" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="square">Square</SelectItem>
                            <SelectItem value="rounded">Rounded</SelectItem>
                            <SelectItem value="dots">Dots</SelectItem>
                            <SelectItem value="diamond">Diamond</SelectItem>
                            <SelectItem value="circular">Circular</SelectItem>
                            <SelectItem value="classy">Classy</SelectItem>
                            <SelectItem value="classy-rounded">Classy Rounded</SelectItem>
                            <SelectItem value="sharp">Sharp</SelectItem>
                            <SelectItem value="shield">Shield</SelectItem>
                            <SelectItem value="pointed">Pointed</SelectItem>
                            <SelectItem value="curved">Curved</SelectItem>
                            <SelectItem value="leaf">Leaf</SelectItem>
                            <SelectItem value="star">Star</SelectItem>
                            <SelectItem value="rounded-in">Rounded In</SelectItem>
                            <SelectItem value="rounded-out">Rounded Out</SelectItem>
                            <SelectItem value="octagon">Octagon</SelectItem>
                            <SelectItem value="edge-cut">Edge Cut</SelectItem>
                            <SelectItem value="dots-circular">Dots Circular</SelectItem>
                            <SelectItem value="dots-square">Dots Square</SelectItem>
                            <SelectItem value="dots-star">Dots Star</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-1 block">Eye Frame Style</label>
                        <Select 
                          defaultValue={selectedRedirect.qrCodeStyle ? 
                            JSON.parse(selectedRedirect.qrCodeStyle).eyeFrameShape || "square" : 
                            "square"
                          }
                          onValueChange={(value: QREyeFrameShape) => {
                            const currentStyle = selectedRedirect.qrCodeStyle ? 
                              JSON.parse(selectedRedirect.qrCodeStyle) : 
                              { color: '#000000', backgroundColor: '#ffffff' };
                            
                            const newStyle = { ...currentStyle, eyeFrameShape: value };
                            if (selectedRedirect.id) {
                              updateMutation.mutate({ 
                                id: selectedRedirect.id, 
                                data: { 
                                  name: selectedRedirect.name, 
                                  destinationUrl: selectedRedirect.destinationUrl,
                                  qrCodeStyle: JSON.stringify(newStyle)
                                } 
                              });
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select eye frame style" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="square">Square</SelectItem>
                            <SelectItem value="rounded">Rounded</SelectItem>
                            <SelectItem value="circle">Circle</SelectItem>
                            <SelectItem value="diamond">Diamond</SelectItem>
                            <SelectItem value="cushion">Cushion</SelectItem>
                            <SelectItem value="classy">Classy</SelectItem>
                            <SelectItem value="classy-rounded">Classy Rounded</SelectItem>
                            <SelectItem value="hexagon">Hexagon</SelectItem>
                            <SelectItem value="octagon">Octagon</SelectItem>
                            <SelectItem value="leaf">Leaf</SelectItem>
                            <SelectItem value="flower">Flower</SelectItem>
                            <SelectItem value="star">Star</SelectItem>
                            <SelectItem value="shield">Shield</SelectItem>
                            <SelectItem value="curved">Curved</SelectItem>
                            <SelectItem value="pointed">Pointed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="col-span-2">
                        <label className="text-sm font-medium mb-1 block">Eye Ball Style</label>
                        <Select 
                          defaultValue={selectedRedirect.qrCodeStyle ? 
                            JSON.parse(selectedRedirect.qrCodeStyle).eyeBallShape || "square" : 
                            "square"
                          }
                          onValueChange={(value: QREyeBallShape) => {
                            const currentStyle = selectedRedirect.qrCodeStyle ? 
                              JSON.parse(selectedRedirect.qrCodeStyle) : 
                              { color: '#000000', backgroundColor: '#ffffff' };
                            
                            const newStyle = { ...currentStyle, eyeBallShape: value };
                            if (selectedRedirect.id) {
                              updateMutation.mutate({ 
                                id: selectedRedirect.id, 
                                data: { 
                                  name: selectedRedirect.name, 
                                  destinationUrl: selectedRedirect.destinationUrl,
                                  qrCodeStyle: JSON.stringify(newStyle)
                                } 
                              });
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select eye ball style" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="square">Square</SelectItem>
                            <SelectItem value="rounded">Rounded</SelectItem>
                            <SelectItem value="circle">Circle</SelectItem>
                            <SelectItem value="diamond">Diamond</SelectItem>
                            <SelectItem value="cushion">Cushion</SelectItem>
                            <SelectItem value="dots">Dots</SelectItem>
                            <SelectItem value="leaves">Leaves</SelectItem>
                            <SelectItem value="corners">Corners</SelectItem>
                            <SelectItem value="sharp-corners">Sharp Corners</SelectItem>
                            <SelectItem value="shield">Shield</SelectItem>
                            <SelectItem value="octagon">Octagon</SelectItem>
                            <SelectItem value="plus">Plus</SelectItem>
                            <SelectItem value="flower">Flower</SelectItem>
                            <SelectItem value="leaf">Leaf</SelectItem>
                            <SelectItem value="bars">Bars</SelectItem>
                            <SelectItem value="corners-rounded">Rounded Corners</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-1 block">QR Code Color</label>
                        <div className="flex items-center space-x-2">
                          <select 
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                            defaultValue={selectedRedirect.qrCodeStyle ? 
                              JSON.parse(selectedRedirect.qrCodeStyle).color || "#000000" : 
                              "#000000"
                            }
                            onChange={(e) => {
                              const currentStyle = selectedRedirect.qrCodeStyle ? 
                                JSON.parse(selectedRedirect.qrCodeStyle) : 
                                { color: '#000000', backgroundColor: '#ffffff' };
                              
                              const newStyle = { ...currentStyle, color: e.target.value };
                              if (selectedRedirect.id) {
                                updateMutation.mutate({ 
                                  id: selectedRedirect.id, 
                                  data: { 
                                    name: selectedRedirect.name, 
                                    destinationUrl: selectedRedirect.destinationUrl,
                                    qrCodeStyle: JSON.stringify(newStyle)
                                  } 
                                });
                              }
                            }}
                          >
                            <option value="#000000">Black</option>
                            <option value="#4A5568">Dark Gray</option>
                            <option value="#2B6CB0">Blue</option>
                            <option value="#0077B6">Royal Blue</option>
                            <option value="#0096C7">Light Blue</option>
                            <option value="#2F855A">Green</option>
                            <option value="#059669">Emerald</option>
                            <option value="#10B981">Mint</option>
                            <option value="#C53030">Red</option>
                            <option value="#E11D48">Ruby</option>
                            <option value="#F43F5E">Coral</option>
                            <option value="#6B46C1">Purple</option>
                            <option value="#8B5CF6">Lavender</option>
                            <option value="#B7791F">Orange</option>
                            <option value="#D97706">Amber</option>
                            <option value="#65a30d">Lime</option>
                            <option value="#881337">Burgundy</option>
                            <option value="#7E22CE">Violet</option>
                            <option value="#6d28d9">Indigo</option>
                            <option value="#BE185D">Hot Pink</option>
                          </select>
                          <div 
                            className="w-8 h-8 rounded-md border border-gray-300" 
                            style={{ 
                              backgroundColor: selectedRedirect.qrCodeStyle ? 
                                JSON.parse(selectedRedirect.qrCodeStyle).color || "#000000" : 
                                "#000000" 
                            }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-1 block">Background Color</label>
                        <div className="flex items-center space-x-2">
                          <select 
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                            defaultValue={selectedRedirect.qrCodeStyle ? 
                              JSON.parse(selectedRedirect.qrCodeStyle).backgroundColor || "#FFFFFF" : 
                              "#FFFFFF"
                            }
                            onChange={(e) => {
                              const currentStyle = selectedRedirect.qrCodeStyle ? 
                                JSON.parse(selectedRedirect.qrCodeStyle) : 
                                { color: '#000000', backgroundColor: '#ffffff' };
                              
                              const newStyle = { ...currentStyle, backgroundColor: e.target.value };
                              if (selectedRedirect.id) {
                                updateMutation.mutate({ 
                                  id: selectedRedirect.id, 
                                  data: { 
                                    name: selectedRedirect.name, 
                                    destinationUrl: selectedRedirect.destinationUrl,
                                    qrCodeStyle: JSON.stringify(newStyle)
                                  } 
                                });
                              }
                            }}
                          >
                            <option value="#FFFFFF">White</option>
                            <option value="#F7FAFC">Light Gray</option>
                            <option value="#F0F9FF">Sky Blue</option>
                            <option value="#EBF8FF">Light Blue</option>
                            <option value="#EFF6FF">Periwinkle</option>
                            <option value="#F0FDFA">Mint</option>
                            <option value="#F0FFF4">Light Green</option>
                            <option value="#FFFBEB">Cream</option>
                            <option value="#FFF7ED">Peach</option>
                            <option value="#FFF5F5">Light Red</option>
                            <option value="#FDF2F8">Light Pink</option>
                            <option value="#FAF5FF">Light Purple</option>
                            <option value="#FDF4FF">Light Magenta</option>
                            <option value="#FFFAF0">Light Orange</option>
                            <option value="#ECFCCB">Pale Lime</option>
                            <option value="#FFEDD5">Pale Orange</option>
                            <option value="#FCE7F3">Pale Pink</option>
                          </select>
                          <div 
                            className="w-8 h-8 rounded-md border border-gray-300" 
                            style={{ 
                              backgroundColor: selectedRedirect.qrCodeStyle ? 
                                JSON.parse(selectedRedirect.qrCodeStyle).backgroundColor || "#FFFFFF" : 
                                "#FFFFFF" 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 mb-3">
                      Customize your QR code appearance. Changes are saved automatically.
                    </p>
                    
                    <div className="bg-gray-50 p-3 rounded-md border border-gray-200 mt-2">
                      <p className="text-xs font-medium mb-2">Examples of QR Style Combinations:</p>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center">
                          <div className="bg-white p-1 rounded border border-gray-200 inline-block">
                            <img src="https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl=https://example.com&chco=8B5CF6" 
                              alt="Example QR" className="w-12 h-12" />
                          </div>
                          <p className="text-xs mt-1">Lavender, Square</p>
                        </div>
                        <div className="text-center">
                          <div className="bg-white p-1 rounded border border-gray-200 inline-block">
                            <img src="https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl=https://example.com&chco=E11D48" 
                              alt="Example QR" className="w-12 h-12" />
                          </div>
                          <p className="text-xs mt-1">Ruby, Dots</p>
                        </div>
                        <div className="text-center">
                          <div className="bg-white p-1 rounded border border-gray-200 inline-block">
                            <img src="https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl=https://example.com&chco=059669" 
                              alt="Example QR" className="w-12 h-12" />
                          </div>
                          <p className="text-xs mt-1">Emerald, Rounded</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center w-full">
                    <p className="text-sm font-medium mb-1">Redirect URL:</p>
                    <code className="bg-gray-100 p-2 rounded text-sm block w-full overflow-auto break-all">
                      {selectedRedirect.name ? `${redirectUrl}/${selectedRedirect.name}` : redirectUrl}
                    </code>
                  </div>
                  <div className="text-center w-full">
                    <p className="text-sm font-medium mb-1">Destination:</p>
                    {selectedRedirect.destinationUrl === "Not configured" ? (
                      <p className="text-sm text-amber-600">
                        You need to configure the main redirect destination in settings.
                      </p>
                    ) : (
                      <p className="text-sm text-blue-500 break-all">{selectedRedirect.destinationUrl}</p>
                    )}
                  </div>
                  
                  {selectedRedirect.id === 0 ? (
                    <div className="bg-primary-50 p-3 rounded-md border border-primary-200 text-sm max-w-md mt-2">
                      <p className="font-medium mb-1">Primary Redirect</p>
                      <p>This is your main redirect URL. Share this QR code for your main marketing materials.
                      You can change the destination at any time in the redirect settings.</p>
                    </div>
                  ) : (
                    <div className="text-center text-sm text-gray-500 max-w-md">
                      <p>This QR code will always point to the same URL, but the destination can be changed at any time.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline"
              onClick={() => setSelectedRedirect(null)}
            >
              Close
            </Button>
            <Button 
              onClick={() => {
                // Create a temporary DOM element to render the QR code
                const container = document.createElement('div');
                container.style.position = 'absolute';
                container.style.left = '-9999px';
                document.body.appendChild(container);
                
                // Render the QR code
                const qrValue = selectedRedirect?.name ? 
                  `${redirectUrl}/${selectedRedirect.name}` : 
                  redirectUrl;
                
                // Get style options from the selected redirect
                const currentStyle = selectedRedirect?.qrCodeStyle ? 
                  JSON.parse(selectedRedirect.qrCodeStyle) : 
                  { color: '#000000', backgroundColor: '#ffffff' };
                
                // Generate QR code using Google Charts API
                const colorHex = (currentStyle.color || '#000000').replace('#', '');
                const imgSize = 300; // Higher resolution for download
                const qrUrl = `https://chart.googleapis.com/chart?cht=qr&chs=${imgSize}x${imgSize}&chl=${encodeURIComponent(qrValue)}&chco=${colorHex}`;
                
                // Fetch the image as blob data
                fetch(qrUrl)
                  .then(response => response.blob())
                  .then(blob => {
                    // Create a download link for the image
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `qrcode-${selectedRedirect?.name || 'redirect'}.png`;
                    a.style.display = 'none';
                    document.body.appendChild(a);
                    a.click();
                    
                    // Clean up
                    setTimeout(() => {
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }, 100);
                    
                    toast({
                      description: "QR code downloaded successfully!",
                      duration: 3000,
                    });
                  })
                  .catch(error => {
                    console.error('Error downloading QR code:', error);
                    
                    toast({
                      title: "Download Failed",
                      description: "Could not download the QR code. Please try again.",
                      variant: "destructive",
                      duration: 4000,
                    });
                  });
                
                // Cleanup
                document.body.removeChild(container);
                
                toast({
                  description: "QR code opened in a new tab. To save, right-click and select 'Save Image As'.",
                  duration: 3000,
                });
              }}
            >
              Download QR Code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Redirect Card */}
      {/* Main Redirect Card - Redesigned */}
      <Card className="overflow-hidden border shadow">
        <div className="flex flex-col md:flex-row">
          {/* Left column - QR code display */}
          <div className="md:w-2/5 bg-gradient-to-br from-primary-50 to-primary-100 p-6 flex flex-col items-center justify-center">
            <div 
              className="bg-white p-4 rounded-lg shadow-sm border border-primary-200 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => {
                // Open the QR code dialog
                const primaryRedirect = redirectUrls.find((r: RedirectUrl) => r.id === 0) || {
                  id: 0,
                  name: '',
                  destinationUrl: mainRedirectDestination || '',
                  accessCount: 0,
                  lastAccessed: null,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                };
                setSelectedRedirect(primaryRedirect);
              }}
            >
              <StyledQRCodeWrapper 
                value={redirectUrl}
                size={200}
                className="max-w-[200px]"
                enableDownload={true}
                style={
                  redirectUrls.find((r: RedirectUrl) => r.id === 0)?.qrCodeStyle ? 
                  JSON.parse(redirectUrls.find((r: RedirectUrl) => r.id === 0)?.qrCodeStyle || '{}') : 
                  undefined
                }
              />
              <div className="text-xs text-center mt-2 text-gray-500">Click to enlarge</div>
            </div>
            
            {/* Analytics Section */}
            {!isStatsLoading && redirectStats.length > 0 && (
              <div className="mt-6 w-full bg-white rounded-lg shadow-sm border border-primary-100 p-4">
                <h3 className="text-md font-semibold text-gray-700 mb-2">Analytics</h3>
                <div className="space-y-2">
                  {redirectStats.map((stat: RedirectUrl) => (
                    stat.name === 'main' && (
                      <div key={stat.id} className="text-sm">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">Total Scans:</span>
                          <span className="font-bold text-primary-700">{stat.accessCount}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Last Scanned:</span>
                          <span className="text-gray-600">
                            {stat.lastAccessed ? formatTimeAgo(stat.lastAccessed) : 'Never'}
                          </span>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-4 flex flex-col gap-2 w-full">
              <div className="text-sm font-medium text-gray-700">QR Code URL:</div>
              <div className="flex items-center bg-white rounded px-3 py-2 border text-sm">
                <span className="text-gray-800 truncate max-w-[180px] md:max-w-[220px]">{redirectUrl}</span>
              </div>
              <div className="flex gap-2 mt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => {
                    navigator.clipboard.writeText(redirectUrl);
                    toast({
                      description: "URL copied to clipboard",
                      duration: 2000,
                    });
                  }}
                >
                  <ClipboardCopy className="h-3 w-3 mr-1" />
                  Copy URL
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => {
                    window.open(redirectUrl, '_blank');
                  }}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Test
                </Button>
              </div>
            </div>
          </div>
          
          {/* Right column - Settings and customization */}
          <div className="md:w-3/5 p-6">
            <CardTitle className="text-xl mb-4">Primary Redirect</CardTitle>
            
            <div className="space-y-5">
              <div>
                <div className="text-sm font-medium mb-1">Redirects To:</div>
                <div className="flex items-center">
                  <Input
                    value={mainRedirectDestination || ''}
                    onChange={(e) => setMainRedirectDestination(e.target.value)}
                    onBlur={(e) => {
                      const newUrl = e.target.value;
                      if (!newUrl) return;
                      
                      const primaryRedirect = redirectUrls.find((r: RedirectUrl) => r.id === 0);
                      
                      if (primaryRedirect) {
                        updateMutation.mutate({
                          id: primaryRedirect.id,
                          data: {
                            ...primaryRedirect,
                            destinationUrl: newUrl
                          }
                        });
                      } else {
                        createMutation.mutate({ 
                          name: '', 
                          destinationUrl: newUrl
                        });
                      }
                    }}
                    placeholder="https://example.com/landing-page"
                    className="flex-grow"
                  />
                  {mainRedirectDestination && (
                    <div className="flex ml-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          navigator.clipboard.writeText(mainRedirectDestination);
                          toast({
                            description: "Destination URL copied",
                            duration: 2000,
                          });
                        }}
                      >
                        <ClipboardCopy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          window.open(mainRedirectDestination, '_blank');
                        }}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-md text-sm border border-blue-100">
                <p>This is your primary redirect. Use this for your main marketing materials and QR codes. You can change where it points to at any time without updating your QR codes.</p>
              </div>
              
              {/* QR Code Customization Options */}
              <div>
                <h3 className="font-medium text-sm mb-3">QR Code Customization</h3>
                
                <QRCodeStyler 
                  redirectUrls={redirectUrls} 
                  mainRedirectDestination={mainRedirectDestination}
                  onStyleChange={() => {
                    // Force refresh the component to rebuild the QR codes
                    console.log('QR code style updated');
                    // Refresh data to get updated styles
                    refetch().then(() => {
                      toast({
                        title: "QR Code style updated",
                        description: "The style has been applied to all QR codes.",
                        duration: 3000,
                      });
                    });
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>            
      {/* Note about only having one redirect */}
      <Card className="bg-blue-50 border-blue-200 mt-4">
        <CardContent className="pt-6 pb-6">
          <p className="text-center text-gray-700">
            This system uses a single redirect URL for all QR codes. You can change the destination at any time without changing your QR codes.
          </p>
        </CardContent>
      </Card>
      
      {/* QR Code Analytics Section */}
      <Card className="mt-6 overflow-hidden border shadow">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">QR Code Analytics</CardTitle>
          <CardDescription>
            Track performance and usage statistics for your QR code redirects
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isStatsLoading ? (
            <div className="py-6 flex justify-center">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {redirectStats
                  .filter(stat => stat.name === 'main')
                  .map(stat => (
                    <div key={stat.id} className="bg-white p-4 rounded-lg border shadow-sm">
                      <h3 className="text-lg font-semibold mb-4">Redirect Statistics</h3>
                      <div className="space-y-4">
                        <div>
                          <span className="text-sm text-gray-500">Total Scans</span>
                          <p className="text-3xl font-bold text-primary">{stat.accessCount}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Last Accessed</span>
                          <p className="font-medium">
                            {stat.lastAccessed ? formatTimeAgo(stat.lastAccessed) : 'Never'}
                          </p>
                          {stat.lastAccessed && (
                            <p className="text-xs text-gray-500">
                              {formatDate(stat.lastAccessed)}
                            </p>
                          )}
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Created</span>
                          <p className="text-sm">
                            {formatDate(stat.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <h3 className="text-lg font-semibold mb-4">Destination</h3>
                  <div className="space-y-3">
                    <div className="truncate max-w-full">
                      <span className="text-sm text-gray-500">Current URL</span>
                      <p className="font-medium text-sm truncate">{mainRedirectDestination}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => window.open(mainRedirectDestination, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Visit Target URL
                    </Button>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <h3 className="text-lg font-semibold mb-4">Actions</h3>
                  <div className="space-y-3">
                    <Button 
                      onClick={() => {
                        window.open(`${window.location.origin}/redirect/main`, '_blank');
                        setTimeout(() => {
                          queryClient.invalidateQueries({ queryKey: ['/api/redirect-stats'] });
                        }, 1000);
                      }}
                      variant="default"
                      className="w-full"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Test QR Code Redirect
                    </Button>
                    <Button 
                      onClick={() => {
                        queryClient.invalidateQueries({ queryKey: ['/api/redirect-stats'] });
                        toast({
                          title: "Analytics refreshed",
                          description: "The latest statistics have been loaded.",
                          duration: 3000,
                        });
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh Analytics
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}