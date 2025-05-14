import React from 'react';

// Component to handle rendering item details while hiding "none" values
interface ItemDisplayProps {
  item: {
    quantity?: number;
    productId: string | number;
    productName?: string;
    size?: string;
    type?: string;
    shape?: string;
  };
  getShapeName?: (shape: string) => string;
}

export const HideNoneValues: React.FC<ItemDisplayProps> = ({ item, getShapeName = (s) => s }) => {
  return (
    <span className="text-[#6F4E37]">
      {item.quantity || 1}x {item.productName || `Product #${item.productId}`} 
      {item.size && item.size.toLowerCase() !== 'none' && ` (${item.size})`}
      {item.type && item.type.toLowerCase() !== 'none' && ` (${item.type})`}
      {item.shape && item.shape.toLowerCase() !== 'none' && ` (${getShapeName(item.shape)})`}
    </span>
  );
};