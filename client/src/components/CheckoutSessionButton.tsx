import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useAwayMode } from '../context/AwayModeContext';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle } from 'lucide-react';

interface CheckoutSessionButtonProps {
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  disabled?: boolean;
}

export function CheckoutSessionButton({
  className = '',
  variant = 'default',
  disabled = false
}: CheckoutSessionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { cartItems, cartTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const { areOrdersDisabled, disableOrdersReason } = useAwayMode();
  const { toast } = useToast();

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast({
        title: 'Cart is empty',
        description: 'Please add items to your cart before checkout',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    try {
      // Get current origin for success/cancel URLs
      const origin = window.location.origin;
      const successUrl = `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${origin}/checkout/canceled`;

      // Create checkout session
      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartItems,
          successUrl,
          cancelUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      
      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'Checkout failed',
        description: 'There was a problem starting the checkout process. Please try again.',
        variant: 'destructive'
      });
      setIsLoading(false);
    }
  };

  return (
    <Button
      className={`${className} ${areOrdersDisabled ? 'bg-gray-500 opacity-80' : ''} flex items-center justify-center`}
      variant={areOrdersDisabled ? 'secondary' : variant}
      disabled={disabled || isLoading || cartItems.length === 0 || areOrdersDisabled}
      onClick={handleCheckout}
      title={areOrdersDisabled ? disableOrdersReason || "" : ""}
    >
      {areOrdersDisabled ? (
        <>
          <AlertCircle className="mr-2 h-4 w-4 text-amber-400" />
          <span className="text-xs">Orders Disabled</span>
        </>
      ) : (
        isLoading ? 'Processing...' : `Checkout ${cartTotal > 0 ? `$${cartTotal.toFixed(2)}` : ''}`
      )}
    </Button>
  );
}