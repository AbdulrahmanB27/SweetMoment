import React, { useRef, useEffect, useState } from 'react';

// This script adds the qr-code-styling library dynamically to the page
// This is a workaround for the package installation issues
const loadQRStylingScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if ((window as any).QRCodeStyling) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/qr-code-styling@1.6.0-rc.1/lib/qr-code-styling.js';
    script.async = true;
    script.onload = () => {
      console.log('QR Code Styling library loaded successfully');
      resolve();
    };
    script.onerror = () => {
      console.error('Failed to load QR Code Styling library');
      reject(new Error('Failed to load QR Code Styling library'));
    };
    document.body.appendChild(script);
  });
};

export type QRStyledCodeOptions = {
  width: number;
  height: number;
  data: string;
  margin?: number;
  qrOptions?: {
    typeNumber?: number;
    mode?: string;
    errorCorrectionLevel?: string;
  };
  imageOptions?: {
    hideBackgroundDots?: boolean;
    imageSize?: number;
    margin?: number;
    crossOrigin?: string;
  };
  dotsOptions?: {
    type?: string;
    color?: string;
    gradient?: {
      type: string;
      rotation: number;
      colorStops: Array<{
        offset: number;
        color: string;
      }>;
    };
  };
  backgroundOptions?: {
    color?: string;
  };
  image?: string;
  cornersSquareOptions?: {
    type?: string;
    color?: string;
    gradient?: {
      type: string;
      rotation: number;
      colorStops: Array<{
        offset: number;
        color: string;
      }>;
    };
  };
  cornersDotOptions?: {
    type?: string;
    color?: string;
    gradient?: {
      type: string;
      rotation: number;
      colorStops: Array<{
        offset: number;
        color: string;
      }>;
    };
  };
};

interface QRCodeStyledProps {
  config: QRStyledCodeOptions;
  className?: string;
}

const QRCodeStyled: React.FC<QRCodeStyledProps> = ({ config, className }) => {
  const qrContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Reference to the QR code instance
  const qrCodeRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;
    
    const initQRCode = async () => {
      try {
        setIsLoading(true);
        await loadQRStylingScript();

        if (!isMounted) return;

        if (!qrContainerRef.current) {
          setError('QR container reference is not available');
          setIsLoading(false);
          return;
        }
        
        // Clear previous QR code
        if (qrContainerRef.current.firstChild) {
          qrContainerRef.current.innerHTML = '';
        }

        const QRCodeStyling = (window as any).QRCodeStyling;
        if (!QRCodeStyling) {
          setError('QR Code Styling library failed to initialize');
          setIsLoading(false);
          return;
        }

        // Create a new QR code instance
        qrCodeRef.current = new QRCodeStyling(config);
        
        // Append to the container
        qrCodeRef.current.append(qrContainerRef.current);
        setIsLoading(false);
      } catch (err) {
        if (isMounted) {
          console.error('Error initializing styled QR code:', err);
          setError('Failed to initialize QR code styling. Check console for details.');
          setIsLoading(false);
        }
      }
    };

    initQRCode();

    return () => {
      isMounted = false;
    };
  }, [config.data]); // Only reinitialize when the QR code data changes

  // Update QR code when config changes
  useEffect(() => {
    if (qrCodeRef.current && !isLoading) {
      try {
        qrCodeRef.current.update(config);
      } catch (err) {
        console.error('Error updating styled QR code:', err);
        setError('Failed to update QR code. Check console for details.');
      }
    }
  }, [config, isLoading]);

  if (error) {
    return (
      <div className={`qr-error ${className || ''}`}>
        <p className="text-red-500 text-sm">{error}</p>
        <p className="text-xs mt-1">Falling back to standard QR code.</p>
      </div>
    );
  }

  return (
    <div className={`qr-container ${className || ''}`}>
      {isLoading && (
        <div className="flex justify-center items-center h-full" style={{ height: config.height }}>
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      )}
      <div
        ref={qrContainerRef}
        className={`styled-qr-code ${isLoading ? 'hidden' : ''}`}
      />
    </div>
  );
};

// Helper function to convert our shape types to qr-code-styling types
export const convertShapeToType = (
  bodyShape: string,
  eyeFrameShape: string,
  eyeBallShape: string
): {
  dotsType: string;
  cornersSquareType: string;
  cornersDotType: string;
} => {
  // Map our shape types to qr-code-styling types
  let dotsType = 'square'; // Default
  let cornersSquareType = 'square'; // Default
  let cornersDotType = 'square'; // Default

  // Convert body shape
  switch (bodyShape) {
    case 'rounded':
      dotsType = 'rounded';
      break;
    case 'dots':
      dotsType = 'dots';
      break;
    case 'classy':
      dotsType = 'classy';
      break;
    case 'circle':
      dotsType = 'rounded';
      break;
    default:
      dotsType = 'square';
  }

  // Convert eye frame shape
  switch (eyeFrameShape) {
    case 'rounded':
      cornersSquareType = 'extra-rounded';
      break;
    case 'circle':
      cornersSquareType = 'dot';
      break;
    default:
      cornersSquareType = 'square';
  }

  // Convert eye ball shape
  switch (eyeBallShape) {
    case 'rounded':
      cornersDotType = 'rounded';
      break;
    case 'circle':
      cornersDotType = 'dot';
      break;
    default:
      cornersDotType = 'square';
  }

  return {
    dotsType,
    cornersSquareType,
    cornersDotType,
  };
};

export default QRCodeStyled;