import React from "react";
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
import { Separator } from "@/components/ui/separator";
import { Eye } from "lucide-react";
import { DeleteCustomOrderButton } from "./DeleteCustomOrderButton";

export interface PastCustomOrderCardViewProps {
  customOrders: any[];
  handleUpdateCustomOrderStatus: (id: number, status: string) => Promise<void>;
  getCustomerName: (name: string | null | undefined, order?: any) => string;
  parseSelectedProducts: (products: string) => any[];
}

export function PastCustomOrderCardView({ 
  customOrders,
  handleUpdateCustomOrderStatus,
  getCustomerName,
  parseSelectedProducts
}: PastCustomOrderCardViewProps) {
  // Filter orders to show only completed or cancelled
  const pastOrders = customOrders.filter(
    (order) => order.status === "completed" || order.status === "cancelled"
  );

  // If no past orders, show an empty state message
  if (pastOrders.length === 0) {
    return (
      <div className="col-span-full text-center py-10 text-muted-foreground">
        No past custom orders
      </div>
    );
  }

  // Otherwise, display the orders in a responsive grid
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {pastOrders.map((order) => (
        <Card key={order.id} className={`overflow-hidden ${order.status === "cancelled" ? "border-red-200" : ""}`}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{getCustomerName(order.customerName, order)}</CardTitle>
              <Badge
                className={
                  order.status === "completed" 
                    ? "bg-green-500" 
                    : order.status === "cancelled"
                    ? "bg-red-500"
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
          <CardFooter className="flex justify-between pt-0">
            <div className="flex items-center gap-2">
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
              <DeleteCustomOrderButton order={order} />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
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
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}