import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  CalendarIcon
} from "lucide-react";
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