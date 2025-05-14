import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, DollarSign } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import SimpleCardTerminal from './SimpleCardTerminal';

interface DirectPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: () => void;
  order?: any; // Optional order object for existing orders
  orderType?: 'custom' | 'regular'; // Specify the type of order
}

const DirectPaymentDialog: React.FC<DirectPaymentDialogProps> = ({
  isOpen,
  onClose,
  onPaymentComplete,
  order,
  orderType = 'regular'
}) => {
  const [isTapToPayMode, setIsTapToPayMode] = useState(false);
  const [customerName, setCustomerName] = useState(order?.customerName || '');
  const [amount, setAmount] = useState(order?.amount ? `${order.amount}` : '');
  const [orderDetails, setOrderDetails] = useState(order?.orderDetails || '');
  const { toast } = useToast();
  
  // Initialize form with order data if available
  React.useEffect(() => {
    if (order) {
      setCustomerName(order.customerName || '');
      // For custom orders, we might need to calculate the amount differently
      if (orderType === 'custom') {
        setAmount(order.amount ? `${order.amount}` : '');
        setOrderDetails(order.orderDetails || '');
      }
    }
  }, [order, orderType]);
  
  const amountInCents = amount ? Math.round(parseFloat(amount) * 100) : 0;

  const handleCashPayment = async () => {
    if (!validateInputs()) return;
    
    try {
      // Get the amount as a number - this is in dollars
      const amountValue = parseFloat(amount);
      
      console.log("Processing cash payment with data:", {
        customerName,
        orderDetails,
        amount: amountValue,
        amountInCents,
        orderId: order?.id,
        isExistingOrder: !!order,
        orderType
      });
      
      // Get the bearer token from localStorage for authentication
      const token = localStorage.getItem('token');
      
      let response;
      
      // If we have an existing custom order, update it instead of creating a new one
      if (order && orderType === 'custom') {
        response = await fetch(`/api/custom-orders/${order.id}/payment`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
            'x-admin-access': 'sweetmoment-dev-secret'
          },
          body: JSON.stringify({
            paymentMethod: 'cash',
            amount: amountValue
          })
        });
      } else {
        // Create a new custom order with payment
        response = await fetch('/api/custom-orders/with-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Include authentication token (for admin-only endpoints)
            'Authorization': token ? `Bearer ${token}` : '',
            // Include admin access for development
            'x-admin-access': 'sweetmoment-dev-secret'
          },
          body: JSON.stringify({
            customerName,
            orderDetails,
            // Send the amount in dollars (NOT cents) to match the schema expectation
            amount: amountValue,
            paymentMethod: 'cash'
          })
        });
      }
      
      const result = await response.json();
      console.log("Cash payment response:", result);
      
      if (!response.ok) {
        throw new Error(result.message || (result.error ? `Failed: ${result.error}` : 'Failed to create and process payment'));
      }
      
      toast({
        title: 'Payment Successful',
        description: 'Cash payment has been recorded'
      });
      
      resetForm();
      onPaymentComplete();
      onClose();
    } catch (error: any) {
      console.error('Error recording cash payment:', error);
      toast({
        title: 'Payment Failed',
        description: error.message || 'There was an error recording the payment',
        variant: 'destructive'
      });
    }
  };

  const handleTapToPayOpen = () => {
    if (!validateInputs()) return;
    setIsTapToPayMode(true);
  };

  const handleTapToPayClose = () => {
    setIsTapToPayMode(false);
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      console.log("Processing card payment with data:", {
        customerName,
        orderDetails,
        amount: amountInCents,
        paymentIntentId,
        orderId: order?.id,
        isExistingOrder: !!order,
        orderType
      });
      
      // Get the bearer token from localStorage for authentication
      const token = localStorage.getItem('token');
      
      let response;
      
      // If we have an existing custom order, update it instead of creating a new one
      if (order && orderType === 'custom') {
        response = await fetch(`/api/custom-orders/${order.id}/payment`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
            'x-admin-access': 'sweetmoment-dev-secret'
          },
          body: JSON.stringify({
            paymentMethod: 'card',
            paymentIntentId,
            amount: amountInCents / 100 // Convert cents to dollars
          })
        });
      } else {
        // Create a new custom order with payment
        response = await fetch('/api/custom-orders/with-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Include authentication token (for admin-only endpoints)
            'Authorization': token ? `Bearer ${token}` : '',
            // Include admin access for development
            'x-admin-access': 'sweetmoment-dev-secret'
          },
          body: JSON.stringify({
            customerName,
            orderDetails,
            amount: amountInCents / 100, // Convert from cents back to dollars for readability
            paymentMethod: 'card',
            paymentIntentId
          })
        });
      }
      
      const result = await response.json();
      console.log("Card payment response:", result);
      
      if (!response.ok) {
        throw new Error(result.message || (result.error ? `Failed: ${result.error}` : 'Failed to create and process payment'));
      }
      
      toast({
        title: 'Payment Successful',
        description: 'Card payment has been processed'
      });
      
      resetForm();
      onPaymentComplete();
      onClose();
    } catch (error: any) {
      console.error('Error recording card payment:', error);
      toast({
        title: 'Payment Failed',
        description: error.message || 'There was an error recording the payment',
        variant: 'destructive'
      });
    }
  };

  const validateInputs = () => {
    if (!customerName.trim()) {
      toast({
        title: 'Customer Name Required',
        description: 'Please enter a customer name',
        variant: 'destructive'
      });
      return false;
    }
    
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast({
        title: 'Valid Amount Required',
        description: 'Please enter a valid payment amount',
        variant: 'destructive'
      });
      return false;
    }
    
    // Order details are now optional, so we don't check for them
    
    return true;
  };

  const resetForm = () => {
    setCustomerName('');
    setAmount('');
    setOrderDetails('');
  };

  if (isTapToPayMode) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <SimpleCardTerminal 
            amount={amountInCents} 
            customerName={customerName}
            onClose={handleTapToPayClose}
            onSuccess={handlePaymentSuccess}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Direct Custom Order Payment</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="customerName" className="text-right">
              Customer Name
            </Label>
            <Input
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount ($)
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="col-span-3"
              placeholder="0.00"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="orderDetails" className="text-right pt-2">
              Order Details
            </Label>
            <textarea
              id="orderDetails"
              value={orderDetails}
              onChange={(e) => setOrderDetails(e.target.value)}
              className="col-span-3 border rounded-md p-2 min-h-[100px]"
              placeholder="Enter optional details about this custom order"
            />
          </div>
        </div>
        <DialogFooter className="flex sm:justify-between">
          <Button
            variant="outline"
            onClick={handleCashPayment}
            className="bg-gray-50 flex-1 mr-2"
          >
            <DollarSign className="mr-2 h-4 w-4" />
            Cash
          </Button>
          <Button
            onClick={handleTapToPayOpen}
            className="bg-green-600 hover:bg-green-700 text-white flex-1 ml-2"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Card
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DirectPaymentDialog;