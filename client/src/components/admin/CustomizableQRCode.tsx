import React, { useRef, useEffect, useState, useMemo } from 'react';
import '../../styles/logo-filter.css';

// QR Code styling options based on the mini-qr library
// Limiting the shape options to ones we can support with our current implementation
export type QRBodyShape = 'square' | 'rounded' | 'dots' | 'classy' | 'circle';

export type QREyeFrameShape = 'square' | 'rounded' | 'circle';

export type QREyeBallShape = 'square' | 'rounded' | 'circle';

export interface QRCodeStyleOptions {
  // Shape options
  bodyShape?: QRBodyShape;
  eyeFrameShape?: QREyeFrameShape;
  eyeBallShape?: QREyeBallShape;
  
  // Basic color options
  color?: string;
  backgroundColor?: string;
  
  // Gradient options
  useGradient?: boolean;
  gradientType?: 'linear' | 'radial';
  gradientRotation?: number;
  gradientStart?: string;
  gradientEnd?: string;
  
  // Custom eye color
  customEyeColor?: boolean;
  eyeColor?: string;
  useGradientForEyes?: boolean; // Whether to use gradient colors for eyes instead of solid color
  
  // Logo options
  logoUrl?: string;
  logoSize?: number; // Size as a percentage of the QR code (1-40)
  logoMargin?: number; // Margin around logo in pixels
  logoInBlack?: boolean; // Whether to render the logo in black and white
}

interface CustomizableQRCodeProps {
  value: string;
  size: number;
  style?: Partial<QRCodeStyleOptions>;
  logoUrl?: string;
  className?: string;
}

// Map our types to QR Code API parameters
const getTypeParams = (
  bodyShape: QRBodyShape = 'square',
  eyeFrameShape: QREyeFrameShape = 'square'
): string => {
  let params = '';
  
  // Map different shapes to error correction levels
  // This impacts the density & appearance of the QR code
  let errorCorrectionLevel = 'L'; // Default lowest level
  
  // Increase error correction based on body shape complexity
  if (['rounded', 'dots', 'dots-circular', 'dots-square', 'classy-rounded'].includes(bodyShape)) {
    errorCorrectionLevel = 'M'; // Medium error correction (more dots)
  } else if (['circular', 'star', 'shield', 'diamond'].includes(bodyShape)) {
    errorCorrectionLevel = 'Q'; // Higher error correction (even more dots)
  } else if (['dots-star', 'edge-cut', 'leaf'].includes(bodyShape)) {
    errorCorrectionLevel = 'H'; // Highest error correction (densest pattern)
  }
  
  params += `&chld=${errorCorrectionLevel}|0`;
  
  return params;
};

/**
 * Generates a QR code with multiple fallback options
 */
