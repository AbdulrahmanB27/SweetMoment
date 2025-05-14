import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Loader2, 
  PackageCheck, 
  AlertCircle, 
  ShoppingBag, 
  Search, 
  Mail, 
  Phone, 
  CreditCard, 
  Truck
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function OrderStatusPage() {
  const [searchType, setSearchType] = useState("email");
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<any | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderNumber.trim()) {
      setError("Please enter a payment ID");
      return;
    }
    
    let queryParams = `paymentId=${orderNumber}`;
    
    // Add the appropriate identifier based on search type
    if (searchType === "email") {
      if (!email.trim()) {
        setError("Please enter the email address associated with your order");
        return;
      }
      queryParams += `&email=${encodeURIComponent(email)}`;
    } else if (searchType === "phone") {
      if (!phone.trim()) {
        setError("Please enter the phone number associated with your order");
        return;
      }
      queryParams += `&phone=${encodeURIComponent(phone)}`;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch order status from API
      const response = await fetch(`/api/orders/status?${queryParams}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Order not found. Please check your payment ID and search information.");
        } else {
          throw new Error("An error occurred while checking the order status.");
        }
      }
      
      const data = await response.json();
      setOrderData(data);
      
      toast({
        title: "Order Found",
        description: `Found order with Payment ID: ${orderNumber}`,
      });
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
      toast({
        title: "Error",
        description: err.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "text-green-600";
      case "processing":
        return "text-amber-600";
      case "shipped":
        return "text-blue-600";
      case "cancelled":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return <PackageCheck className="h-6 w-6 text-green-600" />;
      case "processing":
        return <Loader2 className="h-6 w-6 text-amber-600 animate-spin" />;
      case "shipped":
        return <ShoppingBag className="h-6 w-6 text-blue-600" />;
      case "cancelled":
        return <AlertCircle className="h-6 w-6 text-red-600" />;
      default:
        return <ShoppingBag className="h-6 w-6 text-gray-600" />;
    }
  };

  // Clear all fields when changing search type
  const handleSearchTypeChange = (value: string) => {
    setSearchType(value);
    setError(null);
  };

  return (
    <div className="py-20 px-4 md:px-6 bg-[#FAF5E9]">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-[#5A3E36] mb-4">Order Status</h1>
          <p className="text-[#8C7566] max-w-2xl mx-auto">
            Track your order using your payment ID and any of your order details.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <Card className="shadow-md border-[#E8D9B5]">
            <CardHeader>
              <CardTitle className="text-[#5A3E36]">Track Your Order</CardTitle>
              <CardDescription>
                Enter your order details below to track your order status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="email" value={searchType} onValueChange={handleSearchTypeChange} className="w-full">
                <TabsList className="grid grid-cols-2 mb-6">
                  <TabsTrigger value="email" className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </TabsTrigger>
                  <TabsTrigger value="phone" className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>Phone</span>
                  </TabsTrigger>
                </TabsList>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <TabsContent value="email" className="space-y-4 mt-0">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter the email address used for the order"
                        className="border-[#E8D9B5]"
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="phone" className="space-y-4 mt-0">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter the phone number used for the order"
                        className="border-[#E8D9B5]"
                      />
                    </div>
                  </TabsContent>
                  
                  <div className="space-y-2">
                    <Label htmlFor="orderNumber">Payment ID</Label>
                    <Input
                      id="orderNumber"
                      type="text"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                      placeholder="Enter your payment ID (starts with pi_)"
                      className="border-[#E8D9B5]"
                    />
                  </div>
                  
                  {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                      {error}
                    </div>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-[#5A3E36] hover:bg-[#4A2C2A] flex items-center justify-center"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>Checking...</span>
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        <span>Track Order</span>
                      </>
                    )}
                  </Button>
                </form>
              </Tabs>
            </CardContent>
          </Card>

          {orderData && (
            <Card className="shadow-md border-[#E8D9B5]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-[#5A3E36]">Order #{orderData.id}</CardTitle>
                    <CardDescription>
                      Placed on {new Date(orderData.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex items-center">
                    {getStatusIcon(orderData.status)}
                    <span className={`ml-2 font-semibold ${getStatusColor(orderData.status)}`}>
                      {orderData.status.charAt(0).toUpperCase() + orderData.status.slice(1)}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-[#5A3E36] mb-2">Order Summary</h3>
                  <div className="border rounded-md divide-y">
                    {orderData.items && orderData.items.map((item: any, index: number) => (
                      <div key={index} className="p-3 flex justify-between items-center">
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-sm text-gray-500">
                            {item.quantity} × ${(item.price / item.quantity).toFixed(2)}
                          </p>
                          {item.size && item.size !== "none" && (
                            <p className="text-xs text-gray-500">Size: {item.size}</p>
                          )}
                          {item.type && item.type !== "none" && (
                            <p className="text-xs text-gray-500">Type: {item.type}</p>
                          )}
                        </div>
                        <p className="font-semibold">${item.price.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between border-t pt-4">
                  <p className="font-bold">Total:</p>
                  <p className="font-bold">${orderData.totalAmount.toFixed(2)}</p>
                </div>
                
                {/* Shipping Status Section - For future shipment tracking */}
                {orderData.status === "shipped" && orderData.deliveryMethod === "ship" && (
                  <div className="bg-blue-50 p-4 rounded-md">
                    <h3 className="font-semibold text-[#5A3E36] mb-2 flex items-center">
                      <Truck className="h-4 w-4 mr-2 text-blue-600" />
                      Shipment Status
                    </h3>
                    <div className="text-sm text-gray-700">
                      <p>Your order has been shipped and is on its way.</p>
                      {/* Placeholder for future tracking information */}
                      <p className="mt-2 italic text-gray-500">
                        Detailed tracking information will be available soon.
                      </p>
                    </div>
                  </div>
                )}
                
                {orderData.deliveryMethod === "ship" && orderData.shippingAddress && (
                  <div>
                    <h3 className="font-semibold text-[#5A3E36] mb-2">Shipping Address</h3>
                    <div className="border rounded-md p-3 whitespace-pre-line">
                      {orderData.shippingAddress}
                    </div>
                  </div>
                )}
                {orderData.deliveryMethod === "pickup" && (
                  <div>
                    <h3 className="font-semibold text-[#5A3E36] mb-2">Pickup Information</h3>
                    <div className="border rounded-md p-3">
                      <p>This order is set for pickup at our location.</p>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <p className="text-sm text-gray-500">
                  If you have any questions about your order, please contact our customer service.
                </p>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}