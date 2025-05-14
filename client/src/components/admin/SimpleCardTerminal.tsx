import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, CreditCard, Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface SimpleCardTerminalProps {
  amount: number; // Amount in cents
  customerName: string; 
  onSuccess: (paymentIntentId: string) => Promise<void>;
  onClose: () => void;
}

export default function SimpleCardTerminal({ amount, customerName, onSuccess, onClose }: SimpleCardTerminalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const amountInDollars = (amount / 100).toFixed(2);

  // Simulate card processing
  const handleProcessCard = async () => {
    try {
      setIsLoading(true);
      setPaymentStatus('processing');
      setErrorMessage(null);
      
      // Simulate API call to create payment intent
      console.log("Processing card payment for $" + amountInDollars);
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a mock payment intent ID
      const mockPaymentIntentId = "pi_" + Math.random().toString(36).substring(2, 15);
      
      setPaymentStatus('success');
      
      toast({
        title: "Payment Successful",
        description: `Card payment of $${amountInDollars} processed successfully`
      });
      
      // Call the parent's success callback
      await onSuccess(mockPaymentIntentId);
    } catch (error: any) {
      console.error("Card payment error:", error);
      setPaymentStatus('error');
      setErrorMessage(error.message || "Payment processing failed");
      
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process card payment",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Card Payment
        </CardTitle>
        <CardDescription>
          Processing payment for {customerName}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="text-center py-6">
          {paymentStatus === 'idle' && (
            <div className="space-y-4">
              <div className="text-3xl font-bold">${amountInDollars}</div>
              <p className="text-muted-foreground">
                Ready to process payment from {customerName}
              </p>
            </div>
          )}
          
          {paymentStatus === 'processing' && (
            <div className="space-y-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <div className="text-xl font-medium">Processing Payment</div>
              <p className="text-muted-foreground">
                Please wait while we process the card payment of ${amountInDollars}
              </p>
            </div>
          )}
          
          {paymentStatus === 'success' && (
            <div className="space-y-4">
              <CheckCircle className="h-12 w-12 mx-auto text-green-600" />
              <div className="text-xl font-medium text-green-600">Payment Successful</div>
              <p className="text-muted-foreground">
                Payment of ${amountInDollars} has been successfully processed
              </p>
            </div>
          )}
          
          {paymentStatus === 'error' && (
            <div className="space-y-4">
              <AlertCircle className="h-12 w-12 mx-auto text-red-600" />
              <div className="text-xl font-medium text-red-600">Payment Failed</div>
              <p className="text-muted-foreground">
                {errorMessage || "There was an error processing the payment"}
              </p>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handleCancel}
          disabled={isLoading}
          className="w-full mr-2"
        >
          Cancel
        </Button>
        
        {paymentStatus === 'idle' && (
          <Button 
            onClick={handleProcessCard}
            disabled={isLoading}
            className="w-full ml-2 bg-green-600 hover:bg-green-700"
          >
            Process Card
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}