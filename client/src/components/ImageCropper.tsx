import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { RotateCw, Square, Maximize, Monitor, RefreshCw, CropIcon, Smartphone, Laptop, Grid } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { cn } from "@/lib/utils";

// Helper function to ensure we never get a perfect square ratio
function ensureNonSquareRatio(width: number, height: number): number {
  const ratio = width / height;
  // If the ratio is almost 1:1 (square), adjust it slightly
  if (Math.abs(ratio - 1) < 0.05) {
    return ratio < 1 ? 0.9 : 1.1; // Make it visibly rectangular
  }
  return ratio;
}

interface ImageCropperProps {
  image: string;
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedImageUrl: string, cropInfo?: any, originalImage?: string) => void;
  aspectRatio?: number;
  initialDeviceType?: 'mobile' | 'desktop';
}

export function ImageCropper({
  image,
  isOpen,
  onClose,
  onCropComplete,
  aspectRatio,
  initialDeviceType = 'mobile'
}: ImageCropperProps) {
  // UI State
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Image and crop state
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    x: 0,
    y: 0,
    width: 100,
    height: 100
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [rotation, setRotation] = useState(0);
  
  // Aspect ratio management
  type AspectRatioMode = "free" | "square" | "menu" | "mobile_hero" | "desktop_hero";
  const [aspectMode, setAspectMode] = useState<AspectRatioMode>("free");
  
  // Create default crops for different aspect ratios
  const createDefaultCropForAspect = useCallback((newAspectMode: AspectRatioMode) => {
    if (newAspectMode === "free") return;
    
    // Default to full image size
    const defaultCrop: Crop = {
      unit: '%',
      x: 0,
      y: 0,
      width: 100,
      height: 100
    };
    
    // Get image aspect ratio if available
    const imageAspect = imgRef.current ? imgRef.current.width / imgRef.current.height : 1;
    
    // Determine target aspect ratio based on mode
    let targetAspect: number;
    
    if (newAspectMode === "square") {
      targetAspect = 1; // 1:1 square
    } else if (newAspectMode === "menu") {
      targetAspect = 4/3; // 4:3 menu ratio
    } else if (newAspectMode === "mobile_hero") {
      targetAspect = 5/7; // 5:7 mobile ratio (portrait)
    } else if (newAspectMode === "desktop_hero") {
      targetAspect = 16/9; // 16:9 desktop ratio (landscape)
    } else {
      // Default to standard ratio if not specified
      targetAspect = 4/3;
    }
    
    // Adjust dimensions based on image and target aspect ratios
    if (imageAspect > targetAspect) {
      // Image is wider than target, adjust width
      defaultCrop.width = defaultCrop.height * targetAspect;
      defaultCrop.x = (100 - defaultCrop.width) / 2; // Center horizontally
    } else {
      // Image is taller than target, adjust height
      defaultCrop.height = defaultCrop.width / targetAspect;
      defaultCrop.y = (100 - defaultCrop.height) / 2; // Center vertically
    }
    
    setCrop(defaultCrop);
    
    // Also set completedCrop to match if we have image dimensions
    if (imgRef.current) {
      const width = imgRef.current.width * (defaultCrop.width / 100);
      const height = imgRef.current.height * (defaultCrop.height / 100);
      const x = imgRef.current.width * (defaultCrop.x / 100);
      const y = imgRef.current.height * (defaultCrop.y / 100);
      
      setCompletedCrop({
        unit: 'px',
        x,
        y,
        width,
        height
      });
    }
  }, [imgRef]);
  
  // Shift key handling for temporary aspect locking
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [tempAspectRatio, setTempAspectRatio] = useState<number | null>(null);
  // Reference to the current crop to use when shift is pressed anytime
  const currentCropRef = useRef<Crop | null>(null);
  
  // State to track if a crop has been made
  const [hasUserCropped, setHasUserCropped] = useState(false);
  // State to track if we're in the initial drag (to prevent aspect ratio application right away)
  const [isInitialDrag, setIsInitialDrag] = useState(true);
  
  // Effect to detect when user has made a crop
  useEffect(() => {
    if (completedCrop && completedCrop.width > 0 && completedCrop.height > 0) {
      setHasUserCropped(true);
      setIsInitialDrag(false);
    }
  }, [completedCrop]);
  
  // Set up initial crop when image loads
  const handleImageLoad = useCallback(() => {
    if (imgRef.current && !completedCrop) {
      // Create a default crop based on current aspect mode
      if (aspectMode !== "free") {
        createDefaultCropForAspect(aspectMode);
      } else {
        // For free mode, create a pixel-based crop from our percentage-based initial state
        const width = imgRef.current.width * (crop.width / 100);
        const height = imgRef.current.height * (crop.height / 100);
        const x = imgRef.current.width * (crop.x / 100);
        const y = imgRef.current.height * (crop.y / 100);
        
        setCompletedCrop({
          unit: 'px',
          x,
          y,
          width,
          height
        });
      }
    }
  }, [aspectMode, crop, completedCrop, createDefaultCropForAspect]);
  
  // Set up keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift' && !isShiftPressed && aspectMode === "free") {
        setIsShiftPressed(true);
        
        // Always use the most current crop from our ref
        const currentCrop = currentCropRef.current || crop;
        
        // Only activate aspect ratio if we have a meaningful crop size
        // We use a higher threshold (30px) to ensure we have a clear user intent
        if (currentCrop && currentCrop.width > 30 && currentCrop.height > 30) {
          const ratio = ensureNonSquareRatio(currentCrop.width, currentCrop.height);
          console.log('Shift pressed: locking to current shape with ratio:', ratio);
          setTempAspectRatio(ratio);
        } else {
          // Start with no constraint if the crop is too small or undefined
          console.log('Shift pressed but crop too small - no constraint applied yet');
          setTempAspectRatio(null);
        }
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(false);
        setTempAspectRatio(null);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isShiftPressed, aspectMode, crop]);
  
  // Rotate the image 90 degrees
  const handleRotate = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);
  
  // Reset crop to full image
  const handleReset = useCallback(() => {
    setCrop({
      unit: '%',
      x: 0,
      y: 0,
      width: 100,
      height: 100
    });
    setRotation(0);
  }, []);
  
  // State for device type being edited
  const [deviceType, setDeviceType] = useState<'mobile' | 'desktop'>(initialDeviceType);
  
  // State for rule of thirds toggle
  const [showRuleOfThirds, setShowRuleOfThirds] = useState(false);
  
  // Create a cropped version of the image
  const createCroppedImage = useCallback(async () => {
    if (!completedCrop || !imgRef.current) {
      // If no crop is selected, use the original image
      onCropComplete(image, { objectPosition: 'center center' }, image);
      onClose();
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Create a canvas to hold the cropped image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }
      
      // Get natural dimensions of the image
      const naturalWidth = imgRef.current.naturalWidth;
      const naturalHeight = imgRef.current.naturalHeight;
      
      // Calculate scaling factors
      const scaleX = naturalWidth / imgRef.current.width;
      const scaleY = naturalHeight / imgRef.current.height;
      
      // Apply scaling to crop
      const scaledCrop = {
        x: completedCrop.x * scaleX,
        y: completedCrop.y * scaleY,
        width: completedCrop.width * scaleX,
        height: completedCrop.height * scaleY
      };
      
      // Calculate focal point (center of crop as percentage of original image)
      const focalPointX = (scaledCrop.x + scaledCrop.width / 2) / naturalWidth;
      const focalPointY = (scaledCrop.y + scaledCrop.height / 2) / naturalHeight;
      
      // Calculate object position CSS value based on focal point
      const objectPositionX = `${focalPointX * 100}%`;
      const objectPositionY = `${focalPointY * 100}%`;
      const objectPosition = `${objectPositionX} ${objectPositionY}`;
      
      console.log(`Calculated focal point: x=${focalPointX}, y=${focalPointY}`);
      console.log(`Calculated object-position: ${objectPosition}`);
      
      // Prepare crop info to return with device type
      const cropInfo = {
        focalPoint: { x: focalPointX, y: focalPointY },
        objectPosition,
        deviceType
      };
      
      // Handle rotation - swap dimensions for 90/270 degree rotations
      const isOddRotation = rotation % 180 !== 0;
      if (isOddRotation) {
        canvas.width = scaledCrop.height;
        canvas.height = scaledCrop.width;
      } else {
        canvas.width = scaledCrop.width;
        canvas.height = scaledCrop.height;
      }
      
      // Clear canvas
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Apply rotation if needed
      if (rotation !== 0) {
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        
        if (isOddRotation) {
          ctx.drawImage(
            imgRef.current,
            scaledCrop.x,
            scaledCrop.y,
            scaledCrop.width,
            scaledCrop.height,
            -scaledCrop.height / 2,
            -scaledCrop.width / 2,
            scaledCrop.height,
            scaledCrop.width
          );
        } else {
          ctx.drawImage(
            imgRef.current,
            scaledCrop.x,
            scaledCrop.y,
            scaledCrop.width,
            scaledCrop.height,
            -scaledCrop.width / 2,
            -scaledCrop.height / 2,
            scaledCrop.width,
            scaledCrop.height
          );
        }
        
        ctx.restore();
      } else {
        // No rotation, simple crop
        ctx.drawImage(
          imgRef.current,
          scaledCrop.x,
          scaledCrop.y,
          scaledCrop.width,
          scaledCrop.height,
          0,
          0,
          canvas.width,
          canvas.height
        );
      }
      
      // Convert to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('Canvas is empty'))),
          'image/jpeg',
          0.95
        );
      });
      
      // Convert to data URL and return
      const reader = new FileReader();
      reader.onloadend = () => {
        onCropComplete(reader.result as string, cropInfo, image);
        onClose();
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Error creating cropped image:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [completedCrop, imgRef, rotation, image, onCropComplete, onClose, deviceType]);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl sm:max-w-2xl md:max-w-3xl h-auto max-h-[90vh] overflow-auto bg-white">
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
        </DialogHeader>
        
        <div className="relative w-full mt-4 flex justify-center bg-gray-100 rounded-lg p-4">
          <ReactCrop
            crop={crop}
            onDragStart={(c) => {
              // No predefined aspect ratio when starting a drag, even if shift is pressed
              // We'll only apply a ratio constraint after the user has dragged at least a bit
              if (isShiftPressed && aspectMode === "free") {
                // Start with no aspect ratio restriction regardless of shift state
                setTempAspectRatio(null);
                console.log('Drag start with shift: beginning without constraint');
              }
            }}
            onChange={(c) => {
              // Always keep track of the current crop for shift keypress at any time
              currentCropRef.current = c;
              
              // Only apply a ratio constraint if:
              // 1. Shift is pressed
              // 2. We have a meaningful crop size (at least 30px in each dimension)
              // 3. We're in free aspect ratio mode
              if (isShiftPressed && c.width > 30 && c.height > 30 && aspectMode === "free") {
                const ratio = ensureNonSquareRatio(c.width, c.height);
                setTempAspectRatio(ratio);
                setIsInitialDrag(false);
                console.log('Shift is pressed during drag: locking to current ratio', ratio);
              }
              setCrop(c);
            }}
            onComplete={(c) => {
              setCompletedCrop(c);
              setIsInitialDrag(false);
              
              // After completion, set the aspect ratio for future drags if shift is pressed
              // Only do this if we have a meaningful crop size (30px minimum)
              if (isShiftPressed && c.width > 30 && c.height > 30 && aspectMode === "free") {
                const ratio = ensureNonSquareRatio(c.width, c.height);
                setTempAspectRatio(ratio);
                console.log('Completed drag with shift: locked to ratio', ratio);
              }
            }}
            aspect={
              aspectMode === "square" 
                ? 1 
                : aspectMode === "menu" 
                  ? 4/3 
                  : aspectMode === "mobile_hero"
                    ? 5/7
                    : aspectMode === "desktop_hero"
                      ? 16/9
                      : (isShiftPressed && tempAspectRatio)
                        ? tempAspectRatio 
                        : undefined
            }
            minWidth={30}
            minHeight={30}
          >
            <div className="relative">
              <img
                ref={imgRef}
                src={image}
                alt="Crop preview"
                onLoad={handleImageLoad}
                style={{
                  maxHeight: '60vh',
                  maxWidth: '100%',
                  transform: `rotate(${rotation}deg)`,
                  objectFit: 'contain'
                }}
              />
              
              {/* Rule of thirds overlay */}
              {showRuleOfThirds && imgRef.current && (
                <div 
                  className="absolute top-0 left-0 pointer-events-none"
                  style={{
                    width: imgRef.current.width,
                    height: imgRef.current.height,
                    transform: `rotate(${rotation}deg)`,
                  }}
                >
                  {/* Horizontal lines */}
                  <div className="absolute border-t border-brown-400 opacity-70" style={{ 
                    left: 0, 
                    top: imgRef.current.height / 3, 
                    width: '100%',
                    borderColor: '#8D6142'
                  }} />
                  <div className="absolute border-t border-brown-400 opacity-70" style={{ 
                    left: 0, 
                    top: imgRef.current.height * 2/3, 
                    width: '100%',
                    borderColor: '#8D6142'
                  }} />
                  
                  {/* Vertical lines */}
                  <div className="absolute border-l border-brown-400 opacity-70" style={{ 
                    top: 0, 
                    left: imgRef.current.width / 3, 
                    height: '100%',
                    borderColor: '#8D6142'
                  }} />
                  <div className="absolute border-l border-brown-400 opacity-70" style={{ 
                    top: 0, 
                    left: imgRef.current.width * 2/3, 
                    height: '100%',
                    borderColor: '#8D6142'
                  }} />
                  
                  {/* Intersection points */}
                  <div className="absolute w-2 h-2 rounded-full bg-brown-500" style={{ 
                    top: imgRef.current.height / 3 - 4, 
                    left: imgRef.current.width / 3 - 4,
                    backgroundColor: '#7D4E2C'
                  }} />
                  <div className="absolute w-2 h-2 rounded-full bg-brown-500" style={{ 
                    top: imgRef.current.height / 3 - 4, 
                    left: imgRef.current.width * 2/3 - 4,
                    backgroundColor: '#7D4E2C'
                  }} />
                  <div className="absolute w-2 h-2 rounded-full bg-brown-500" style={{ 
                    top: imgRef.current.height * 2/3 - 4, 
                    left: imgRef.current.width / 3 - 4,
                    backgroundColor: '#7D4E2C'
                  }} />
                  <div className="absolute w-2 h-2 rounded-full bg-brown-500" style={{ 
                    top: imgRef.current.height * 2/3 - 4, 
                    left: imgRef.current.width * 2/3 - 4,
                    backgroundColor: '#7D4E2C'
                  }} />
                </div>
              )}
            </div>
          </ReactCrop>
        </div>
        
        <div className="flex flex-col mt-4 p-4 bg-gray-50 rounded-md gap-3">
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <Button
                onClick={handleRotate}
                size="sm"
                variant="outline"
                title="Rotate 90°"
              >
                <RotateCw className="h-4 w-4 mr-1" />
                Rotate
              </Button>
              
              <Button
                onClick={handleReset}
                size="sm"
                variant="outline"
                title="Reset crop to center"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>
            
            <div className="text-sm font-semibold flex items-center gap-2">
              <span className="text-base">Device:</span>
              <div className="flex rounded-md border overflow-hidden">
                <Button 
                  size="sm" 
                  variant={deviceType === 'mobile' ? 'default' : 'ghost'}
                  className={`px-2 py-1 h-8 rounded-none ${deviceType === 'mobile' ? 'text-white hover:bg-opacity-90' : ''}`}
                  style={deviceType === 'mobile' ? {backgroundColor: '#7D4E2C'} : {}}
                  onClick={() => setDeviceType('mobile')}
                >
                  <Smartphone className="h-4 w-4 mr-1" />
                  Mobile
                </Button>
                <Button 
                  size="sm" 
                  variant={deviceType === 'desktop' ? 'default' : 'ghost'}
                  className={`px-2 py-1 h-8 rounded-none ${deviceType === 'desktop' ? 'text-white hover:bg-opacity-90' : ''}`}
                  style={deviceType === 'desktop' ? {backgroundColor: '#7D4E2C'} : {}}
                  onClick={() => setDeviceType('desktop')}
                >
                  <Laptop className="h-4 w-4 mr-1" />
                  Desktop
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-500">
                {deviceType === 'mobile' 
                  ? 'Adjusting how image appears on mobile devices (portrait)' 
                  : 'Adjusting how image appears on desktop devices (landscape)'}
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <Switch
                  id="rule-of-thirds"
                  checked={showRuleOfThirds}
                  onCheckedChange={setShowRuleOfThirds}
                />
                <Label htmlFor="rule-of-thirds" className="text-sm cursor-pointer flex items-center gap-1">
                  <Grid className="h-4 w-4" />
                  Rule of Thirds
                </Label>
              </div>
            </div>
            
            <div className="text-sm font-semibold">
              <span className="text-base">Aspect Ratio</span>
            </div>
          </div>
          
          <RadioGroup 
            value={aspectMode}
            onValueChange={(value) => {
              const newAspectMode = value as AspectRatioMode;
              setAspectMode(newAspectMode);
              
              // For free mode, just change the aspect constraint
              if (newAspectMode === "free" as AspectRatioMode) {
                return;
              }
              
              // If there is no completed crop yet or if it's the initial crop, create a default one
              if (!completedCrop || !hasUserCropped) {
                // Create a default square or menu crop centered in the image
                createDefaultCropForAspect(newAspectMode);
                return;
              }
              
              // If user has already made a crop, adjust the current crop to the new aspect ratio
              if (newAspectMode !== "free" as AspectRatioMode && imgRef.current && completedCrop) {
                // Get the center point of the current crop
                const centerX = completedCrop.x + completedCrop.width / 2;
                const centerY = completedCrop.y + completedCrop.height / 2;
                
                // Determine the new aspect ratio based on mode
                let newRatio: number;
                if (newAspectMode === "square") {
                  newRatio = 1; // 1:1 square
                } else if (newAspectMode === "menu") {
                  newRatio = 4/3; // 4:3 menu
                } else if (newAspectMode === "mobile_hero") {
                  newRatio = 5/7; // 5:7 mobile hero (portrait)
                } else if (newAspectMode === "desktop_hero") {
                  newRatio = 16/9; // 16:9 desktop hero (landscape)
                } else {
                  // Default to 4:3 as fallback
                  newRatio = 4/3;
                }
                
                // Calculate new width and height maintaining the center
                let newWidth = completedCrop.width;
                let newHeight = completedCrop.height;
                
                // Adjust dimensions to match the new aspect ratio
                if (newWidth / newHeight > newRatio) {
                  // Current crop is wider than target ratio, adjust width
                  newWidth = newHeight * newRatio;
                } else {
                  // Current crop is taller than target ratio, adjust height
                  newHeight = newWidth / newRatio;
                }
                
                // Calculate new top-left corner to maintain the center point
                const newX = centerX - newWidth / 2;
                const newY = centerY - newHeight / 2;
                
                // Create and apply the new crop
                const newCrop: Crop = {
                  unit: completedCrop.unit,
                  x: newX,
                  y: newY,
                  width: newWidth,
                  height: newHeight
                };
                
                setCrop(newCrop);
                // Also update the completed crop to match
                setCompletedCrop({
                  ...newCrop,
                  unit: 'px'
                } as PixelCrop);
              }
            }}
            className="grid grid-cols-5 gap-3 text-base"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="free" id="ratio-free" />
              <Label htmlFor="ratio-free" className="flex items-center space-x-2 cursor-pointer">
                <Maximize className="h-5 w-5" />
                <span className="text-sm font-medium">
                  Free {isShiftPressed && aspectMode === "free" && tempAspectRatio ? (
                    <span className="ml-1 text-xs font-medium" style={{color: '#7D4E2C'}}>(Shift locked)</span>
                  ) : isShiftPressed && aspectMode === "free" ? (
                    <span className="ml-1 text-xs text-gray-500 font-medium">(Shift ready)</span>
                  ) : null}
                </span>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="square" id="ratio-square" />
              <Label htmlFor="ratio-square" className="flex items-center space-x-2 cursor-pointer">
                <Square className="h-5 w-5" />
                <span className="text-sm font-medium">Square</span>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="menu" id="ratio-menu" />
              <Label htmlFor="ratio-menu" className="flex items-center space-x-2 cursor-pointer">
                <Monitor className="h-5 w-5" />
                <span className="text-sm font-medium">Menu (4:3)</span>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="mobile_hero" id="ratio-mobile-hero" />
              <Label htmlFor="ratio-mobile-hero" className="flex items-center space-x-2 cursor-pointer">
                <Smartphone className="h-5 w-5" />
                <span className="text-sm font-medium">Mobile (5:7)</span>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="desktop_hero" id="ratio-desktop-hero" />
              <Label htmlFor="ratio-desktop-hero" className="flex items-center space-x-2 cursor-pointer">
                <Laptop className="h-5 w-5" />
                <span className="text-sm font-medium">Desktop (16:9)</span>
              </Label>
            </div>
          </RadioGroup>
          
          {aspectMode === "free" && (
            <div className="text-xs text-gray-500 mt-1">
              <span>
                Tip: Hold <kbd className="px-1 py-0.5 rounded bg-gray-100 border border-gray-300 font-mono">Shift</kbd> key at any time to lock to current shape. Release to freely adjust, then press Shift again to lock to new shape.
              </span>
            </div>
          )}
        </div>
        
        <DialogFooter className="mt-4">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isProcessing}
            size="sm"
          >
            Cancel
          </Button>
          <Button 
            onClick={createCroppedImage}
            disabled={isProcessing}
            size="sm"
          >
            {isProcessing ? 'Processing...' : 'Apply Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}