import React from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard, DollarSign } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import TapToPayTerminal from './TapToPayTerminal';

interface CustomOrderPaymentProps {
  isOpen: boolean;
  onClose: () => void;
  selectedOrder: any;
  onPaymentComplete: () => void;
}

const CustomOrderPayment: React.FC<CustomOrderPaymentProps> = ({
  isOpen,
  onClose,
  selectedOrder,
  onPaymentComplete
}) => {
  const [isTapToPayMode, setIsTapToPayMode] = React.useState(false);
  const { toast } = useToast();

  // Calculate the payment amount
  const amount = selectedOrder?.orderAmount || 0;
  
  const handleCashPayment = async () => {
    try {
      // Update the custom order with payment details
      await fetch(`/api/custom-orders/${selectedOrder?.id}/payment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethod: 'cash',
          amount
        })
      });
      
      toast({
        title: 'Payment Successful',
        description: 'Cash payment has been recorded'
      });
      
      onPaymentComplete();
      onClose();
    } catch (error) {
      console.error('Error recording cash payment:', error);
      toast({
        title: 'Payment Failed',
        description: 'There was an error recording the payment',
        variant: 'destructive'
      });
    }
  };

  const handleTapToPayOpen = () => {
    setIsTapToPayMode(true);
  };

  const handleTapToPayClose = () => {
    setIsTapToPayMode(false);
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      // Update the custom order with payment details
      await fetch(`/api/custom-orders/${selectedOrder?.id}/payment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethod: 'card',
          paymentIntentId,
          amount
        })
      });
      
      toast({
        title: 'Payment Successful',
        description: 'Card payment has been processed'
      });
      
      onPaymentComplete();
      onClose();
    } catch (error) {
      console.error('Error recording card payment:', error);
      toast({
        title: 'Payment Failed',
        description: 'There was an error recording the payment',
        variant: 'destructive'
      });
    }
  };

  if (isTapToPayMode) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <TapToPayTerminal 
            amount={amount} 
            customerName={selectedOrder?.customerName || 'Customer'}
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
          <DialogTitle>Process Payment for Custom Order #{selectedOrder?.id}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Customer: {selectedOrder?.customerName || 'N/A'}</h3>
            <p className="text-sm text-muted-foreground">
              Select payment method to process the payment for this custom order.
            </p>
            <div className="flex justify-between items-center mt-4">
              <span className="font-semibold">Amount:</span>
              <span className="text-xl font-bold">${(amount / 100).toFixed(2)}</span>
            </div>
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

export default CustomOrderPayment;