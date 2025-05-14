import React, { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useNavigation } from "../App";
import {
  Check,
  Gift,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  ShoppingBag,
  Instagram,
  ChevronsUpDown,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Maximum length for phone numbers
const MAX_PHONE_LENGTH = 15;

// Country codes data
const countries = [
  { name: "United States", code: "US", dialCode: "1" },
  { name: "United Kingdom", code: "GB", dialCode: "44" },
  { name: "United Arab Emirates", code: "AE", dialCode: "971" },
  { name: "Canada", code: "CA", dialCode: "1" },
  { name: "Australia", code: "AU", dialCode: "61" },
  { name: "France", code: "FR", dialCode: "33" },
  { name: "Germany", code: "DE", dialCode: "49" },
  { name: "Italy", code: "IT", dialCode: "39" },
  { name: "Spain", code: "ES", dialCode: "34" },
  { name: "Japan", code: "JP", dialCode: "81" },
  { name: "China", code: "CN", dialCode: "86" },
  { name: "India", code: "IN", dialCode: "91" },
  { name: "Brazil", code: "BR", dialCode: "55" },
  { name: "Russia", code: "RU", dialCode: "7" },
  { name: "South Africa", code: "ZA", dialCode: "27" },
  { name: "Saudi Arabia", code: "SA", dialCode: "966" },
  { name: "Singapore", code: "SG", dialCode: "65" },
  { name: "New Zealand", code: "NZ", dialCode: "64" },
  { name: "Mexico", code: "MX", dialCode: "52" },
  { name: "Sweden", code: "SE", dialCode: "46" },
];

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  preferredContact: z.string({
    required_error: "Please select your preferred contact method.",
  }),
  emailContact: z.string().optional(),
  phoneContact: z.string().optional(),
  instagramContact: z.string().optional(),
  orderDetails: z.string().min(10, { message: "Please provide more details about your order." }),
  selectedProducts: z.array(z.object({
    productId: z.string(),
    name: z.string(),
  })).optional(),
  // Using z.boolean() with refine instead of z.literal(true) to allow setting default as false
  agreedToTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms.",
  }),
}).refine((data) => {
  // If email is the preferred contact, it must be provided
  if (data.preferredContact === 'email') {
    return !!data.emailContact;
  }
  // If phone is the preferred contact, it must be provided
  if (data.preferredContact === 'phone') {
    return !!data.phoneContact;
  }
  // If instagram is the preferred contact, it must be provided
  if (data.preferredContact === 'instagram') {
    return !!data.instagramContact;
  }
  return true;
}, {
  message: "Your preferred contact information is required",
  path: ["preferredContact"] // Shows the error on the preferredContact field
});

type FormValues = z.infer<typeof formSchema>;

// Contact method options
const contactOptions = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "instagram", label: "Instagram" },
];

