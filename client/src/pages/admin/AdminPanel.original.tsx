import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { fixCalendarDateSelection } from "@/lib/dateUtils";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiteCustomizationContent } from "./site-customization";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { 
  PlusCircle, 
  Pencil, 
  Trash, 
  Tag, 
  Package, 
  Star, 
  ShoppingBag,
  BarChart3,
  LogOut,
  ImageIcon,
  AlertTriangle,
  Scissors,
  GripVertical,
  Check,
  X,
  HelpCircle,
  CalendarIcon,
  Upload,
  Plus,
  Minus,
  Edit,
  ArrowUp,
  ArrowDown,
  Filter,
  FilterX,
  CheckCircle,
  Eye,
  EyeOff,
  FolderTree, Trophy, Flame, Gift, Zap, Crown, Heart, Sparkles, Award, Palette
} from "lucide-react";
import { HexColorPicker } from "react-colorful";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ImageUploader } from "@/components/ImageUploader";
import { AdminNotificationProvider, useAdminNotification } from "@/components/ui/admin-notification";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { AdminDeleteDialog } from "@/components/ui/admin-delete-dialog";

// Helper function to get admin authorization headers
function getAdminAuthHeaders() {
  const token = localStorage.getItem('adminToken');
  return {
    'Authorization': `Bearer ${token}`,
    // Keep the development header as fallback during transition
    'x-admin-access': 'sweetmoment-dev-secret'
  };
}

// Define types for our admin panel
interface Discount {
  id: number;
  code: string;
  description: string | null;
  discountType: string;
  value: number;
  minPurchase: number | null;
  maxUses: number | null;
  usedCount: number;
  productIds: string[] | null;
  categoryIds: string[] | null;
  active: boolean;
  hidden: boolean;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  rating: number;
  reviewCount: number;
  basePrice: number;
  category: string;
  featured?: boolean;
  inventory?: number;
  sizeOptions?: string | null; // JSON string of options
  typeOptions?: string | null; // JSON string of options
  allergyInfo?: string | null; // Field for allergy information
  ingredients?: string | null; // Field for product ingredients list
  createdAt?: string;
  displayOrder?: number; // Added field for product ordering
  // Product-specific sale fields
  saleActive?: boolean;
  saleType?: string; // 'percentage' or 'fixed'
  saleValue?: number;
  salePrice?: number; // Calculated or stored sale price
  saleStartDate?: string;
  saleEndDate?: string;
  hasMultipleImages?: boolean; // Flag indicating if product has additional images
  recentlyMoved?: boolean; // Visual indicator for recently dragged and dropped items
  visible?: boolean; // Whether the product should be shown in the menu
  badge?: "best-seller" | "premium" | "popular" | "new" | null; // Badge to display on product card
}

interface ProductImage {
  id: number;
  productId: number;
  imageUrl: string;
  caption: string | null;
  displayOrder: number;
  createdAt?: string;
}

interface Review {
  id: number;
  userId: number;
  productId: number;
  rating: number;
  comment: string | null;
  userName: string | null;
  createdAt: string;
  productName?: string; // Added for admin panel display
}

interface Order {
  id: number;
  userId: number;
  status: string;
  totalAmount: number;
  shippingAddress: string;
  paymentIntentId: string | null;
  createdAt: string;
}

interface ProductStatistics {
  productId: number;
  name: string;
  totalSales: number;
  revenue: number;
  reviewCount: number;
  averageRating: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  badge?: "best-seller" | "premium" | "popular" | "new" | null; // Badge to display on category
}

