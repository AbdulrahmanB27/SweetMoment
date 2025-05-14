import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { XCircle, ShoppingBag, ArrowLeft } from 'lucide-react';

export default function CheckoutCanceled() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
        <div className="flex justify-center mb-6">
          <XCircle className="h-24 w-24 text-red-500" />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Checkout Canceled</h1>
        
        <p className="text-gray-600 mb-8 max-w-lg mx-auto">
          Your payment process was canceled. Your cart items are still saved, 
          and you can continue shopping or try checking out again.
        </p>
        
        <div className="space-y-4 md:space-y-0 md:flex md:space-x-4 justify-center">
          <Button asChild>
            <Link href="/cart">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Return to Cart
            </Link>
          </Button>
          
          <Button variant="outline" asChild>
            <Link href="/menu">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}