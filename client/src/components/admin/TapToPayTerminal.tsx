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

interface TapToPayProps {
  amount: number; // Amount in cents
  customerName: string; 
  onSuccess: (paymentIntentId: string) => Promise<void>;
  onClose: () => void;
}

export default function TapToPayTerminal({ amount, customerName, onSuccess, onClose }: TapToPayProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const amountInDollars = (amount / 100).toFixed(2);

  // Handler for initiating a payment
  const handleInitiatePayment = async () => {
    try {
      setIsLoading(true);
      setPaymentStatus('pending');
      setErrorMessage(null);

      console.log("Creating payment intent for amount:", amount, "cents");
      
      // Create a payment intent
      const response = await fetch('/api/tap-to-pay/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount, // Pass the amount in cents
          description: `Payment from ${customerName}`,
          metadata: {
            source: 'tap_to_pay_terminal',
            customerName,
            created_at: new Date().toISOString()
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment intent');
      }

      const data = await response.json();
      
      if (!data.success || !data.paymentIntentId) {
        throw new Error('Invalid response from server');
      }

      // Store the payment intent ID for later use
      setPaymentId(data.paymentIntentId);

      // Start polling payment status
      pollPaymentStatus(data.paymentIntentId);

      toast({
        title: "Payment Ready",
        description: "Please tap the customer's card on the terminal",
      });

    } catch (error: any) {
      console.error('Error creating payment intent:', error);
      setPaymentStatus('error');
      setErrorMessage(error.message || 'An error occurred while processing the payment');
      
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to initialize payment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Poll payment status
  const pollPaymentStatus = async (intentId: string) => {
    try {
      const checkStatus = async () => {
        // Check the payment status
        const response = await fetch(`/api/tap-to-pay/tap-to-pay-status/${intentId}`);
        
        if (!response.ok) {
          throw new Error('Failed to check payment status');
        }
        
        const data = await response.json();
        
        // If payment is successful or requires capture
        if (data.status === 'requires_capture') {
          // Capture the payment
          await capturePayment(intentId);
          return true;
        } else if (data.status === 'succeeded') {
          setPaymentStatus('success');
          
          // Call the onPaymentComplete callback if provided
          if (onPaymentComplete) {
            onPaymentComplete({
              id: intentId,
              amount: data.amount,
              status: 'succeeded'
            });
          }
          
          toast({
            title: "Payment Successful",
            description: `Successfully processed payment of $${data.amount.toFixed(2)}`,
          });
          
          return true;
        } else if (data.status === 'canceled' || data.status === 'failed') {
          setPaymentStatus('error');
          setErrorMessage(`Payment ${data.status}`);
          return true;
        }
        
        // Continue polling if payment is still processing
        return false;
      };
      
      // Start polling
      const poll = async () => {
        const complete = await checkStatus();
        if (!complete) {
          setTimeout(poll, 2000); // Poll every 2 seconds
        }
      };
      
      poll();
      
    } catch (error: any) {
      console.error('Error polling payment status:', error);
      setPaymentStatus('error');
      setErrorMessage(error.message || 'Failed to check payment status');
      
      toast({
        title: "Payment Check Failed",
        description: error.message || "Unable to verify payment status",
        variant: "destructive",
      });
    }
  };

  // Capture a payment
  const capturePayment = async (intentId: string) => {
    try {
      const response = await fetch('/api/tap-to-pay/capture-tap-to-pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIntentId: intentId
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to capture payment');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setPaymentStatus('success');
        
        // Call the onPaymentComplete callback if provided
        if (onPaymentComplete) {
          onPaymentComplete({
            id: intentId,
            amount: data.paymentIntent.amount,
            status: data.paymentIntent.status
          });
        }
        
        toast({
          title: "Payment Captured",
          description: `Successfully captured payment of $${data.paymentIntent.amount.toFixed(2)}`,
        });
      } else {
        throw new Error(data.error || 'Failed to capture payment');
      }
    } catch (error: any) {
      console.error('Error capturing payment:', error);
      setPaymentStatus('error');
      setErrorMessage(error.message || 'Failed to capture payment');
      
      toast({
        title: "Capture Failed",
        description: error.message || "Failed to complete the payment",
        variant: "destructive",
      });
    }
  };

  // Reset the form
  const handleReset = () => {
    setAmount('');
    setDescription('');
    setPaymentStatus('idle');
    setPaymentId(null);
    setErrorMessage(null);
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Tap to Pay Terminal
        </CardTitle>
        <CardDescription>
          Process contactless card payments directly from this terminal
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {paymentStatus === 'idle' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="text-lg"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="In-store purchase"
              />
            </div>
            
            {errorMessage && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                {errorMessage}
              </div>
            )}
          </div>
        )}
        
        {paymentStatus === 'pending' && (
          <div className="py-6 flex flex-col items-center justify-center space-y-4">
            <div className="animate-pulse text-primary">
              <Loader2 className="h-16 w-16 animate-spin" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-lg">Waiting for Card</h3>
              <p className="text-muted-foreground">
                Please tap the customer's card on the terminal to complete the payment of ${parseFloat(amount).toFixed(2)}
              </p>
            </div>
          </div>
        )}
        
        {paymentStatus === 'success' && (
          <div className="py-6 flex flex-col items-center justify-center space-y-4">
            <div className="text-green-600">
              <CheckCircle className="h-16 w-16" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-lg">Payment Successful</h3>
              <p className="text-muted-foreground">
                Payment of ${parseFloat(amount).toFixed(2)} has been successfully processed.
              </p>
              <p className="text-xs text-muted-foreground">
                Payment ID: {paymentId}
              </p>
            </div>
          </div>
        )}
        
        {paymentStatus === 'error' && (
          <div className="py-6 flex flex-col items-center justify-center space-y-4">
            <div className="text-red-600">
              <AlertCircle className="h-16 w-16" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-lg">Payment Failed</h3>
              <p className="text-muted-foreground">
                {errorMessage || "There was an error processing the payment."}
              </p>
              {paymentId && (
                <p className="text-xs text-muted-foreground">
                  Payment ID: {paymentId}
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        {paymentStatus === 'idle' && (
          <Button 
            onClick={handleInitiatePayment} 
            disabled={isLoading || !amount || parseFloat(amount) <= 0}
            className="w-full"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Process Payment
          </Button>
        )}
        
        {paymentStatus !== 'idle' && (
          <Button 
            onClick={handleReset} 
            variant="outline" 
            className="w-full"
          >
            New Payment
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}