// Discount Management Tab
function DiscountManagement() {
  const { toast } = useToast();
  const { showNotification } = useAdminNotification();
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [discountToDelete, setDiscountToDelete] = useState<number | null>(null);
  const [isAddingDiscount, setIsAddingDiscount] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "percentage",
    value: 0,
    minPurchase: 0,
    maxUses: null as number | null,
    active: true,
    hidden: false, // Whether to hide the discount banner
    startDate: "",
    endDate: "",
    productIds: [] as string[],
    categoryIds: [] as string[],
  });

  // Fetch all discounts with frequent refetching
  const { data: discounts = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/admin/discounts"],
    queryFn: async () => {
      try {
        return await apiRequest("/api/admin/discounts", "GET", null, {
          headers: getAdminAuthHeaders()
        }) as Discount[];
      } catch (error) {
        // For now just show empty array if unauthorized
        console.error("Failed to fetch discounts:", error);
        return [];
      }
    },
    // Increase refetch frequency to see changes immediately
    refetchInterval: 2000
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;
      setFormData({ ...formData, [name]: checked });
    } else if (name === "value" || name === "minPurchase" || name === "maxUses") {
      setFormData({ ...formData, [name]: value === "" ? null : parseFloat(value) });
    } else if (name === "code") {
      // Always convert discount codes to uppercase
      setFormData({ ...formData, [name]: value.toUpperCase() });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      description: "",
      discountType: "percentage",
      value: 0,
      minPurchase: 0,
      maxUses: null as number | null,
      active: true,
      hidden: false,
      startDate: "",
      endDate: "",
      productIds: [] as string[],
      categoryIds: [] as string[], // Empty to avoid automatic category selection
    });
    setEditingDiscount(null);
    setIsAddingDiscount(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Create sanitized data with proper date handling
      const sanitizedData = {
        ...formData,
        // Convert empty strings to null for date fields
        startDate: formData.startDate ? formData.startDate : null,
        endDate: formData.endDate ? formData.endDate : null,
      };
      
      if (editingDiscount) {
        // Update existing discount
        await apiRequest(`/api/admin/discounts/${editingDiscount.id}`, "PUT", sanitizedData, {
          headers: getAdminAuthHeaders()
        });
        showNotification({
          title: "Discount Updated",
          message: `Discount code ${formData.code} has been updated.`,
          variant: "success",
          position: "top-right"
        });
      } else {
        // Create new discount
        await apiRequest("/api/admin/discounts", "POST", sanitizedData, {
          headers: getAdminAuthHeaders()
        });
        showNotification({
          title: "Discount Created",
          message: `New discount code ${formData.code} has been created.`,
          variant: "success",
          position: "top-right"
        });
      }
      
      // Invalidate the cache for both admin discounts and public discounts
      queryClient.invalidateQueries({ queryKey: ['/api/admin/discounts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/discounts'] });
      
      resetForm();
      refetch();
    } catch (error) {
      console.error("Error saving discount:", error);
      showNotification({
        title: "Error",
        message: "Failed to save discount. Please try again.",
        variant: "error",
        position: "top-right"
      });
    }
  };

  const handleEdit = (discount: Discount) => {
    setEditingDiscount(discount);
    setFormData({
      code: discount.code,
      description: discount.description || "",
      discountType: discount.discountType,
      value: discount.value,
      minPurchase: discount.minPurchase || 0,
      maxUses: discount.maxUses as number | null,
      active: discount.active !== null ? discount.active : true,
      hidden: discount.hidden !== null ? discount.hidden : false,
      startDate: discount.startDate || "",
      endDate: discount.endDate || "",
      productIds: discount.productIds || [],
      categoryIds: discount.categoryIds || [],
    });
    setIsAddingDiscount(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await apiRequest(`/api/admin/discounts/${id}`, "DELETE", null, {
        headers: getAdminAuthHeaders()
      });
      
      // Invalidate the cache for both admin discounts and public discounts
      queryClient.invalidateQueries({ queryKey: ['/api/admin/discounts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/discounts'] });
      
      showNotification({
        title: "Discount Deleted",
        message: "The discount has been deleted successfully.",
        variant: "success",
        position: "top-right"
      });
      setDiscountToDelete(null);
      refetch();
    } catch (error) {
      console.error("Error deleting discount:", error);
      showNotification({
        title: "Error",
        message: "Failed to delete discount. Please try again.",
        variant: "error",
        position: "top-right"
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Discount Management</h2>
        <Button onClick={() => setIsAddingDiscount(!isAddingDiscount)}>
          {isAddingDiscount ? "Cancel" : (
            <>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Discount
            </>
          )}
        </Button>
      </div>
      
      {isAddingDiscount ? (
        <Card>
          <CardHeader>
            <CardTitle>{editingDiscount ? "Edit Discount" : "Create New Discount"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="code" className="font-medium">Discount Code</label>
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <Input 
                        id="code" 
                        name="code" 
                        value={formData.code} 
                        onChange={handleInputChange}
                        required
                        placeholder="SUMMER25" 
                        className="flex-1"
                      />
                      <div className="flex space-x-1">
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          className="whitespace-nowrap"
                          onClick={() => {
                            // Brand-style code: PREFIX + VALUE + 2-DIGIT-NUMBER + CATEGORY
                            const prefixes = ["SWEET", "CHOCO", "LUXURY", "DUBAI"];
                            const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
                            const randomNumber = Math.floor(Math.random() * 90) + 10; // 10 to 99
                            
                            // Only include category if explicitly selected by user
                            let categorySuffix = "";
                            if (formData.categoryIds.length === 1 && !editingDiscount) {
                              // Get a unique identifier based on the category name
                              const category = formData.categoryIds[0];
                              if (category === "classic") {
                                categorySuffix = "CLS";
                              } else if (category === "assorted") {
                                categorySuffix = "NUT";
                              } else if (category === "caramel") {
                                categorySuffix = "CRM";
                              } else if (category === "cereal") {
                                categorySuffix = "CRL";
                              }
                            }
                            
                            // For percentage discounts, include the value in the code
                            let valuePart = "";
                            if (formData.discountType === "percentage" && formData.value > 0) {
                              valuePart = formData.value.toString();
                            }
                            
                            const generatedCode = `${randomPrefix}${valuePart}${randomNumber}${categorySuffix}`;
                            setFormData({...formData, code: generatedCode});
                          }}
                        >
                          Brand Format
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          className="whitespace-nowrap"
                          onClick={() => {
                            // Full random code: 5-character alphanumeric
                            const alphanumeric = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed similar looking characters
                            let randomCode = "";
                            for (let i = 0; i < 5; i++) {
                              randomCode += alphanumeric.charAt(Math.floor(Math.random() * alphanumeric.length));
                            }
                            
                            setFormData({...formData, code: randomCode});
                          }}
                        >
                          Random Code
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Choose between a branded format (e.g., SWEET2575CLS) or a 5-character random code (e.g., 8K4P3)
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="discountType" className="font-medium">Discount Type</label>
                  <select 
                    id="discountType" 
                    name="discountType" 
                    value={formData.discountType} 
                    onChange={handleInputChange}
                    className="w-full p-2 rounded-md border"
                    required
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed_amount">Fixed Amount</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="value" className="font-medium">
                    Value {formData.discountType === "percentage" ? "(0-100%)" : "(in USD)"}
                  </label>
                  <Input 
                    id="value" 
                    name="value" 
                    type="number" 
                    value={formData.value} 
                    onChange={handleInputChange} 
                    required
                    min={0}
                    max={formData.discountType === "percentage" ? 100 : undefined}
                    step={formData.discountType === "percentage" ? 1 : 0.01}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="minPurchase" className="font-medium">Minimum Purchase (USD)</label>
                  <Input 
                    id="minPurchase" 
                    name="minPurchase" 
                    type="number" 
                    value={formData.minPurchase || ""} 
                    onChange={handleInputChange}
                    min={0}
                    step={0.01}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="maxUses" className="font-medium">Maximum Uses</label>
                  <Input 
                    id="maxUses" 
                    name="maxUses" 
                    type="number" 
                    value={formData.maxUses || ""} 
                    onChange={handleInputChange}
                    min={0}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="font-medium">Validity Period</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground mb-2">Start Date</div>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal group relative overflow-hidden transition-all duration-300",
                              !formData.startDate && "text-muted-foreground",
                              formData.startDate && "border-primary/50 text-primary"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:scale-110 group-hover:text-primary" />
                            <span className="transition-opacity duration-300">
                              {formData.startDate ? format(new Date(formData.startDate), "PPP") : <span>Pick a date</span>}
                            </span>
                            <span className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md"></span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent 
                          className="w-auto p-0 shadow-lg border-primary/20 animate-in fade-in-50 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95" 
                          sideOffset={5}
                        >
                          <Calendar
                            mode="single"
                            selected={formData.startDate ? new Date(formData.startDate) : undefined}
                            onSelect={(date: Date | undefined) => {
                              if (date) {
                                // Use the new fixCalendarDateSelection function that preserves the date the user selected
                                setFormData({
                                  ...formData,
                                  startDate: fixCalendarDateSelection(date)
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  startDate: ""
                                });
                              }
                            }}
                            initialFocus
                            className="rounded-md border-0"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground mb-2">End Date</div>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal group relative overflow-hidden transition-all duration-300",
                              !formData.endDate && "text-muted-foreground",
                              formData.endDate && "border-primary/50 text-primary"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:scale-110 group-hover:text-primary" />
                            <span className="transition-opacity duration-300">
                              {formData.endDate ? format(new Date(formData.endDate), "PPP") : <span>Pick a date</span>}
                            </span>
                            <span className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md"></span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent 
                          className="w-auto p-0 shadow-lg border-primary/20 animate-in fade-in-50 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95" 
                          sideOffset={5}
                        >
                          <Calendar
                            mode="single"
                            selected={formData.endDate ? new Date(formData.endDate) : undefined}
                            onSelect={(date: Date | undefined) => {
                              if (date) {
                                // Use the new fixCalendarDateSelection function that preserves the date the user selected
                                setFormData({
                                  ...formData,
                                  endDate: fixCalendarDateSelection(date)
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  endDate: ""
                                });
                              }
                            }}
                            initialFocus
                            className="rounded-md border-0"
                            disabled={(date: Date) => 
                              formData.startDate ? date < new Date(formData.startDate) : false
                            }
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
                
                <div className="col-span-2 space-y-2">
                  <label htmlFor="description" className="font-medium">Description</label>
                  <Input 
                    id="description" 
                    name="description" 
                    value={formData.description} 
                    onChange={handleInputChange} 
                    placeholder="Summer discount for all chocolate products"
                  />
                </div>
                
                <div className="col-span-2 space-y-4 border-t pt-4 mt-2">
                  <h3 className="font-medium text-lg">Discount Restrictions</h3>
                  
                  <div className="space-y-2">
                    <label className="font-medium">Applicable Categories</label>
                    <div className="grid grid-cols-2 gap-2">
                      {["classic", "assorted", "caramel", "cereal"].map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`category-${category}`}
                            checked={formData.categoryIds.includes(category)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({
                                  ...formData,
                                  categoryIds: [...formData.categoryIds, category]
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  categoryIds: formData.categoryIds.filter(id => id !== category)
                                });
                              }
                            }}
                          />
                          <label 
                            htmlFor={`category-${category}`}
                            className="text-sm capitalize cursor-pointer"
                          >
                            {category} Chocolate
                          </label>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formData.categoryIds.length === 0 
                        ? "The discount will apply to all categories if none are selected."
                        : `The discount will only apply to ${formData.categoryIds.length} selected categories.`}
                    </p>
                  </div>
                </div>
                
                <div className="col-span-2 grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <input 
                      id="active" 
                      name="active" 
                      type="checkbox" 
                      checked={formData.active} 
                      onChange={handleInputChange}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <label htmlFor="active" className="font-medium">Active</label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input 
                      id="hidden" 
                      name="hidden" 
                      type="checkbox" 
                      checked={formData.hidden} 
                      onChange={handleInputChange}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <label htmlFor="hidden" className="font-medium">Hidden Code (No Banner)</label>
                    <div className="relative group">
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-popover text-popover-foreground text-xs p-2 rounded shadow-md min-w-[250px] z-50">
                        Hidden codes will work but won't display a promotional banner on the website, ideal for exclusive or targeted promotions.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                <Button type="submit">{editingDiscount ? "Update Discount" : "Create Discount"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Discount Codes</CardTitle>
            <CardDescription>Manage your store discount codes and promotions</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">Loading discounts...</div>
            ) : discounts.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No discount codes found. Create your first discount.
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Applies To</TableHead>
                      <TableHead>Uses</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Visibility</TableHead>
                      <TableHead>Validity</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...discounts]
                      .sort((a, b) => {
                        // First, sort by active status (active discounts at the top)
                        if (a.active && !b.active) return -1;
                        if (!a.active && b.active) return 1;
                        // Then sort by creation date (newest first)
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                      })
                      .map((discount: Discount) => (
                      <TableRow key={discount.id}>
                        <TableCell className="font-medium">{discount.code}</TableCell>
                        <TableCell>
                          {discount.discountType === "percentage" 
                            ? "Percentage" 
                            : "Fixed Amount"}
                        </TableCell>
                        <TableCell>
                          {discount.discountType === "percentage" 
                            ? `${discount.value}%` 
                            : `$${(discount.value / 100).toFixed(2)}`}
                        </TableCell>
                        <TableCell>
                          {discount.categoryIds && discount.categoryIds.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {discount.categoryIds.map(category => (
                                <span 
                                  key={category} 
                                  className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs capitalize"
                                >
                                  {category}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">All Categories</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {discount.usedCount || 0} / {discount.maxUses || "∞"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={async () => {
                                try {
                                  // Only send the updated active status instead of entire object
                                  await apiRequest(`/api/admin/discounts/${discount.id}/status`, "PATCH", 
                                    { active: !discount.active },
                                    { headers: getAdminAuthHeaders() }
                                  );
                                  
                                  // Better caching strategy - only invalidate what's needed
                                  queryClient.invalidateQueries({ 
                                    queryKey: ['/api/admin/discounts'],
                                    exact: false
                                  });
                                  
                                  // Only show notification, don't force immediate refresh
                                  showNotification({
                                    title: discount.active ? "Discount Deactivated" : "Discount Activated",
                                    message: `${discount.code} is now ${discount.active ? 'inactive' : 'active'}.`,
                                    variant: "success",
                                    position: "top-right"
                                  });
                                } catch (error) {
                                  console.error("Error toggling discount:", error);
                                  showNotification({
                                    title: "Error",
                                    message: "Failed to update discount status. Please try again.",
                                    variant: "error",
                                    position: "top-right"
                                  });
                                }
                              }}
                              className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none hover:ring-2 hover:ring-offset-2 hover:ring-opacity-50 active:scale-95 focus:ring-2 focus:ring-offset-2"
                              style={{ 
                                backgroundColor: discount.active ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                              }}
                            >
                              <span className="sr-only">Toggle discount activation</span>
                              <span 
                                className={`
                                  pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md 
                                  ${discount.active 
                                    ? 'animate-switch-on' 
                                    : 'animate-switch-off'
                                  }
                                `}
                              />
                            </button>
                            <span 
                              className={`text-sm font-medium transition-all duration-300 ease-in-out px-2 py-1 rounded-full
                                ${discount.active ? 
                                  'text-green-600 bg-green-100 animate-ping-success' : 
                                  'text-red-600 bg-red-100'}
                              `}
                            >
                              {discount.active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span 
                              className={`text-sm font-medium px-2 py-1 rounded-full
                                ${discount.hidden ? 
                                  'text-purple-600 bg-purple-100' : 
                                  'text-blue-600 bg-blue-100'}
                              `}
                            >
                              {discount.hidden ? 'Hidden Banner' : 'Visible Banner'}
                            </span>
                            {discount.hidden && (
                              <span className="ml-2">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <HelpCircle className="h-4 w-4 text-gray-400 cursor-help hover:text-gray-600" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>This discount won't show a promotional banner</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {discount.startDate && discount.endDate 
                            ? `${new Date(discount.startDate).toLocaleDateString()} - ${new Date(discount.endDate).toLocaleDateString()}` 
                            : "Always Valid"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(discount)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-red-500 hover:text-red-700" 
                              onClick={() => setDiscountToDelete(discount.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Delete Confirmation Dialog */}
      {discountToDelete && (
        <AdminDeleteDialog
          title="Delete Discount"
          description="Are you sure you want to delete this discount? This action cannot be undone."
          isOpen={discountToDelete !== null}
          onConfirm={() => {
            if (discountToDelete) {
              handleDelete(discountToDelete);
            }
          }}
          confirmLabel="Delete Discount"
          cancelLabel="Cancel"
          onClose={() => setDiscountToDelete(null)}
        />
      )}
    </div>
  );
}

// Product Management Tab
// Component to select a category for products
function CategorySelector({ value, onChange }: { value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void }) {
  const { data: categories = [], isLoading, isError } = useQuery({
    queryKey: ["/api/admin/categories"],
    queryFn: async () => {
      try {
        return await apiRequest("/api/admin/categories", "GET", null, {
          headers: getAdminAuthHeaders()
        }) as Category[];
      } catch (error) {
        console.error("Error fetching categories:", error);
        throw error;
      }
    }
  });

  if (isLoading) return <div className="text-sm">Loading categories...</div>;
  if (isError) return <div className="text-sm text-red-500">Failed to load categories</div>;
  
  return (
    <select 
      id="category" 
      name="category" 
      value={value} 
      onChange={onChange}
      className="w-full p-2 rounded-md border"
      required
    >
      <option value="none">None</option>
      {categories.map((category) => (
        <option key={category.id} value={category.slug}>
          {category.name}
        </option>
      ))}
    </select>
  );
}

function ProductManagement() {
  const { showNotification } = useAdminNotification();
  const { toast } = useToast();
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [deletingProductIds, setDeletingProductIds] = useState<string[]>([]);
  const [showImageManager, setShowImageManager] = useState(false);
  const [selectedProductForImages, setSelectedProductForImages] = useState<Product | null>(null);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [imageToDelete, setImageToDelete] = useState<number | null>(null);
  const [newImageData, setNewImageData] = useState({
    imageUrl: "",
    caption: "",
    displayOrder: 0
  });
  
  // State for category management
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  
  // State for badge management
  const [showBadgeManager, setShowBadgeManager] = useState(false);
  
  // State to manage local product updates (for visibility toggling)
  const [localProductUpdates, setLocalProductUpdates] = useState<{[id: string]: Partial<Product>}>({});
  
  // Empty placeholders for removed duplicate functionality
  const [duplicateGroups] = useState<Product[][]>([]);
  const [showDuplicates, setShowDuplicates] = useState(false);
  
  // Fetch images for a specific product
  const fetchProductImages = async (productId: string) => {
    try {
      // Handle both numeric and string IDs
      // For DB-sourced products the ID is numeric, for hardcoded ones it's a string
      const numericProductId = parseInt(productId);
      
      // If the ID is not a number, we can't fetch images for it
      // This is for hardcoded/legacy products that don't have DB entries
      if (isNaN(numericProductId)) {
        showNotification({
          title: "Product Images Not Available",
          message: "Image management is only available for catalog products.",
          variant: "warning"
        });
        setProductImages([]);
        return;
      }
      
      const images = await apiRequest(`/api/products/${numericProductId}/images`, "GET", null, {
        headers: getAdminAuthHeaders()
      }) as ProductImage[];
      
      // Sort images by display order
      const sortedImages = [...images].sort((a, b) => a.displayOrder - b.displayOrder);
      setProductImages(sortedImages);
    } catch (error) {
      console.error("Error fetching product images:", error);
      showNotification({
        title: "Error",
        message: "Failed to load product images. Please try again.",
        variant: "error"
      });
    }
  };
  
  // Add a new image to a product
  const addProductImage = async () => {
    if (!selectedProductForImages) return;
    
    try {
      const numericProductId = parseInt(selectedProductForImages.id);
      if (isNaN(numericProductId)) {
        showNotification({
          title: "Product Not Supported",
          message: "Image management is only available for catalog products.",
          variant: "warning"
        });
        return;
      }
      
      // Only proceed if we have a valid image URL
      if (!newImageData.imageUrl.trim()) {
        showNotification({
          title: "Missing Image URL",
          message: "Please provide a valid image URL.",
          variant: "warning"
        });
        return;
      }
      
      const imageData = {
        imageUrl: newImageData.imageUrl,
        caption: newImageData.caption || null,
        displayOrder: newImageData.displayOrder || 0
      };
      
      await apiRequest(`/api/products/${numericProductId}/images`, "POST", imageData, {
        headers: getAdminAuthHeaders()
      });
      
      showNotification({
        title: "Image Added",
        message: "The image has been added to the product successfully.",
        variant: "success"
      });
      
      // Reset form and refresh images
      setNewImageData({
        imageUrl: "",
        caption: "",
        displayOrder: productImages.length > 0 ? Math.max(...productImages.map(img => img.displayOrder)) + 10 : 10
      });
      
      fetchProductImages(selectedProductForImages.id);
    } catch (error) {
      console.error("Error adding product image:", error);
      showNotification({
        title: "Error",
        message: "Failed to add image. Please try again.",
        variant: "error"
      });
    }
  };
  
  // Update an existing product image
  const updateProductImage = async (imageId: number, updatedData: Partial<ProductImage>) => {
    try {
      await apiRequest(`/api/product-images/${imageId}`, "PUT", updatedData, {
        headers: getAdminAuthHeaders()
      });
      
      showNotification({
        title: "Image Updated",
        message: "The image has been updated successfully.",
        variant: "success"
      });
      
      // Refresh the image list
      if (selectedProductForImages) {
        fetchProductImages(selectedProductForImages.id);
      }
    } catch (error) {
      console.error("Error updating product image:", error);
      showNotification({
        title: "Error",
        message: "Failed to update image. Please try again.",
        variant: "error"
      });
    }
  };
  
  // Delete a product image
  const deleteProductImage = async (imageId: number) => {
    try {
      await apiRequest(`/api/product-images/${imageId}`, "DELETE", null, {
        headers: getAdminAuthHeaders()
      });
      
      showNotification({
        title: "Image Deleted",
        message: "The image has been deleted successfully.",
        variant: "success"
      });
      
      setImageToDelete(null);
      
      // Refresh the image list
      if (selectedProductForImages) {
        fetchProductImages(selectedProductForImages.id);
      }
    } catch (error) {
      console.error("Error deleting product image:", error);
      showNotification({
        title: "Error",
        message: "Failed to delete image. Please try again.",
        variant: "error"
      });
    }
  };
  
  // Open the image manager for a specific product
  const openImageManager = (product: Product) => {
    setSelectedProductForImages(product);
    setShowImageManager(true);
    setNewImageData({
      imageUrl: "",
      caption: "",
      displayOrder: 10
    });
    fetchProductImages(product.id);
  };
  
  // Close the image manager
  const closeImageManager = () => {
    setShowImageManager(false);
    setSelectedProductForImages(null);
    setProductImages([]);
  };
  
  // Category management functions
  const handleAddCategory = async (categoryData: any) => {
    try {
      await apiRequest("/api/admin/categories", "POST", categoryData, {
        headers: getAdminAuthHeaders()
      });
      
      showNotification({
        title: "Category Added",
        message: `Category "${categoryData.name}" has been created successfully.`,
        variant: "success"
      });
      
      // Refresh the categories list
      queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
      // Also refresh products since they may need to show the new category
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products-with-reviews"] });
      
    } catch (error) {
      console.error("Error adding category:", error);
      showNotification({
        title: "Error",
        message: "Failed to add category. Please try again.",
        variant: "error"
      });
    }
  };
  
  const handleUpdateCategory = async (categoryData: any) => {
    try {
      await apiRequest(`/api/admin/categories/${categoryData.id}`, "PUT", categoryData, {
        headers: getAdminAuthHeaders()
      });
      
      showNotification({
        title: "Category Updated",
        message: `Category "${categoryData.name}" has been updated successfully.`,
        variant: "success"
      });
      
      // Refresh the categories list
      queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
      // Also refresh products since they may need to show the updated category
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products-with-reviews"] });
      
    } catch (error) {
      console.error("Error updating category:", error);
      showNotification({
        title: "Error",
        message: "Failed to update category. Please try again.",
        variant: "error"
      });
    }
  };
  
  const handleDeleteCategory = async (categoryId: number) => {
    try {
      await apiRequest(`/api/admin/categories/${categoryId}`, "DELETE", null, {
        headers: getAdminAuthHeaders()
      });
      
      showNotification({
        title: "Category Deleted",
        message: "Category has been deleted successfully.",
        variant: "success"
      });
      
      // Refresh the categories list
      queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
      // Also refresh products since they may have been affected by the category deletion
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products-with-reviews"] });
      
    } catch (error) {
      console.error("Error deleting category:", error);
      showNotification({
        title: "Error",
        message: "Failed to delete category. Please try again.",
        variant: "error"
      });
    }
  };
  const [isSaving, setIsSaving] = useState(false);
  // Define a more specific type for our ordered products state
  const [orderedProducts, setOrderedProducts] = useState<Product[]>([]);
  const [productFormData, setProductFormData] = useState({
    name: "",
    description: "",
    image: "",
    basePrice: 0,
    category: "classic", // default category
    allergyInfo: "",
    ingredients: "",
    sizes: [] as { id: string, label: string, price: number, quantity: number }[],
    types: [] as { id: string, label: string, price: number }[],
    // Product-specific sale fields
    saleActive: false,
    saleType: "percentage", // 'percentage' or 'fixed'
    saleValue: 0,
    salePrice: 0, // Calculated sale price
    saleStartDate: "",
    saleEndDate: "",
    // Visibility control
    visible: true, // Default to visible
    // Badge display
    badge: null as "best-seller" | "premium" | "popular" | "new" | null, // Badge to display on product card
  });
  
  const [sizeOption, setSizeOption] = useState({ id: "", label: "", price: 0, quantity: 0 });
  const [typeOption, setTypeOption] = useState({ id: "", label: "", price: 0 });
  const [editingSizeIndex, setEditingSizeIndex] = useState<number | null>(null);
  const [editingTypeIndex, setEditingTypeIndex] = useState<number | null>(null);
  
  // Fetch products with reviews and metadata directly from our new endpoint
  const { data: productsWithReviews = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/admin/products-with-reviews"],
    queryFn: async () => {
      try {
        const response = await apiRequest("/api/admin/products-with-reviews", "GET", null, {
          headers: getAdminAuthHeaders()
        });
        console.log("Products with reviews and metadata:", response);
        
        // Filter out any products that are currently being deleted
        const filteredProducts = response.filter((product: Product) => 
          !deletingProductIds.includes(product.id.toString())
        );
        
        // Sort by displayOrder if available, with a stable secondary sort by name
        return filteredProducts.sort((a: Product, b: Product) => {
          // First sort by displayOrder (default to 1000 if not set)
          const orderA = a.displayOrder || 1000;
          const orderB = b.displayOrder || 1000;
          
          if (orderA !== orderB) {
            return orderA - orderB;
          }
          
          // If displayOrder is the same, sort alphabetically by name for stability
          return a.name.localeCompare(b.name);
        });
      } catch (error) {
        console.error("Error fetching products with reviews:", error);
        return [];
      }
    }
  });
  
  // Simplified product reordering with drag and drop
  const handleProductDragEnd = (result: DropResult) => {
    // Only process if there's a valid destination
    if (!result.destination) return;
    
    const { source, destination } = result;
    // Skip if no change in position
    if (source.index === destination.index) return;
    
    // Get the current product list
    const currentProducts = orderedProducts.length > 0 
      ? [...orderedProducts] 
      : [...(productsWithReviews || []) as Product[]];
    
    // Reorder the products
    const newProducts = Array.from(currentProducts);
    const [movedProduct] = newProducts.splice(source.index, 1);
    newProducts.splice(destination.index, 0, movedProduct);
    
    // Update display order values (10, 20, 30...)
    const updatedProducts = newProducts.map((product, index) => ({
      ...product,
      displayOrder: (index + 1) * 10
    }));
    
    // Update UI state immediately
    setOrderedProducts(updatedProducts);
    
    // Prepare data for server update
    const productOrders = newProducts.map((product, index) => {
      const productId = !isNaN(parseInt(product.id)) ? parseInt(product.id) : product.id;
      return {
        id: productId,
        displayOrder: (index + 1) * 10
      };
    });
    
    // Use requestAnimationFrame to wait until next paint is complete
    requestAnimationFrame(() => {
      // Then use setTimeout to further ensure we don't block the main thread
      setTimeout(() => {
        apiRequest("/api/products/reorder", "PATCH", { productOrders }, {
          headers: getAdminAuthHeaders()
        })
          .then(() => {
            showNotification({
              title: "Order Updated",
              message: "Product display order saved",
              variant: "success",
              duration: 1000 // Shorter notification
            });
            
            // Invalidate caches
            queryClient.invalidateQueries({ queryKey: ['/api/products'] });
            queryClient.invalidateQueries({ queryKey: ['/api/admin/products-with-reviews'] });
          })
          .catch((error) => {
            console.error("Failed to update product order:", error);
            showNotification({
              title: "Error",
              message: "Failed to save product order. Please try again.",
              variant: "error"
            });
          });
      }, 250); // Longer delay to ensure animations complete first
    });
  };
  
  const handleSizeOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "price") {
      // Clear initial zero when user starts typing
      if (sizeOption.price === 0 && value !== "") {
        // Parse input as dollars - "8" means 8 dollars
        const numValue = parseFloat(value);
        // By default, treat input as full dollars if no decimal point is included
        if (Number.isInteger(numValue) && !value.includes('.')) {
          // Treat as full dollars (8 means $8.00)
          setSizeOption({ ...sizeOption, price: isNaN(numValue) ? 0 : numValue });
        } else {
          // Value already contains a decimal point, use it as entered
          setSizeOption({ ...sizeOption, price: isNaN(numValue) ? 0 : numValue });
        }
      } else {
        // Parse input as dollars - "8" means 8 dollars
        const numValue = parseFloat(value) || 0;
        // By default, treat input as full dollars if no decimal point is included
        if (Number.isInteger(numValue) && !value.includes('.')) {
          // Treat as full dollars (8 means $8.00)
          setSizeOption({ ...sizeOption, price: numValue });
        } else {
          // Value already contains a decimal point, use it as entered
          setSizeOption({ ...sizeOption, price: numValue });
        }
      }
    } else {
      setSizeOption({ ...sizeOption, [name]: value });
    }
  };
  
  const handleTypeOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "price") {
      // Clear initial zero when user starts typing
      if (typeOption.price === 0 && value !== "") {
        // Parse input as dollars - "8" means 8 dollars
        const numValue = parseFloat(value);
        // By default, treat input as full dollars if no decimal point is included
        if (Number.isInteger(numValue) && !value.includes('.')) {
          // Treat as full dollars (8 means $8.00)
          setTypeOption({ ...typeOption, price: isNaN(numValue) ? 0 : numValue });
        } else {
          // Value already contains a decimal point, use it as entered
          setTypeOption({ ...typeOption, price: isNaN(numValue) ? 0 : numValue });
        }
      } else {
        // Parse input as dollars - "8" means 8 dollars
        const numValue = parseFloat(value) || 0;
        // By default, treat input as full dollars if no decimal point is included
        if (Number.isInteger(numValue) && !value.includes('.')) {
          // Treat as full dollars (8 means $8.00)
          setTypeOption({ ...typeOption, price: numValue });
        } else {
          // Value already contains a decimal point, use it as entered
          setTypeOption({ ...typeOption, price: numValue });
        }
      }
    } else {
      setTypeOption({ ...typeOption, [name]: value });
    }
  };
  
  const addSizeOption = () => {
    // Generate ID from label if not provided
    let optionToAdd = { ...sizeOption };
    if (!optionToAdd.id && optionToAdd.label) {
      // Generate ID from label: convert to lowercase, replace spaces with hyphens
      optionToAdd.id = optionToAdd.label.toLowerCase().replace(/\s+/g, '-');
    }
    
    // Format the label to include quantity information if provided
    // This ensures consistent display in both admin panel and store front
    if (optionToAdd.quantity && !optionToAdd.label.includes('pieces') && !optionToAdd.label.includes('pcs')) {
      // If quantity is provided but not already in the label, add it
      optionToAdd.label = `${optionToAdd.label} (${optionToAdd.quantity} pieces)`;
    }
    
    if (optionToAdd.label) { // Only require label, ID will be auto-generated
      if (editingSizeIndex !== null) {
        // Update existing size option
        const newSizes = [...productFormData.sizes];
        newSizes[editingSizeIndex] = optionToAdd;
        setProductFormData({
          ...productFormData,
          sizes: newSizes
        });
        setEditingSizeIndex(null);
      } else {
        // Add new size option
        setProductFormData({
          ...productFormData,
          sizes: [...productFormData.sizes, optionToAdd]
        });
      }
      // Reset the form
      setSizeOption({ id: "", label: "", price: 0, quantity: 0 });
    }
  };
  
  const addTypeOption = () => {
    // Generate ID from label if not provided
    let optionToAdd = { ...typeOption };
    if (!optionToAdd.id && optionToAdd.label) {
      // Generate ID from label: convert to lowercase, replace spaces with hyphens
      optionToAdd.id = optionToAdd.label.toLowerCase().replace(/\s+/g, '-');
    }
    
    if (optionToAdd.label) { // Only require label, ID will be auto-generated
      if (editingTypeIndex !== null) {
        // Update existing type option
        const newTypes = [...productFormData.types];
        newTypes[editingTypeIndex] = optionToAdd;
        setProductFormData({
          ...productFormData,
          types: newTypes
        });
        setEditingTypeIndex(null);
      } else {
        // Add new type option
        setProductFormData({
          ...productFormData,
          types: [...productFormData.types, optionToAdd]
        });
      }
      // Reset the form
      setTypeOption({ id: "", label: "", price: 0 });
    }
  };
  
  const editSizeOption = (index: number) => {
    const size = productFormData.sizes[index];
    // Ensure quantity is included (default to 0 if not present)
    setSizeOption({ 
      ...size, 
      quantity: size.quantity !== undefined ? size.quantity : 0 
    });
    setEditingSizeIndex(index);
  };
  
  const editTypeOption = (index: number) => {
    const type = productFormData.types[index];
    setTypeOption({ ...type });
    setEditingTypeIndex(index);
  };
  
  const cancelEditingOption = () => {
    if (editingSizeIndex !== null) {
      setSizeOption({ id: "", label: "", price: 0, quantity: 0 });
      setEditingSizeIndex(null);
    }
    if (editingTypeIndex !== null) {
      setTypeOption({ id: "", label: "", price: 0 });
      setEditingTypeIndex(null);
    }
  };
  
  const removeSize = (index: number) => {
    const newSizes = [...productFormData.sizes];
    newSizes.splice(index, 1);
    setProductFormData({ ...productFormData, sizes: newSizes });
  };
  
  const removeType = (index: number) => {
    const newTypes = [...productFormData.types];
    newTypes.splice(index, 1);
    setProductFormData({ ...productFormData, types: newTypes });
  };
  
  // Handle drag and drop reordering for size options - with optimized animations
  const handleSizeDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const { source, destination } = result;
    if (source.index === destination.index) return;
    
    // Create a new array with reordered size options
    const newSizes = Array.from(productFormData.sizes);
    const [movedItem] = newSizes.splice(source.index, 1);
    newSizes.splice(destination.index, 0, movedItem);
    
    // Update state immediately and synchronously for smooth animations
    // React Beautiful DnD requires this to calculate final positions
    setProductFormData({
      ...productFormData,
      sizes: newSizes
    });
  };
  
  // Handle drag and drop reordering for type options - with optimized animations
  const handleTypeDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const { source, destination } = result;
    if (source.index === destination.index) return;
    
    // Create a new array with reordered type options
    const newTypes = Array.from(productFormData.types);
    const [movedItem] = newTypes.splice(source.index, 1);
    newTypes.splice(destination.index, 0, movedItem);
    
    // Update state immediately and synchronously for smooth animations
    // React Beautiful DnD requires this to calculate final positions
    setProductFormData({
      ...productFormData,
      types: newTypes
    });
  };
  
  const handleAddEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent duplicate submissions
    if (isSaving) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Calculate sale price if applicable
      let salePrice = 0;
      // Ensure we have valid numerical values before calculations
      const basePrice = isNaN(productFormData.basePrice) ? 0 : productFormData.basePrice;
      const saleValue = isNaN(productFormData.saleValue) ? 0 : productFormData.saleValue;

      if (productFormData.saleActive && productFormData.saleType === "percentage") {
        // Calculate the sale price after applying percentage discount
        salePrice = basePrice - (basePrice * saleValue / 100);
      } else if (productFormData.saleActive && productFormData.saleType === "fixed") {
        // Use the fixed price directly
        salePrice = saleValue;
      }
      
      // Convert dollar values to integer cents for database storage
      // Database schema expects integers for these fields
      const basePriceCents = Math.round(basePrice * 100);
      // Ensure the sale price is never NaN
      const validSalePrice = isNaN(salePrice) ? 0 : salePrice;
      const salePriceCents = Math.round(validSalePrice * 100);
      
      const saleValueCents = productFormData.saleType === "percentage" 
        ? Math.round(saleValue) // Percentage values should remain as-is
        : Math.round(saleValue * 100); // Fixed amount values need to be converted to cents
      
      // Convert size and type option prices from dollars to cents
      const sizesWithCentPrices = productFormData.sizes.map(size => ({
        ...size,
        price: Math.round(size.price * 100), // Convert dollar price to cents
        quantity: size.quantity || 0 // Ensure quantity is included
      }));
      
      const typesWithCentPrices = productFormData.types.map(type => ({
        ...type,
        price: Math.round(type.price * 100) // Convert dollar price to cents
      }));
      
      // Create product data object from form data
      const productData = {
        name: productFormData.name,
        description: productFormData.description,
        image: productFormData.image,
        basePrice: basePriceCents, // Convert to cents
        category: productFormData.category,
        allergyInfo: productFormData.allergyInfo,
        ingredients: productFormData.ingredients,
        rating: 0,
        reviewCount: 0,
        // Store size and type options as JSON strings with prices converted to cents
        sizeOptions: productFormData.sizes.length > 0 ? JSON.stringify(sizesWithCentPrices) : null,
        typeOptions: productFormData.types.length > 0 ? JSON.stringify(typesWithCentPrices) : null,
        // Log for debugging - will show in browser console
        _debug_basePrice_dollars: basePrice,
        _debug_basePrice_cents: basePriceCents,
        // Sale fields
        saleActive: productFormData.saleActive,
        saleType: productFormData.saleType,
        saleValue: saleValueCents, // Store values in cents or as percentage
        salePrice: salePriceCents, // Store price in cents
        saleStartDate: productFormData.saleStartDate || null,
        saleEndDate: productFormData.saleEndDate || null,
        // Visibility control
        visible: productFormData.visible,
        // For new products, set a string ID matching the category for better display in menu
        ...(editingProduct ? {} : { id: productFormData.category + '-custom' })
      };

      if (editingProduct) {
        // Update existing product
        await apiRequest(`/api/products/${editingProduct.id}`, "PUT", productData, {
          headers: getAdminAuthHeaders()
        });
      } else {
        // Create new product
        await apiRequest("/api/products", "POST", productData, {
          headers: getAdminAuthHeaders()
        });
      }
      
      toast({
        title: editingProduct ? "Product Updated" : "Product Added",
        description: `The product ${productFormData.name} has been ${editingProduct ? "updated" : "added"} successfully.`,
      });
      
      resetProductForm();
      // Invalidate products cache
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products-with-reviews'] });
      refetch();
      
      // Scroll to top of the page for better user experience
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error("Error adding/updating product:", error);
      toast({
        title: "Error",
        description: "Failed to save product. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleProductInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === "basePrice" || name === "saleValue") {
      // Handle empty value, NaN, and initial zero
      if (value === "") {
        setProductFormData({ ...productFormData, [name]: 0 });
      } else {
        // Convert the input value to a number that represents dollars
        // (So "8" means 8 dollars, which should be stored as 800 cents in the database)
        const numValue = parseFloat(value);
        // Make sure we never set NaN values
        const safeValue = isNaN(numValue) ? 0 : numValue;
        
        // By default, treat input as full dollars if no decimal point is included
        // For example, "8" becomes $8.00, not $0.08
        if (Number.isInteger(safeValue) && !value.includes('.')) {
          // Treat as full dollars (8 means $8.00)
          setProductFormData({ ...productFormData, [name]: safeValue });
        } else {
          // Value already contains a decimal point, use it as entered
          setProductFormData({ ...productFormData, [name]: safeValue });
        }
      }
    } else {
      setProductFormData({ ...productFormData, [name]: value });
    }
  };
  
  const resetProductForm = () => {
    setProductFormData({
      name: "",
      description: "",
      image: "",
      basePrice: 0,
      category: "classic",
      allergyInfo: "",
      ingredients: "",
      sizes: [],
      types: [],
      // Reset sale fields
      saleActive: false,
      saleType: "percentage",
      saleValue: 0,
      salePrice: 0,
      saleStartDate: "",
      saleEndDate: "",
      // Reset visibility to default (visible)
      visible: true,
      // Reset badge to no badge
      badge: null
    });
    setEditingProduct(null);
    setShowProductForm(false);
    setSizeOption({ id: "", label: "", price: 0, quantity: 0 });
    setTypeOption({ id: "", label: "", price: 0 });
    setEditingSizeIndex(null);
    setEditingTypeIndex(null);
  };
  
  const handleDeleteProduct = async (id: string) => {
    try {
      console.log(`Starting deletion process for product ID: ${id}`);
      const headers = getAdminAuthHeaders();
      console.log(`Auth headers for delete request:`, headers);
      
      // First, add the product to our deleting list to trigger the animation
      setDeletingProductIds(prev => [...prev, id]);
      
      // Use Promise.all to run both the animation waiting and the API call concurrently
      await Promise.all([
        // Animation promise - gives time for the animation to play (matches CSS duration)
        new Promise(resolve => setTimeout(resolve, 650)),
        
        // API call promise - delete the product from the database
        // We use a separate promise to not block the UI animation
        (async () => {
          try {
            // Wrap the API call in its own try/catch to isolate errors
            console.log(`Sending DELETE request to /api/products/${id}`);
            const response = await apiRequest(`/api/products/${id}`, "DELETE", null, {
              headers: getAdminAuthHeaders()
            });
            console.log(`Product deletion response:`, response);
          } catch (error) {
            console.error("API error during product deletion:", error);
            // We don't re-throw here to let the animation complete
          }
        })()
      ]);
      
      // Once both promises are settled (animation finished and API call completed)
      // Update the UI in a non-blocking way
      setTimeout(() => {
        // First remove the item from our deleting list to clean up state 
        setDeletingProductIds(prev => prev.filter(item => item !== id));
        setProductToDelete(null);
        
        // Show success notification
        showNotification({
          title: "Product Deleted",
          message: "The product has been deleted successfully.",
          variant: "success",
          position: "top-right"
        });
        
        // Then invalidate queries and refresh data
        queryClient.invalidateQueries({ queryKey: ['/api/products'] });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/products-with-reviews'] });
        
        // Give a brief delay before refetching to prevent UI jumps
        setTimeout(() => {
          refetch();
        }, 100);
      }, 10); // Very minimal delay to prevent blocking the main thread
    } catch (error) {
      console.error("Error deleting product:", error);
      
      // Remove from the deleting list only if there was an error
      setDeletingProductIds(prev => prev.filter(itemId => itemId !== id));
      
      showNotification({
        title: "Error",
        message: "Failed to delete product. Please try again.",
        variant: "error",
        position: "top-right"
      });
    }
  };

  // Function to find duplicate products based on name
  // Removed duplicate products management functionality
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Product Management</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowCategoryManager(true)}
          >
            <FolderTree className="mr-2 h-4 w-4" />
            Manage Categories
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowBadgeManager(true)}
          >
            <Award className="mr-2 h-4 w-4" />
            Badges
          </Button>
          <Button onClick={() => setShowProductForm(!showProductForm)}>
            {showProductForm ? "Cancel" : (
              <>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Product
              </>
            )}
          </Button>
        </div>
      </div>
      
      {showProductForm ? (
        <Card>
          <CardHeader>
            <CardTitle>{editingProduct ? "Edit Product" : "Add New Product"}</CardTitle>
            <CardDescription>
              {editingProduct 
                ? "Update product details, pricing, and options" 
                : "Create a new product with customizable options"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddEditProduct} className="space-y-4">
              {/* Fully stacked vertical layout for better mobile experience */}
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="font-medium">Product Name</label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={productFormData.name} 
                    onChange={handleProductInputChange} 
                    required
                    placeholder="Classic Chocolate" 
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="basePrice" className="font-medium">Base Price ($)</label>
                  <div className="relative">
                    <Input 
                      id="basePrice" 
                      name="basePrice" 
                      type="number" 
                      value={productFormData.basePrice || ""}
                      onChange={handleProductInputChange}
                      onFocus={(e) => {
                        if (productFormData.basePrice === 0) {
                          setProductFormData({ ...productFormData, basePrice: "" as any });
                        }
                      }}
                      placeholder="0.00"
                      required
                      min={0}
                      step={0.01}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="category" className="font-medium">Category</label>
                  
                  {/* Use React Query to fetch available categories */}
                  <CategorySelector 
                    value={productFormData.category} 
                    onChange={handleProductInputChange} 
                  />
                </div>
                
                {/* Badge selector */}
                <div className="space-y-2">
                  <label htmlFor="badge" className="font-medium">Product Badge</label>
                  <select 
                    id="badge" 
                    name="badge" 
                    value={productFormData.badge || ""} 
                    onChange={handleProductInputChange}
                    className="w-full p-2 rounded-md border"
                  >
                    <option value="">No Badge</option>
                    <option value="best-seller">Best Seller</option>
                    <option value="premium">Premium</option>
                    <option value="popular">Popular</option>
                    <option value="new">New</option>
                  </select>
                  <p className="text-sm text-muted-foreground">
                    Badges appear on product cards to highlight special products
                  </p>
                </div>
                
                {/* Visibility toggle */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="visible"
                      name="visible"
                      checked={productFormData.visible}
                      onCheckedChange={(checked) => {
                        setProductFormData({
                          ...productFormData,
                          visible: checked
                        });
                      }}
                    />
                    <label htmlFor="visible" className="text-sm font-medium">
                      Show in Menu
                    </label>
                  </div>
                  <p className="text-sm text-muted-foreground pl-7">
                    Uncheck to hide this product from the menu without deleting it
                  </p>
                </div>
                
                {/* Image uploader - full width and properly stacked */}
                <div className="space-y-2">
                  <label htmlFor="image" className="font-medium">Product Image</label>
                  <ImageUploader
                    currentImageUrl={productFormData.image}
                    onImageUploaded={(imageUrl) => {
                      setProductFormData({
                        ...productFormData,
                        image: imageUrl
                      });
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="description" className="font-medium">Description</label>
                  <textarea 
                    id="description" 
                    name="description" 
                    value={productFormData.description} 
                    onChange={handleProductInputChange} 
                    required
                    placeholder="Delicious premium chocolate made with the finest ingredients..."
                    className="w-full p-2 rounded-md border min-h-[100px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="allergyInfo" className="font-medium">Allergy Information</label>
                  <textarea 
                    id="allergyInfo" 
                    name="allergyInfo" 
                    value={productFormData.allergyInfo} 
                    onChange={handleProductInputChange} 
                    placeholder="Contains: nuts, milk, soy. May contain traces of gluten."
                    className="w-full p-2 rounded-md border min-h-[60px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="ingredients" className="font-medium">Ingredients</label>
                  <textarea 
                    id="ingredients" 
                    name="ingredients" 
                    value={productFormData.ingredients} 
                    onChange={handleProductInputChange} 
                    placeholder="Cocoa butter, sugar, milk powder, cocoa mass, vanilla extract..."
                    className="w-full p-2 rounded-md border min-h-[60px]"
                  />
                </div>
                
                {/* Product-specific Sale Section */}
                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-medium">Product-specific Sale</h3>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="saleActive"
                      name="saleActive"
                      checked={productFormData.saleActive}
                      onCheckedChange={(checked) => {
                        setProductFormData({
                          ...productFormData,
                          saleActive: checked
                        });
                      }}
                    />
                    <label htmlFor="saleActive" className="text-sm font-medium">
                      Activate Sale
                    </label>
                  </div>
                  
                  {productFormData.saleActive && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="saleType" className="font-medium">Sale Type</label>
                        <select 
                          id="saleType" 
                          name="saleType" 
                          value={productFormData.saleType} 
                          onChange={handleProductInputChange}
                          className="w-full p-2 rounded-md border"
                        >
                          <option value="percentage">Percentage Discount</option>
                          <option value="fixed">Fixed Price</option>
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="saleValue" className="font-medium">
                          {productFormData.saleType === "percentage" ? "Discount %" : "Sale Price ($)"}
                        </label>
                        <Input 
                          id="saleValue" 
                          name="saleValue" 
                          type="number" 
                          value={productFormData.saleValue || ""} 
                          onChange={handleProductInputChange}
                          min={0}
                          max={productFormData.saleType === "percentage" ? 100 : undefined}
                          step={productFormData.saleType === "percentage" ? 1 : 0.01}
                          className="w-full"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="saleStartDate" className="font-medium">Sale Start Date</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !productFormData.saleStartDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {productFormData.saleStartDate ? (
                                format(new Date(productFormData.saleStartDate), "PPP")
                              ) : (
                                <span>Pick a start date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={productFormData.saleStartDate ? new Date(productFormData.saleStartDate) : undefined}
                              onSelect={(date) => {
                                if (date) {
                                  // Use the new fixCalendarDateSelection function that preserves the date the user selected
                                  setProductFormData({
                                    ...productFormData,
                                    saleStartDate: fixCalendarDateSelection(date)
                                  });
                                }
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="saleEndDate" className="font-medium">Sale End Date</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !productFormData.saleEndDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {productFormData.saleEndDate ? (
                                format(new Date(productFormData.saleEndDate), "PPP")
                              ) : (
                                <span>Pick an end date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={productFormData.saleEndDate ? new Date(productFormData.saleEndDate) : undefined}
                              onSelect={(date) => {
                                if (date) {
                                  // Use the new fixCalendarDateSelection function that preserves the date the user selected
                                  setProductFormData({
                                    ...productFormData,
                                    saleEndDate: fixCalendarDateSelection(date)
                                  });
                                }
                              }}
                              disabled={(date) => {
                                if (!productFormData.saleStartDate) return false;
                                const startDate = new Date(productFormData.saleStartDate);
                                return date < startDate;
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      <div className="md:col-span-2">
                        <div className="p-3 bg-accent/40 rounded-md">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Regular Price:</span>
                            <span className="text-sm">${productFormData.basePrice.toFixed(2)}</span>
                          </div>
                          
                          {productFormData.saleType === "percentage" && (
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-sm font-medium">Discount:</span>
                              <span className="text-sm">
                                {productFormData.saleValue}% ({(productFormData.basePrice * productFormData.saleValue / 100).toFixed(2)})
                              </span>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between mt-1 text-primary">
                            <span className="font-medium">Sale Price:</span>
                            <span className="font-medium">
                              ${productFormData.saleType === "percentage"
                                ? (productFormData.basePrice - (productFormData.basePrice * productFormData.saleValue / 100)).toFixed(2)
                                : productFormData.saleValue.toFixed(2)
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Size options section - Mobile responsive */}
                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-medium mb-2">Size Options</h3>
                  
                  {/* Mobile-friendly inputs that stack on small screens */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <div className="sm:col-span-1">
                      <Input 
                        placeholder="Label (e.g., Small)"
                        name="label"
                        value={sizeOption.label}
                        onChange={handleSizeOptionChange}
                        className="w-full"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <Input 
                        placeholder="Extra Price"
                        name="price"
                        type="number"
                        value={sizeOption.price || ""}
                        onChange={handleSizeOptionChange}
                        onFocus={(e) => {
                          if (sizeOption.price === 0) {
                            setSizeOption({ ...sizeOption, price: "" as any });
                          }
                        }}
                        className="w-full"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <Input 
                        placeholder="Quantity (e.g., 4 pieces)"
                        name="quantity"
                        type="number"
                        value={sizeOption.quantity || ""}
                        onChange={handleSizeOptionChange}
                        onFocus={(e) => {
                          if (sizeOption.quantity === 0) {
                            setSizeOption({ ...sizeOption, quantity: "" as any });
                          }
                        }}
                        className="w-full"
                      />
                    </div>
                    <div className="sm:col-span-1 flex gap-2">
                      <Button 
                        type="button" 
                        variant={editingSizeIndex !== null ? "default" : "outline"} 
                        size="sm" 
                        onClick={addSizeOption}
                        className="flex-1"
                      >
                        {editingSizeIndex !== null ? (
                          <>
                            <Check className="mr-2 h-3 w-3" />
                            Update
                          </>
                        ) : (
                          <>
                            <PlusCircle className="mr-2 h-3 w-3" />
                            Add
                          </>
                        )}
                      </Button>
                      {editingSizeIndex !== null && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={cancelEditingOption}
                          className="flex-none"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Size options list with drag and drop */}
                  {productFormData.sizes.length > 0 && (
                    <div className="border rounded-md p-3">
                      <div className="grid grid-cols-5 gap-2 font-medium text-sm mb-2 px-2">
                        <div className="w-8"></div>
                        <div>ID</div>
                        <div>Label</div>
                        <div>Extra Price</div>
                        <div>Quantity</div>
                      </div>
                      <DragDropContext 
                        onDragEnd={handleSizeDragEnd}
                      >
                        <Droppable droppableId="sizes-list">
                          {(provided) => (
                            <div 
                              {...provided.droppableProps} 
                              ref={provided.innerRef}
                              className="space-y-1"
                            >
                              {productFormData.sizes.map((size, index) => (
                                <Draggable 
                                  key={`size-${index}`} 
                                  draggableId={`size-${index}`} 
                                  index={index}
                                >
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className={`grid grid-cols-5 gap-2 items-center py-1 px-2 rounded-sm group ${
                                        snapshot.isDragging ? 'bg-muted shadow-md' : 'hover:bg-muted/50'
                                      }`}
                                    >
                                      <div 
                                        {...provided.dragHandleProps}
                                        className="flex items-center justify-center cursor-grab"
                                      >
                                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                                      </div>
                                      <div>{size.id}</div>
                                      <div>{size.label}</div>
                                      <div>${typeof size.price === 'number' ? size.price.toFixed(2) : '0.00'}</div>
                                      <div className="flex justify-between">
                                        {size.quantity || '0'}
                                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100">
                                          <Button 
                                            type="button" 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-6 w-6 text-blue-500"
                                            onClick={() => editSizeOption(index)}
                                          >
                                            <Pencil className="h-3 w-3" />
                                          </Button>
                                          <Button 
                                            type="button" 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-6 w-6 text-red-500"
                                            onClick={() => removeSize(index)}
                                          >
                                            <Trash className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>
                    </div>
                  )}
                </div>
                
                {/* Type options section - Mobile responsive */}
                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-medium mb-2">Type Options</h3>
                  
                  {/* Mobile-friendly inputs that stack on small screens */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-1">
                      <Input 
                        placeholder="Label (e.g., Milk Chocolate)"
                        name="label"
                        value={typeOption.label}
                        onChange={handleTypeOptionChange}
                        className="w-full"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <Input 
                        placeholder="Extra Price"
                        name="price"
                        type="number"
                        value={typeOption.price || ""}
                        onChange={handleTypeOptionChange}
                        onFocus={(e) => {
                          if (typeOption.price === 0) {
                            setTypeOption({ ...typeOption, price: "" as any });
                          }
                        }}
                        className="w-full"
                      />
                    </div>
                    <div className="sm:col-span-1 flex gap-2">
                      <Button 
                        type="button" 
                        variant={editingTypeIndex !== null ? "default" : "outline"} 
                        size="sm" 
                        onClick={addTypeOption}
                        className="flex-1"
                      >
                        {editingTypeIndex !== null ? (
                          <>
                            <Check className="mr-2 h-3 w-3" />
                            Update
                          </>
                        ) : (
                          <>
                            <PlusCircle className="mr-2 h-3 w-3" />
                            Add
                          </>
                        )}
                      </Button>
                      {editingTypeIndex !== null && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={cancelEditingOption}
                          className="flex-none"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Type options list with drag and drop */}
                  {productFormData.types.length > 0 && (
                    <div className="border rounded-md p-3">
                      <div className="grid grid-cols-4 gap-2 font-medium text-sm mb-2 px-2">
                        <div className="w-8"></div>
                        <div>ID</div>
                        <div>Label</div>
                        <div>Extra Price</div>
                      </div>
                      <DragDropContext 
                        onDragEnd={handleTypeDragEnd}
                      >
                        <Droppable droppableId="types-list">
                          {(provided) => (
                            <div 
                              {...provided.droppableProps} 
                              ref={provided.innerRef}
                              className="space-y-1"
                            >
                              {productFormData.types.map((type, index) => (
                                <Draggable 
                                  key={`type-${index}`} 
                                  draggableId={`type-${index}`} 
                                  index={index}
                                >
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className={`grid grid-cols-4 gap-2 items-center py-1 px-2 rounded-sm group ${
                                        snapshot.isDragging ? 'bg-muted shadow-md' : 'hover:bg-muted/50'
                                      }`}
                                    >
                                      <div 
                                        {...provided.dragHandleProps}
                                        className="flex items-center justify-center cursor-grab"
                                      >
                                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                                      </div>
                                      <div>{type.id}</div>
                                      <div>{type.label}</div>
                                      <div className="flex justify-between">
                                        ${typeof type.price === 'number' ? type.price.toFixed(2) : '0.00'}
                                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100">
                                          <Button 
                                            type="button" 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-6 w-6 text-blue-500"
                                            onClick={() => editTypeOption(index)}
                                          >
                                            <Pencil className="h-3 w-3" />
                                          </Button>
                                          <Button 
                                            type="button" 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-6 w-6 text-red-500"
                                            onClick={() => removeType(index)}
                                          >
                                            <Trash className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetProductForm}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
                      {editingProduct ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>{editingProduct ? "Update Product" : "Create Product"}</>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
            <CardDescription>Manage your store products</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">Loading products...</div>
            ) : productsWithReviews.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No products found. Add your first product.
              </div>
            ) : (
              <div className="overflow-auto max-h-[400px]">
                <div className="mb-2 text-sm text-muted-foreground">
                  Drag and drop products to reorder how they appear on the site
                </div>
                <div className="bg-white rounded-md border shadow-sm">
                  <div className="p-3 border-b bg-muted/20 font-medium">
                    Drag and drop products to reorder them in the menu
                  </div>
                  <DragDropContext 
                    onDragEnd={handleProductDragEnd}
                  >
                    <Droppable 
                      droppableId="products-list"
                    >
                      {(provided) => (
                        <div 
                          {...provided.droppableProps} 
                          ref={provided.innerRef}
                          className="p-4 min-h-[200px] flex flex-col gap-4 relative"
                        >
                          {(orderedProducts.length > 0 ? orderedProducts : (productsWithReviews as Product[])).map((product: Product, index: number) => {
                            // Create a stable draggableId that works for both string and numeric IDs
                            // The key must be consistent for react-beautiful-dnd to work properly
                            const stableId = `product-${product.id}`;
                            
                            return (
                              <Draggable 
                                key={stableId} 
                                draggableId={stableId} 
                                index={index}
                                isDragDisabled={deletingProductIds.includes(product.id.toString())}
                              >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`product-list-item flex items-center rounded-md border p-3
                                    ${
                                    deletingProductIds.includes(product.id.toString())
                                      ? "deleting bg-red-50" 
                                      : snapshot.isDragging 
                                        ? "bg-blue-50 shadow-lg" 
                                        : product.recentlyMoved 
                                          ? "recently-moved bg-card" 
                                          : "bg-card"
                                  }`}
                                  style={{
                                    ...provided.draggableProps.style,
                                    borderWidth: '1px'
                                  }}
                                >
                                  {/* Drag handle */}
                                  <div className="pr-2 mr-2 border-r flex-shrink-0">
                                    <GripVertical className="h-5 w-5 text-muted-foreground/50 cursor-grab" />
                                  </div>
                                  
                                  {/* Image */}
                                  <div className="relative h-14 w-14 rounded-md overflow-hidden mr-4">
                                    <img
                                      src={product.image || "https://placehold.co/400x400/6F4E37/FFF5E1?text=Chocolate"}
                                      alt={product.name}
                                      className="h-full w-full object-cover"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = "https://placehold.co/400x400/6F4E37/FFF5E1?text=Chocolate";
                                      }}
                                    />
                                  </div>
                                  
                                  {/* Product info - flexible width */}
                                  <div className="flex-grow min-w-0">
                                    <div className="font-medium truncate flex items-center">
                                      {product.name}
                                      {product.saleActive && (
                                        <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 border-green-200">Sale</Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center mt-1 text-sm text-muted-foreground">
                                      <Badge variant="outline" className="mr-2">{product.category}</Badge>
                                      <div className="flex items-center">
                                        <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400 mr-1" />
                                        <span>{product.rating.toFixed(1)} ({product.reviewCount})</span>
                                        <span className="mx-2">•</span>
                                        <span className={product.saleActive ? "line-through text-gray-400 mr-1" : ""}>
                                          ${
                                            product.basePrice < 100 
                                            ? product.basePrice.toFixed(2) 
                                            : (product.basePrice / 100).toFixed(2)
                                          }
                                        </span>
                                        {product.saleActive && product.salePrice && (
                                          <span className="text-green-600 font-medium">
                                            ${
                                              (typeof product.salePrice === 'number') ? 
                                                (product.salePrice < 100
                                                  ? product.salePrice.toFixed(2)
                                                  : (product.salePrice / 100).toFixed(2)
                                                ) : '0.00'
                                            }
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Actions */}
                                  <div className="flex items-center gap-1 ml-4">
                                    {/* Visibility Toggle Button with Tooltip */}
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className={`h-8 w-8 ${product.visible === false ? 'text-gray-400' : 'text-green-500'}`}
                                            onClick={async (e) => {
                                              e.stopPropagation();
                                              try {
                                                // Copy current product for UI update
                                                const currentProduct = {...product};
                                                
                                                // Toggle visibility (explicit boolean check)
                                                const newVisibility = !(currentProduct.visible === true);
                                                
                                                console.log(`Toggling visibility for ${currentProduct.name} (${currentProduct.id}):`, {
                                                  currentVisible: currentProduct.visible,
                                                  newVisibility
                                                });
                                                
                                                // Skip UI updates entirely - we'll rely on the refetch after API call
                                                // This avoids any state management issues with references
                                                console.log(`Sending visibility change request for ${currentProduct.name} without optimistic UI update`)
                                                
                                                // Send the API request with the new visibility
                                                const requestBody = { visible: newVisibility };
                                                console.log(`Sending PATCH request to /api/admin/products/${currentProduct.id} with:`, requestBody);
                                                
                                                const response = await apiRequest(
                                                  `/api/admin/products/${currentProduct.id}`, 
                                                  "PATCH", 
                                                  requestBody,
                                                  { headers: getAdminAuthHeaders() }
                                                );
                                                
                                                console.log("Visibility update response:", response);
                                                
                                                // Show confirmation message
                                                showNotification({
                                                  title: "Visibility Updated",
                                                  message: `${currentProduct.name} is now ${newVisibility ? 'visible' : 'hidden'} in menus`,
                                                  variant: "success"
                                                });
                                                
                                                // Invalidate queries to refresh data everywhere
                                                queryClient.invalidateQueries({ queryKey: ['/api/products'] });
                                                queryClient.invalidateQueries({ queryKey: ['/api/admin/products-with-reviews'] });
                                                
                                                // Optional: Force refetch to ensure server-side consistency
                                                refetch();
                                              } catch (error) {
                                                console.error("Failed to toggle product visibility:", error);
                                                showNotification({
                                                  title: "Error",
                                                  message: "Failed to update product visibility",
                                                  variant: "error"
                                                });
                                                
                                                // Revert any optimistic UI updates
                                                refetch();
                                              }
                                            }}
                                          >
                                            <div className="relative h-4 w-4">
                                              {/* Eye (visible) icon with animation */}
                                              <motion.div
                                                initial={{ opacity: product.visible === false ? 0 : 1, scale: product.visible === false ? 0 : 1 }}
                                                animate={{ opacity: product.visible === false ? 0 : 1, scale: product.visible === false ? 0 : 1 }}
                                                transition={{ duration: 0.2 }}
                                                className="absolute inset-0"
                                              >
                                                <Eye className="h-4 w-4" />
                                              </motion.div>
                                              
                                              {/* EyeOff (hidden) icon with animation */}
                                              <motion.div
                                                initial={{ opacity: product.visible === false ? 1 : 0, scale: product.visible === false ? 1 : 0 }}
                                                animate={{ opacity: product.visible === false ? 1 : 0, scale: product.visible === false ? 1 : 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="absolute inset-0"
                                              >
                                                <EyeOff className="h-4 w-4" />
                                              </motion.div>
                                            </div>
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          {product.visible === false ? 'Click to make product visible in menu' : 'Click to hide product from menu'}
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                    
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        
                                        // Set the editing product
                                        setEditingProduct(product);
                                        
                                        // Normalize image URL if needed
                                        let normalizedImage = product.image || "";
                                        if (normalizedImage && !normalizedImage.startsWith('http://') && 
                                            !normalizedImage.startsWith('https://') && !normalizedImage.startsWith('/')) {
                                          normalizedImage = "https://" + normalizedImage;
                                        }
                                        
                                        // Convert price values from cents to dollars for display
                                        // Check if the price seems to already be in dollars format
                                        // If price is < 100, it's likely that it was mistakenly saved in dollars instead of cents
                                        const priceIsLikelyInDollars = product.basePrice < 100;
                                        const basePriceDollars = product.basePrice ? (priceIsLikelyInDollars ? product.basePrice : product.basePrice / 100) : 0;
                                        const salePriceDollars = product.salePrice ? (priceIsLikelyInDollars ? product.salePrice : product.salePrice / 100) : 0;
                                        
                                        // For sale value, we need to handle differently based on type
                                        const saleValueConverted = product.saleType === "percentage" 
                                          ? product.saleValue || 0 
                                          : (product.saleValue ? (priceIsLikelyInDollars ? product.saleValue : product.saleValue / 100) : 0);
                                        
                                        // Add logging to debug price conversion
                                        console.log("Editing product with price data:", {
                                          basePrice: product.basePrice,
                                          basePriceDollars,
                                          saleValue: product.saleValue,
                                          saleValueConverted
                                        });
                                        
                                        // Set the form data with all existing product details
                                        setProductFormData({
                                          name: product.name,
                                          description: product.description,
                                          image: normalizedImage,
                                          basePrice: basePriceDollars,
                                          category: product.category,
                                          allergyInfo: product.allergyInfo || "",
                                          ingredients: product.ingredients || "",
                                          sizes: product.sizeOptions 
                                            ? JSON.parse(product.sizeOptions).map((size: any) => {
                                                // Check if the size price is likely already in dollars
                                                const sizePriceIsLikelyInDollars = size.price < 100;
                                                return {
                                                  ...size,
                                                  price: sizePriceIsLikelyInDollars ? size.price : size.price / 100,
                                                  quantity: size.quantity || 0 // Ensure quantity field is included
                                                };
                                              }) 
                                            : [],
                                          types: product.typeOptions 
                                            ? JSON.parse(product.typeOptions).map((type: any) => {
                                                // Check if the type price is likely already in dollars
                                                const typePriceIsLikelyInDollars = type.price < 100;
                                                return {
                                                  ...type,
                                                  price: typePriceIsLikelyInDollars ? type.price : type.price / 100
                                                };
                                              }) 
                                            : [],
                                          saleActive: product.saleActive || false,
                                          saleType: product.saleType || "percentage",
                                          saleValue: saleValueConverted,
                                          salePrice: salePriceDollars,
                                          saleStartDate: product.saleStartDate || "",
                                          saleEndDate: product.saleEndDate || "",
                                          // Include visibility status (default to true if not specified)
                                          visible: typeof product.visible === 'boolean' ? product.visible : true,
                                          // Include badge (default to null if not specified)
                                          badge: product.badge || null
                                        });
                                        
                                        // Show the form
                                        setShowProductForm(true);
                                      }}
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-blue-500 hover:text-blue-700"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openImageManager(product);
                                      }}
                                    >
                                      <ImageIcon className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-red-500 hover:text-red-700"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setProductToDelete(product.id);
                                      }}
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                            );
                          })}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Delete Confirmation Dialog */}
      {productToDelete && (
        <AdminDeleteDialog
          title="Delete Product"
          description="Are you sure you want to delete this product? This action cannot be undone."
          isOpen={productToDelete !== null}
          onConfirm={() => {
            if (productToDelete) {
              handleDeleteProduct(productToDelete);
            }
          }}
          confirmLabel="Delete Product"
          cancelLabel="Cancel"
          onClose={() => setProductToDelete(null)}
        />
      )}
      
      {/* Duplicate Products Dialog */}
      {/* Duplicate Products Dialog removed */}
      
      {/* Image Manager Dialog */}
      {showImageManager && selectedProductForImages && (
        <Dialog open={showImageManager} onOpenChange={closeImageManager}>
          <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle>Manage Images for {selectedProductForImages.name}</DialogTitle>
              <DialogDescription>
                Add or remove product images. The first image with the lowest display order will be shown as the main product image.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-6 py-4">
              {/* Current Images Section */}
              <div>
                <h3 className="text-lg font-medium mb-2">Current Images</h3>
                {productImages.length === 0 ? (
                  <p className="text-muted-foreground italic">No additional images added yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {productImages.map((image) => (
                      <div key={image.id} className="border rounded-md p-3 relative group">
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 bg-white/80 hover:bg-white text-red-500"
                            onClick={() => setImageToDelete(image.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="relative aspect-square mb-2 overflow-hidden rounded-md">
                          <img 
                            src={image.imageUrl} 
                            alt={image.caption || `Product image ${image.id}`} 
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Display Order:</span>
                            <span className="text-sm">{image.displayOrder}</span>
                          </div>
                          {image.caption && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {image.caption}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Add New Image Section */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-4">Add New Image</h3>
                <div className="grid gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Image URL</label>
                      <input
                        type="text"
                        placeholder="https://example.com/image.jpg"
                        className="w-full p-2 border rounded-md"
                        value={newImageData.imageUrl}
                        onChange={(e) => setNewImageData({...newImageData, imageUrl: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Display Order</label>
                      <input
                        type="number"
                        min="0"
                        className="w-full p-2 border rounded-md"
                        value={newImageData.displayOrder}
                        onChange={(e) => setNewImageData({...newImageData, displayOrder: parseInt(e.target.value) || 0})}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1 block">Caption (Optional)</label>
                    <input
                      type="text"
                      placeholder="Brief description of the image"
                      className="w-full p-2 border rounded-md"
                      value={newImageData.caption}
                      onChange={(e) => setNewImageData({...newImageData, caption: e.target.value})}
                    />
                  </div>
                  
                  <div className="flex justify-start mt-2">
                    <Button onClick={addProductImage} className="flex items-center">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Image
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Image Uploader Section */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-4">Upload New Image</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload an image directly from your computer. The image will be stored on the server.
                </p>
                <ImageUploader
                  currentImageUrl=""
                  onImageUploaded={(imageUrl) => {
                    setNewImageData({
                      ...newImageData,
                      imageUrl
                    });
                    showNotification({
                      title: "Image Uploaded",
                      message: "Image uploaded successfully. Click 'Add Image' to associate it with this product.",
                      variant: "success"
                    });
                  }}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={closeImageManager}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Delete Image Confirmation Dialog */}
      {imageToDelete && (
        <AdminDeleteDialog
          title="Delete Image"
          description="Are you sure you want to delete this image? This action cannot be undone."
          onConfirm={() => deleteProductImage(imageToDelete)}
          onClose={() => setImageToDelete(null)}
          isOpen={!!imageToDelete}
        />
      )}

      {/* Category Management Dialog */}
      <Dialog open={showCategoryManager} onOpenChange={setShowCategoryManager}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Category Management</DialogTitle>
            <DialogDescription>
              Create and manage product categories to organize your chocolate catalog
            </DialogDescription>
          </DialogHeader>
          
          <CategoryManagementContent 
            onAddCategory={(category) => {
              setEditingCategory(null);
              handleAddCategory(category);
            }}
            onEditCategory={(category) => {
              setEditingCategory(category);
            }}
            onUpdateCategory={(category) => {
              handleUpdateCategory(category);
              setEditingCategory(null);
            }}
            onDeleteCategory={(categoryId) => {
              setCategoryToDelete(categoryId);
            }}
            editingCategory={editingCategory}
          />
          
          <DialogFooter>
            <Button 
              variant="outline"
              onClick={() => {
                setShowCategoryManager(false);
                setEditingCategory(null);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Badge Manager Dialog */}
      <Dialog open={showBadgeManager} onOpenChange={setShowBadgeManager}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Badge Management</DialogTitle>
            <DialogDescription>
              Assign badges to products and categories to highlight them in the storefront
            </DialogDescription>
          </DialogHeader>
          
          <BadgeManager 
            initialActiveTab="assign"
            refreshProducts={() => {
              // Force refresh of product data
              queryClient.invalidateQueries({ queryKey: ["/api/admin/products-with-reviews"] });
              queryClient.invalidateQueries({ queryKey: ["/api/products"] });
            }}
          />
          
          <DialogFooter className="mt-6">
            <Button 
              variant="outline" 
              onClick={() => setShowBadgeManager(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Confirm Delete Category Dialog */}
      {categoryToDelete && (
        <AdminDeleteDialog
          title="Delete Category"
          description="Are you sure you want to delete this category? This action cannot be undone."
          confirmLabel="Delete Category"
          cancelLabel="Cancel"
          onConfirm={() => {
            handleDeleteCategory(categoryToDelete);
            setCategoryToDelete(null);
          }}
          onClose={() => setCategoryToDelete(null)}
          isOpen={!!categoryToDelete}
        />
      )}
    </div>
  );
}

// Category Management Content Component
function CategoryManagementContent({ 
  onAddCategory, 
  onEditCategory, 
  onUpdateCategory, 
  onDeleteCategory,
  editingCategory
}: { 
  onAddCategory: (category: any) => void; 
  onEditCategory: (category: Category | null) => void; 
  onUpdateCategory: (category: any) => void; 
  onDeleteCategory: (categoryId: number) => void;
  editingCategory: Category | null;
}) {
  const { showNotification } = useAdminNotification();
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
    badge: null as "best-seller" | "premium" | "popular" | "new" | null
  });
  
  // Use a query to fetch categories
  const { data: categories = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/admin/categories"],
    queryFn: async () => {
      try {
        const response = await apiRequest("/api/admin/categories", "GET", null, {
          headers: getAdminAuthHeaders()
        });
        return response;
      } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
      }
    }
  });
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setCategoryFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Auto-generate slug from name (kept for backend compatibility)
    if (name === "name") {
      const slug = value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      setCategoryFormData(prev => ({
        ...prev,
        slug: slug
      }));
    }
  };
  
  // Effect to populate form when editing a category
  useEffect(() => {
    if (editingCategory) {
      setCategoryFormData({
        name: editingCategory.name,
        slug: editingCategory.slug,
        description: editingCategory.description || "",
        image: editingCategory.image || "",
        badge: editingCategory.badge || null
      });
    } else {
      setCategoryFormData({
        name: "",
        slug: "",
        description: "",
        image: "",
        badge: null
      });
    }
  }, [editingCategory]);
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!categoryFormData.name || !categoryFormData.slug) {
      showNotification({
        title: "Validation Error",
        message: "Category name and slug are required.",
        variant: "error"
      });
      return;
    }
    
    // If editing, update the category
    if (editingCategory) {
      onUpdateCategory({
        id: editingCategory.id,
        ...categoryFormData
      });
    } else {
      // Otherwise add a new category
      onAddCategory(categoryFormData);
    }
    
    // Reset form
    setCategoryFormData({
      name: "",
      slug: "",
      description: "",
      image: "",
      badge: null
    });
  };
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Form */}
        <div className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-md">
            <h3 className="font-medium text-lg">
              {editingCategory ? "Edit Category" : "Add New Category"}
            </h3>
            
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Category Name</label>
              <Input
                id="name"
                name="name"
                value={categoryFormData.name}
                onChange={handleInputChange}
                placeholder="e.g. Premium Chocolates"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <textarea
                id="description"
                name="description"
                value={categoryFormData.description}
                onChange={handleInputChange}
                placeholder="Optional category description"
                className="w-full p-2 rounded-md border min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Badge (Optional)</label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={categoryFormData.badge === "best-seller" ? "default" : "outline"}
                  className={categoryFormData.badge === "best-seller" ? "bg-amber-500 hover:bg-amber-600" : ""}
                  onClick={() => handleBadgeSelect(categoryFormData.badge === "best-seller" ? null : "best-seller", setCategoryFormData)}
                >
                  <Star className={`mr-2 h-4 w-4 ${categoryFormData.badge === "best-seller" ? "fill-white" : ""}`} />
                  Best Seller
                </Button>
                <Button
                  type="button"
                  variant={categoryFormData.badge === "premium" ? "default" : "outline"}
                  className={categoryFormData.badge === "premium" ? "bg-indigo-500 hover:bg-indigo-600" : ""}
                  onClick={() => handleBadgeSelect(categoryFormData.badge === "premium" ? null : "premium", setCategoryFormData)}
                >
                  <Crown className={`mr-2 h-4 w-4 ${categoryFormData.badge === "premium" ? "fill-white" : ""}`} />
                  Premium
                </Button>
                <Button
                  type="button"
                  variant={categoryFormData.badge === "popular" ? "default" : "outline"}
                  className={categoryFormData.badge === "popular" ? "bg-rose-500 hover:bg-rose-600" : ""}
                  onClick={() => handleBadgeSelect(categoryFormData.badge === "popular" ? null : "popular", setCategoryFormData)}
                >
                  <Heart className={`mr-2 h-4 w-4 ${categoryFormData.badge === "popular" ? "fill-white" : ""}`} />
                  Popular
                </Button>
                <Button
                  type="button"
                  variant={categoryFormData.badge === "new" ? "default" : "outline"}
                  className={categoryFormData.badge === "new" ? "bg-emerald-500 hover:bg-emerald-600" : ""}
                  onClick={() => handleBadgeSelect(categoryFormData.badge === "new" ? null : "new", setCategoryFormData)}
                >
                  <Sparkles className={`mr-2 h-4 w-4 ${categoryFormData.badge === "new" ? "fill-white" : ""}`} />
                  New
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {categoryFormData.badge ? (
                  <>Selected badge: <span className="font-medium">{categoryFormData.badge}</span></>
                ) : (
                  "Click a badge to apply it to this category, or leave unselected for no badge."
                )}
              </p>
            </div>
            
            {/* Hidden slug field that's auto-generated for backend compatibility */}
            <input 
              type="hidden"
              id="slug"
              name="slug"
              value={categoryFormData.slug}
            />
            
            {/* Hidden image field for backend compatibility */}
            <input 
              type="hidden"
              id="image"
              name="image"
              value={categoryFormData.image}
            />
            
            <div className="flex justify-end space-x-2 pt-2">
              {editingCategory && (
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setCategoryFormData({
                      name: "",
                      slug: "",
                      description: "",
                      image: "",
                      badge: null
                    });
                    // Pass null to clear editing state
                    onEditCategory(null);
                  }}
                >
                  Cancel
                </Button>
              )}
              <Button type="submit">
                {editingCategory ? "Update" : "Add"} Category
              </Button>
            </div>
          </form>
        </div>
        
        {/* Category List */}
        <div className="lg:col-span-2">
          <div className="border rounded-md overflow-hidden">
            <div className="p-4 bg-muted font-medium">Category List</div>
            {isLoading ? (
              <div className="p-4 text-center">Loading categories...</div>
            ) : categories.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-muted-foreground">No categories found</p>
                <p className="text-sm mt-2">Create your first category to organize your products</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category: Category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell className="max-w-[400px] truncate">
                        {category.description || <span className="text-muted-foreground italic">No description</span>}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditCategory(category)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteCategory(category.id)}
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Badge selector helper function
const handleBadgeSelect = (
  value: "best-seller" | "premium" | "popular" | "new" | null,
  setCategoryFormData: React.Dispatch<React.SetStateAction<{
    name: string;
    slug: string;
    description: string;
    image: string;
    badge: "best-seller" | "premium" | "popular" | "new" | null;
  }>>
) => {
  setCategoryFormData(prev => ({
    ...prev,
    badge: value
  }));
};

// Review Management Tab
function ReviewManagement() {
  const { showNotification } = useAdminNotification();
  const { toast } = useToast();
  const [reviewToDelete, setReviewToDelete] = useState<{id: number, productId: number} | null>(null);
  
  // This will be populated by reviews from the backend
  // Each review now has a productName field from the server
  
  // Fetch all reviews
  const { data: reviews = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/admin/reviews"],
    queryFn: async () => {
      try {
        return await apiRequest("/api/admin/reviews", "GET", null, {
          headers: getAdminAuthHeaders()
        }) as Review[];
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
        return [];
      }
    }
  });

  const handleDeleteReview = async (id: number, productId: number) => {
    try {
      await apiRequest(`/api/admin/reviews/${id}`, "DELETE", null, {
        headers: getAdminAuthHeaders()
      });
      
      showNotification({
        title: "Review Deleted",
        message: "The review has been deleted successfully.",
        variant: "success",
        position: "top-right"
      });
      
      // Refetch all reviews for the admin panel
      refetch();
      
      // Create a reverse mapping from numeric product IDs to string IDs
      const numericToStringProductId: Record<number, string> = {
        1: 'classic',
        2: 'assorted',
        3: 'caramel',
        4: 'cereal'
      };
      
      // Get the string product ID
      const stringProductId = numericToStringProductId[productId];
      
      // Invalidate the specific product's reviews cache to update product pages
      if (stringProductId) {
        queryClient.invalidateQueries({ queryKey: [`product-reviews-${stringProductId}`] });
        // Also invalidate any product details that might show review counts/ratings
        queryClient.invalidateQueries({ queryKey: [`product-${stringProductId}`] });
      }
      
      // Invalidate general product listings that might show ratings
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
    } catch (error) {
      console.error("Error deleting review:", error);
      showNotification({
        title: "Error",
        message: "Failed to delete review. Please try again.",
        variant: "error",
        position: "top-right"
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Review Management</h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Customer Reviews</CardTitle>
          <CardDescription>Manage product reviews from customers</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No reviews found.
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Comment</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.map((review: Review) => (
                    <TableRow key={review.id}>
                      <TableCell>
                        {review.productName || `Product #${review.productId}`}
                      </TableCell>
                      <TableCell>
                        {review.userName || `User #${review.userId}`}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          <span>{review.rating.toFixed(1)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {review.comment}
                      </TableCell>
                      <TableCell>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => setReviewToDelete({ id: review.id, productId: review.productId })}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
      
      {/* Delete Confirmation Dialog */}
      {reviewToDelete && (
        <AdminDeleteDialog
          title="Delete Review"
          description="Are you sure you want to delete this review? This action cannot be undone."
          isOpen={reviewToDelete !== null}
          onConfirm={() => {
            if (reviewToDelete) {
              handleDeleteReview(reviewToDelete.id, reviewToDelete.productId);
            }
          }}
          confirmLabel="Delete Review"
          cancelLabel="Cancel"
          onClose={() => setReviewToDelete(null)}
        />
      )}
    </div>
  );
}

// Order Management Tab
function OrderManagement() {
  const { showNotification } = useAdminNotification();
  const { toast } = useToast();
  
  // Fetch all orders
  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/admin/orders"],
    queryFn: async () => {
      try {
        return await apiRequest("/api/admin/orders", "GET", null, {
          headers: getAdminAuthHeaders()
        }) as Order[];
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        return [];
      }
    }
  });

  const handleUpdateOrderStatus = async (id: number, status: string) => {
    try {
      await apiRequest(`/api/admin/orders/${id}/status`, "PUT", { status }, {
        headers: getAdminAuthHeaders()
      });
      showNotification({
        title: "Order Updated",
        message: `Order status has been updated to ${status}.`,
        variant: "success",
        position: "top-right"
      });
      refetch();
    } catch (error) {
      console.error("Error updating order status:", error);
      showNotification({
        title: "Error",
        message: "Failed to update order status. Please try again.",
        variant: "error",
        position: "top-right"
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Order Management</h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>Manage customer orders</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No orders found.
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order: Order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>User #{order.userId}</TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>${(order.totalAmount / 100).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            order.status === "delivered" 
                              ? "bg-green-500" 
                              : order.status === "processing" 
                              ? "bg-blue-500"
                              : order.status === "cancelled"
                              ? "bg-red-500"
                              : undefined
                          }
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <select
                          className="px-2 py-1 rounded-md border"
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Category Management Tab
function CategoryManagement() {
  const { toast } = useToast();
  const { showNotification } = useAdminNotification();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image: null as string | null,
  });

  // Fetch all categories
  const { data: categories = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/admin/categories"],
    queryFn: async () => {
      try {
        return await apiRequest("/api/admin/categories", "GET", null, {
          headers: getAdminAuthHeaders()
        }) as Category[];
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        return [];
      }
    },
    refetchInterval: 5000
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === "name" && formData.slug === "" && !editingCategory) {
      // Auto-generate slug from name (if user hasn't manually entered a slug)
      const generatedSlug = value.toLowerCase()
        .replace(/[^\w\s-]/g, "") // Remove special chars
        .replace(/\s+/g, "-")     // Replace spaces with hyphens
        .replace(/-+/g, "-");     // Replace multiple hyphens with single one
      
      setFormData({ ...formData, name: value, slug: generatedSlug });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImageUploaded = (imageUrl: string) => {
    setFormData({ ...formData, image: imageUrl });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      image: null,
    });
    setEditingCategory(null);
    setIsAddingCategory(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCategory) {
        // Update existing category
        await apiRequest(`/api/admin/categories/${editingCategory.id}`, "PUT", formData, {
          headers: getAdminAuthHeaders()
        });
        showNotification({
          title: "Category Updated",
          message: `Category "${formData.name}" has been updated.`,
          variant: "success",
          position: "top-right"
        });
      } else {
        // Create new category
        await apiRequest("/api/admin/categories", "POST", formData, {
          headers: getAdminAuthHeaders()
        });
        showNotification({
          title: "Category Created",
          message: `New category "${formData.name}" has been created.`,
          variant: "success",
          position: "top-right"
        });
      }
      
      // Invalidate the cache for both admin categories and all products
      queryClient.invalidateQueries({ queryKey: ['/api/admin/categories'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      
      resetForm();
      refetch();
    } catch (error) {
      console.error("Error saving category:", error);
      showNotification({
        title: "Error",
        message: "Failed to save category. Please try again.",
        variant: "error",
        position: "top-right"
      });
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      image: category.image,
    });
    setIsAddingCategory(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await apiRequest(`/api/admin/categories/${id}`, "DELETE", null, {
        headers: getAdminAuthHeaders()
      });
      
      // Invalidate the cache for both admin categories and all products
      queryClient.invalidateQueries({ queryKey: ['/api/admin/categories'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      
      showNotification({
        title: "Category Deleted",
        message: "The category has been deleted successfully.",
        variant: "success",
        position: "top-right"
      });
      setCategoryToDelete(null);
      refetch();
    } catch (error) {
      console.error("Error deleting category:", error);
      showNotification({
        title: "Error",
        message: "Failed to delete category. Please try again.",
        variant: "error",
        position: "top-right"
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Category Management</h2>
        <Button onClick={() => setIsAddingCategory(!isAddingCategory)}>
          {isAddingCategory ? "Cancel" : (
            <>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Category
            </>
          )}
        </Button>
      </div>
      
      {isAddingCategory ? (
        <Card>
          <CardHeader>
            <CardTitle>{editingCategory ? "Edit Category" : "Create New Category"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="font-medium">Category Name</label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Dark Chocolate" 
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="slug" className="font-medium">
                    Category Slug
                    <span className="ml-1 text-xs text-muted-foreground">(for URLs)</span>
                  </label>
                  <Input 
                    id="slug" 
                    name="slug" 
                    value={formData.slug} 
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. dark-chocolate" 
                  />
                  <p className="text-xs text-muted-foreground">
                    Automatically generated from name. Use only lowercase letters, numbers, and hyphens.
                  </p>
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="description" className="font-medium">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Category description"
                    className="w-full p-2 border rounded-md h-32"
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <label className="font-medium">Category Image</label>
                  <div className="flex items-start space-x-4">
                    <div className="w-32 h-32 border rounded-md overflow-hidden flex items-center justify-center bg-muted">
                      {formData.image ? (
                        <img 
                          src={formData.image} 
                          alt="Category preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-10 w-10 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <ImageUploader 
                        currentImageUrl={formData.image || ""}
                        onImageUploaded={handleImageUploaded}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Recommended size: 800x600 pixels (landscape orientation)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingCategory ? "Update Category" : "Create Category"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-card rounded-md shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Image</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    <div className="flex justify-center">
                      <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">Loading categories...</div>
                  </TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    <div className="text-muted-foreground">No categories found</div>
                    <Button 
                      variant="link" 
                      onClick={() => setIsAddingCategory(true)}
                      className="mt-2"
                    >
                      Create your first category
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-mono">{category.id}</TableCell>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="font-mono text-sm">{category.slug}</TableCell>
                    <TableCell>
                      {category.description ? (
                        <span className="line-clamp-1">{category.description}</span>
                      ) : (
                        <span className="text-muted-foreground italic text-sm">No description</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {category.image ? (
                        <div className="h-10 w-10 rounded overflow-hidden">
                          <img 
                            src={category.image} 
                            alt={category.name} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic text-sm">No image</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(category)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCategoryToDelete(category.id)}
                          className="text-destructive hover:text-destructive/90"
                        >
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Delete confirmation dialog */}
      <AdminDeleteDialog
        title="Delete Category"
        description="Are you sure you want to delete this category? This action cannot be undone and may affect products assigned to this category."
        isOpen={categoryToDelete !== null}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={() => categoryToDelete !== null && handleDelete(categoryToDelete)}
        confirmLabel="Delete Category"
      />
    </div>
  );
}

// Analytics Tab
function AnalyticsDashboard() {
  const { showNotification } = useAdminNotification();
  const { data: productStats = [], isLoading } = useQuery({
    queryKey: ["/api/admin/statistics/products"],
    queryFn: async () => {
      try {
        return await apiRequest("/api/admin/statistics/products", "GET", null, {
          headers: getAdminAuthHeaders()
        }) as ProductStatistics[];
      } catch (error) {
        console.error("Failed to fetch product statistics:", error);
        return [];
      }
    }
  });

  // Calculate some basic statistics
  const totalSales = productStats.reduce((sum: number, product: ProductStatistics) => sum + product.totalSales, 0);
  const totalRevenue = productStats.reduce((sum: number, product: ProductStatistics) => sum + product.revenue, 0);
  const totalReviews = productStats.reduce((sum: number, product: ProductStatistics) => sum + product.reviewCount, 0);
  
  // Find top-selling product
  const topSellingProduct = productStats.length > 0 
    ? productStats.reduce((top: ProductStatistics, product: ProductStatistics) => 
        product.totalSales > top.totalSales ? product : top, 
        productStats[0]
      )
    : null;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSales}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalRevenue / 100).toFixed(2)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReviews}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Top Selling Product
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {topSellingProduct ? topSellingProduct.name : "None"}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Product Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Performance</CardTitle>
          <CardDescription>Sales and revenue by product</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading statistics...</div>
          ) : productStats.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No product statistics available.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Sales</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Reviews</TableHead>
                  <TableHead className="text-right">Avg Rating</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productStats.map((product: ProductStatistics) => (
                  <TableRow key={product.productId}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="text-right">{product.totalSales}</TableCell>
                    <TableCell className="text-right">${(product.revenue / 100).toFixed(2)}</TableCell>
                    <TableCell className="text-right">{product.reviewCount}</TableCell>
                    <TableCell className="text-right">
                      {product.averageRating.toFixed(1)}
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 inline ml-1" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

  const { toast } = useToast();
  const { showNotification } = useAdminNotification();
  const [activeSection, setActiveSection] = useState<string>("reviews");
  
  // Reviews Display Section
  const [reviewsSection, setReviewsSection] = useState({
    enabled: true,
    title: "What Our Customers Say",
    subtitle: "Discover why chocolate lovers choose Sweet Moment",
    displayCount: 3
  });
  
  // Featured Products Section
  const [featuredSection, setFeaturedSection] = useState({
    enabled: true,
    title: "Featured Products",
    subtitle: "Our handpicked selection of luxurious chocolates",
    productIds: [] as string[]
  });
  
  // Hero Image Section
  const [heroSection, setHeroSection] = useState({
    title: "Luxury Dubai Chocolates",
    subtitle: "Handcrafted with the finest ingredients",
    buttonText: "Shop Now",
    buttonLink: "/menu",
    imageUrl: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80"
  });
  
  // Products for featured selection
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ["/api/products"],
    queryFn: async () => {
      try {
        const response = await apiRequest("/api/products", "GET");
        return response as Product[];
      } catch (error) {
        console.error("Error fetching products:", error);
        return [];
      }
    }
  });
  
  // Load existing site customization data (if available)
  const { data: siteConfig, isLoading: isLoadingSiteConfig } = useQuery({
    queryKey: ["/api/admin/site-customization"],
    queryFn: async () => {
      try {
        return await apiRequest("/api/admin/site-customization", "GET", null, {
          headers: getAdminAuthHeaders()
        });
      } catch (error) {
        console.error("Error fetching site customization:", error);
        // Return default configuration if unable to fetch
        return {
          reviewsSection,
          featuredSection,
          heroSection
        };
      }
    },
    onSuccess: (data) => {
      // Initialize state with data from server
      if (data?.reviewsSection) {
        setReviewsSection(data.reviewsSection);
      }
      if (data?.featuredSection) {
        setFeaturedSection(data.featuredSection);
      }
      if (data?.heroSection) {
        setHeroSection(data.heroSection);
      }
    }
  });
  
  // Save site customization changes
  const handleSaveChanges = async () => {
    try {
      const payload = {
        reviewsSection,
        featuredSection,
        heroSection
      };
      
      await apiRequest("/api/admin/site-customization", "POST", payload, {
        headers: getAdminAuthHeaders()
      });
      
      showNotification({
        title: "Changes Saved",
        message: "Your site customization changes have been saved successfully.",
        variant: "success"
      });
      
      // Refresh site data
      queryClient.invalidateQueries({ queryKey: ["/api/admin/site-customization"] });
    } catch (error) {
      console.error("Error saving site customization:", error);
      showNotification({
        title: "Error",
        message: "Failed to save changes. Please try again.",
        variant: "error"
      });
    }
  };
  
  // Handle featured products selection
  const handleFeaturedProductChange = (productId: string, checked: boolean) => {
    if (checked) {
      setFeaturedSection({
        ...featuredSection,
        productIds: [...featuredSection.productIds, productId]
      });
    } else {
      setFeaturedSection({
        ...featuredSection,
        productIds: featuredSection.productIds.filter(id => id !== productId)
      });
    }
  };
  
  // Handle hero image upload
  const handleHeroImageUpload = (imageUrl: string) => {
    setHeroSection({
      ...heroSection,
      imageUrl
    });
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Site Customization</CardTitle>
          <CardDescription>
            Customize how your website appears to customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeSection} onValueChange={setActiveSection}>
            <TabsList className="mb-4">
              <TabsTrigger value="reviews">Reviews Display</TabsTrigger>
              <TabsTrigger value="featured">Featured Products</TabsTrigger>
              <TabsTrigger value="hero">Hero Image</TabsTrigger>
            </TabsList>
            
            {/* Reviews Display Section */}
            <TabsContent value="reviews" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="reviews-enabled"
                    checked={reviewsSection.enabled}
                    onCheckedChange={(checked) => {
                      setReviewsSection({...reviewsSection, enabled: checked});
                    }}
                  />
                  <label htmlFor="reviews-enabled" className="text-sm font-medium">
                    Display reviews section on homepage
                  </label>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="reviews-title" className="text-sm font-medium">Section Title</label>
                  <Input
                    id="reviews-title"
                    value={reviewsSection.title}
                    onChange={(e) => setReviewsSection({...reviewsSection, title: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="reviews-subtitle" className="text-sm font-medium">Section Subtitle</label>
                  <Input
                    id="reviews-subtitle"
                    value={reviewsSection.subtitle}
                    onChange={(e) => setReviewsSection({...reviewsSection, subtitle: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="reviews-count" className="text-sm font-medium">Number of Reviews to Display</label>
                  <Input
                    id="reviews-count"
                    type="number"
                    min={1}
                    max={6}
                    value={reviewsSection.displayCount}
                    onChange={(e) => setReviewsSection({...reviewsSection, displayCount: parseInt(e.target.value) || 3})}
                  />
                  <p className="text-xs text-muted-foreground">
                    The most recent reviews will be displayed (maximum 6)
                  </p>
                </div>
              </div>
            </TabsContent>
            
            {/* Featured Products Section */}
            <TabsContent value="featured" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured-enabled"
                    checked={featuredSection.enabled}
                    onCheckedChange={(checked) => {
                      setFeaturedSection({...featuredSection, enabled: checked});
                    }}
                  />
                  <label htmlFor="featured-enabled" className="text-sm font-medium">
                    Display featured products section on homepage
                  </label>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="featured-title" className="text-sm font-medium">Section Title</label>
                  <Input
                    id="featured-title"
                    value={featuredSection.title}
                    onChange={(e) => setFeaturedSection({...featuredSection, title: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="featured-subtitle" className="text-sm font-medium">Section Subtitle</label>
                  <Input
                    id="featured-subtitle"
                    value={featuredSection.subtitle}
                    onChange={(e) => setFeaturedSection({...featuredSection, subtitle: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Select Featured Products</h3>
                  <div className="border rounded-md p-4 max-h-72 overflow-y-auto">
                    {isLoadingProducts ? (
                      <p>Loading products...</p>
                    ) : (
                      <div className="space-y-2">
                        {products.map((product) => (
                          <div key={product.id} className="flex items-center space-x-2 hover:bg-muted/50 p-1 rounded-md">
                            <Checkbox 
                              id={`product-${product.id}`}
                              checked={featuredSection.productIds.includes(product.id)}
                              onCheckedChange={(checked) => handleFeaturedProductChange(product.id, checked === true)}
                            />
                            <label htmlFor={`product-${product.id}`} className="text-sm cursor-pointer font-medium flex-1">
                              {product.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Select the products that will be featured on the homepage
                  </p>
                </div>
              </div>
            </TabsContent>
            
            {/* Hero Image Section */}
            <TabsContent value="hero" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="hero-title" className="text-sm font-medium">Hero Title</label>
                    <Input
                      id="hero-title"
                      value={heroSection.title}
                      onChange={(e) => setHeroSection({...heroSection, title: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="hero-subtitle" className="text-sm font-medium">Hero Subtitle</label>
                    <Input
                      id="hero-subtitle"
                      value={heroSection.subtitle}
                      onChange={(e) => setHeroSection({...heroSection, subtitle: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="hero-button-text" className="text-sm font-medium">Button Text</label>
                    <Input
                      id="hero-button-text"
                      value={heroSection.buttonText}
                      onChange={(e) => setHeroSection({...heroSection, buttonText: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="hero-button-link" className="text-sm font-medium">Button Link</label>
                    <Input
                      id="hero-button-link"
                      value={heroSection.buttonLink}
                      onChange={(e) => setHeroSection({...heroSection, buttonLink: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Hero Background Image</label>
                    <ImageUploader
                      currentImageUrl={heroSection.imageUrl}
                      onImageUploaded={handleHeroImageUpload}
                    />
                  </div>
                  
                  <div className="mt-4 p-4 border rounded-md">
                    <h4 className="text-sm font-medium mb-2">Preview</h4>
                    <div 
                      className="relative w-full h-40 rounded-md overflow-hidden bg-cover bg-center"
                      style={{backgroundImage: `url(${heroSection.imageUrl})`}}
                    >
                      <div className="absolute inset-0 bg-black/30 flex flex-col justify-center items-center text-white p-4">
                        <h3 className="text-xl font-bold text-center">{heroSection.title}</h3>
                        <p className="text-sm text-center mt-1">{heroSection.subtitle}</p>
                        <button className="mt-3 bg-white text-black px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-100">
                          {heroSection.buttonText}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            onClick={handleSaveChanges} 
            disabled={isLoadingSiteConfig}
          >
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function AdminPanelContent() {
  const [, navigate] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { showNotification } = useAdminNotification();
  const { toast } = useToast();
  
  // Check authentication on component mount
  useEffect(() => {
    // For development, we'll just check if there's a flag in localStorage
    // In production, this would verify with the server if the user is authenticated
    const isAdminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    
    if (!isAdminLoggedIn) {
      showNotification({
        title: "Authentication Required",
        message: "Please log in to access the admin panel",
        variant: "error",
        position: "top-center"
      });
      navigate('/admin/login');
      return;
    }
    
    setIsAuthenticated(true);
  }, [navigate, showNotification]);
  
  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    showNotification({
      title: "Logged Out",
      message: "You have been logged out of the admin panel",
      variant: "info",
      position: "top-center"
    });
    navigate('/admin/login');
  };
  
  if (!isAuthenticated) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  return (
    <div className="container px-4 md:px-6 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <Button 
          variant="outline" 
          className="flex items-center" 
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Log out
        </Button>
      </div>
      
      <Tabs defaultValue="discounts">
        <ScrollArea className="w-full">
          <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 mb-6 w-full">
            <TabsTrigger value="discounts" className="flex items-center">
              <Tag className="h-4 w-4 mr-2" />
              <span className="whitespace-nowrap">Discounts</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center">
              <Package className="h-4 w-4 mr-2" />
              <span className="whitespace-nowrap">Products</span>
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center">
              <Star className="h-4 w-4 mr-2" />
              <span className="whitespace-nowrap">Reviews</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center">
              <ShoppingBag className="h-4 w-4 mr-2" />
              <span className="whitespace-nowrap">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="site-customization" className="flex items-center">
              <FolderTree className="h-4 w-4 mr-2" />
              <span className="whitespace-nowrap">Site Customization</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              <span className="whitespace-nowrap">Analytics</span>
            </TabsTrigger>
          </TabsList>
        </ScrollArea>
        
        <TabsContent value="discounts">
          <DiscountManagement />
        </TabsContent>
        
        <TabsContent value="products">
          <ProductManagement />
        </TabsContent>
        
        <TabsContent value="reviews">
          <ReviewManagement />
        </TabsContent>
        
        <TabsContent value="orders">
          <OrderManagement />
        </TabsContent>
        
        <TabsContent value="analytics">
          <AnalyticsDashboard />
        </TabsContent>
        
        <TabsContent value="site-customization">
          <SiteCustomizationContent />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Badge types and color themes
interface BadgeTheme {
  id: string;
  name: string;
  background: string;
  hoverBackground: string;
  icon: string;
  color: string;
  customColor?: string; // Hexadecimal color value for custom color
}

// Badge Manager Dialog Component
interface BadgeManagerProps {
  initialActiveTab?: "assign" | "edit";
  refreshProducts?: () => void;
}

function BadgeManager({ initialActiveTab = "assign", refreshProducts }: BadgeManagerProps) {
  const { showNotification } = useAdminNotification();
  const [activeTab, setActiveTab] = useState<"assign" | "edit">(initialActiveTab);
  
  // Color theme presets for badges
  const [badgeThemes, setBadgeThemes] = useState<BadgeTheme[]>([
    { id: "best-seller", name: "Best Seller", background: "bg-amber-500", hoverBackground: "hover:bg-amber-600", icon: "Crown", color: "text-white" },
    { id: "premium", name: "Premium", background: "bg-purple-600", hoverBackground: "hover:bg-purple-700", icon: "Sparkles", color: "text-white" },
    { id: "popular", name: "Popular", background: "bg-red-500", hoverBackground: "hover:bg-red-600", icon: "Heart", color: "text-white" },
    { id: "new", name: "New", background: "bg-green-500", hoverBackground: "hover:bg-green-600", icon: "Star", color: "text-white" }
  ]);
  
  // State for adding/editing badge
  const [editingBadge, setEditingBadge] = useState<BadgeTheme | null>(null);
  const [newBadgeForm, setNewBadgeForm] = useState<BadgeTheme>({
    id: "",
    name: "",
    background: "bg-blue-500",
    hoverBackground: "hover:bg-blue-600",
    icon: "Award",
    color: "text-white"
  });
  
  // Color theme presets
  const colorPresets = [
    { name: "Gold", background: "bg-amber-500", hoverBackground: "hover:bg-amber-600", color: "text-white" },
    { name: "Royal Purple", background: "bg-purple-600", hoverBackground: "hover:bg-purple-700", color: "text-white" },
    { name: "Ruby Red", background: "bg-red-500", hoverBackground: "hover:bg-red-600", color: "text-white" },
    { name: "Emerald", background: "bg-green-500", hoverBackground: "hover:bg-green-600", color: "text-white" },
    { name: "Sky Blue", background: "bg-blue-500", hoverBackground: "hover:bg-blue-600", color: "text-white" },
    { name: "Chocolate", background: "bg-amber-800", hoverBackground: "hover:bg-amber-900", color: "text-white" },
    { name: "Luxury Gold", background: "bg-yellow-600", hoverBackground: "hover:bg-yellow-700", color: "text-white" },
    { name: "Royal Blue", background: "bg-indigo-600", hoverBackground: "hover:bg-indigo-700", color: "text-white" },
    { name: "Rose Pink", background: "bg-pink-500", hoverBackground: "hover:bg-pink-600", color: "text-white" },
    { name: "Teal", background: "bg-teal-500", hoverBackground: "hover:bg-teal-600", color: "text-white" }
  ];
  
  // Icons available for badges
  const iconOptions = [
    { name: "Crown", component: Crown },
    { name: "Star", component: Star },
    { name: "Heart", component: Heart },
    { name: "Sparkles", component: Sparkles },
    { name: "Award", component: Award },
    { name: "Zap", component: Zap },
    { name: "Gift", component: Gift },
    { name: "Check", component: CheckCircle },
    { name: "Flame", component: Flame },
    { name: "Trophy", component: Trophy },
  ];
  
  // Fetch all products to manage badges
  const { data: productsWithBadges = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ["/api/admin/products-with-reviews"],
    queryFn: async () => {
      try {
        return await apiRequest("/api/admin/products-with-reviews", "GET", null, {
          headers: getAdminAuthHeaders()
        }) as Product[];
      } catch (error) {
        console.error("Error fetching products:", error);
        return [];
      }
    }
  });
  

  
  // Handle product badge updates
  const handleProductBadgeChange = async (productId: string, badge: string | null) => {
    try {
      await apiRequest(`/api/admin/products/${productId}`, "PATCH", { badge }, {
        headers: getAdminAuthHeaders()
      });
      
      showNotification({
        title: "Badge Updated",
        message: `Product badge has been updated successfully.`,
        variant: "success"
      });
      
      // Refresh product data
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products-with-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      
      // Use refreshProducts callback if provided
      if (refreshProducts) {
        refreshProducts();
      }
    } catch (error) {
      console.error("Error updating product badge:", error);
      showNotification({
        title: "Error",
        message: "Failed to update product badge. Please try again.",
        variant: "error"
      });
    }
  };
  

  
  // Handle adding a new badge theme
  const handleAddBadge = () => {
    // Validate form
    if (!newBadgeForm.id || !newBadgeForm.name) {
      showNotification({
        title: "Validation Error",
        message: "Badge ID and name are required",
        variant: "error"
      });
      return;
    }
    
    // Convert ID to lowercase and remove spaces
    const sanitizedId = newBadgeForm.id.toLowerCase().replace(/\s+/g, "-");
    
    // Check if ID already exists
    if (!editingBadge && badgeThemes.some(badge => badge.id === sanitizedId)) {
      showNotification({
        title: "Validation Error",
        message: "A badge with this ID already exists",
        variant: "error"
      });
      return;
    }
    
    if (editingBadge) {
      // Update existing badge
      const updatedThemes = badgeThemes.map(badge => 
        badge.id === editingBadge.id ? {...newBadgeForm, id: badge.id} : badge
      );
      setBadgeThemes(updatedThemes);
      showNotification({
        title: "Badge Updated",
        message: `Badge "${newBadgeForm.name}" has been updated`,
        variant: "success"
      });
    } else {
      // Add new badge
      setBadgeThemes([...badgeThemes, {...newBadgeForm, id: sanitizedId}]);
      showNotification({
        title: "Badge Added",
        message: `New badge "${newBadgeForm.name}" has been added`,
        variant: "success"
      });
    }
    
    // Refresh products to update badges display
    if (refreshProducts) {
      refreshProducts();
    }
    
    // Reset form
    setNewBadgeForm({
      id: "",
      name: "",
      background: "bg-blue-500",
      hoverBackground: "hover:bg-blue-600",
      icon: "Award",
      color: "text-white"
    });
    setEditingBadge(null);
  };
  
  // Handle editing an existing badge
  const handleEditBadge = (badge: BadgeTheme) => {
    setEditingBadge(badge);
    // Check if the badge uses a custom color
    let customColor = undefined;
    if (badge.background.startsWith('bg-[') && badge.background.endsWith(']')) {
      // Extract the hex color from the bg-[#hexcolor] format
      customColor = badge.background.substring(4, badge.background.length - 1);
    }
    
    setNewBadgeForm({
      ...badge,
      customColor
    });
  };
  
  // Handle deleting a badge theme
  const handleDeleteBadge = (badgeId: string) => {
    // Check if the badge is in use by any products
    const badgeInUse = productsWithBadges.some(product => product.badge === badgeId);
    
    if (badgeInUse) {
      showNotification({
        title: "Cannot Delete",
        message: "This badge is currently assigned to products. Remove all product assignments first.",
        variant: "error"
      });
      return;
    }
    
    const updatedThemes = badgeThemes.filter(badge => badge.id !== badgeId);
    setBadgeThemes(updatedThemes);
    
    // Refresh products to update badges display
    if (refreshProducts) {
      refreshProducts();
    }
    
    showNotification({
      title: "Badge Deleted",
      message: "The badge has been deleted successfully",
      variant: "success"
    });
  };
  
  // Apply a color preset to the form
  const applyColorPreset = (preset: any) => {
    setNewBadgeForm({
      ...newBadgeForm,
      background: preset.background,
      hoverBackground: preset.hoverBackground,
      color: preset.color,
      // Clear any custom color when applying a preset
      customColor: undefined
    });
  };
  
  const getIconComponent = (iconName: string) => {
    const icon = iconOptions.find(i => i.name === iconName);
    return icon ? icon.component : Award;
  };
  
  // Utility function to determine if a color is dark (for text contrast)
  const isColorDark = (hexColor: string): boolean => {
    // Handle different hex formats
    const hex = hexColor.replace('#', '');
    
    // Convert hex to RGB
    let r = 0, g = 0, b = 0;
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length >= 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }
    
    // Calculate luminance (perceived brightness)
    // Using the formula from WCAG 2.0: https://www.w3.org/TR/WCAG20-TECHS/G17.html
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return true if the color is dark (luminance is low)
    return luminance < 0.5;
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "assign" | "edit")} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assign">Assign Badges</TabsTrigger>
          <TabsTrigger value="edit">Edit Badges</TabsTrigger>
        </TabsList>
        
        <TabsContent value="assign" className="space-y-6 pt-4">
          <div>
            <h3 className="text-lg font-semibold mb-4">Product Badges</h3>
            <div className="grid grid-cols-1 gap-4">
              {isLoadingProducts ? (
                <p>Loading products...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Current Badge</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {productsWithBadges.map((product) => (
                        <motion.tr 
                          key={product.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="group"
                        >
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>
                            <AnimatePresence mode="wait">
                              {product.badge ? (
                                (() => {
                                  const badgeTheme = badgeThemes.find(b => b.id === product.badge);
                                  if (!badgeTheme) return <motion.div key="no-badge">product.badge</motion.div>;
                                  
                                  if (badgeTheme.background.startsWith('bg-[')) {
                                    const bgColor = badgeTheme.background.substring(4, badgeTheme.background.length - 1);
                                    return (
                                      <motion.div 
                                        key={badgeTheme.id}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="px-2 py-1 rounded-full text-sm font-medium inline-flex items-center"
                                        style={{ 
                                          backgroundColor: bgColor,
                                          color: badgeTheme.color === 'text-white' ? 'white' : 'black'
                                        }}
                                        whileHover={{ scale: 1.05 }}
                                      >
                                        {badgeTheme.name}
                                      </motion.div>
                                    );
                                  } else {
                                    return (
                                      <motion.div
                                        key={badgeTheme.id}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        whileHover={{ scale: 1.05 }}
                                      >
                                        <Badge className={badgeTheme.background}>
                                          {badgeTheme.name}
                                        </Badge>
                                      </motion.div>
                                    );
                                  }
                                })()
                              ) : (
                                <motion.div 
                                  key="no-badge"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 0.7 }}
                                  exit={{ opacity: 0 }}
                                >
                                  None
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-2">
                              {badgeThemes.map(badge => {
                                const IconComponent = getIconComponent(badge.icon);
                                
                                if (badge.background.startsWith('bg-[')) {
                                  const bgColor = badge.background.substring(4, badge.background.length - 1);
                                  return (
                                    <motion.button
                                      key={badge.id}
                                      type="button"
                                      className={`inline-flex items-center justify-center rounded-md h-8 w-8 border ${product.badge === badge.id ? 'border-black dark:border-white' : 'border-input'}`}
                                      style={{ 
                                        backgroundColor: product.badge === badge.id ? bgColor : 'transparent',
                                        color: product.badge === badge.id && badge.color === 'text-white' ? 'white' : 'black'
                                      }}
                                      onClick={() => handleProductBadgeChange(product.id, product.badge === badge.id ? null : badge.id)}
                                      title={badge.name}
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      <IconComponent className="h-4 w-4" />
                                    </motion.button>
                                  );
                                } else {
                                  return (
                                    <motion.div
                                      key={badge.id}
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      <Button
                                        variant={product.badge === badge.id ? "default" : "outline"}
                                        size="sm"
                                        className={product.badge === badge.id ? `${badge.background} ${badge.hoverBackground}` : ""}
                                        onClick={() => handleProductBadgeChange(product.id, product.badge === badge.id ? null : badge.id)}
                                        title={badge.name}
                                      >
                                        <IconComponent className={`h-4 w-4 ${product.badge === badge.id ? "fill-white" : ""}`} />
                                      </Button>
                                    </motion.div>
                                  );
                                }
                              })}
                              {product.badge && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.8 }}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-red-500 text-red-500 hover:bg-red-50"
                                    onClick={() => handleProductBadgeChange(product.id, null)}
                                    title="Remove Badge"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </motion.div>
                              )}
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              )}
            </div>
          </div>


        </TabsContent>
        
        <TabsContent value="edit" className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Badge Form */}
            <motion.div 
              className="space-y-4 border p-4 rounded-md md:col-span-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.h3 
                className="font-medium text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {editingBadge ? `Edit Badge: ${editingBadge.name}` : "Create New Badge"}
              </motion.h3>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <label htmlFor="badgeName" className="text-sm font-medium">Badge Name</label>
                  <Input
                    id="badgeName"
                    placeholder="e.g. Limited Edition"
                    value={newBadgeForm.name}
                    onChange={(e) => setNewBadgeForm({...newBadgeForm, name: e.target.value, id: !editingBadge ? e.target.value.toLowerCase().replace(/\s+/g, "-") : newBadgeForm.id})}
                  />
                </div>
                
                {/* Removed the badge ID section as it's now auto-generated */}
                
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="text-sm font-medium">Badge Icon</label>
                  <div className="grid grid-cols-5 gap-2">
                    {iconOptions.map((icon, index) => {
                      const IconComp = icon.component;
                      
                      if (newBadgeForm.customColor && newBadgeForm.icon === icon.name) {
                        return (
                          <motion.button
                            key={icon.name}
                            type="button"
                            className="inline-flex items-center justify-center rounded-md h-8 w-8 border border-black dark:border-white"
                            style={{ 
                              backgroundColor: newBadgeForm.customColor,
                              color: isColorDark(newBadgeForm.customColor) ? 'white' : 'black'
                            }}
                            onClick={() => setNewBadgeForm({...newBadgeForm, icon: icon.name})}
                            title={icon.name}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.05 * index, duration: 0.2 }}
                          >
                            <IconComp className="h-4 w-4" />
                          </motion.button>
                        );
                      } else if (newBadgeForm.customColor) {
                        return (
                          <motion.button
                            key={icon.name}
                            type="button"
                            className="inline-flex items-center justify-center rounded-md h-8 w-8 border border-input"
                            onClick={() => setNewBadgeForm({...newBadgeForm, icon: icon.name})}
                            title={icon.name}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.05 * index, duration: 0.2 }}
                          >
                            <IconComp className="h-4 w-4" />
                          </motion.button>
                        );
                      } else {
                        return (
                          <motion.div
                            key={icon.name}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.05 * index, duration: 0.2 }}
                          >
                            <Button
                              type="button"
                              variant={newBadgeForm.icon === icon.name ? "default" : "outline"}
                              size="sm"
                              className={newBadgeForm.icon === icon.name ? `${newBadgeForm.background} ${newBadgeForm.hoverBackground}` : ""}
                              onClick={() => setNewBadgeForm({...newBadgeForm, icon: icon.name})}
                              title={icon.name}
                            >
                              <IconComp className={`h-4 w-4 ${newBadgeForm.icon === icon.name && newBadgeForm.color === "text-white" ? "text-white" : ""}`} />
                            </Button>
                          </motion.div>
                        );
                      }
                    })}
                  </div>
                </motion.div>
                
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="text-sm font-medium">Color Theme Presets</label>
                  <div className="grid grid-cols-5 gap-2">
                    {colorPresets.map((preset, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 * idx, duration: 0.2 }}
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          className={`h-8 ${preset.background}`}
                          onClick={() => applyColorPreset(preset)}
                          title={preset.name}
                        />
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Click a color to apply it to this badge
                  </p>
                </motion.div>
                
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="flex items-center text-sm font-medium gap-2">
                    <motion.div
                      initial={{ rotate: -45, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      transition={{ delay: 0.5, type: "spring" }}
                    >
                      <Palette size={16} />
                    </motion.div>
                    Custom Color Picker
                  </label>
                  <motion.div 
                    className="border rounded-md p-4 flex flex-col items-center"
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                  >
                    <HexColorPicker 
                      color={newBadgeForm.customColor || "#3b82f6"} 
                      onChange={(color) => {
                        // Update form with custom color values
                        setNewBadgeForm({
                          ...newBadgeForm,
                          customColor: color,
                          // Create Tailwind-like utility classes based on hex color
                          background: `bg-[${color}]`,
                          hoverBackground: `hover:bg-[${color}]`,
                          // Automatically set text color based on brightness
                          color: isColorDark(color) ? "text-white" : "text-black"
                        });
                      }} 
                    />
                    <motion.div 
                      className="flex items-center gap-2 mt-3"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      <motion.div 
                        className="w-8 h-8 rounded-md border" 
                        style={{ backgroundColor: newBadgeForm.customColor || "#3b82f6" }}
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                      />
                      <Input
                        value={newBadgeForm.customColor || "#3b82f6"}
                        onChange={(e) => {
                          const color = e.target.value;
                          setNewBadgeForm({
                            ...newBadgeForm,
                            customColor: color,
                            background: `bg-[${color}]`,
                            hoverBackground: `hover:bg-[${color}]`,
                            color: isColorDark(color) ? "text-white" : "text-black"
                          });
                        }}
                        placeholder="#000000"
                        className="w-28"
                      />
                    </motion.div>
                  </motion.div>
                </motion.div>
                
                <motion.div 
                  className="pt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <motion.h4 
                    className="text-sm font-medium mb-2"
                    initial={{ x: -5, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    Badge Preview
                  </motion.h4>
                  <AnimatePresence mode="wait">
                    <motion.div 
                      className="flex items-center gap-2"
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.8, type: "spring" }}
                      key={newBadgeForm.customColor ? "custom" : "preset"}
                    >
                      {newBadgeForm.customColor ? (
                        <>
                          <motion.div 
                            className="px-2 py-1 rounded-full text-sm font-medium inline-flex items-center"
                            style={{ 
                              backgroundColor: newBadgeForm.customColor,
                              color: isColorDark(newBadgeForm.customColor) ? 'white' : 'black'
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {newBadgeForm.name || "Badge Name"}
                          </motion.div>
                          
                          <motion.div
                            className="flex items-center justify-center rounded-md h-8 w-8"
                            style={{ 
                              backgroundColor: newBadgeForm.customColor,
                              color: isColorDark(newBadgeForm.customColor) ? 'white' : 'black'
                            }}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {(() => {
                              const IconComp = getIconComponent(newBadgeForm.icon);
                              return <IconComp className="h-4 w-4" />;
                            })()}
                          </motion.div>
                        </>
                      ) : (
                        <>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Badge className={newBadgeForm.background}>
                              {newBadgeForm.name || "Badge Name"}
                            </Badge>
                          </motion.div>
                          
                          <motion.div whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              size="sm"
                              variant="outline"
                              className={`${newBadgeForm.background} ${newBadgeForm.hoverBackground} ${newBadgeForm.color}`}
                            >
                              {(() => {
                                const IconComp = getIconComponent(newBadgeForm.icon);
                                return <IconComp className="h-4 w-4" />;
                              })()}
                            </Button>
                          </motion.div>
                        </>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  {editingBadge && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingBadge(null);
                        setNewBadgeForm({
                          id: "",
                          name: "",
                          background: "bg-blue-500",
                          hoverBackground: "hover:bg-blue-600",
                          icon: "Award",
                          color: "text-white",
                          customColor: undefined
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button onClick={handleAddBadge}>
                    {editingBadge ? "Update Badge" : "Add Badge"}
                  </Button>
                </div>
              </div>
            </motion.div>
            
            {/* Badge List */}
            <div className="md:col-span-2">
              <div className="border rounded-md overflow-hidden">
                <div className="p-4 bg-muted font-medium">Available Badge Themes</div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Badge</TableHead>
                      <TableHead>Preview</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {badgeThemes.map(badge => {
                        const IconComp = getIconComponent(badge.icon);
                        return (
                          <motion.tr
                            key={badge.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }} 
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="group"
                          >
                            <TableCell>
                              <motion.div className="font-medium" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>{badge.name}</motion.div>
                              <motion.div className="text-sm text-muted-foreground" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>ID: {badge.id}</motion.div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {badge.background.startsWith('bg-[') ? (
                                  <>
                                    <motion.div 
                                      className="px-2 py-1 rounded-full text-sm font-medium inline-flex items-center"
                                      style={{ 
                                        backgroundColor: badge.background.substring(4, badge.background.length - 1),
                                        color: badge.color === 'text-white' ? 'white' : 'black'
                                      }}
                                      whileHover={{ scale: 1.05 }} 
                                      whileTap={{ scale: 0.95 }}
                                    >
                                      {badge.name}
                                    </motion.div>
                                    <motion.div
                                      className="flex items-center justify-center rounded-md h-8 w-8"
                                      style={{ 
                                        backgroundColor: badge.background.substring(4, badge.background.length - 1),
                                        color: badge.color === 'text-white' ? 'white' : 'black'
                                      }}
                                      whileHover={{ scale: 1.05 }} 
                                      whileTap={{ scale: 0.95 }}
                                    >
                                      <IconComp className="h-4 w-4" />
                                    </motion.div>
                                  </>
                                ) : (
                                  <>
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                      <Badge className={badge.background}>
                                        {badge.name}
                                      </Badge>
                                    </motion.div>
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                      <Button
                                        size="sm"
                                        className={`${badge.background} ${badge.hoverBackground}`}
                                      >
                                        <IconComp className="h-4 w-4 text-white" />
                                      </Button>
                                    </motion.div>
                                  </>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2 opacity-70 group-hover:opacity-100 transition-opacity">
                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditBadge(badge)}
                                  >
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                  </Button>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteBadge(badge.id)}
                                  >
                                    <Trash className="h-4 w-4" />
                                    <span className="sr-only">Delete</span>
                                  </Button>
                                </motion.div>
                              </div>
                            </TableCell>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

  const { toast } = useToast();
  const { showNotification } = useAdminNotification();
  const [activeSection, setActiveSection] = useState<string>("reviews");
  
  // Reviews Display Section
  const [reviewsSection, setReviewsSection] = useState({
    enabled: true,
    title: "What Our Customers Say",
    subtitle: "Discover why chocolate lovers choose Sweet Moment",
    displayCount: 3
  });
  
  // Featured Products Section
  const [featuredSection, setFeaturedSection] = useState({
    enabled: true,
    title: "Featured Products",
    subtitle: "Our handpicked selection of luxurious chocolates",
    productIds: [] as string[]
  });
  
  // Hero Image Section
  const [heroSection, setHeroSection] = useState({
    title: "Luxury Dubai Chocolates",
    subtitle: "Handcrafted with the finest ingredients",
    buttonText: "Shop Now",
    buttonLink: "/menu",
    imageUrl: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80"
  });
  
  // Products for featured selection
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ["/api/products"],
    queryFn: async () => {
      try {
        const response = await apiRequest("/api/products", "GET");
        return response as Product[];
      } catch (error) {
        console.error("Error fetching products:", error);
        return [];
      }
    }
  });
  
  // Load existing site customization data (if available)
  const { data: siteConfig, isLoading: isLoadingSiteConfig } = useQuery({
    queryKey: ["/api/admin/site-customization"],
    queryFn: async () => {
      try {
        return await apiRequest("/api/admin/site-customization", "GET", null, {
          headers: getAdminAuthHeaders()
        });
      } catch (error) {
        console.error("Error fetching site customization:", error);
        // Return default configuration if unable to fetch
        return {
          reviewsSection,
          featuredSection,
          heroSection
        };
      }
    },
    onSuccess: (data) => {
      // Initialize state with data from server
      if (data?.reviewsSection) {
        setReviewsSection(data.reviewsSection);
      }
      if (data?.featuredSection) {
        setFeaturedSection(data.featuredSection);
      }
      if (data?.heroSection) {
        setHeroSection(data.heroSection);
      }
    }
  });
  
  // Save site customization changes
  const handleSaveChanges = async () => {
    try {
      const payload = {
        reviewsSection,
        featuredSection,
        heroSection
      };
      
      await apiRequest("/api/admin/site-customization", "POST", payload, {
        headers: getAdminAuthHeaders()
      });
      
      showNotification({
        title: "Changes Saved",
        message: "Your site customization changes have been saved successfully.",
        variant: "success"
      });
      
      // Refresh site data
      queryClient.invalidateQueries({ queryKey: ["/api/admin/site-customization"] });
    } catch (error) {
      console.error("Error saving site customization:", error);
      showNotification({
        title: "Error",
        message: "Failed to save changes. Please try again.",
        variant: "error"
      });
    }
  };
  
  // Handle featured products selection
  const handleFeaturedProductChange = (productId: string, checked: boolean) => {
    if (checked) {
      setFeaturedSection({
        ...featuredSection,
        productIds: [...featuredSection.productIds, productId]
      });
    } else {
      setFeaturedSection({
        ...featuredSection,
        productIds: featuredSection.productIds.filter(id => id !== productId)
      });
    }
  };
  
  // Handle hero image upload
  const handleHeroImageUpload = (imageUrl: string) => {
    setHeroSection({
      ...heroSection,
      imageUrl
    });
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Site Customization</CardTitle>
          <CardDescription>
            Customize how your website appears to customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeSection} onValueChange={setActiveSection}>
            <TabsList className="mb-4">
              <TabsTrigger value="reviews">Reviews Display</TabsTrigger>
              <TabsTrigger value="featured">Featured Products</TabsTrigger>
              <TabsTrigger value="hero">Hero Image</TabsTrigger>
            </TabsList>
            
            {/* Reviews Display Section */}
            <TabsContent value="reviews" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="reviews-enabled"
                    checked={reviewsSection.enabled}
                    onCheckedChange={(checked) => {
                      setReviewsSection({...reviewsSection, enabled: checked});
                    }}
                  />
                  <label htmlFor="reviews-enabled" className="text-sm font-medium">
                    Display reviews section on homepage
                  </label>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="reviews-title" className="text-sm font-medium">Section Title</label>
                  <Input
                    id="reviews-title"
                    value={reviewsSection.title}
                    onChange={(e) => setReviewsSection({...reviewsSection, title: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="reviews-subtitle" className="text-sm font-medium">Section Subtitle</label>
                  <Input
                    id="reviews-subtitle"
                    value={reviewsSection.subtitle}
                    onChange={(e) => setReviewsSection({...reviewsSection, subtitle: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="reviews-count" className="text-sm font-medium">Number of Reviews to Display</label>
                  <Input
                    id="reviews-count"
                    type="number"
                    min={1}
                    max={6}
                    value={reviewsSection.displayCount}
                    onChange={(e) => setReviewsSection({...reviewsSection, displayCount: parseInt(e.target.value) || 3})}
                  />
                  <p className="text-xs text-muted-foreground">
                    The most recent reviews will be displayed (maximum 6)
                  </p>
                </div>
              </div>
            </TabsContent>
            
            {/* Featured Products Section */}
            <TabsContent value="featured" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured-enabled"
                    checked={featuredSection.enabled}
                    onCheckedChange={(checked) => {
                      setFeaturedSection({...featuredSection, enabled: checked});
                    }}
                  />
                  <label htmlFor="featured-enabled" className="text-sm font-medium">
                    Display featured products section on homepage
                  </label>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="featured-title" className="text-sm font-medium">Section Title</label>
                  <Input
                    id="featured-title"
                    value={featuredSection.title}
                    onChange={(e) => setFeaturedSection({...featuredSection, title: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="featured-subtitle" className="text-sm font-medium">Section Subtitle</label>
                  <Input
                    id="featured-subtitle"
                    value={featuredSection.subtitle}
                    onChange={(e) => setFeaturedSection({...featuredSection, subtitle: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Select Featured Products</h3>
                  <div className="border rounded-md p-4 max-h-72 overflow-y-auto">
                    {isLoadingProducts ? (
                      <p>Loading products...</p>
                    ) : (
                      <div className="space-y-2">
                        {products.map((product) => (
                          <div key={product.id} className="flex items-center space-x-2 hover:bg-muted/50 p-1 rounded-md">
                            <Checkbox 
                              id={`product-${product.id}`}
                              checked={featuredSection.productIds.includes(product.id)}
                              onCheckedChange={(checked) => handleFeaturedProductChange(product.id, checked === true)}
                            />
                            <label htmlFor={`product-${product.id}`} className="text-sm cursor-pointer font-medium flex-1">
                              {product.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Select the products that will be featured on the homepage
                  </p>
                </div>
              </div>
            </TabsContent>
            
            {/* Hero Image Section */}
            <TabsContent value="hero" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="hero-title" className="text-sm font-medium">Hero Title</label>
                    <Input
                      id="hero-title"
                      value={heroSection.title}
                      onChange={(e) => setHeroSection({...heroSection, title: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="hero-subtitle" className="text-sm font-medium">Hero Subtitle</label>
                    <Input
                      id="hero-subtitle"
                      value={heroSection.subtitle}
                      onChange={(e) => setHeroSection({...heroSection, subtitle: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="hero-button-text" className="text-sm font-medium">Button Text</label>
                    <Input
                      id="hero-button-text"
                      value={heroSection.buttonText}
                      onChange={(e) => setHeroSection({...heroSection, buttonText: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="hero-button-link" className="text-sm font-medium">Button Link</label>
                    <Input
                      id="hero-button-link"
                      value={heroSection.buttonLink}
                      onChange={(e) => setHeroSection({...heroSection, buttonLink: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Hero Background Image</label>
                    <ImageUploader
                      currentImageUrl={heroSection.imageUrl}
                      onImageUploaded={handleHeroImageUpload}
                    />
                  </div>
                  
                  <div className="mt-4 p-4 border rounded-md">
                    <h4 className="text-sm font-medium mb-2">Preview</h4>
                    <div 
                      className="relative w-full h-40 rounded-md overflow-hidden bg-cover bg-center"
                      style={{backgroundImage: `url(${heroSection.imageUrl})`}}
                    >
                      <div className="absolute inset-0 bg-black/30 flex flex-col justify-center items-center text-white p-4">
                        <h3 className="text-xl font-bold text-center">{heroSection.title}</h3>
                        <p className="text-sm text-center mt-1">{heroSection.subtitle}</p>
                        <button className="mt-3 bg-white text-black px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-100">
                          {heroSection.buttonText}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            onClick={handleSaveChanges} 
            disabled={isLoadingSiteConfig}
          >
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function AdminPanel() {
  return (
    <AdminNotificationProvider>
      <AdminPanelContent />
    </AdminNotificationProvider>
  );
}
