import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Terminal, CheckCircle2, AlertCircle, Banknote, CreditCard } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Make sure to call `loadStripe` outside of a component's render to avoid recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error("Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY");
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface TapToPayOrderProps {
  onOrderCreated?: (order: any) => void;
  onCancel?: () => void;
  preparedOrder?: {
    userId?: number;
    customerName?: string;
    customerEmail?: string;
    totalAmount?: number;
    shippingAddress?: string;
    status?: string;
    deliveryMethod?: string;
    phone?: string;
    items?: Array<{
      productId: string;
      productName: string;
      quantity: number;
      price: number;
      size?: string;
      type?: string;
      shape?: string;
    }>;
  };
}

export function TapToPayOrder({ onOrderCreated, onCancel, preparedOrder }: TapToPayOrderProps) {
  const { toast } = useToast();
  // Initialize state values from preparedOrder if available
  const [amount, setAmount] = useState<number>(preparedOrder?.totalAmount || 0);
  const [customerName, setCustomerName] = useState<string>(preparedOrder?.customerName || "");
  const [customerEmail, setCustomerEmail] = useState<string>(preparedOrder?.customerEmail || "");
  const [customerPhone, setCustomerPhone] = useState<string>(preparedOrder?.phone || "");
  const [orderItems, setOrderItems] = useState(preparedOrder?.items || []);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [paymentType, setPaymentType] = useState<"card" | "cash">("card");

  // Function to handle tap-to-pay card payment
  const handleCardPayment = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid payment amount.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setPaymentStatus("processing");
    
    try {
      console.log("Creating payment intent with amount:", amount);
      
      // Format amount as number to prevent issues
      const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
      
      // Create a payment intent
      const response = await fetch("/api/tap-to-pay/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + localStorage.getItem("token"),
          "x-admin-access": "sweetmoment-dev-secret"
        },
        body: JSON.stringify({
          amount: numericAmount,
          customerName: customerName || "",
          customerEmail: customerEmail || "",
          customerPhone: customerPhone || "",
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create payment intent");
      }
      
      const data = await response.json();
      
      // Start payment terminal
      const terminalResponse = await fetch("/api/tap-to-pay/process-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + localStorage.getItem("token"),
          "x-admin-access": "sweetmoment-dev-secret"
        },
        body: JSON.stringify({
          paymentIntentId: data.paymentIntentId,
        }),
      });
      
      if (!terminalResponse.ok) {
        let errorMessage = "Failed to process payment";
        try {
          const errorData = await terminalResponse.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          // If we can't parse the response as JSON, use the status text
          errorMessage = `Failed to process payment: ${terminalResponse.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      const terminalData = await terminalResponse.json();
      
      if (terminalData.status === "succeeded") {
        setPaymentStatus("success");
        
        // Create an order with the payment information
        const createOrderResponse = await fetch("/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("token"),
            "x-admin-access": "sweetmoment-dev-secret"
          },
          body: JSON.stringify({
            userId: preparedOrder?.userId || 1, // Default to admin if not provided
            customerName: customerName || "Walk-in Customer",
            customerEmail: customerEmail || "",
            totalAmount: amount,
            shippingAddress: preparedOrder?.shippingAddress || "In-store purchase",
            status: "completed",
            deliveryMethod: preparedOrder?.deliveryMethod || "pickup",
            paymentIntentId: data.paymentIntentId,
            paymentMethod: "tap_to_pay",
            phone: customerPhone || "",
            // Use prepared order items if available, otherwise use default
            items: orderItems.length > 0 ? orderItems : [
              {
                productId: "tap-to-pay",
                productName: "In-store Purchase",
                quantity: 1,
                price: amount,
              },
            ],
          }),
        });
        
        if (!createOrderResponse.ok) {
          const errorData = await createOrderResponse.json();
          throw new Error(errorData.message || "Failed to create order");
        }
        
        const orderData = await createOrderResponse.json();
        
        // Show success message
        toast({
          title: "Card Payment Successful",
          description: `Payment of $${amount.toFixed(2)} was successful.`,
        });
        
        // Notify parent
        if (onOrderCreated) {
          onOrderCreated(orderData);
        }
      } else {
        setPaymentStatus("error");
        setErrorMessage("Payment was not successful. Please try again.");
      }
    } catch (error: any) {
      setPaymentStatus("error");
      setErrorMessage(error.message || "An error occurred during payment processing");
      toast({
        title: "Payment Failed",
        description: error.message || "An error occurred during payment processing",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to handle cash payment
  const handleCashPayment = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid payment amount.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Format amount as number to prevent issues
      const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
      
      // Create an order directly (no payment intent for cash)
      const createOrderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + localStorage.getItem("token"),
          "x-admin-access": "sweetmoment-dev-secret"
        },
        body: JSON.stringify({
          userId: preparedOrder?.userId || 1, // Default to admin if not provided
          customerName: customerName || "Walk-in Customer",
          customerEmail: customerEmail || "",
          totalAmount: numericAmount,
          shippingAddress: preparedOrder?.shippingAddress || "In-store purchase",
          status: "completed",
          deliveryMethod: preparedOrder?.deliveryMethod || "pickup",
          paymentIntentId: "", // No payment intent for cash
          paymentMethod: "cash", // Mark as cash payment
          phone: customerPhone || "",
          // Use prepared order items if available, otherwise use default
          items: orderItems.length > 0 ? orderItems : [
            {
              productId: "cash-payment",
              productName: "In-store Purchase (Cash)",
              quantity: 1,
              price: numericAmount,
            },
          ],
        }),
      });
      
      if (!createOrderResponse.ok) {
        const errorData = await createOrderResponse.json();
        throw new Error(errorData.message || "Failed to create order");
      }
      
      const orderData = await createOrderResponse.json();
      
      // Show success message
      toast({
        title: "Cash Payment Recorded",
        description: `Cash payment of $${numericAmount.toFixed(2)} was successfully recorded.`,
      });

      setPaymentStatus("success");
      
      // Notify parent
      if (onOrderCreated) {
        onOrderCreated(orderData);
      }
    } catch (error: any) {
      setPaymentStatus("error");
      setErrorMessage(error.message || "An error occurred while recording the cash payment");
      toast({
        title: "Cash Payment Recording Failed",
        description: error.message || "An error occurred while recording the cash payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Choose which submit handler to use based on payment type
  const handleSubmit = (event: React.FormEvent) => {
    if (paymentType === "card") {
      handleCardPayment(event);
    } else {
      handleCashPayment(event);
    }
  };

  return (
    <div className="p-4">
      <div className="flex flex-col items-center space-y-2 mb-6">
        <Terminal className="h-12 w-12 text-primary" />
        <h2 className="text-2xl font-bold text-center">Payment Processing</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Process in-store payments via card or cash
        </p>
      </div>

      {paymentStatus === "success" ? (
        <div className="flex flex-col items-center justify-center py-8">
          <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
          <h3 className="text-2xl font-bold text-center mb-2">Payment Successful!</h3>
          <p className="text-muted-foreground text-center mb-2">
            Amount: ${amount.toFixed(2)}
          </p>
          <p className="text-muted-foreground text-center mb-6">
            Method: {paymentType === "card" ? "Card Payment" : "Cash Payment"}
          </p>
          <div className="flex gap-4">
            <Button onClick={() => {
              setPaymentStatus("idle");
              setAmount(0);
              setCustomerName("");
              setCustomerEmail("");
              setCustomerPhone("");
            }}>
              New Payment
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Close
            </Button>
          </div>
        </div>
      ) : paymentStatus === "error" ? (
        <div className="flex flex-col items-center justify-center py-8">
          <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
          <h3 className="text-2xl font-bold text-center mb-2">Payment Failed</h3>
          <p className="text-muted-foreground text-center mb-2">
            {errorMessage || "There was an error processing your payment."}
          </p>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Please try again or contact support.
          </p>
          <div className="flex gap-4">
            <Button onClick={() => setPaymentStatus("idle")}>
              Try Again
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>
                Enter customer and payment information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={amount || ""}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  required
                />
              </div>
              
              {/* Display order items if they were passed from the parent component */}
              {orderItems.length > 0 && (
                <div className="mt-4 border rounded-md p-3 bg-muted/20">
                  <h4 className="font-medium mb-2">Order Items</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {orderItems.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <div>
                          <span className="font-medium">{item.productName}</span>
                          {item.size && <span className="text-muted-foreground ml-1">({item.size})</span>}
                          {item.type && <span className="text-muted-foreground ml-1">({item.type})</span>}
                          <span className="text-muted-foreground ml-1">x{item.quantity}</span>
                        </div>
                        <div>${(item.price/100).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t mt-2 pt-2 flex justify-between font-medium">
                    <span>Total:</span>
                    <span>${amount.toFixed(2)}</span>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="customerEmail">Customer Email</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="customer@example.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Customer Phone (optional)</Label>
                <Input
                  id="customerPhone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="space-y-2 pt-4">
                <Label>Payment Method</Label>
                <Tabs 
                  defaultValue="card" 
                  value={paymentType} 
                  onValueChange={(value) => setPaymentType(value as "card" | "cash")}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="card" className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Card Payment
                    </TabsTrigger>
                    <TabsTrigger value="cash" className="flex items-center gap-2">
                      <Banknote className="h-4 w-4" />
                      Cash Payment
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="card" className="pt-2 pb-2">
                    <p className="text-sm text-muted-foreground">
                      Process payment using contactless payment methods on a compatible device.
                    </p>
                  </TabsContent>
                  <TabsContent value="cash" className="pt-2 pb-2">
                    <p className="text-sm text-muted-foreground">
                      Record a cash payment for this transaction. No card processing will be needed.
                    </p>
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
                Cancel
              </Button>
              <Button type="submit" disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Processing...
                  </>
                ) : paymentType === "card" ? (
                  "Process Card Payment"
                ) : (
                  "Record Cash Payment"
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}
    </div>
  );
}