const generateQRCode = (text: string, size: number, options: QRCodeStyleOptions): string => {
  // Double the requested size for higher quality
  const highResSize = size * 2;
  const sizeParam = `${highResSize}x${highResSize}`;
  const colorParam = options.color?.replace('#', '') || '000000';
  // Handle transparent background
  const bgColorParam = options.backgroundColor === 'transparent' ? 'transparent' : (options.backgroundColor?.replace('#', '') || 'FFFFFF');
  
  // Always use highest error correction level for better reliability
  // Using 'H' for highest error correction and compatibility with logo overlay
  const errorCorrectionLevel = 'H';
  
  // Minimal margin for cleaner appearance
  const margin = 1;
  
  // Generate a timestamp to prevent caching issues
  const timestamp = new Date().getTime();
  
  // Implement style differences with CSS and container styling
  // To visually differentiate styles, we'll combine image properties with container styling
  
  // Initialize parameters based on bodyShape
  let additionalParams = '';
  
  // Apply different parameters based on the body shape
  switch (options.bodyShape) {
    case 'dots':
      additionalParams += '&margin=5';
      break;
    
    case 'rounded':
      additionalParams += '&margin=2';
      break;
    
    case 'classy':
      additionalParams += '&margin=3';
      break;
    
    case 'circle':
      additionalParams += '&margin=0';
      break;
  }
  
  // Apply different parameters based on eye frame shape
  if (options.eyeFrameShape) {
    switch (options.eyeFrameShape) {
      case 'rounded':
        // Try to get an API parameter for rounded eyes if available
        additionalParams += '&eyeball=1';
        break;
      
      case 'circle':
        // Try to get an API parameter for circular eyes if available
        additionalParams += '&eyeball=2';
        break;
    }
  }
  
  // Handle eye colors - use custom color or gradient
  if (options.useGradientForEyes && options.useGradient) {
    // If gradient for eyes is enabled, use the gradient colors
    // Note: The API doesn't support different colors for eyes vs body
    // So we'll handle this entirely with CSS overlay/masking in the UI
    console.log('Using gradient colors for eyes:', options.gradientStart, options.gradientEnd);
  } else if (options.customEyeColor) {
    // If custom eye color is specified, try to use it
    const eyeColorParam = options.eyeColor?.replace('#', '') || colorParam;
    additionalParams += `&eye_color=${eyeColorParam}`;
    console.log('Using custom eye color:', eyeColorParam);
  }
  
  // Build the final URL with all parameters
  const finalUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(text)}&size=${sizeParam}&color=${colorParam}&bgcolor=${bgColorParam}&qzone=${margin}&format=png&ecc=${errorCorrectionLevel}&t=${timestamp}${additionalParams}`;
  
  console.log(`Generated QR URL with bodyShape=${options.bodyShape}, eyeFrameShape=${options.eyeFrameShape}:`, finalUrl);
  
  return finalUrl;
};

/**
 * Helper function to download a QR code image
 */
const downloadQRCode = (url: string, filename: string = 'qrcode.png') => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const CustomizableQRCode: React.FC<CustomizableQRCodeProps> = ({ 
  value, 
  size = 200, 
  style = {},
  className
}) => {
  const qrContainerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [qrImageUrl, setQrImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<boolean>(false);

  // Default style options - we need to create a new object on each render
  // to ensure React detects the changes in style props
  const styleOptions = React.useMemo(() => ({ 
    // Shape options
    bodyShape: style.bodyShape || 'square',
    eyeFrameShape: style.eyeFrameShape || 'square',
    eyeBallShape: style.eyeBallShape || 'square',
    
    // Basic color options
    color: style.color || '#000000',
    backgroundColor: style.backgroundColor || '#FFFFFF',
    
    // Gradient options
    useGradient: style.useGradient || false,
    gradientType: style.gradientType || 'linear',
    gradientRotation: style.gradientRotation || 0,
    gradientStart: style.gradientStart || style.color || '#000000',
    gradientEnd: style.gradientEnd || '#6B46C1',
    
    // Custom eye color
    customEyeColor: style.customEyeColor || false,
    eyeColor: style.eyeColor || style.color || '#000000',
    useGradientForEyes: style.useGradientForEyes || false,
    
    // Logo options
    logoUrl: style.logoUrl || '',
    logoSize: style.logoSize || 25, // 25% of QR code size by default
    logoMargin: style.logoMargin || 2, // 2px margin by default
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

  // Force re-render on any style option change
  const qrKey = useMemo(() => 
    `qr-${value}-${size}-${JSON.stringify(styleOptions)}`, 
    [value, size, styleOptions]
  );
  
  useEffect(() => {
    setIsLoading(true);
    setLoadError(false);
    
    // Generate QR code URL
    const qrUrl = generateQRCode(value, size, styleOptions);
    setQrImageUrl(qrUrl);
    
    // Create an image element to preload and check for errors
    const img = new Image();
    img.onload = () => {
      setIsLoading(false);
    };
    img.onerror = () => {
      console.error('Failed to load QR code image.');
      setLoadError(true);
      setIsLoading(false);
    };
    img.src = qrUrl;
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [qrKey]);

  // Calculate visual appearance based on style
  const getContainerStyle = () => {
    // Style variables
    let borderRadius = '0';
    let padding = '8px';
    let boxShadow = 'none';
    let border = 'none';
    
    // Apply different styles based on bodyShape
    switch(styleOptions.bodyShape) {
      case 'rounded':
        borderRadius = '8px';
        padding = '10px';
        boxShadow = styleOptions.backgroundColor !== 'transparent' ? '0 3px 10px rgba(0,0,0,0.08)' : 'none';
        break;
        
      case 'circle':
        borderRadius = '50%';
        padding = '12px';
        boxShadow = styleOptions.backgroundColor !== 'transparent' ? '0 4px 12px rgba(0,0,0,0.12)' : 'none';
        break;
        
      case 'dots':
        borderRadius = '8px';
        padding = '8px';
        border = styleOptions.backgroundColor !== 'transparent' ? `2px dashed ${styleOptions.color}20` : 'none'; // Very light border using QR color
        break;
        
      case 'classy':
        borderRadius = '12px';
        padding = '14px';
        boxShadow = styleOptions.backgroundColor !== 'transparent' ? '0 6px 16px rgba(0,0,0,0.08), 0 3px 6px rgba(0,0,0,0.04)' : 'none';
        break;
        
      default: // square
        borderRadius = '0';
        padding = '8px';
        border = styleOptions.backgroundColor !== 'transparent' ? `1px solid ${styleOptions.color}10` : 'none'; // Very light border
    }
    
    // Apply additional modifications based on eyeFrameShape
    if ((styleOptions.eyeFrameShape === 'rounded' || styleOptions.eyeFrameShape === 'circle') && 
        styleOptions.backgroundColor !== 'transparent') {
      boxShadow = boxShadow + ', inset 0 0 8px rgba(0,0,0,0.03)';
    }
    
    return {
      backgroundColor: styleOptions.backgroundColor,
      padding: styleOptions.backgroundColor !== 'transparent' ? padding : '0',
      borderRadius,
      boxShadow,
      border,
      display: 'inline-block',
      position: 'relative' as const,
      overflow: 'hidden',
      transition: 'all 0.2s ease-in-out',
      // Add checkered background for transparent QR codes to make them visible during editing
      backgroundImage: styleOptions.backgroundColor === 'transparent' 
        ? 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)'
        : 'none',
      backgroundSize: styleOptions.backgroundColor === 'transparent' ? '20px 20px' : 'auto',
      backgroundPosition: styleOptions.backgroundColor === 'transparent' ? '0 0, 0 10px, 10px -10px, -10px 0' : 'auto'
    };
  };

  // Function to handle downloading the QR code
  const handleDownload = () => {
    if (qrImageUrl && !loadError) {
      const filename = `qr-code-${value.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 20)}.png`;
      downloadQRCode(qrImageUrl, filename);
    }
  };
  
  // Function to open QR code in a new window (enlarge)
  const handleEnlarge = () => {
    if (qrImageUrl && !loadError) {
      window.open(qrImageUrl, '_blank');
    }
  };

  return (
    <div className={className}>
      <div className="flex flex-col items-center">
        <div 
          style={getContainerStyle()}
          ref={qrContainerRef}
          className="relative group"
        >
          {isLoading ? (
            <div style={{
              width: size,
              height: size,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: styleOptions.backgroundColor === 'transparent' ? undefined : styleOptions.backgroundColor,
              // Add checkered background for transparent loading state
              backgroundImage: styleOptions.backgroundColor === 'transparent' 
                ? 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)'
                : 'none',
              backgroundSize: styleOptions.backgroundColor === 'transparent' ? '20px 20px' : 'auto',
              backgroundPosition: styleOptions.backgroundColor === 'transparent' ? '0 0, 0 10px, 10px -10px, -10px 0' : 'auto'
            }}>
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : loadError ? (
            <div style={{
              width: size,
              height: size,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: styleOptions.backgroundColor === 'transparent' ? undefined : styleOptions.backgroundColor,
              color: styleOptions.color,
              padding: '8px',
              textAlign: 'center',
              fontSize: '14px',
              position: 'relative',
              overflow: 'hidden',
              // Add checkered background for transparent error state
              backgroundImage: styleOptions.backgroundColor === 'transparent' 
                ? 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)'
                : 'none',
              backgroundSize: styleOptions.backgroundColor === 'transparent' ? '20px 20px' : 'auto',
              backgroundPosition: styleOptions.backgroundColor === 'transparent' ? '0 0, 0 10px, 10px -10px, -10px 0' : 'auto'
            }}>
              {/* QR pattern background */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0.1,
                pointerEvents: 'none',
                backgroundImage: `
                  radial-gradient(${styleOptions.color} 2px, transparent 2px),
                  radial-gradient(${styleOptions.color} 2px, transparent 2px)
                `,
                backgroundSize: '10px 10px',
                backgroundPosition: '0 0, 5px 5px'
              }} />
              
              {/* Content */}
              <div style={{ 
                position: 'relative', 
                zIndex: 2,
                backgroundColor: styleOptions.backgroundColor === 'transparent' 
                  ? 'rgba(255, 255, 255, 0.8)' // Use semi-transparent white for transparent backgrounds
                  : `${styleOptions.backgroundColor}99`, 
                padding: '8px 12px',
                borderRadius: '4px',
                width: 'calc(100% - 16px)',
                maxWidth: size - 16,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{ 
                  fontWeight: 'bold', 
                  textAlign: 'center', 
                  fontSize: '12px'
                }}>
                  Scan or click link:
                </div>
                
                <div style={{ 
                  fontSize: '10px', 
                  width: '100%',
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap',
                  textAlign: 'center'
                }}>
                  {value.length > 25 ? `${value.substring(0, 22)}...` : value}
                </div>
                
                <button
                  onClick={() => window.open(value, '_blank')}
                  style={{
                    backgroundColor: styleOptions.color,
                    color: styleOptions.backgroundColor,
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '10px',
                    border: 'none',
                    cursor: 'pointer',
                    marginTop: '8px',
                    width: 'fit-content'
                  }}
                >
                  Open Link
                </button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <img 
                ref={imgRef}
                src={qrImageUrl}
                alt={`QR Code for ${value}`}
                width={size}
                height={size}
                style={{ 
                  maxWidth: '100%',
                  height: 'auto',
                  display: 'block',
                  borderRadius: styleOptions.bodyShape === 'circle' ? '50%' : getContainerStyle().borderRadius,
                  imageRendering: 'crisp-edges',
                  filter: `contrast(1.05) ${styleOptions.bodyShape === 'dots' ? 'drop-shadow(0 0 1px rgba(0,0,0,0.2))' : ''}`,
                  padding: styleOptions.bodyShape === 'rounded' || styleOptions.bodyShape === 'circle' ? '2px' : '0',
                  boxShadow: styleOptions.bodyShape === 'classy' ? 'inset 0 0 10px rgba(0,0,0,0.05)' : 'none'
                }}
              />
              
              {/* Logo overlay */}
              {styleOptions.logoUrl && (
                <div 
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: `calc(${styleOptions.logoSize}% - ${(styleOptions.logoMargin || 0) * 2}px)`, 
                    height: `calc(${styleOptions.logoSize}% - ${(styleOptions.logoMargin || 0) * 2}px)`,
                    backgroundColor: '#FFFFFF',
                    borderRadius: '4px',
                    boxShadow: `0 0 0 ${styleOptions.logoMargin || 0}px #FFFFFF, 0 2px 4px rgba(0,0,0,0.1)`,
                    overflow: 'hidden'
                  }}
                >
                  {styleOptions.logoInBlack ? (
                    // Black and white logo with special handling
                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                      {/* White background layer to handle transparent logos */}
                      <div style={{ 
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'white',
                        zIndex: 1
                      }} />
                      
                      {/* Black and white filtered logo - match exactly with QRCodeRedirectManager */}
                      <img 
                        src={styleOptions.logoUrl}
                        alt="Logo (Black)"
                        className={`qr-code-logo ${styleOptions.logoInBlack ? 'black-filter' : ''}`}
                        style={{ 
                          position: 'relative',
                          width: '100%', 
                          height: '100%',
                          objectFit: 'contain',
                          zIndex: 2,
                          // Apply inline filter for dialogs/popups where CSS might not be applying correctly
                          filter: styleOptions.logoInBlack ? 'brightness(0) contrast(2000%)' : 'none',
                          WebkitFilter: styleOptions.logoInBlack ? 'brightness(0) contrast(2000%)' : 'none'
                        }}
                      />
                    </div>
                  ) : (
                    // Original colored logo
                    <img 
                      src={styleOptions.logoUrl}
                      alt="Logo (Color)"
                      className="qr-code-logo"
                      style={{ 
                        width: '100%', 
                        height: '100%',
                        objectFit: 'contain',
                        position: 'relative',
                        zIndex: 2
                      }}
                    />
                  )}
                </div>
              )}
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex gap-2">
                  <button 
                    onClick={handleEnlarge}
                    className="bg-white p-1 rounded-full shadow-md hover:bg-gray-200 transition-colors"
                    title="Enlarge QR Code"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                    </svg>
                  </button>
                  <button 
                    onClick={handleDownload}
                    className="bg-white p-1 rounded-full shadow-md hover:bg-gray-200 transition-colors"
                    title="Download QR Code"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Controls below QR code */}
        {!isLoading && !loadError && (
          <div className="flex space-x-2 mt-2">
            <button 
              onClick={handleEnlarge}
              className="text-xs flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              title="Enlarge QR Code"
            >
              <span>Enlarge</span>
            </button>
            <button 
              onClick={handleDownload}
              className="text-xs flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              title="Download QR Code"
            >
              <span>Download</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomizableQRCode;