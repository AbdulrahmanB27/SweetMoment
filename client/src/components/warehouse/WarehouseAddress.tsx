import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from 'framer-motion';

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Truck, Save, Eye, EyeOff, Mail, ChevronDown } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// US States list
import { US_STATES } from '@/lib/constants';

// Form schema validation
const warehouseAddressSchema = z.object({
  name: z.string().min(1, { message: "Warehouse name is required" }),
  address1: z.string().min(1, { message: "Street address is required" }),
  address2: z.string().optional(),
  city: z.string().min(1, { message: "City is required" }),
  state: z.string().min(1, { message: "State/Province is required" }),
  zipCode: z.string()
    .min(1, { message: "ZIP/Postal code is required" })
    .refine(
      (val) => /^\d{5}(-\d{4})?$/.test(val) || val.length <= 10, 
      { message: "US ZIP code must be 5 digits (or 5+4 format)" }
    ),
  country: z.string().min(1, { message: "Country is required" }),
  privateAddress: z.boolean().default(false),
  emailOnly: z.boolean().default(false),
});

// Type for form values
type WarehouseFields = z.infer<typeof warehouseAddressSchema>;

// Country options
const COUNTRIES = [
  "United States",
  "United Arab Emirates",
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Kosovo",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Korea",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Timor-Leste",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Kingdom",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe"
];

