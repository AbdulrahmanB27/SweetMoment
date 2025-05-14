import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Eye, CreditCard, Terminal, DollarSign, ChevronDown } from "lucide-react";
import { DeleteCustomOrderButton } from "./DeleteCustomOrderButton";
import DirectPaymentDialog from "@/components/admin/DirectPaymentDialog";
import CustomOrderPayment from "@/components/admin/CustomOrderPayment";

export interface CustomOrderCardViewProps {
  customOrders: any[];
  handleUpdateCustomOrderStatus: (id: number, status: string) => Promise<void>;
  getCustomerName: (name: string | null | undefined, order?: any) => string;
  parseSelectedProducts: (products: string) => any[];
}

export function CustomOrderCardView({ 
  customOrders,
  handleUpdateCustomOrderStatus,
  getCustomerName,
  parseSelectedProducts
}: CustomOrderCardViewProps) {
  // State for payment dialogs
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isDirectPaymentOpen, setIsDirectPaymentOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<any>(null);

  // Handle direct cash payment
  const handleDirectPayment = (order: any) => {
    setCurrentOrder(order);
    setIsDirectPaymentOpen(true);
  };

  // Handle tap to pay
  const handleTapToPay = (order: any) => {
    setCurrentOrder(order);
    setIsPaymentOpen(true);
  };

  // Handle payment completion
  const handlePaymentComplete = () => {
    setIsPaymentOpen(false);
    setIsDirectPaymentOpen(false);
    setCurrentOrder(null);
  };

  // Filter orders to only show active ones (not completed or cancelled)
  const activeOrders = customOrders.filter(
    (order) => order.status !== "completed" && order.status !== "cancelled"
  );

  // If no active orders, show an empty state message
  if (activeOrders.length === 0) {
    return (
      <div className="col-span-full text-center py-10 text-muted-foreground">
        No current custom orders
      </div>
    );
  }

  // Otherwise, display the orders in a responsive grid
  return (
    <>
      {/* Payment Dialogs */}
      {isPaymentOpen && currentOrder && (
        <CustomOrderPayment
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          onPaymentComplete={handlePaymentComplete}
          selectedOrder={currentOrder}
        />
      )}
      
      {isDirectPaymentOpen && currentOrder && (
        <DirectPaymentDialog
          isOpen={isDirectPaymentOpen}
          onClose={() => setIsDirectPaymentOpen(false)}
          onPaymentComplete={handlePaymentComplete}
          order={currentOrder}
          orderType="custom"
        />
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeOrders.map((order) => (
        <Card key={order.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{getCustomerName(order.customerName, order)}</CardTitle>
              <Badge
                className={
                  order.status === "ready" 
                    ? "bg-blue-500"
                    : undefined
                }
              >
                {order.status}
              </Badge>
            </div>
            <CardDescription>{new Date(order.createdAt).toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium mb-1">Contact</h4>
                <p className="text-sm">
                  {order.contactType === "email" ? (
                    <a href={`mailto:${order.contactInfo}`} className="text-blue-600 hover:underline">
                      {order.contactInfo}
                    </a>
                  ) : order.contactType === "phone" ? (
                    <a href={`tel:${order.contactInfo}`} className="text-blue-600 hover:underline">
                      {order.contactInfo}
                    </a>
                  ) : (
                    <span>{order.contactInfo}</span>
                  )}
                </p>
              </div>
              
              {order.selectedProducts && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Products</h4>
                  <ul className="text-sm list-disc pl-4">
                    {parseSelectedProducts(order.selectedProducts).map((product: any, index: number) => (
                      <li key={index}>
                        {product.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Order Details - Enlarged and Highlighted */}
              <div className="bg-amber-50 p-3 rounded-md border border-amber-100 mt-4">
                <h4 className="text-sm font-semibold mb-2 text-amber-900">Order Details</h4>
                <p className="text-sm whitespace-pre-line min-h-[80px] max-h-[120px] overflow-y-auto">{order.orderDetails}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 pt-0">
            <div className="flex justify-between w-full">
              <div className="flex gap-2">
                <select
                  className="px-2 py-1 rounded-md border text-sm"
                  value={order.status}
                  onChange={(e) => handleUpdateCustomOrderStatus(order.id, e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="ready">Ready</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="flex gap-2">
                {/* Single payment button with dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 border-green-200 flex items-center gap-1"
                    >
                      <DollarSign className="h-4 w-4" />
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDirectPayment(order)}>
                      <DollarSign className="h-4 w-4 mr-2" />
                      Cash
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleTapToPay(order)}>
                      <Terminal className="h-4 w-4 mr-2" />
                      Tap to Pay
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-2">
                      <h3 className="font-medium">{getCustomerName(order.customerName, order)}</h3>
                      <p className="text-sm text-muted-foreground">
                        Requested on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      
                      <Separator />
                      
                      <div>
                        <h4 className="text-sm font-medium">Customer</h4>
                        <p className="text-sm">{getCustomerName(order.customerName, order)}</p>
                        <p className="text-sm">{order.contactType}: {order.contactInfo}</p>
                      </div>
                      
                      {order.selectedProducts && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="text-sm font-medium">Selected Products</h4>
                            <ul className="text-sm space-y-1 list-disc pl-4 mt-1">
                              {parseSelectedProducts(order.selectedProducts).map((product: any, index: number) => (
                                <li key={index}>
                                  {product.name}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </>
                      )}
                      
                      <Separator />
                      
                      <div>
                        <h4 className="text-sm font-medium">Order Details</h4>
                        <p className="text-sm whitespace-pre-line">{order.orderDetails}</p>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                <DeleteCustomOrderButton order={order} />
              </div>
            </div>
          </CardFooter>
        </Card>
      ))}
      </div>
    </>
  );
}