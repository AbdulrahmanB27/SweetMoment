import React, { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { Loader2 } from 'lucide-react';

type WarehouseAddress = {
  name: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  privateAddress: boolean;
  emailOnly: boolean;
};

interface PickupLocationProps {
  onOrderComplete?: boolean;
}

export function PickupLocation({ onOrderComplete = false }: PickupLocationProps) {
  const [address, setAddress] = useState<WarehouseAddress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchWarehouseAddress = async () => {
      try {
        // Remove debug logging in production
        // console.log('Fetching warehouse address for pickup location...');
        
        // apiRequest already parses JSON by default
        const data = await apiRequest('/api/warehouse-address', 'GET', null);
        
        if (!isMounted) return;
        
        // Remove debug logging in production
        // console.log('Warehouse address response received:', data);
        
        if (data && data.name) {
          setAddress(data);
          setError(null);
        } else {
          setError('Failed to load warehouse address data');
        }
      } catch (err) {
        if (!isMounted) return;
        
        // Use a more descriptive error message but keep the console.error for debugging
        console.error('Error fetching warehouse address:', err);
        setError('Unable to load pickup location information. Please try again later.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    // Start the fetch operation
    fetchWarehouseAddress();
    
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array to run only once

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !address) {
    return (
      <div>
        <h3 className="font-medium mb-1">Pickup Location Information</h3>
        <p className="text-sm">Your order will be available for pickup.</p>
        <p className="text-sm">Please allow at least 24 hours notice before your desired pickup time.</p>
        <p className="text-sm text-gray-600 mt-1">Please bring your order confirmation and ID when collecting your chocolates.</p>
      </div>
    );
  }

  // If address is private and this is not after order completion
  // hide the address details and show appropriate message
  if (address.privateAddress && !onOrderComplete) {
    // Only keep minimal debug logging if needed
    // console.log("[PICKUP] Address is PRIVATE - hiding detailed address");
    
    return (
      <div>
        <h3 className="font-medium mb-1">Pickup Location Information</h3>
        <p className="text-sm">Your order will be available for pickup.</p>
        <p className="text-sm font-medium text-[#4A2C2A] my-2">
          {address.emailOnly 
            ? "The detailed pickup location will be sent to you via email after your purchase is complete."
            : "The pickup location details will be available after your purchase is complete."}
        </p>
        <p className="text-sm">Please allow at least 24 hours notice before your desired pickup time.</p>
        <p className="text-sm text-gray-600 mt-1">Please bring your order confirmation and ID when collecting your chocolates.</p>
      </div>
    );
  }
  
  // Otherwise, show the full address
  // console.log("[PICKUP] Address is PUBLIC or on order completion page - showing address details");
  return (
    <div>
      <h3 className="font-medium mb-1">Pickup Location Information</h3>
      <p className="text-sm">Your order will be available for pickup at:</p>
      <p className="text-sm font-bold text-[#4A2C2A] my-2 border-l-4 border-[#7D4E2C] pl-3 py-1 bg-[#FFF8E8] rounded-r-md">
        {address.name}<br/>
        {address.address1}<br/>
        {address.address2 && <>{address.address2}<br/></>}
        {address.city}, {address.state} {address.zipCode}<br/>
        {address.country}
      </p>
      <p className="text-sm">Please allow at least 24 hours notice before your desired pickup time.</p>
      <p className="text-sm text-gray-600 mt-1">Please bring your order confirmation and ID when collecting your chocolates.</p>
    </div>
  );
}