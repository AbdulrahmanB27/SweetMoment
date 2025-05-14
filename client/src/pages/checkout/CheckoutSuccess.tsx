import { useEffect } from 'react';
import { Link } from 'wouter';
import { useCart } from '../../context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

export default function CheckoutSuccess() {
  const { clearCart } = useCart();
  const { toast } = useToast();

  // Clear cart and show success toast on mount
  useEffect(() => {
    // Clear the cart
    clearCart();
    
    // Show success toast
    toast({
      title: 'Payment successful!',
      description: 'Thank you for your order. We have received your payment.',
    });
  }, [clearCart, toast]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
        <div className="flex justify-center mb-6">
          <CheckCircle className="h-24 w-24 text-green-500" />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Order Successful!</h1>
        
        <p className="text-gray-600 mb-8 max-w-lg mx-auto">
          Your payment was processed successfully. We'll send you an email confirmation 
          shortly with details of your order.
        </p>

        <div className="text-sm text-gray-500 mb-8">
          <p>Your order details have been saved to your account.</p>
          <p>If you provided a phone number, we'll use it to update you about your delivery.</p>
        </div>
        
        <div className="space-y-4 md:space-y-0 md:flex md:space-x-4 justify-center">
          <Button asChild>
            <Link href="/menu">
              Continue Shopping
            </Link>
          </Button>
          
          <Button variant="outline" asChild>
            <Link href="/account/orders">
              View Your Orders
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}