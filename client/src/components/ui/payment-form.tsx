import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "./button";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

// Load stripe outside of component to avoid recreating on every render
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "pk_test_TYooMQauvdEDq54NiTphI7jx");

type PaymentFormProps = {
  amount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
};

export function PaymentForm({ amount, onSuccess, onError }: PaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { cartItems } = useCart();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Create checkout session
      const response = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, cartItems })
      });

      if (!response.ok) {
        throw new Error(`Payment setup failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.url) {
        throw new Error("Invalid checkout session response");
      }

      // Redirect directly to Stripe checkout
      console.log("Redirecting to Stripe checkout:", data.url);
      
      // Call onSuccess before redirect (but note: redirect will interrupt it)
      onSuccess();
      
      // Perform the redirect - this will stop JS execution
      window.location.href = data.url;
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || "Payment processing failed");
      onError(err.message || "Payment processing failed");
      toast({
        title: "Payment Error",
        description: err.message || "Payment processing failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Card preview */}
      <div className="rounded-md border border-[#E8D9B5] p-4 bg-white shadow-sm">
        <div className="text-sm mb-2 font-medium">Credit Card Payment</div>
        <div className="border-b border-[#E8D9B5] py-2">
          <div className="flex items-center justify-between">
            <div className="text-sm text-[#6F4E37]">Amount:</div>
            <div className="font-semibold">${amount.toFixed(2)}</div>
          </div>
        </div>
        <div className="mt-3 text-xs text-[#6F4E37]">
          You'll be redirected to our secure payment provider to complete your purchase.
        </div>
      </div>

      {/* Test card info */}
      <div className="p-3 bg-[#F5EFEA] rounded-md text-xs text-[#6F4E37]">
        <p className="mb-1"><span className="font-semibold">Test Card:</span> 4242 4242 4242 4242</p>
        <p className="mb-1"><span className="font-semibold">Expiry:</span> Any future date (e.g., 12/28)</p>
        <p><span className="font-semibold">CVC:</span> Any 3 digits (e.g., 123)</p>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Buttons */}
      <div className="flex space-x-4 mb-6">
        <div className="flex-1">
          <a href="/cart" className="no-underline">
            <div className="w-full py-3 border-2 border-[#4A2C2A] bg-white text-[#4A2C2A] hover:bg-[#F5EFEA] rounded-md transition-colors font-semibold text-center">
              Back to Cart
            </div>
          </a>
        </div>
        
        <div className="flex-1">
          <Button 
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full py-3 bg-[#4A2C2A] text-white hover:bg-[#3A1F1D] rounded-md transition-colors font-semibold"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block"
                />
                Processing...
              </span>
            ) : "Pay Now"}
          </Button>
        </div>
      </div>
    </div>
  );
}