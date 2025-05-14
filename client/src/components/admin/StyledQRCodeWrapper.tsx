import React, { useState, useEffect, useMemo, useRef } from 'react';
import QRCodeStyled, { QRStyledCodeOptions, convertShapeToType } from './QRCodeStylingLoader';
import CustomizableQRCode, { QRCodeStyleOptions } from './CustomizableQRCode';
import { Button } from '../ui/button';
import { Download } from 'lucide-react';

// Extended style props for internal use that includes all the properties
interface QRCodeStylePropsInternal {
  // Shape options
  bodyShape: string;
  eyeFrameShape: string;
  eyeBallShape: string;
  
  // Basic color options
  color: string;
  backgroundColor: string;
  
  // Gradient options
  useGradient: boolean;
  gradientType: 'linear' | 'radial';
  gradientRotation: number;
  gradientStart: string;
  gradientEnd: string;
  
  // Custom eye color
  customEyeColor: boolean;
  eyeColor: string;
  useGradientForEyes?: boolean; // Whether to use gradient colors for eyes
  
  // Logo options
  logoUrl: string;
  logoSize: number;
  logoMargin: number;
  logoInBlack?: boolean;
}

interface StyledQRCodeWrapperProps {
  value: string;
  size: number;
  style?: Partial<QRCodeStyleOptions>;
  className?: string;
  enableDownload?: boolean;
}

/**
 * This component tries to use the advanced qr-code-styling library first,
 * but falls back to the existing implementation if that fails to load.
 */