export function WarehouseAddressSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);

  // Create form
  const form = useForm<WarehouseFields>({
    resolver: zodResolver(warehouseAddressSchema),
    defaultValues: {
      name: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      privateAddress: false,
      emailOnly: false,
    },
  });

  // Set up default address values
  const defaultAddress = {
    name: 'Sweet Moment Chocolate',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    privateAddress: false,
    emailOnly: false
  };

  // Function to handle successful data fetching
  const handleSettingsData = (data: any) => {
    // Process warehouse address data if it exists
    const warehouseAddress = data?.find((setting: any) => setting.key === 'warehouse_address');
    if (warehouseAddress?.value) {
      try {
        const parsedAddress = JSON.parse(warehouseAddress.value);
        console.log("[WAREHOUSE] Loaded address from settings:", parsedAddress);
        
        // Ensure boolean values are properly typed
        const processedAddress = {
          ...parsedAddress,
          privateAddress: Boolean(parsedAddress.privateAddress),
          emailOnly: Boolean(parsedAddress.emailOnly)
        };
        
        console.log("[WAREHOUSE] After boolean conversion:", processedAddress);
        
        // Update form with stored values
        form.reset(processedAddress);
        
        // Also save to localStorage
        localStorage.setItem('warehouse-address', JSON.stringify(processedAddress));
      } catch (e) {
        console.error('[WAREHOUSE] Error parsing warehouse address:', e);
        form.reset(defaultAddress);
      }
    } else {
      // Check localStorage for previously saved address
      const localAddress = localStorage.getItem('warehouse-address');
      if (localAddress) {
        try {
          const parsedAddress = JSON.parse(localAddress);
          console.log("[WAREHOUSE] Loading from localStorage:", parsedAddress);
          
          // Ensure boolean values are properly typed
          const processedAddress = {
            ...parsedAddress,
            privateAddress: Boolean(parsedAddress.privateAddress),
            emailOnly: Boolean(parsedAddress.emailOnly)
          };
          
          console.log("[WAREHOUSE] After boolean conversion:", processedAddress);
          form.reset(processedAddress);
        } catch (e) {
          console.error('[WAREHOUSE] Error parsing local warehouse address:', e);
          form.reset(defaultAddress);
        }
      } else {
        // No warehouse address in settings or localStorage, use defaults
        console.log('[WAREHOUSE] No warehouse address found in settings, showing defaults');
        form.reset(defaultAddress);
      }
    }
    setIsLoading(false);
  };

  // Fetch stored warehouse address
  const { data: siteSettings, isError } = useQuery({
    queryKey: ['/api/admin/site-settings'],
    queryFn: async () => {
      const response = await apiRequest('/api/admin/site-settings', 'GET', null, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-admin-access': 'sweetmoment-dev-secret'
        }
      });
      return await response.json();
    }
  });
  
  // Process the data when it's available
  useEffect(() => {
    if (siteSettings) {
      handleSettingsData(siteSettings);
    } else if (isError) {
      console.error('Error fetching site settings');
      // Try localStorage or set defaults
      const localAddress = localStorage.getItem('warehouse-address');
      if (localAddress) {
        try {
          const parsedAddress = JSON.parse(localAddress);
          form.reset(parsedAddress);
        } catch (e) {
          console.error('Error parsing local warehouse address:', e);
          form.reset(defaultAddress);
        }
      } else {
        form.reset(defaultAddress);
      }
      setIsLoading(false);
    }
  }, [siteSettings, isError]);
  
  // Ensure we don't get stuck in loading state
  useEffect(() => {
    // Set a timeout to apply default values if loading takes too long
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.log('Loading timeout - applying default warehouse address values');
        form.reset(defaultAddress);
        setIsLoading(false);
      }
    }, 3000); // 3 second timeout
    
    return () => clearTimeout(timeoutId);
  }, [isLoading, form]);

  // Mutation to save warehouse address
  const saveAddressMutation = useMutation({
    mutationFn: async (data: WarehouseFields) => {
      console.log("[WAREHOUSE] Saving address with values:", JSON.stringify(data));
      
      // Ensure boolean values are properly set
      // This ensures that privateAddress and emailOnly are saved as boolean values
      const addressData = {
        ...data,
        privateAddress: Boolean(data.privateAddress),
        emailOnly: Boolean(data.emailOnly)
      };
      
      console.log("[WAREHOUSE] After boolean conversion:", JSON.stringify(addressData));
      
      // Save to site settings using the existing endpoint
      return apiRequest('/api/admin/site-customization', 'POST', {
        key: 'warehouse_address',
        value: JSON.stringify(addressData),
        timestamp: Date.now()
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-admin-access': 'sweetmoment-dev-secret'
        }
      });
    },
    onSuccess: (response) => {
      console.log("[WAREHOUSE] Save successful, response:", response);
      
      // Invalidate both site settings and warehouse address queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/admin/site-settings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/warehouse-address'] });
      
      // Save to localStorage for persistence
      localStorage.setItem('warehouse-address', JSON.stringify(form.getValues()));
      
      toast({
        title: "Warehouse address saved",
        description: "Your warehouse address has been saved successfully."
      });
    },
    onError: (error) => {
      console.error('[WAREHOUSE] Error saving warehouse address:', error);
      toast({
        title: "Failed to save address",
        description: "There was an error saving your warehouse address. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Form submission handler
  const onSubmit = (values: WarehouseFields) => {
    saveAddressMutation.mutate(values);
  };

  return (
    <Card className="w-full">
      <CardHeader className="bg-muted/50">
        <div className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-primary" />
          <CardTitle>Warehouse Address</CardTitle>
        </div>
        <CardDescription>
          Set your warehouse address for shipping labels and pickup
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Warehouse Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Sweet Moment Chocolate Factory" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="address1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input placeholder="1234 Cocoa Street" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="address2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apartment/Suite (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Suite 101" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="City" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* State field - Only show if United States is selected */}
                {form.watch('country') === 'United States' && (
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a state" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {US_STATES.map((state) => (
                              <SelectItem key={state.value} value={state.value}>
                                {state.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                {/* Non-US State/Province field */}
                {form.watch('country') !== 'United States' && (
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State/Province</FormLabel>
                        <FormControl>
                          <Input placeholder="State/Province" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP/Postal Code</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="12345" 
                          {...field} 
                          maxLength={form.watch('country') === 'United States' ? 5 : 10}
                          onChange={(e) => {
                            // For US, restrict to numbers only and limit to 5 digits
                            if (form.watch('country') === 'United States') {
                              const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 5);
                              field.onChange(value);
                            } else {
                              field.onChange(e.target.value);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium text-sm text-muted-foreground">Privacy Settings</h3>
                
                <FormField
                  control={form.control}
                  name="privateAddress"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="flex items-center gap-2">
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                          Hide address on public pages
                        </FormLabel>
                        <FormDescription>
                          When enabled, the warehouse address will not be displayed on public pages.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="emailOnly"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          Share address in email receipts only
                        </FormLabel>
                        <FormDescription>
                          When enabled, the warehouse address will only be shared in email receipts after purchase.
                          This helps protect your location while still providing necessary information to customers.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              
              <CardFooter className="px-0 pt-4 pb-0 flex justify-end">
                <Button 
                  type="submit" 
                  className="bg-green-600 hover:bg-green-700"
                  disabled={saveAddressMutation.isPending}
                >
                  {saveAddressMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Address
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}