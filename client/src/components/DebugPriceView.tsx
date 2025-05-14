import { useState, useEffect } from 'react';

// Simple component to display and debug price calculations
export const DebugPriceView = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sample test data with the issue
  const testItems = [
    {
      productId: '48',
      productName: 'Signature Collection',
      quantity: 1,
      price: 3000,
      size: 'large',
      type: 'milk',
    },
    {
      productId: '48',
      productName: 'Signature Collection',
      quantity: 2,
      price: 3000, // Same per-item price, but quantity 2
      size: 'large',
      type: 'milk',
    }
  ];

  useEffect(() => {
    // Use test data directly
    setItems(testItems);
    setLoading(false);
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-6 p-4 bg-white rounded shadow-sm">
      <h3 className="text-lg font-bold">Price Calculation Debug</h3>
      
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="p-3 border rounded">
            <div className="flex justify-between">
              <span className="font-medium">{item.productName}</span>
              <span>Quantity: {item.quantity}</span>
            </div>
            
            <div className="mt-2 text-sm space-y-1">
              <div><span className="font-medium">Price in database (cents):</span> {item.price}</div>
              <div><span className="font-medium">Price in dollars:</span> ${(item.price / 100).toFixed(2)}</div>
              
              <div className="mt-3 p-2 bg-gray-50 rounded">
                <h4 className="font-medium mb-1">Calculations:</h4>
                <div><span className="text-red-500">Incorrect order of operations:</span> ${(item.price / 100 * item.quantity).toFixed(2)}</div>
                <div><span className="text-green-500">Correct order of operations:</span> ${((item.price / 100) * item.quantity).toFixed(2)}</div>
                <div><span className="text-gray-500">Alternative calculation:</span> ${(item.price * item.quantity / 100).toFixed(2)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DebugPriceView;