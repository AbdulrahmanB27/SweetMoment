import { useState, useEffect } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { HexColorPicker } from "react-colorful";
import ColorThief from "colorthief";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/ui/image-upload";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ThemeCustomizerProps {
  initialTheme?: {
    primary: string;
    variant: 'professional' | 'tint' | 'vibrant';
    appearance: 'light' | 'dark' | 'system';
    radius: number;
    font: string;
    logo?: string;
  };
  onSave: (theme: any) => Promise<void>;
  isSaving: boolean;
}

export function ThemeCustomizer({ initialTheme, onSave, isSaving }: ThemeCustomizerProps) {
  const { toast } = useToast();
  
  // Initialize theme with default values or from props
  const [theme, setTheme] = useState({
    primary: initialTheme?.primary || "hsl(25, 37%, 25%)",
    variant: initialTheme?.variant || "professional",
    appearance: initialTheme?.appearance || "light",
    radius: initialTheme?.radius || 0.5,
    font: initialTheme?.font || "default",
    logo: initialTheme?.logo || "",
  });
  
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [activeSwatch, setActiveSwatch] = useState<number | null>(null);
  
  // Update theme when initialTheme changes
  useEffect(() => {
    if (initialTheme) {
      setTheme({
        primary: initialTheme.primary,
        variant: initialTheme.variant,
        appearance: initialTheme.appearance,
        radius: initialTheme.radius,
        font: initialTheme.font || "default",
        logo: initialTheme.logo || "",
      });
    }
  }, [initialTheme]);
  
  // Preview the theme changes in real-time
  useEffect(() => {
    // Update theme.json values in real-time for preview
    const root = document.documentElement;
    
    // Update radius
    root.style.setProperty('--radius', `${theme.radius}rem`);
    
    // We'll only update the preview here, actual saving happens in the onSave callback
  }, [theme]);
  
  // Function to extract colors from an uploaded logo
  const extractColorsFromLogo = async (logoUrl: string) => {
    try {
      setIsExtracting(true);
      
      // Create an image element to load the logo
      const img = new Image();
      img.crossOrigin = "Anonymous"; // To avoid CORS issues
      
      img.onload = async () => {
        try {
          // Use ColorThief to extract a color palette
          const colorThief = new ColorThief();
          const colorPalette = colorThief.getPalette(img, 5);
          
          // Convert RGB to hex
          const hexColors = colorPalette.map(color => {
            return `#${color[0].toString(16).padStart(2, '0')}${color[1].toString(16).padStart(2, '0')}${color[2].toString(16).padStart(2, '0')}`;
          });
          
          setExtractedColors(hexColors);
          setIsExtracting(false);
          
          toast({
            title: "Colors extracted",
            description: "Click on a color swatch to apply it as your primary color.",
          });
        } catch (error) {
          console.error("Error extracting colors:", error);
          setIsExtracting(false);
          toast({
            title: "Color extraction failed",
            description: "Unable to extract colors from this image.",
            variant: "destructive",
          });
        }
      };
      
      img.onerror = () => {
        setIsExtracting(false);
        toast({
          title: "Image loading failed",
          description: "Unable to load the logo image for color extraction.",
          variant: "destructive",
        });
      };
      
      // Set the source to start loading
      img.src = logoUrl;
    } catch (error) {
      console.error("Error in color extraction:", error);
      setIsExtracting(false);
      toast({
        title: "Error",
        description: "Something went wrong during color extraction.",
        variant: "destructive",
      });
    }
  };
  
  // Handle logo upload
  const handleLogoUpload = (imageUrl: string) => {
    setTheme(prev => ({ ...prev, logo: imageUrl }));
    extractColorsFromLogo(imageUrl);
  };
  
  // Apply an extracted color as the primary color
  const applyExtractedColor = (color: string, index: number) => {
    setTheme(prev => ({ ...prev, primary: color }));
    setActiveSwatch(index);
  };
  
  // Handle form field changes
  const handleChange = (field: string, value: any) => {
    setTheme(prev => ({ ...prev, [field]: value }));
  };
  
  // Function to handle the save action
  const handleSave = async () => {
    await onSave(theme);
  };
  
  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Logo Upload Section */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label htmlFor="logo-upload" className="text-base font-medium">
                Store Logo
              </Label>
              {theme.logo && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => extractColorsFromLogo(theme.logo)}
                  disabled={isExtracting}
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Extracting...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Extract Colors
                    </>
                  )}
                </Button>
              )}
            </div>
            <ImageUpload
              value={theme.logo}
              onChange={handleLogoUpload}
              label="Logo Upload"
              helpText="Upload your store logo (recommended size: 300x100px)"
            />
            
            {/* Color swatches from extracted logo colors */}
            {extractedColors.length > 0 && (
              <div className="space-y-2 mt-4">
                <Label className="text-base">Extracted Colors</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {extractedColors.map((color, index) => (
                    <div
                      key={`${color}-${index}`}
                      className={cn(
                        "w-8 h-8 rounded cursor-pointer transition-all hover:scale-110 relative",
                        activeSwatch === index ? "ring-2 ring-primary ring-offset-2" : ""
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => applyExtractedColor(color, index)}
                      title={color}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Click on a color to set it as your primary theme color
                </p>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Primary Color Picker */}
              <div className="space-y-3">
                <Label htmlFor="primary-color" className="text-base font-medium">
                  Primary Color
                </Label>
                <div className="flex gap-2 items-center">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="primary-color"
                        variant="outline"
                        className="w-[80px] h-[30px] p-0 border-2"
                        style={{ backgroundColor: theme.primary }}
                      >
                        <span className="sr-only">Pick a color</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-3">
                      <HexColorPicker
                        color={theme.primary}
                        onChange={(color) => handleChange("primary", color)}
                      />
                    </PopoverContent>
                  </Popover>
                  <Input
                    value={theme.primary}
                    onChange={(e) => handleChange("primary", e.target.value)}
                    className="flex-1"
                    placeholder="e.g. #663f27 or hsl(25, 37%, 25%)"
                  />
                </div>
              </div>
              
              {/* Theme Variant */}
              <div className="space-y-3">
                <Label htmlFor="variant" className="text-base font-medium">
                  Color Scheme
                </Label>
                <Select
                  value={theme.variant}
                  onValueChange={(value) => handleChange("variant", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a variant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="tint">Tint</SelectItem>
                    <SelectItem value="vibrant">Vibrant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Appearance (Light/Dark) */}
              <div className="space-y-3">
                <Label htmlFor="appearance" className="text-base font-medium">
                  Appearance
                </Label>
                <Select
                  value={theme.appearance}
                  onValueChange={(value) => handleChange("appearance", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select appearance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Border Radius */}
              <div className="space-y-3">
                <Label htmlFor="radius" className="text-base font-medium">
                  Border Radius
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="radius"
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={theme.radius}
                    onChange={(e) => handleChange("radius", parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <span className="w-14 text-center">{theme.radius}rem</span>
                </div>
              </div>
            </div>
            
            {/* Font Selection */}
            <div className="space-y-3">
              <Label htmlFor="font" className="text-base font-medium">
                Font
              </Label>
              <Select
                value={theme.font}
                onValueChange={(value) => handleChange("font", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a font" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default (Inter)</SelectItem>
                  <SelectItem value="serif">Serif</SelectItem>
                  <SelectItem value="mono">Monospace</SelectItem>
                  <SelectItem value="georgia">Georgia</SelectItem>
                  <SelectItem value="playfair">Playfair Display</SelectItem>
                  <SelectItem value="montserrat">Montserrat</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Preview text with the selected font
              </p>
              <div 
                className="p-4 border rounded bg-card"
                style={{ fontFamily: getFontFamily(theme.font) }}
              >
                <p className="text-lg font-semibold">Sweet Moment Chocolates</p>
                <p>Experience our finest handcrafted selection of premium chocolates.</p>
              </div>
            </div>
            
            {/* Theme Preview */}
            <div className="space-y-3">
              <Label className="text-base font-medium">
                Theme Preview
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <PreviewCard 
                  title="Primary Button" 
                  theme={theme}
                  element={<Button>Button</Button>}
                />
                <PreviewCard 
                  title="Card" 
                  theme={theme}
                  element={
                    <div className="p-3 border rounded-md bg-card shadow">
                      Card Content
                    </div>
                  }
                />
                <PreviewCard 
                  title="Form Control" 
                  theme={theme}
                  element={<Input placeholder="Input field" />}
                />
                <PreviewCard 
                  title="Secondary Button" 
                  theme={theme}
                  element={<Button variant="outline">Button</Button>}
                />
              </div>
            </div>
          </div>
          
          {/* Save Button */}
          <div className="flex justify-end mt-6">
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
            >
              {isSaving ? (
                <div className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </div>
              ) : "Save Theme"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper component for preview cards
function PreviewCard({ title, theme, element }: { title: string; theme: any; element: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{title}</p>
      <div 
        className="flex items-center justify-center h-20 bg-card border rounded-md"
        style={{ 
          borderRadius: `calc(var(--radius) * ${theme.radius * 2}px)`,
          fontFamily: getFontFamily(theme.font)
        }}
      >
        {element}
      </div>
    </div>
  );
}

// Helper function to get actual font family from theme font value
function getFontFamily(font: string): string {
  switch(font) {
    case 'serif': return 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif';
    case 'mono': return 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';
    case 'georgia': return 'Georgia, serif';
    case 'playfair': return '"Playfair Display", serif';
    case 'montserrat': return 'Montserrat, sans-serif';
    default: return 'Inter, sans-serif';
  }
}