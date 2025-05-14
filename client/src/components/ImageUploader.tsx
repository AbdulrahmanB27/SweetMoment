import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, Link as LinkIcon, ImagePlus, XCircle, Scissors, Edit, Crop } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageCropper } from "./ImageCropper";

interface ImageUploaderProps {
  currentImageUrl: string;
  onImageUploaded: (imageUrl: string) => void;
  className?: string;
}

export function ImageUploader({ currentImageUrl, onImageUploaded, className = "" }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string>(currentImageUrl || "");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string>("");
  const [originalImage, setOriginalImage] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  
  // State to store the original filename
  const [originalFilename, setOriginalFilename] = useState<string>("");
  
  // Handle file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.match('image.*')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPEG, PNG, etc.)",
        variant: "destructive"
      });
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image size must be less than 5MB",
        variant: "destructive"
      });
      return;
    }
    
    // Store the original filename (without extension)
    const filename = file.name.replace(/\.[^/.]+$/, "");
    setOriginalFilename(filename);
    console.log("Original filename:", filename);
    
    // Create a preview URL and open crop dialog
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageDataUrl = e.target?.result as string;
      // Save both the original and the image to crop
      setOriginalImage(imageDataUrl);
      setImageToCrop(imageDataUrl);
      setIsCropModalOpen(true);
    };
    reader.readAsDataURL(file);
  };
  
  // Handle the cropped image but preserve the original for future editing
  const handleCroppedImage = async (croppedImageUrl: string, originalImageData?: string) => {
    try {
      // Show processing state
      setIsUploading(true);
      
      // Important: If originalImageData is provided, store it for future edits
      // We may not have this in all cases, but the ImageCropper should provide it
      if (originalImageData) {
        console.log("Storing original image for future edits");
        setOriginalImage(originalImageData);
      }
      
      // Show the cropped version in the preview
      console.log("Setting preview to cropped image");
      setPreview(croppedImageUrl);
      
      // Upload the cropped image to the server
      console.log("Uploading cropped image to server...");
      // Get the admin auth headers helper function
      const getAdminAuthHeaders = () => {
        return {
          'X-Admin-Access': 'sweetmoment-dev-secret'
        };
      };
      
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAdminAuthHeaders() // Use the admin auth headers
        },
        body: JSON.stringify({ 
          base64Image: croppedImageUrl,
          originalFilename: originalFilename || `Image_${new Date().toISOString().slice(0, 10)}`
        })
      });
      
      if (!response.ok) {
        throw new Error('Upload failed: ' + response.statusText);
      }
      
      // Get server response with the URL to use in the product
      const data = await response.json();
      console.log("Upload successful, server response:", data);
      
      // Store image metadata in global window object for display name lookup
      if (data.imageUrl && originalFilename) {
        // Initialize the metadata object if it doesn't exist
        if (!window.__imageMetadata) {
          window.__imageMetadata = {};
        }
        
        // Store the original filename with the image URL
        window.__imageMetadata[data.imageUrl] = {
          originalFilename: originalFilename
        };
        
        console.log("Stored image metadata:", window.__imageMetadata);
      }
      
      // Update the parent component with the server URL for saving to the database
      onImageUploaded(data.imageUrl);
      
      // Toast notification removed to prevent duplicates with site-customization.tsx
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading the cropped image. Please try again.",
        variant: "destructive"
      });
      
      // Still show the cropped preview even if server upload failed
      if (croppedImageUrl) {
        setPreview(croppedImageUrl);
      }
    } finally {
      setIsUploading(false);
    }
  };
  
  // URL handling is done inline in the button's onClick

  // Handle paste from clipboard
  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    
    if (!items) return;
    
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          
          // Create a preview URL and open crop dialog
          const reader = new FileReader();
          reader.onload = (e) => {
            const imageDataUrl = e.target?.result as string;
            // Save both the original and the image to crop
            setOriginalImage(imageDataUrl);
            setImageToCrop(imageDataUrl);
            setIsCropModalOpen(true);
          };
          reader.readAsDataURL(file);
          return;
        }
      }
    }
  };
  
  // Handle drag events for the drop zone
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);
  
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  }, [isDragging]);
  
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  
  // Process the dropped files
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    // Get the dropped files
    const files = e.dataTransfer?.files;
    
    // Process the first file if any were dropped
    if (files && files.length > 0) {
      const file = files[0];
      
      // Validate file type
      if (!file.type.match('image.*')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file (JPEG, PNG, etc.)",
          variant: "destructive"
        });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Image size must be less than 5MB",
          variant: "destructive"
        });
        return;
      }
      
      // Store the original filename (without extension)
      const filename = file.name.replace(/\.[^/.]+$/, "");
      setOriginalFilename(filename);
      console.log("Original filename from drop:", filename);
      
      // Create a preview URL and open crop dialog
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target?.result as string;
        // Save both the original and the image to crop
        setOriginalImage(imageDataUrl);
        setImageToCrop(imageDataUrl);
        setIsCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  }, [toast]);

  // Helper function to upload image
  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    
    // Store the original filename (without extension)
    const filename = file.name.replace(/\.[^/.]+$/, "");
    setOriginalFilename(filename);
    console.log("Original filename:", filename);
    
    // Also add the original filename to the form data
    formData.append('originalFilename', filename);
    
    setIsUploading(true);
    try {
      // Get the admin auth headers helper function (reusing the same function from above)
      const getAdminAuthHeaders = () => {
        return {
          'X-Admin-Access': 'sweetmoment-dev-secret'
        };
      };
      
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
        headers: {
          // The browser will set content-type with correct boundary
          ...getAdminAuthHeaders() // Use the admin auth headers
        }
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      
      // Store image metadata in global window object for display name lookup
      if (data.imageUrl && filename) {
        // Initialize the metadata object if it doesn't exist
        if (!window.__imageMetadata) {
          window.__imageMetadata = {};
        }
        
        // Store the original filename with the image URL
        window.__imageMetadata[data.imageUrl] = {
          originalFilename: filename
        };
        
        console.log("Stored image metadata:", window.__imageMetadata);
      }
      
      onImageUploaded(data.imageUrl);
      
      // Toast notification removed to prevent duplicates with site-customization.tsx
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading the image",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle image removal
  const handleClearImage = () => {
    setPreview("");
    setImageUrl("");
    setOriginalImage("");
    onImageUploaded("");
  };
  
  // Reset file input value when clearing image
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Modified clear image handler that resets the file input
  const handleClearAndReset = () => {
    handleClearImage();
    
    // Reset the file input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card className="overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Preview area with crop button - takes full width on mobile, left side on desktop */}
          {(originalImage || preview) ? (
            <div className="relative overflow-hidden md:w-1/2 md:border-r border-gray-100" style={{ minHeight: '230px' }}>
              <div className="flex justify-center items-center w-full h-full p-2">
                <img 
                  src={preview || originalImage || ""} 
                  alt="Image preview" 
                  className="max-w-full max-h-[300px] object-contain" 
                />
              </div>
              
              {/* Control buttons in the corner */}
              <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                <button 
                  onClick={async () => {
                    // Use the original image for cropping if available
                    if (originalImage) {
                      setImageToCrop(originalImage);
                      setIsCropModalOpen(true);
                    } else if (preview) {
                      setIsUploading(true);
                      try {
                        // For external URLs (starting with http), we need to fetch and convert to data URL
                        // to avoid CORS issues when cropping
                        if (preview.startsWith('http')) {
                          // Create a canvas to draw and convert the image
                          const img = new Image();
                          img.crossOrigin = 'anonymous'; // Try to request CORS access
                          
                          // Wait for the image to load
                          await new Promise((resolve, reject) => {
                            img.onload = resolve;
                            img.onerror = reject;
                            // Add cache-busting parameter
                            img.src = `${preview}${preview.includes('?') ? '&' : '?'}t=${Date.now()}`;
                          });
                          
                          // Create a canvas and convert to data URL
                          const canvas = document.createElement('canvas');
                          canvas.width = img.width;
                          canvas.height = img.height;
                          const ctx = canvas.getContext('2d');
                          ctx?.drawImage(img, 0, 0);
                          
                          try {
                            // Try to get the data URL (may fail with CORS)
                            const dataUrl = canvas.toDataURL('image/png');
                            setImageToCrop(dataUrl);
                            // Also save as originalImage for future edits
                            setOriginalImage(dataUrl);
                          } catch (corsError) {
                            console.error('CORS error converting image:', corsError);
                            // Fall back to direct URL if CORS fails
                            toast({
                              title: "Limited Functionality",
                              description: "External image cannot be fully processed due to security restrictions. Cropping may be limited."
                            });
                            setImageToCrop(preview);
                          }
                        } 
                        // For server URLs (starting with /), add a timestamp to force a fresh fetch
                        else if (preview.startsWith('/')) {
                          const cacheBustUrl = `${preview}?t=${Date.now()}`;
                          setImageToCrop(cacheBustUrl);
                        } 
                        // For data URLs, use directly
                        else {
                          setImageToCrop(preview);
                        }
                        
                        setIsCropModalOpen(true);
                      } catch (error) {
                        console.error('Error preparing image for cropping:', error);
                        toast({
                          title: "Error",
                          description: "Failed to prepare image for cropping",
                          variant: "destructive"
                        });
                      } finally {
                        setIsUploading(false);
                      }
                    }
                  }}
                  className="bg-white/90 backdrop-blur-sm hover:bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 group"
                  type="button"
                  aria-label="Crop image"
                  title="Crop image"
                  disabled={isUploading}
                >
                  {isUploading ? 
                    <Loader2 className="h-6 w-6 text-primary animate-spin" /> : 
                    <Crop className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                  }
                </button>
                
                <button 
                  onClick={handleClearAndReset}
                  className="bg-white/90 backdrop-blur-sm hover:bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 group"
                  type="button"
                  aria-label="Remove image"
                  title="Remove image"
                  disabled={isUploading}
                >
                  <XCircle className="h-6 w-6 text-red-500 group-hover:scale-110 transition-transform" />
                </button>
              </div>
              
              {/* Transparent overlay at the bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
            </div>
          ) : null}
          
          {/* Upload controls - takes full width on mobile, right side on desktop */}
          <div className={`p-4 ${preview || originalImage ? 'md:w-1/2' : 'w-full'}`}>
            <Tabs defaultValue="file" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="file">
                  <Upload className="h-6 w-6 mr-2" />
                  File Upload
                </TabsTrigger>
                <TabsTrigger value="url">
                  <LinkIcon className="h-6 w-6 mr-2" />
                  Image URL
                </TabsTrigger>
                <TabsTrigger value="paste">
                  <ImagePlus className="h-6 w-6 mr-2" />
                  Paste
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="file" className="space-y-4">
                <div 
                  className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors relative ${isDragging ? 'bg-primary/10 border-primary' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload className={`mx-auto h-10 w-10 mb-2 ${isDragging ? 'text-primary/80 animate-bounce' : 'text-primary'}`} />
                  <div className="mt-2 text-sm font-medium">
                    {isDragging ? 'Release to upload image' : 'Drop image here'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {isDragging ? 'from another browser tab or window' : 'or click to select'}
                  </div>
                  
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="file:text-primary hidden"
                    disabled={isUploading}
                  />
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                      <div className="text-center">
                        <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary mb-2" />
                        <p className="text-sm font-medium">Uploading...</p>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500">Maximum file size: 5MB. Supported formats: JPG, PNG, GIF, etc.</p>
              </TabsContent>
              
              <TabsContent value="url">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      placeholder="https://example.com/image.jpg"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      disabled={isUploading}
                      aria-label="Image URL"
                    />
                  </div>
                  
                  <div className="flex justify-center">
                    <Button 
                      type="button" 
                      onClick={() => {
                        if (!imageUrl || imageUrl.trim() === '') {
                          toast({
                            title: "Empty URL",
                            description: "Please enter an image URL",
                            variant: "destructive"
                          });
                          return;
                        }
                        
                        setIsUploading(true);
                        
                        // Normalize the URL
                        let fixedUrl = imageUrl.trim();
                        
                        // Add protocol if missing
                        if (!fixedUrl.startsWith('http://') && !fixedUrl.startsWith('https://') && !fixedUrl.startsWith('/')) {
                          fixedUrl = 'https://' + fixedUrl;
                        }
                        
                        // Create an image object to test if the URL is valid
                        const img = new Image();
                        img.crossOrigin = 'anonymous'; // Try to request CORS access
                        
                        img.onload = () => {
                          try {
                            // Try to convert the image to a data URL for easier cropping later
                            const canvas = document.createElement('canvas');
                            canvas.width = img.width;
                            canvas.height = img.height;
                            const ctx = canvas.getContext('2d');
                            ctx?.drawImage(img, 0, 0);
                            
                            try {
                              // Try to get data URL (may fail with CORS)
                              const dataUrl = canvas.toDataURL('image/png');
                              // Save original image data for future cropping
                              setOriginalImage(dataUrl);
                            } catch (corsError) {
                              console.error('CORS restrictions prevent image conversion', corsError);
                              // If CORS prevents canvas access, we'll just use the URL
                              setOriginalImage("");
                            }
                          } catch (canvasError) {
                            console.error('Error creating canvas preview', canvasError);
                            setOriginalImage("");
                          }
                          
                          // Always set the preview to the URL regardless of CORS success
                          setPreview(fixedUrl);
                          onImageUploaded(fixedUrl);
                          
                          toast({
                            title: "Image URL Set",
                            description: "The image URL has been successfully set."
                          });
                          
                          // Reset states
                          setIsUploading(false);
                          setImageUrl("");
                        };
                        
                        img.onerror = () => {
                          // Image failed to load
                          toast({
                            title: "Invalid Image URL",
                            description: "Could not load image from the provided URL. Please check the URL and try again.",
                            variant: "destructive"
                          });
                          setIsUploading(false);
                        };
                        
                        // Start loading the image
                        img.src = fixedUrl;
                      }}
                      disabled={isUploading || !imageUrl}
                      className="w-full"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Setting URL...
                        </>
                      ) : (
                        <>
                          <LinkIcon className="mr-2 h-5 w-5" />
                          Use Image URL
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-2">Enter a direct link to an image (must end with .jpg, .png, etc.)</p>
                </div>
              </TabsContent>
              
              <TabsContent value="paste">
                <div 
                  className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors ${isDragging ? 'bg-primary/10 border-primary' : ''}`}
                  onPaste={handlePaste}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'v' && e.ctrlKey && handlePaste}
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <ImagePlus className={`mx-auto h-10 w-10 mb-2 ${isDragging ? 'text-primary/80 animate-bounce' : 'text-gray-400'}`} />
                  <p className="text-sm font-medium">
                    {isDragging ? 'Release to upload image' : 'Paste image from clipboard'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {isDragging ? 'from another browser tab or window' : 'Use Ctrl+V (Windows) or Cmd+V (Mac) to paste image'}
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </Card>
      
      {/* Image Cropper */}
      {imageToCrop && (
        <ImageCropper
          image={imageToCrop}
          isOpen={isCropModalOpen}
          onClose={() => setIsCropModalOpen(false)}
          onCropComplete={handleCroppedImage}
        />
      )}
      
      {/* Note: Aspect ratio selection now happens inside the ImageCropper component */}
    </div>
  );
}