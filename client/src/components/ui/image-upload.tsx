import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import { Button } from './button';
import { Label } from './label';
import { Input } from './input';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onSizeChange?: (size: number) => void;
  showBlackWhiteOption?: boolean;
  isBlackWhite?: boolean;
  onBlackWhiteChange?: (isBlackWhite: boolean) => void;
  maxPreviewHeight?: number;
  label?: string;
  helpText?: string;
}

/**
 * A reusable image upload component that supports:
 * - File input
 * - Drag and drop
 * - Paste from clipboard
 * - Direct URL input
 * - Black and white conversion for logos
 */
export function ImageUpload({
  value,
  onChange,
  onSizeChange,
  showBlackWhiteOption = false,
  isBlackWhite = false,
  onBlackWhiteChange,
  maxPreviewHeight = 96, // 6rem
  label = "Image",
  helpText = "Drag & drop an image here, paste, or select a file"
}: ImageUploadProps) {
  const [imageUrl, setImageUrl] = useState<string>(value || '');
  const [urlInput, setUrlInput] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set a default size value when an image is loaded
  const DEFAULT_SIZE = 30;

  // Handle file based uploads (select file, drag/drop, paste)
  const handleFileUpload = (file: File) => {
    if (file.type.indexOf('image') !== -1) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImageUrl(result);
        onChange(result);
        if (onSizeChange) {
          onSizeChange(DEFAULT_SIZE);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle direct URL input
  const handleUrlSubmit = () => {
    if (urlInput) {
      setImageUrl(urlInput);
      onChange(urlInput);
      if (onSizeChange) {
        onSizeChange(DEFAULT_SIZE);
      }
    }
  };

  // Delete/remove the image
  const handleRemoveImage = () => {
    setImageUrl('');
    setUrlInput('');
    onChange('');
  };

  return (
    <div className="space-y-4">
      <div 
        className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center"
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleFileUpload(file);
            }
          }}
        />
        
        <div 
          className="w-full h-32 flex flex-col items-center justify-center"
          onPaste={(e) => {
            const items = e.clipboardData?.items;
            if (items) {
              for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                  const blob = items[i].getAsFile();
                  if (blob) {
                    handleFileUpload(blob);
                  }
                }
              }
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
              const file = files[0];
              if (file.type.indexOf('image') !== -1) {
                handleFileUpload(file);
              }
            }
          }}
        >
          {imageUrl ? (
            isBlackWhite && showBlackWhiteOption ? (
              // Black and white image with white background to ensure transparent handling
              <div className="relative max-h-24 w-auto mb-2 bg-white">
                <div className="relative overflow-hidden" style={{ maxHeight: `${maxPreviewHeight}px` }}>
                  {/* White background for transparent images */}
                  <div className="absolute inset-0 bg-white"></div>
                  
                  {/* Black and white filtered image */}
                  <img 
                    src={imageUrl} 
                    alt="Preview (B&W)"
                    className="image-upload-preview" 
                    style={{
                      WebkitFilter: 'brightness(0) contrast(2000%)',
                      maxHeight: `${maxPreviewHeight}px`,
                      maxWidth: '100%',
                      objectFit: 'contain',
                      position: 'relative',
                      zIndex: 2
                    }}
                  />
                </div>
              </div>
            ) : (
              // Regular color image
              <img 
                src={imageUrl} 
                alt="Preview" 
                className="max-h-24 max-w-full object-contain mb-2"
                style={{ maxHeight: `${maxPreviewHeight}px` }}
              />
            )
          ) : (
            <>
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">
                {helpText}
              </p>
            </>
          )}
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            className="mt-2"
            onClick={() => fileInputRef.current?.click()}
          >
            {imageUrl ? 'Change Image' : 'Select Image'}
          </Button>
        </div>
      </div>
      
      {/* Image URL input */}
      <div>
        <Label htmlFor="image-url" className="text-sm font-medium">Image URL</Label>
        <div className="flex gap-2 mt-1">
          <Input
            id="image-url"
            placeholder="https://example.com/image.png"
            className="flex-1"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
          />
          <Button
            type="button"
            onClick={handleUrlSubmit}
            className="whitespace-nowrap"
          >
            Use Link
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Enter a direct URL to an image (PNG, JPG, SVG, etc.)
        </p>
      </div>
      
      {/* Additional controls when an image is selected */}
      {imageUrl && (
        <div className="space-y-2">
          {/* Black and white option when enabled */}
          {showBlackWhiteOption && onBlackWhiteChange && (
            <div className="flex items-center gap-2">
              <input 
                type="checkbox"
                id="use-black-white"
                checked={isBlackWhite}
                onChange={(e) => onBlackWhiteChange(e.target.checked)}
              />
              <Label 
                htmlFor="use-black-white" 
                className="text-sm font-medium cursor-pointer"
              >
                Convert to black only (for printing)
              </Label>
            </div>
          )}
          
          {/* Remove image button */}
          <Button 
            variant="outline"
            className="w-full mt-2"
            onClick={handleRemoveImage}
          >
            Remove Image
          </Button>
        </div>
      )}
    </div>
  );
}