const CustomOrder = () => {
  const [, navigation] = useLocation();
  const [submitted, setSubmitted] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("US");
  const [selectedProducts, setSelectedProducts] = useState<
    Array<{ productId: string; name: string }>
  >([]);
  const { toast } = useToast();

  // Define product type
  interface Product {
    id: string;
    name: string;
    basePrice: number;
    visible?: boolean;
    description?: string;
  }

  // Fetch products
  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Form definition with default values and validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      preferredContact: "",
      emailContact: "",
      phoneContact: "",
      instagramContact: "",
      orderDetails: "",
      selectedProducts: [],
      agreedToTerms: false,
    },
  });

  // Handle form submission
  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      // Get the appropriate contact info based on the preferred contact method
      const preferredContact = values.preferredContact;
      const contactInfoMap = {
        email: values.emailContact,
        phone: values.phoneContact,
        instagram: values.instagramContact,
      };
      
      // Create the properly formatted request for the backend
      const contactInfo = contactInfoMap[preferredContact as keyof typeof contactInfoMap] || '';
      
      // Debug logs to help diagnose the issue
      console.log('Submitting custom order with data:', {
        customerName: values.name,
        contactInfo: contactInfo,
        contactType: values.preferredContact,
        orderDetails: values.orderDetails,
        selectedProducts: selectedProducts,
        status: "pending",
      });
      
      // Convert selectedProducts to string if it's not already one
      const productsData = typeof selectedProducts === 'string' 
        ? selectedProducts 
        : JSON.stringify(selectedProducts);
      
      return apiRequest("/api/public-custom-orders", "POST", {
        customerName: values.name,
        contactInfo: contactInfo,
        contactType: values.preferredContact,
        orderDetails: values.orderDetails,
        selectedProducts: productsData,
        status: "pending",
      });
    },
    onSuccess: (data) => {
      console.log('Custom order submitted successfully:', data);
      setSubmitted(true);
      form.reset();
      
      // Show a success toast message
      toast({
        title: "Success!",
        description: "Your custom order request has been submitted successfully. We'll contact you soon!",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error("Custom order submission error:", error);
      toast({
        title: "Error",
        description: `There was an error submitting your request: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    // Make sure at least one contact method is filled
    const preferredContact = values.preferredContact;
    
    // If no preferred contact method is selected, show error
    if (!preferredContact) {
      form.setError(
        "preferredContact",
        {
          type: "manual",
          message: "Please select a preferred contact method.",
        }
      );
      
      // Show toast notification
      toast({
        title: "Missing information",
        description: "Please select your preferred contact method (Email, Phone, or Instagram)",
        variant: "destructive",
      });
      return;
    }
    
    const contactFields = {
      email: values.emailContact,
      phone: values.phoneContact,
      instagram: values.instagramContact,
    };

    // Make sure the selected contact method has a value
    if (!contactFields[preferredContact as keyof typeof contactFields]) {
      form.setError(
        `${preferredContact}Contact` as "emailContact" | "phoneContact" | "instagramContact",
        {
          type: "manual",
          message: `Please provide your ${preferredContact} contact information.`,
        }
      );
      
      // Show toast notification
      toast({
        title: "Missing information",
        description: `Please provide your ${preferredContact} contact information.`,
        variant: "destructive",
      });
      return;
    }
    
    // Validate email only if it's provided or if it's the preferred contact method
    if (values.emailContact && preferredContact !== 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.emailContact)) {
      form.setError("emailContact", {
        type: "manual",
        message: "Please enter a valid email address or leave it blank.",
      });
      
      // Show toast notification
      toast({
        title: "Invalid input",
        description: "The email address you provided is invalid. Please correct it or leave it blank.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate order details
    if (!values.orderDetails || values.orderDetails.length < 10) {
      form.setError(
        "orderDetails",
        {
          type: "manual",
          message: "Please provide more details about your order (at least 10 characters).",
        }
      );
      
      // Show toast notification
      toast({
        title: "Missing information",
        description: "Please provide more details about your custom order request.",
        variant: "destructive",
      });
      return;
    }

    // Show loading toast
    toast({
      title: "Submitting...",
      description: "Your custom order request is being submitted...",
      variant: "default",
    });

    console.log("Form is valid, submitting with data:", values);
    
    // Submit the form - we don't need to transform the data here
    // as the transformation happens in the mutation function
    mutation.mutate(values);
  };

  // Handle product selection toggle - simplified to just track product types
  const handleProductSelect = (productId: string, name: string) => {
    const existingProduct = selectedProducts.find((p) => p.productId === productId);

    if (existingProduct) {
      // If product already selected, remove it
      setSelectedProducts(selectedProducts.filter((p) => p.productId !== productId));
    } else {
      // If product not selected, add it (no quantity tracking)
      setSelectedProducts([...selectedProducts, { productId, name }]);
    }
  };

  // Observe preferred contact changes to show only relevant fields
  const watchPreferredContact = form.watch("preferredContact");

  // If form is submitted, show success message
  if (submitted) {
    return (
      <div className="pt-28 md:py-24 flex flex-col items-center justify-center min-h-[50vh] bg-[#FCFAF7]">
        <div className="bg-white p-8 rounded-lg max-w-lg mx-auto text-center shadow-md border border-[#E8D9B5]">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-4 font-montserrat text-[#2A1A18]">
            Request Submitted!
          </h1>
          <p className="text-lg mb-6 text-[#5A3D3B]">
            Thank you for your custom order request. We'll review your requirements and get back to you soon.
          </p>
          <Separator className="my-6" />
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              className="border-2 border-[#4A2C2A] bg-white text-[#4A2C2A] hover:bg-[#F5EFEA] transition-colors"
              onClick={() => navigation("/")}
            >
              Return Home
            </Button>
            <Button
              className="bg-[#D4AF37] hover:bg-[#C09C30] text-white"
              onClick={() => {
                setSubmitted(false);
                form.reset();
              }}
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              New Custom Order
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Main form UI
  return (
    <div className="pt-28 pb-16 bg-[#FCFAF7]">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="p-5 md:p-10 shadow-md border border-[#E8D9B5]">
            <h1 className="text-3xl font-bold mb-2 text-center font-montserrat text-[#2A1A18]">
              Custom Chocolate Order
            </h1>
            <p className="text-[#5A3D3B] text-center mb-8">
              Let us create a personalized chocolate experience just for you. Fill out the form below with your preferences.
            </p>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Contact Information */}
                <div className="space-y-4 border border-[#E8D9B5] rounded-md p-6 bg-[#FCFAF7]">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-5 w-5 text-[#D4AF37]" />
                    <FormLabel className="text-[#2A1A18] text-lg font-medium m-0">Contact Information</FormLabel>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Please provide your contact details so we can discuss your custom order.
                  </p>

                  {/* Name Field */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#2A1A18]">Full Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Your full name"
                            {...field}
                            className="border-[#E8D9B5] focus:border-[#D4AF37] bg-white"
                          />
                        </FormControl>
                        <FormDescription>
                          Enter your full name as it should appear on the order.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Preferred Contact Method */}
                  <FormField
                    control={form.control}
                    name="preferredContact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#2A1A18]">Preferred Contact Method</FormLabel>
                        <div className="grid grid-cols-3 gap-2">
                          {contactOptions.map((option) => (
                            <Button
                              key={option.value}
                              type="button"
                              variant={field.value === option.value ? "default" : "outline"}
                              className={`border-[#E8D9B5] ${
                                field.value === option.value
                                  ? "bg-[#D4AF37] text-white hover:bg-[#C09C30]"
                                  : "bg-white text-[#2A1A18] hover:bg-[#FDF8ED]"
                              }`}
                              onClick={() => {
                                field.onChange(option.value);
                              }}
                            >
                              {option.value === "email" && <Mail className="h-4 w-4 mr-2" />}
                              {option.value === "phone" && <Phone className="h-4 w-4 mr-2" />}
                              {option.value === "instagram" && <Instagram className="h-4 w-4 mr-2" />}
                              {option.label}
                            </Button>
                          ))}
                        </div>
                        <FormDescription>
                          Select your preferred method of contact.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email Contact - Always visible but required only if preferred */}
                  <FormField
                    control={form.control}
                    name="emailContact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#2A1A18]">
                          Email Address 
                          {watchPreferredContact === "email" && <span className="text-red-500 ml-1">*</span>}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="yourname@example.com"
                            {...field}
                            className={`border-[#E8D9B5] focus:border-[#D4AF37] bg-white`}
                            onBlur={(e) => {
                              field.onBlur();
                              // Only validate email if it's provided and it's the preferred contact method
                              if (
                                field.value && 
                                watchPreferredContact === "email" &&
                                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)
                              ) {
                                form.setError("emailContact", {
                                  type: "manual",
                                  message: "Please enter a valid email address.",
                                });
                              } else if (
                                field.value && 
                                watchPreferredContact !== "email" &&
                                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)
                              ) {
                                form.setError("emailContact", {
                                  type: "manual",
                                  message: "Please enter a valid email address or leave it blank.",
                                });
                              }
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          {watchPreferredContact === "email" 
                            ? "This is your preferred contact method."
                            : "We'll use this email if we can't reach you through your preferred method."}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Phone Contact with country code dropdown - Always visible but required only if preferred */}
                  <FormField
                    control={form.control}
                    name="phoneContact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#2A1A18]">
                          Phone Number
                          {watchPreferredContact === "phone" && <span className="text-red-500 ml-1">*</span>}
                        </FormLabel>
                        <div className="flex gap-2">
                            {/* Country code dropdown with search */}
                            <div className="w-[120px] flex-shrink-0">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    className="w-full border-[#E8D9B5] bg-white justify-between h-10"
                                  >
                                    <div className="truncate">
                                      {(() => {
                                        const country = countries.find(c => c.code === selectedCountry);
                                        return country ? `+${country.dialCode}` : '+1';
                                      })()}
                                    </div>
                                    <ChevronsUpDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[250px] p-0">
                                  <Command>
                                    <CommandInput placeholder="Search country..." />
                                    <CommandEmpty>No country found.</CommandEmpty>
                                    <CommandGroup className="max-h-[300px] overflow-y-auto">
                                      {countries.map((country) => (
                                        <CommandItem
                                          key={country.code}
                                          value={`${country.name} ${country.dialCode}`}
                                          onSelect={() => {
                                            setSelectedCountry(country.code);
                                            
                                            // Get the digits without country code
                                            const phoneDigits = field.value ? field.value.replace(/^\+\d+\s*/, '') : '';
                                            
                                            // Create new phone number with selected country code
                                            field.onChange(`+${country.dialCode} ${phoneDigits}`.trim());
                                          }}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              selectedCountry === country.code ? "opacity-100" : "opacity-0"
                                            )}
                                          />
                                          <span className="mr-2">{country.name}</span>
                                          <span className="text-gray-500">+{country.dialCode}</span>
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                            </div>
                            
                            {/* Phone number input */}
                            <FormControl>
                              <Input
                                placeholder="Phone number"
                                value={field.value ? field.value.replace(/^\+\d+\s*/, '') : ''}
                                className={`border-[#E8D9B5] focus:border-[#D4AF37] bg-white flex-1 ${
                                  field.value && form.formState.errors.phoneContact ? 'border-red-500' : ''
                                }`}
                                onChange={(e) => {
                                  // Get only digits the user typed
                                  const digitsOnly = e.target.value.replace(/\D/g, '');
                                  
                                  // Get country for dialing code
                                  const country = countries.find(c => c.code === selectedCountry);
                                  if (!country) return;
                                  
                                  // Format based on country
                                  let formattedNumber;
                                  if (country.code === 'US' || country.code === 'CA') {
                                    // US/Canada format: XXX-XXX-XXXX
                                    if (digitsOnly.length <= 3) {
                                      formattedNumber = digitsOnly;
                                    } else if (digitsOnly.length <= 6) {
                                      formattedNumber = `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3)}`;
                                    } else {
                                      formattedNumber = `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6, 10)}`;
                                    }
                                    // Create full number with country code
                                    formattedNumber = `+${country.dialCode} ${formattedNumber}`;
                                  } else {
                                    // Default international format
                                    formattedNumber = `+${country.dialCode} ${digitsOnly}`;
                                  }
                                  
                                  // Check max length
                                  if (formattedNumber.length > MAX_PHONE_LENGTH) {
                                    return; // Don't update if too long
                                  }
                                  
                                  // Update field value
                                  field.onChange(formattedNumber);
                                }}
                                onBlur={(e) => {
                                  field.onBlur();
                                  
                                  // Validate on blur
                                  if (!field.value) return;
                                  
                                  // Check max length
                                  if (field.value.length > MAX_PHONE_LENGTH) {
                                    form.setError('phoneContact', {
                                      type: 'manual',
                                      message: `Phone number must be ${MAX_PHONE_LENGTH} characters or less.`
                                    });
                                    return;
                                  }
                                  
                                  // Basic validation - only checking if there's a plus sign and some digits
                                  const hasCountryCode = /^\+/.test(field.value);
                                  
                                  // Count total number of digits
                                  const totalDigits = (field.value.match(/\d/g) || []).length;
                                  
                                  if (!hasCountryCode || totalDigits < 5) { // Most phone numbers have at least 5 digits
                                    form.setError('phoneContact', {
                                      type: 'manual',
                                      message: 'Please enter a valid phone number with country code.'
                                    });
                                  } else {
                                    form.clearErrors('phoneContact');
                                  }
                                }}
                              />
                            </FormControl>
                          </div>
                        <FormDescription>
                          Select your country code and enter your phone number (max {MAX_PHONE_LENGTH} characters).
                        </FormDescription>
                        <FormMessage />
                        </FormItem>
                      )}
                    />
                  

                  {/* Instagram Contact */}
                  <FormField
                    control={form.control}
                    name="instagramContact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#2A1A18]">
                          Instagram Handle
                          {watchPreferredContact === "instagram" && <span className="text-red-500 ml-1">*</span>}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">@</div>
                            <Input
                              placeholder="yourusername"
                              value={field.value?.startsWith('@') ? field.value.substring(1) : field.value}
                              onChange={(e) => field.onChange(`@${e.target.value}`)}
                              onBlur={field.onBlur}
                              name={field.name}
                              ref={field.ref}
                              className="border-[#E8D9B5] focus:border-[#D4AF37] bg-white pl-8"
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Enter your username without the @ symbol - it's automatically added.
                        </FormDescription>
                        <FormMessage />
                        </FormItem>
                      )}
                    />
                  
                </div>

                {/* Product Selection Section */}
                <div className="space-y-4 border border-[#E8D9B5] rounded-md p-6 bg-[#FCFAF7]">
                  <div className="flex items-center gap-2 mb-2">
                    <ShoppingBag className="h-5 w-5 text-[#D4AF37]" />
                    <FormLabel className="text-[#2A1A18] text-lg font-medium m-0">Products Selection</FormLabel>
                  </div>
                  <p className="text-sm text-gray-600">
                    Optionally select the chocolate flavors you're interested in for your custom order. You can leave this section blank if you're still deciding. We'll discuss all details including quantities during follow-up.
                  </p>

                  {/* Product Selection Grid */}
                  {productsLoading ? (
                    <div className="flex justify-center p-8">
                      <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-4">
                      {products && products.filter((p: Product) => p.visible !== false).map((product: Product) => {
                        // Check if product is selected
                        const isSelected = selectedProducts.some(p => p.productId === product.id);
                        return (
                          <div
                            key={product.id}
                            className={`border-2 rounded-md p-4 relative transition-all cursor-pointer hover:shadow-md ${
                              isSelected 
                                ? 'border-[#D4AF37] bg-[#FDF8ED]' 
                                : 'border-[#E8D9B5] hover:border-[#D4AF37] bg-white'
                            }`}
                            onClick={() => handleProductSelect(product.id, product.name)}
                          >
                            <div className="font-medium text-[#2A1A18] mb-1">{product.name}</div>
                            {product.description && (
                              <div className="text-sm text-gray-500 mb-1 line-clamp-2">
                                {product.description}
                              </div>
                            )}
                            {isSelected && (
                              <div className="absolute top-2 right-2 rounded-full bg-[#D4AF37] p-1">
                                <Check className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Selected products are shown as checked items in the grid */}
                </div>

                {/* Order Details */}
                <div className="space-y-4 border border-[#E8D9B5] rounded-md p-6 bg-[#FCFAF7]">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="h-5 w-5 text-[#D4AF37]" />
                    <FormLabel className="text-[#2A1A18] text-lg font-medium m-0">Order Details</FormLabel>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Tell us about your custom chocolate needs. The more details you provide, the better we can create something perfect for you.
                  </p>
                  
                  <FormField
                    control={form.control}
                    name="orderDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Please describe your custom order requirements in detail. Include information about desired flavors, quantity, packaging, event dates, special messages, occasion, dietary requirements, etc."
                            {...field}
                            className="min-h-[150px] border-[#E8D9B5] focus:border-[#D4AF37] bg-white"
                          />
                        </FormControl>
                        <FormDescription className="mt-2">
                          We'll use these details to create a personalized chocolate experience just for you.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Terms and Conditions */}
                <FormField
                  control={form.control}
                  name="agreedToTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-[#E8D9B5] p-4 bg-white">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-[#D4AF37] data-[state=checked]:border-[#D4AF37]"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-[#2A1A18]">
                          I agree to the terms and conditions for custom orders.
                        </FormLabel>
                        <FormDescription>
                          By checking this box, you agree to our custom order policies including potential additional charges for special requests.
                        </FormDescription>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-[#D4AF37] hover:bg-[#C09C30] text-white py-6 text-lg font-medium rounded-md mt-4 shadow-md"
                  disabled={mutation.isPending}
                  onClick={() => {
                    // This helps with feedback if the form doesn't validate properly
                    if (Object.keys(form.formState.errors).length > 0) {
                      console.log("Form has validation errors:", form.formState.errors);
                      toast({
                        title: "Form has errors",
                        description: "Please correct the errors in the form before submitting.",
                        variant: "destructive",
                      });
                    } else {
                      console.log("Form is being submitted via button click");
                    }
                  }}
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing Your Request...
                    </>
                  ) : (
                    <>
                      <Gift className="mr-2 h-5 w-5" />
                      Submit Custom Order Request
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CustomOrder;