const StyledQRCodeWrapper: React.FC<StyledQRCodeWrapperProps> = ({
  value,
  size,
  style = {},
  className,
  enableDownload = false,
}) => {
  const [useAdvancedStyling, setUseAdvancedStyling] = useState<boolean>(true);
  const [qrConfig, setQrConfig] = useState<QRStyledCodeOptions | null>(null);
  const [scriptLoadError, setScriptLoadError] = useState(false);

  // Memoize style properties to prevent recreation on each render
  const styleProps = useMemo<QRCodeStylePropsInternal>(() => ({
    // Shape options
    bodyShape: style.bodyShape || 'square',
    eyeFrameShape: style.eyeFrameShape || 'square',
    eyeBallShape: style.eyeBallShape || 'square',
    
    // Basic color options
    color: style.color || '#000000',
    backgroundColor: style.backgroundColor || '#FFFFFF',
    
    // Gradient options
    useGradient: style.useGradient || false,
    gradientType: (style.gradientType || 'linear') as 'linear' | 'radial',
    gradientRotation: style.gradientRotation || 0,
    gradientStart: style.gradientStart || style.color || '#000000',
    gradientEnd: style.gradientEnd || '#6B46C1',
    
    // Custom eye color
    customEyeColor: style.customEyeColor || false,
    eyeColor: style.eyeColor || style.color || '#000000',
    useGradientForEyes: style.useGradientForEyes || false,
    
    // Logo options
    logoUrl: style.logoUrl || '',
    logoSize: style.logoSize || 25,
    logoMargin: style.logoMargin || 0,
    logoInBlack: style.logoInBlack || false
  }), [
    // Shape options
    style.bodyShape,
    style.eyeFrameShape,
    style.eyeBallShape,
    
    // Basic color options
    style.color,
    style.backgroundColor,
    
    // Gradient options
    style.useGradient,
    style.gradientType,
    style.gradientRotation,
    style.gradientStart,
    style.gradientEnd,
    
    // Custom eye color
    style.customEyeColor,
    style.eyeColor,
    style.useGradientForEyes,
    
    // Logo options
    style.logoUrl,
    style.logoSize, 
    style.logoMargin,
    style.logoInBlack
  ]);

  // For efficiency, create a local variable for logoInBlack outside the effect
  const logoInBlack = style.logoInBlack || false;

  // Convert our styling options to the qr-code-styling format
  useEffect(() => {
    if (!useAdvancedStyling) return;

    try {
      // Get the shape types
      const { dotsType, cornersSquareType, cornersDotType } = convertShapeToType(
        styleProps.bodyShape,
        styleProps.eyeFrameShape,
        styleProps.eyeBallShape
      );

      // Configure the QR code options
      const config: QRStyledCodeOptions = {
        width: size,
        height: size,
        data: value,
        margin: 0,
        qrOptions: {
          typeNumber: 0,
          mode: 'Byte',
          errorCorrectionLevel: 'H'
        },
        backgroundOptions: {
          color: styleProps.backgroundColor === 'transparent' ? 'transparent' : (styleProps.backgroundColor || '#FFFFFF')
        }
      };
      
      // Create a shared gradient configuration if needed
      const sharedGradient = styleProps.useGradient ? {
        type: styleProps.gradientType || 'linear',
        rotation: styleProps.gradientRotation || 0,
        colorStops: [
          { offset: 0, color: styleProps.gradientStart || styleProps.color || '#000000' },
          { offset: 1, color: styleProps.gradientEnd || '#6B46C1' }
        ]
      } : null;
      
      // Set dot options
      if (sharedGradient) {
        config.dotsOptions = {
          type: dotsType,
          gradient: sharedGradient
        };
      } else {
        config.dotsOptions = {
          type: dotsType,
          color: styleProps.color
        };
      }
      
      // Set eye frame options (corner squares)
      if (styleProps.useGradientForEyes && sharedGradient) {
        // Apply the same gradient as the QR code body for visual continuity
        config.cornersSquareOptions = {
          type: cornersSquareType,
          gradient: sharedGradient
        };
      } else if (styleProps.customEyeColor) {
        // Use custom eye color if specified
        config.cornersSquareOptions = {
          type: cornersSquareType,
          color: styleProps.eyeColor || styleProps.color
        };
      } else {
        // Default to main color
        config.cornersSquareOptions = {
          type: cornersSquareType,
          color: styleProps.color
        };
      }
      
      // Set eye ball options (corner dots)
      if (styleProps.useGradientForEyes && sharedGradient) {
        // Apply the same gradient as the QR code body for visual continuity
        config.cornersDotOptions = {
          type: cornersDotType,
          gradient: sharedGradient
        };
      } else if (styleProps.customEyeColor) {
        // Use custom eye color if specified
        config.cornersDotOptions = {
          type: cornersDotType,
          color: styleProps.eyeColor || styleProps.color
        };
      } else {
        // Default to main color
        config.cornersDotOptions = {
          type: cornersDotType,
          color: styleProps.color
        };
      };

      // If logo URL is provided, add it to the config
      if (styleProps.logoUrl) {
        // Set basic imageOptions
        config.imageOptions = {
          hideBackgroundDots: true,
          imageSize: (styleProps.logoSize) / 100,
          margin: styleProps.logoMargin,
          crossOrigin: 'anonymous'
        };
        
        // Handle black and white conversion
        if (logoInBlack) {
          // Create a canvas for black and white processing
          const logoImg = new Image();
          logoImg.crossOrigin = 'anonymous';
          logoImg.onload = () => {
            try {
              const canvas = document.createElement('canvas');
              const size = Math.max(logoImg.width, logoImg.height);
              canvas.width = size;
              canvas.height = size;
              const ctx = canvas.getContext('2d');
              
              if (ctx) {
                // Fill with white background
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Draw the original image centered
                const x = (size - logoImg.width) / 2;
                const y = (size - logoImg.height) / 2;
                ctx.drawImage(logoImg, x, y, logoImg.width, logoImg.height);
                
                // Apply black and white filter - exactly matching the preview filter
                // Filter:  brightness(0) contrast(2000%)
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                
                for (let i = 0; i < data.length; i += 4) {
                  const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
                  // Apply the same aggressive contrast(2000%) filter effect as the CSS
                  const value = brightness < 240 ? 0 : 255; // Ultra aggressive threshold matching our CSS
                  data[i] = data[i + 1] = data[i + 2] = value;
                  
                  // Force the alpha channel to be fully opaque for black pixels
                  if (value === 0) {
                    data[i + 3] = 255; // Full opacity for black pixels
                  }
                }
                
                ctx.putImageData(imageData, 0, 0);
                
                // Update the QR config with processed image
                const processedLogoUrl = canvas.toDataURL('image/png');
                if (qrConfig) {
                  const updatedConfig = {
                    ...qrConfig,
                    image: processedLogoUrl
                  };
                  setQrConfig(updatedConfig);
                }
              }
            } catch (err) {
              console.error('Error processing logo for QR code:', err);
              // Fallback to original logo
              config.image = styleProps.logoUrl;
              if (qrConfig !== config) {
                setQrConfig(config);
              }
            }
          };
          
          logoImg.onerror = () => {
            console.error('Failed to load logo for QR code');
            // Fallback to original logo
            config.image = styleProps.logoUrl;
            if (qrConfig !== config) {
              setQrConfig(config);
            }
          };
          
          logoImg.src = styleProps.logoUrl;
          
          // Set initial image while processing
          config.image = styleProps.logoUrl;
        } else {
          // Use the original colored logo
          config.image = styleProps.logoUrl;
        }
      }
      
      // Set initial config before async processing completes
      setQrConfig(config);
    } catch (error) {
      console.error('Error creating QR config:', error);
      setUseAdvancedStyling(false);
    }
  }, [value, size, styleProps, useAdvancedStyling, logoInBlack]);

  // If the script fails to load, use the fallback
  const handleScriptError = () => {
    console.log('Falling back to standard QR code implementation');
    setScriptLoadError(true);
    setUseAdvancedStyling(false);
  };
  
  // Function to download QR code as image
  const downloadQRCode = () => {
    // Find the canvas element within this component
    const canvas = document.querySelector(`.${className} canvas`) as HTMLCanvasElement;
    if (!canvas) {
      console.error('No canvas element found to download');
      return;
    }
    
    try {
      // Use canvas to get data URL
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `qr-code-${value.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error downloading QR code:', error);
    }
  };

  return (
    <div className={className}>
      <div className="relative">
        {useAdvancedStyling && qrConfig ? (
          <div className={`qr-wrapper ${logoInBlack ? 'dialog-logo-black-filter' : ''}`}>
            <QRCodeStyled
              config={qrConfig}
              className={`advanced-qr ${logoInBlack ? 'dialog-logo-black-filter' : ''}`}
            />
            {scriptLoadError && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70" 
                  onClick={() => setUseAdvancedStyling(false)}>
                <div className="text-sm text-red-500 p-2 bg-white rounded shadow">
                  Error loading advanced QR styling.
                  <button className="block mx-auto mt-1 text-xs text-blue-500">
                    Try standard version
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <CustomizableQRCode
            value={value}
            size={size}
            style={style}
            className={`${className} ${logoInBlack ? 'dialog-logo-black-filter' : ''}`} // Add black filter class if needed
          />
        )}
        
        {enableDownload && (
          <div className="mt-2 flex justify-center">
            <Button 
              size="sm" 
              onClick={downloadQRCode}
              className="flex items-center gap-2"
            >
              <Download size={16} />
              Download QR Code
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StyledQRCodeWrapper;