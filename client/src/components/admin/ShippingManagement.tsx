import React, { useState, useEffect } from "react";
import { 
  Truck, 
  Boxes, 
  Package, 
  Search, 
  FileText, 
  Clock, 
  AlertCircle, 
  Check, 
  MapPin,
  Loader2,
  ChevronDown,
  ChevronRight,
  ArrowDownToLine,
  Building2,
  Store,
  Factory,
  Ban,
  CreditCard,
  Terminal,
  Save
} from "lucide-react";
import { WarehouseAddressSection } from "../warehouse/WarehouseAddress";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { queryClient } from "@/lib/queryClient";
import { format } from "date-fns";

// Sample carriers for demonstration
const carriers = [
  { id: "roadie", name: "Roadie", logo: "🚚", basePrice: 8.99, availableZipCodes: ["20171", "20172", "20190", "20191"] },
  { id: "usps", name: "USPS", logo: "🇺🇸", basePrice: 5.99 },
  { id: "ups", name: "UPS", logo: "📦", basePrice: 7.99 },
  { id: "fedex", name: "FedEx", logo: "📬", basePrice: 8.49 }
];

// Sample shipping zones
const shippingZones = [
  { id: 1, name: "Local", zipcodes: ["20171", "20172", "20190", "20191"], rate: 5.99 },
  { id: 2, name: "Regional", zipcodes: ["20001", "20002", "20003", "20004", "20005"], rate: 7.99 },
  { id: 3, name: "National", zipcodes: [], rate: 12.99 } // Fallback for any other zipcode
];

// Sample shipping methods
const shippingMethods = [
  { id: "standard", name: "Standard Shipping", daysMin: 3, daysMax: 5, price: 5.99, description: "Standard delivery via USPS or UPS" },
  { id: "expedited", name: "Expedited Shipping", daysMin: 2, daysMax: 3, price: 8.99, description: "Faster delivery through priority services" },
  { id: "overnight", name: "Overnight Shipping", daysMin: 1, daysMax: 1, price: 19.99, description: "Next-day delivery (order must be placed before 2pm)" }
];

// Sample shipping orders for display
const sampleOrders = [
  { 
    id: 325, 
    customerName: "Handy Bandy", 
    address: "34256 Test St\nHerndon\nVA\n20171\nUnited States", 
    status: "pending", 
    carrier: "roadie",
    trackingNumber: "",
    shippedDate: null,
    estimatedDelivery: null,
    orderTotal: 15.00,
    shippingCost: 5.99
  },
  { 
    id: 250, 
    customerName: "Jane Smith", 
    address: "1234 Main St\nReston\nVA\n20190\nUnited States", 
    status: "shipped", 
    carrier: "usps",
    trackingNumber: "9400100000000000000000",
    shippedDate: "2025-04-22T14:30:00.000Z",
    estimatedDelivery: "2025-04-26T16:00:00.000Z",
    orderTotal: 8.00,
    shippingCost: 5.99
  },
  { 
    id: 241, 
    customerName: "John Doe", 
    address: "5678 Oak Ave\nArlington\nVA\n22201\nUnited States", 
    status: "delivered", 
    carrier: "ups",
    trackingNumber: "1Z999AA10123456784",
    shippedDate: "2025-04-18T11:15:00.000Z",
    estimatedDelivery: "2025-04-21T16:00:00.000Z",
    deliveredDate: "2025-04-21T14:22:00.000Z",
    orderTotal: 15.00,
    shippingCost: 7.99
  }
];

interface CarrierSetupProps {
  carrierId: string;
  onUpdate: (id: string, enabled: boolean, accountDetails?: any) => void;
}

const CarrierSetup: React.FC<CarrierSetupProps> = ({ carrierId, onUpdate }) => {
  const [enabled, setEnabled] = useState(false);
  const [accountNumber, setAccountNumber] = useState("");
  const [apiKey, setApiKey] = useState("");
  
  const carrier = carriers.find(c => c.id === carrierId);
  
  if (!carrier) return null;
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{carrier.logo}</span>
            <CardTitle>{carrier.name}</CardTitle>
          </div>
          <Badge variant={enabled ? "default" : "outline"}>
            {enabled ? "Enabled" : "Disabled"}
          </Badge>
        </div>
        <CardDescription>Configure shipping rates and account settings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor={`${carrierId}-enabled`} className="flex items-center space-x-2 cursor-pointer">
              <input
                id={`${carrierId}-enabled`}
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span>Enable {carrier.name} shipping</span>
            </Label>
          </div>
          
          {enabled && (
            <div className="space-y-4 mt-4 p-4 border rounded-md bg-muted/20">
              <div className="space-y-2">
                <Label htmlFor={`${carrierId}-account`}>Account Number</Label>
                <Input 
                  id={`${carrierId}-account`} 
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder={`Enter your ${carrier.name} account number`}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`${carrierId}-api`}>API Key</Label>
                <Input 
                  id={`${carrierId}-api`} 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  type="password"
                  placeholder={`Enter your ${carrier.name} API key`}
                />
              </div>
              
              <div className="pt-2">
                <Button 
                  onClick={() => onUpdate(carrierId, enabled, { accountNumber, apiKey })}
                  disabled={!accountNumber || !apiKey}
                >
                  Save Configuration
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t p-4">
        <div className="text-sm text-muted-foreground">
          Base rate: ${carrier.basePrice.toFixed(2)}
        </div>
        <Button variant="outline" size="sm">
          View Documentation
        </Button>
      </CardFooter>
    </Card>
  );
};

interface ShippingZoneCardProps {
  zone: typeof shippingZones[0];
  onEdit: (zone: typeof shippingZones[0]) => void;
}

const ShippingZoneCard: React.FC<ShippingZoneCardProps> = ({ zone, onEdit }) => {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{zone.name}</CardTitle>
          <Badge variant="outline">${zone.rate.toFixed(2)}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">ZIP Codes:</span> {zone.zipcodes.length > 0 
              ? zone.zipcodes.slice(0, 5).join(", ") + (zone.zipcodes.length > 5 ? ` +${zone.zipcodes.length - 5} more` : "") 
              : "All other ZIP codes"}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button variant="outline" size="sm" onClick={() => onEdit(zone)}>
          Edit Zone
        </Button>
      </CardFooter>
    </Card>
  );
};

export function ShippingManagement() {
  const [activeTab, setActiveTab] = useState("settings");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingZone, setEditingZone] = useState<typeof shippingZones[0] | null>(null);
  const [shipping, setShipping] = useState(() => {
    // Initialize from localStorage if available, otherwise default to true
    const savedState = localStorage.getItem('shipping-enabled');
    return savedState !== null ? savedState === 'true' : true;
  });
  const [isSaving, setIsSaving] = useState(false);
  
  // Warehouse fields are now managed in the WarehouseAddressSection component
  
  // Load shipping settings from the database
  const { data: shippingSettings } = useQuery({ 
    queryKey: ["/api/shipping/status"],
    queryFn: async () => {
      try {
        // No admin token needed for shipping status endpoint since it's public
        const response = await fetch('/api/shipping/status');
        if (!response.ok) {
          throw new Error('Failed to fetch shipping status');
        }
        const data = await response.json();
        
        // Update localStorage to match database setting
        localStorage.setItem('shipping-enabled', data.enabled.toString());
        
        // Update the shipping state to match the database
        setShipping(data.enabled);
        
        return data;
      } catch (error) {
        console.error("Error fetching shipping status:", error);
        
        // Fallback to localStorage if API fails
        const savedState = localStorage.getItem('shipping-enabled');
        const enabled = savedState !== null ? savedState === 'true' : true;
        
        return { enabled };
      }
    }
  });
  
  // Save shipping state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('shipping-enabled', shipping.toString());
  }, [shipping]);
  
  // Save shipping settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async () => {
      setIsSaving(true);
      
      try {
        // Save to localStorage first for immediate persistence
        localStorage.setItem('shipping-enabled', shipping.toString());
        
        console.log("Saving shipping settings:", { enabled: shipping });
        
        // Make API call to save the setting to the database
        // Use the admin authentication headers with both token and x-admin-access header
        const adminToken = localStorage.getItem('adminToken') || '';
        const response = await fetch('/api/admin/site-settings', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`,
            'x-admin-access': 'sweetmoment-dev-secret'
          },
          body: JSON.stringify({ 
            key: 'shipping_enabled',
            value: shipping ? 'true' : 'false'
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to save shipping settings to database');
        }
        
        return await response.json();
      } catch (error) {
        console.error("Error saving shipping settings:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      // Reset state and invalidate queries as needed
      setIsSaving(false);
      
      // Quiet success - no browser alert
      console.log("Shipping settings saved successfully!");
      
      // Invalidate the shipping status query cache to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/shipping/status"] });
    },
    onError: () => {
      setIsSaving(false);
      console.error("Failed to save shipping settings. Please try again.");
    }
  });
  
  // Simulate loading shipping orders with the real orders
  const { data: shippingOrders, isLoading: isLoadingOrders } = useQuery({ 
    queryKey: ["/api/admin/shipping-orders"],
    queryFn: async () => {
      // This is a simulation - in reality, you would fetch from your API
      await new Promise(resolve => setTimeout(resolve, 600)); // Simulate network delay
      return sampleOrders;
    }
  });
  
  const handleCarrierUpdate = (id: string, enabled: boolean, accountDetails?: any) => {
    console.log(`Carrier ${id} ${enabled ? 'enabled' : 'disabled'}`, accountDetails);
    // Here you would update your backend with the carrier configuration
    // Log success but don't show browser alert
    console.log(`${carriers.find(c => c.id === id)?.name} configuration updated!`);
  };
  
  const handleEditZone = (zone: typeof shippingZones[0]) => {
    setEditingZone(zone);
  };
  
  const filteredOrders = shippingOrders?.filter(order => 
    order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.id.toString().includes(searchQuery) ||
    order.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (order.trackingNumber && order.trackingNumber.includes(searchQuery))
  ) || [];
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Shipping</h2>
          <p className="text-muted-foreground">
            Manage shipping settings, carriers, and track orders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span>Export</span>
          </Button>
          <Button className="flex items-center gap-1">
            <ArrowDownToLine className="h-4 w-4" />
            <span>Generate Labels</span>
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 mb-6">
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span>Shipments</span>
          </TabsTrigger>
          <TabsTrigger value="carriers" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            <span>Carriers</span>
          </TabsTrigger>
          <TabsTrigger value="zones" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>Zones & Rates</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Boxes className="h-4 w-4" />
            <span>Shipping Settings</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="orders">
          <div className="mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <div className="space-y-1">
                <h3 className="text-xl font-semibold">Shipping Orders</h3>
                <p className="text-sm text-muted-foreground">
                  View and manage orders that require shipping
                </p>
                {!shipping && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4 mt-4">
                    <p className="text-red-700 font-medium">Shipping is currently disabled</p>
                    <p className="text-sm text-red-600 mt-1">No shipping orders will be created while shipping is disabled.</p>
                  </div>
                )}
              </div>
              <div className="w-full md:w-auto">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search orders, tracking numbers..."
                    className="pl-8 w-full md:w-[300px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            <div className={`border rounded-md overflow-hidden ${!shipping ? "opacity-50 pointer-events-none" : ""}`}>
              {isLoadingOrders ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <AlertCircle className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold">No matching orders found</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Try adjusting your search query or filters
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Carrier</TableHead>
                      <TableHead>Tracking</TableHead>
                      <TableHead>Shipped Date</TableHead>
                      <TableHead>Delivery Est.</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id}</TableCell>
                        <TableCell>
                          <div className="font-medium">{order.customerName}</div>
                          <div className="text-xs text-muted-foreground mt-1 whitespace-pre-line">{order.address.split("\n").slice(0, 2).join(", ")}</div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              order.status === "delivered" ? "default" : 
                              order.status === "shipped" ? "secondary" : 
                              "outline"
                            }
                            className="text-xs"
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {order.carrier ? (
                            <div className="flex items-center">
                              <span className="mr-1">
                                {carriers.find(c => c.id === order.carrier)?.logo}
                              </span>
                              <span className="text-sm">
                                {carriers.find(c => c.id === order.carrier)?.name}
                              </span>
                            </div>
                          ) : "—"}
                        </TableCell>
                        <TableCell>
                          {order.trackingNumber ? (
                            <div className="text-xs font-mono">{order.trackingNumber}</div>
                          ) : "—"}
                        </TableCell>
                        <TableCell>
                          {order.shippedDate ? format(new Date(order.shippedDate), "MMM d, yyyy") : "—"}
                        </TableCell>
                        <TableCell>
                          {order.estimatedDelivery ? format(new Date(order.estimatedDelivery), "MMM d, yyyy") : "—"}
                        </TableCell>
                        <TableCell className="text-right">${order.shippingCost.toFixed(2)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="carriers">
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Shipping Carriers</h3>
              <p className="text-muted-foreground">
                Configure shipping providers and their settings
              </p>
              {!shipping && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mt-4">
                  <p className="text-red-700 font-medium">Shipping is currently disabled</p>
                  <p className="text-sm text-red-600 mt-1">Enable shipping in the Settings tab before configuring carriers.</p>
                </div>
              )}
            </div>
            
            <div className={!shipping ? "opacity-50 pointer-events-none" : ""}>
              <div className="grid grid-cols-1 gap-6">
                {carriers.map(carrier => (
                  <CarrierSetup 
                    key={carrier.id} 
                    carrierId={carrier.id} 
                    onUpdate={handleCarrierUpdate} 
                  />
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="zones">
          <div className="space-y-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold">Shipping Zones</h3>
                <p className="text-muted-foreground">
                  Create and manage shipping zones and rates
                </p>
                {!shipping && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4 mt-4">
                    <p className="text-red-700 font-medium">Shipping is currently disabled</p>
                    <p className="text-sm text-red-600 mt-1">Enable shipping in the Settings tab before configuring zones.</p>
                  </div>
                )}
              </div>
              <Button disabled={!shipping}>
                Add New Zone
              </Button>
            </div>
            
            <div className={!shipping ? "opacity-50 pointer-events-none" : ""}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {shippingZones.map(zone => (
                  <ShippingZoneCard 
                    key={zone.id} 
                    zone={zone} 
                    onEdit={handleEditZone} 
                  />
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="settings">
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-2">Global Shipping Settings</h3>
              <p className="text-muted-foreground mb-4">
                Enable or disable shipping for your store
              </p>
              
              <Card className="mb-6">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle>Shipping Status</CardTitle>
                    <Badge 
                      variant={shipping ? "default" : "destructive"} 
                      className={`transition-all duration-300 ease-in-out ${
                        shipping 
                          ? "bg-green-500 hover:bg-green-500 text-white font-medium" 
                          : "bg-red-500 hover:bg-red-500 text-white font-medium"
                      }`}
                    >
                      {shipping ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <CardDescription>Control whether shipping is available in your store</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="enable-shipping" 
                      checked={shipping}
                      onCheckedChange={(checked) => setShipping(checked === true)}
                    />
                    <Label htmlFor="enable-shipping">Enable shipping for customers</Label>
                  </div>
                  
                  <div className="text-sm text-muted-foreground mt-4">
                    {shipping ? 
                      "Shipping is currently enabled. Customers can choose shipping options during checkout." : 
                      "Shipping is currently disabled. Customers will only be able to select pickup options."}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => saveSettingsMutation.mutate()}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Settings
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <Separator />
            
            <div className={!shipping ? "opacity-50 pointer-events-none" : ""}>
              <h3 className="text-xl font-semibold mb-2">Shipping Methods</h3>
              <p className="text-muted-foreground mb-4">
                Configure available shipping methods for your customers
              </p>
              
              <div className="space-y-4">
                {shippingMethods.map(method => (
                  <Card key={method.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle>{method.name}</CardTitle>
                        <Badge variant="outline">${method.price.toFixed(2)}</Badge>
                      </div>
                      <CardDescription>{method.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm">
                        Delivery estimate: {method.daysMin === method.daysMax 
                          ? `${method.daysMin} day${method.daysMin > 1 ? 's' : ''}` 
                          : `${method.daysMin}-${method.daysMax} days`}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="destructive" size="sm">Disable</Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Fulfillment Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center">
                      <Store className="mr-2 h-5 w-5 text-primary" />
                      <CardTitle>Pickup Options</CardTitle>
                    </div>
                    <CardDescription>Configure in-store pickup availability</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <input
                          id="enable-pickup"
                          type="checkbox"
                          checked={true}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <Label htmlFor="enable-pickup">Enable in-store pickup</Label>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="pickup-instructions">Pickup Instructions</Label>
                        <Input 
                          id="pickup-instructions" 
                          value="Please arrive during store hours and bring your ID for verification."
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Available Pickup Days</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                            <div key={day} className="flex items-center space-x-2">
                              <input
                                id={`day-${day}`}
                                type="checkbox"
                                checked={day !== 'Sunday'}
                                className="h-4 w-4 rounded border-gray-300"
                              />
                              <Label htmlFor={`day-${day}`}>{day}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button>Save Settings</Button>
                  </CardFooter>
                </Card>
                
                <WarehouseAddressSection />
              </div>
            </div>
            
            <Separator />
            
            <div className={!shipping ? "opacity-50 pointer-events-none" : ""}>
              <h3 className="text-xl font-semibold mb-4">Stripe Shipping Integration</h3>
              <p className="text-muted-foreground mb-6">
                Integrate with Stripe to create shipping rates and process shipping payments
                {!shipping && <span className="block font-semibold text-red-500 mt-2">(Disabled - Enable shipping in Global Settings first)</span>}
              </p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <div className="flex items-center">
                      <CreditCard className="mr-2 h-5 w-5 text-primary" />
                      <CardTitle>Stripe Shipping Rates</CardTitle>
                    </div>
                    <CardDescription>Create and manage shipping rates in Stripe</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-sm">
                        <p>Shipping rates created in Stripe will automatically appear as options during checkout.</p>
                        <p className="mt-2">Current active shipping rates:</p>
                        
                        <div className="mt-4 border rounded-md divide-y">
                          {shippingMethods.map(method => (
                            <div key={method.id} className="p-3 flex justify-between items-center">
                              <div>
                                <div className="font-medium">{method.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {method.daysMin === method.daysMax 
                                    ? `Delivery in ${method.daysMin} day${method.daysMin > 1 ? 's' : ''}` 
                                    : `Delivery in ${method.daysMin}-${method.daysMax} days`}
                                </div>
                              </div>
                              <div className="font-semibold">${method.price.toFixed(2)}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="pt-2 space-y-2">
                        <Button className="w-full">
                          <CreditCard className="mr-2 h-4 w-4" />
                          Sync with Stripe
                        </Button>
                        <Button variant="outline" className="w-full">
                          Create New Shipping Rate
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <div className="flex items-center">
                      <Terminal className="mr-2 h-5 w-5 text-primary" />
                      <CardTitle>Checkout Settings</CardTitle>
                    </div>
                    <CardDescription>Configure how shipping options appear during checkout</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Default Shipping Option</Label>
                        <Select defaultValue="standard">
                          <SelectTrigger>
                            <SelectValue placeholder="Select default shipping option" />
                          </SelectTrigger>
                          <SelectContent>
                            {shippingMethods.map(method => (
                              <SelectItem key={method.id} value={method.id}>
                                {method.name} (${method.price.toFixed(2)})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox id="show-delivery-estimates" defaultChecked={true} />
                        <Label htmlFor="show-delivery-estimates">Show delivery time estimates</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox id="show-pickup-option" defaultChecked={true} />
                        <Label htmlFor="show-pickup-option">Show pickup option</Label>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Allowed Shipping Countries</Label>
                        <Select defaultValue="us-ca">
                          <SelectTrigger>
                            <SelectValue placeholder="Select countries" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="us-only">United States Only</SelectItem>
                            <SelectItem value="us-ca">US and Canada</SelectItem>
                            <SelectItem value="all">All Countries</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="text-xs text-muted-foreground mt-1">
                          This controls which countries are available in Stripe Checkout
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button>Save Checkout Settings</Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
            
            <Separator />
            
            <div className={!shipping ? "opacity-50 pointer-events-none" : ""}>
              <h3 className="text-xl font-semibold mb-4">Shipping Restrictions</h3>
              {!shipping && <p className="text-red-500 font-medium mb-4">(Disabled - Enable shipping in Global Settings first)</p>}
              
              <Card>
                <CardHeader>
                  <div className="flex items-center">
                    <Ban className="mr-2 h-5 w-5 text-destructive" />
                    <CardTitle>Shipping Restrictions</CardTitle>
                  </div>
                  <CardDescription>Configure products or locations with shipping restrictions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="location-restrictions">
                      <AccordionTrigger>Location Restrictions</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 p-2">
                          <p className="text-sm text-muted-foreground">
                            Define countries, states, or ZIP codes where shipping is not available.
                          </p>
                          
                          <div className="space-y-2">
                            <Label>Restricted Countries</Label>
                            <Select defaultValue="none">
                              <SelectTrigger>
                                <SelectValue placeholder="Select countries to restrict" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">No Restrictions</SelectItem>
                                <SelectItem value="international">International Only</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Restricted States/Provinces</Label>
                            <Input placeholder="Enter comma-separated list of states (e.g. AK, HI)" />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Restricted ZIP/Postal Codes</Label>
                            <Input placeholder="Enter comma-separated list of ZIP codes" />
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="product-restrictions">
                      <AccordionTrigger>Product Restrictions</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 p-2">
                          <p className="text-sm text-muted-foreground">
                            Define products that have special shipping requirements or restrictions.
                          </p>
                          
                          <div className="space-y-2">
                            <Label>Products with Special Requirements</Label>
                            <Select defaultValue="none">
                              <SelectTrigger>
                                <SelectValue placeholder="Select products" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">No Products</SelectItem>
                                <SelectItem value="all">All Products</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
                <CardFooter>
                  <Button>Save Restrictions</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}