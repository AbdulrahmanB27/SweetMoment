import React, { useState } from 'react';
import { toast } from '@/hooks/use-toast';

interface ImageCropperProps {
  image: string;
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedImageUrl: string, originalImage?: string) => Promise<void>;
}

// Placeholder for ImageCropper component - you'll need to implement or import this
const ImageCropper: React.FC<ImageCropperProps> = ({ image, isOpen, onClose, onCropComplete }) => {
  // Placeholder implementation
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Image Cropper</h2>
        <img src={image} alt="Edit" className="max-w-md max-h-96 mb-4" />
        <div className="flex justify-end space-x-2">
          <button
            className="px-4 py-2 border rounded-md hover:bg-gray-100"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            onClick={() => onCropComplete(image)}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

// Function to get admin authentication headers
const getAdminAuthHeaders = () => {
  // Implement based on your auth system
  return {};
};

interface CarouselEditFunctionsProps {
  heroSection: any;
  setHeroSection: React.Dispatch<React.SetStateAction<any>>;
  syncWithHomepage: (updatedHeroSection: any) => Promise<boolean>;
}

const CarouselEditFunctions: React.FC<CarouselEditFunctionsProps> = ({ 
  heroSection, 
  setHeroSection, 
  syncWithHomepage 
}) => {
  // State for image cropping
  const [imageBeingEdited, setImageBeingEdited] = useState<string | null>(null);
  const [showImageCropper, setShowImageCropper] = useState(false);
  
  // Handle editing a carousel image
  const handleEditCarouselImage = (imageUrl: string) => {
    console.log(`Editing image: ${imageUrl}`);
    setImageBeingEdited(imageUrl);
    setShowImageCropper(true);
  };
  
  // Handle completing image crop
  const handleCropComplete = async (croppedImageUrl: string, originalImage?: string) => {
    if (!imageBeingEdited || !croppedImageUrl) {
      console.error("Missing required image data for crop completion");
      return;
    }
    
    console.log(`Replacing image ${imageBeingEdited} with cropped version`);
    
    try {
      // Create a fetch request to upload the base64 image
      const response = await fetch('/api/admin/upload-base64', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAdminAuthHeaders()
        },
        body: JSON.stringify({
          image: croppedImageUrl,
          originalPath: imageBeingEdited // Pass the original path for potential optimization
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to upload cropped image: ${response.status}`);
      }
      
      const data = await response.json();
      const newImageUrl = data.url;
      
      // Update the image in heroSection
      const updatedImages = [...heroSection.images];
      const imageIndex = updatedImages.findIndex(img => img === imageBeingEdited);
      
      if (imageIndex !== -1) {
        updatedImages[imageIndex] = newImageUrl;
        
        // Also update primaryImage if necessary
        let updatedImageUrl = heroSection.imageUrl;
        if (heroSection.imageUrl === imageBeingEdited) {
          updatedImageUrl = newImageUrl;
        }
        
        const updatedHeroSection = {
          ...heroSection,
          images: updatedImages,
          imageUrl: updatedImageUrl
        };
        
        setHeroSection(updatedHeroSection);
        
        // Sync with homepage
        const success = await syncWithHomepage(updatedHeroSection);
        if (success) {
          toast({
            title: "Image Updated",
            description: "The carousel image has been recropped successfully",
            variant: "default",
          });
        } else {
          toast({
            title: "Update Pending",
            description: "Image updated but not yet synced. Click 'Save Changes' to apply.",
            variant: "default",
          });
        }
      }
    } catch (error) {
      console.error("Error updating cropped image:", error);
      toast({
        title: "Error",
        description: "Failed to update cropped image. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Reset state
      setImageBeingEdited(null);
      setShowImageCropper(false);
    }
  };

  return (
    <>
      {/* Render UI for editing carousel images */}
      {showImageCropper && imageBeingEdited && (
        <ImageCropper
          image={imageBeingEdited}
          isOpen={showImageCropper}
          onClose={() => setShowImageCropper(false)}
          onCropComplete={handleCropComplete}
        />
      )}
    </>
  );
};

export default CarouselEditFunctions;