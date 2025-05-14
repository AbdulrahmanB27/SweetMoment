import { useState, useEffect } from "react";
import { ChocolateSlider } from "./ChocolateSlider";

interface MixedTypeSelectorProps {
  typeOptions: { id: string; label: string; price: number }[];
  onChange: (mixedTypeRatio: { 
    typeId1: string; 
    typeId2: string; 
    ratio: number;
    type1Pieces?: number;
    type2Pieces?: number;
    totalPieces?: number;
  }) => void;
  initialRatio?: number;
  totalPieces?: number;
  onPriceChange?: (price: number) => void;
  enableSlider?: boolean; // Whether to show the slider for precise ratio control
}

const MixedTypeSelector = ({ 
  typeOptions, 
  onChange, 
  initialRatio = 50, 
  totalPieces = 6,
  onPriceChange,
  enableSlider = false // Default to false for backward compatibility
}: MixedTypeSelectorProps) => {
  const [ratio, setRatio] = useState(initialRatio);
  
  // Calculate the actual number of pieces for each type
  const type1PiecesFloat = (ratio / 100) * totalPieces;
  const type2PiecesFloat = totalPieces - type1PiecesFloat;
  
  // Round to nearest integer
  const type1Pieces = Math.round(type1PiecesFloat);
  const type2Pieces = totalPieces - type1Pieces; // Ensure the total is exactly totalPieces

  // Ensure we have at least 2 types to mix
  if (typeOptions.length < 2) {
    return <div>At least two chocolate types are needed for mixing.</div>;
  }

  const type1 = typeOptions[0];
  const type2 = typeOptions[1];

  // Calculate the price impact of the mixed type based on pieces
  useEffect(() => {
    // Update parent with all details including piece counts
    onChange({
      typeId1: type1.id,
      typeId2: type2.id,
      ratio: ratio,
      type1Pieces: type1Pieces,
      type2Pieces: type2Pieces,
      totalPieces: totalPieces
    });
    
    // Calculate and update price if onPriceChange is provided
    if (onPriceChange) {
      // Get prices of each type
      let type1Price = type1.price || 0;
      let type2Price = type2.price || 0;
      
      // Convert type prices if they're in cents
      if (type1Price >= 100 && type1Price < 500) {
        type1Price = type1Price / 100;
      }
      
      if (type2Price >= 100 && type2Price < 500) {
        type2Price = type2Price / 100;
      }
      
      // Calculate weighted price based on piece count
      const weightedPrice = 
        ((type1Price * type1Pieces) + (type2Price * type2Pieces)) / totalPieces;
      
      console.log(`Mixed type price calculation: ${weightedPrice.toFixed(2)} = (${type1Pieces} x $${type1Price} + ${type2Pieces} x $${type2Price}) / ${totalPieces}`);
      
      onPriceChange(weightedPrice);
    }
  }, [ratio, type1.id, type2.id, type1.price, type2.price, type1Pieces, type2Pieces, totalPieces, onChange, onPriceChange]);

  // Handle slider value change
  const handleRatioChange = (value: number[]) => {
    setRatio(value[0]);
  };

  return (
    <div className="p-4 bg-[#FDF7E4] border border-amber-100 rounded-md">
      <h4 className="text-sm font-medium mb-4 text-amber-800">Adjust Chocolate Distribution</h4>
      
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div className="text-center p-2 bg-[#E8C39E] text-[#3A281D] rounded-md shadow-sm">
          <div className="font-medium mb-1">{type1.label}</div>
          <div className="flex items-center justify-center">
            <span className="text-lg font-bold">{type1Pieces}</span>
          </div>
        </div>
        
        <div className="text-center p-2 bg-[#3A281D] text-white rounded-md shadow-sm">
          <div className="font-medium mb-1">{type2.label}</div>
          <div className="flex items-center justify-center">
            <span className="text-lg font-bold">{type2Pieces}</span>
          </div>
        </div>
      </div>
      
      {/* Only show slider if enableSlider is true */}
      {enableSlider && (
        <ChocolateSlider
          value={[ratio]}
          max={100}
          min={0}
          step={Math.ceil(100 / totalPieces)}
          onValueChange={handleRatioChange}
          className="my-4"
        />
      )}

    </div>
  );
};

export default MixedTypeSelector;