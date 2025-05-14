import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Gift, Save, RotateCcw } from "lucide-react";
import { useAdminNotification } from "@/hooks/use-admin-notification";

interface SiteSetting {
  id: number;
  key: string;
  value: string;
}

export function PostPurchaseDiscountSettings() {
  const { toast } = useToast();
  const { showNotification } = useAdminNotification();
  const [isSaving, setIsSaving] = useState(false);
  
  // State for settings
  const [settings, setSettings] = useState({
    enabled: false,
    discountType: 'percentage',
    value: 10,
    minPurchase: 0,
    expiryDays: 30,
    prefix: 'THANKS'
  });

  // Fetch current settings
  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['/api/site-settings'],
    select: (data: SiteSetting[]) => {
      // Convert array of settings to object
      const settingsObj: Record<string, string> = {};
      data.forEach(setting => {
        settingsObj[setting.key] = setting.value;
      });
      return settingsObj;
    }
  });

  // Update local state when settings are loaded
  useEffect(() => {
    if (settingsData) {
      setSettings({
        enabled: settingsData['postPurchaseDiscountEnabled'] === 'true',
        discountType: settingsData['postPurchaseDiscountType'] || 'percentage',
        value: parseInt(settingsData['postPurchaseDiscountValue'] || '10', 10),
        minPurchase: parseInt(settingsData['postPurchaseDiscountMinPurchase'] || '0', 10),
        expiryDays: parseInt(settingsData['postPurchaseDiscountExpiryDays'] || '30', 10),
        prefix: settingsData['postPurchaseDiscountPrefix'] || 'THANKS'
      });
    }
  }, [settingsData]);

  // Save settings
  const saveSettings = async () => {
    setIsSaving(true);
    try {
      // Convert settings to array of key-value pairs
      const settingsToSave = [
        { key: 'postPurchaseDiscountEnabled', value: settings.enabled.toString() },
        { key: 'postPurchaseDiscountType', value: settings.discountType },
        { key: 'postPurchaseDiscountValue', value: settings.value.toString() },
        { key: 'postPurchaseDiscountMinPurchase', value: settings.minPurchase.toString() },
        { key: 'postPurchaseDiscountExpiryDays', value: settings.expiryDays.toString() },
        { key: 'postPurchaseDiscountPrefix', value: settings.prefix }
      ];

      // Save each setting
      for (const setting of settingsToSave) {
        await apiRequest('/api/site-settings', 'POST', 
          JSON.stringify(setting)
        );
      }

      // Invalidate settings cache
      queryClient.invalidateQueries({ queryKey: ['/api/site-settings'] });
      
      toast({
        title: "Settings saved",
        description: "Post-purchase discount settings have been updated."
      });
      
      showNotification({
        title: "Settings saved",
        message: "Post-purchase discount settings have been updated.",
        variant: "info"
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "There was a problem saving your settings.",
        variant: "destructive"
      });
      
      showNotification({
        title: "Error",
        message: "There was a problem saving your settings.",
        variant: "error"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle value changes
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: name === 'prefix' ? value : parseInt(value, 10)
    }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle switch changes
  const handleSwitchChange = (checked: boolean) => {
    setSettings(prev => ({
      ...prev,
      enabled: checked
    }));
  };

  // Reset to defaults
  const resetDefaults = () => {
    setSettings({
      enabled: false,
      discountType: 'percentage',
      value: 10,
      minPurchase: 0,
      expiryDays: 30,
      prefix: 'THANKS'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          <span>Post-Purchase Discount Codes</span>
        </CardTitle>
        <CardDescription>
          Configure automatic discount codes generated after a customer completes a purchase
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="enabled">Enable Post-Purchase Discounts</Label>
            <p className="text-sm text-muted-foreground">
              When enabled, customers will receive a one-time discount code after completing a purchase
            </p>
          </div>
          <Switch 
            id="enabled" 
            checked={settings.enabled} 
            onCheckedChange={handleSwitchChange}
          />
        </div>

        <div className="grid gap-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discountType">Discount Type</Label>
              <Select 
                value={settings.discountType} 
                onValueChange={(value) => handleSelectChange('discountType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select discount type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">
                {settings.discountType === 'percentage' ? 'Percentage (%)' : 'Amount ($)'}
              </Label>
              <Input
                id="value"
                name="value"
                type="number"
                min={0}
                max={settings.discountType === 'percentage' ? 100 : undefined}
                value={settings.value}
                onChange={handleValueChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minPurchase">Minimum Purchase Amount ($)</Label>
              <Input
                id="minPurchase"
                name="minPurchase"
                type="number"
                min={0}
                value={settings.minPurchase}
                onChange={handleValueChange}
              />
              <p className="text-xs text-muted-foreground">
                Minimum order amount to use the discount code (0 for no minimum)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiryDays">Expiry Period (Days)</Label>
              <Input
                id="expiryDays"
                name="expiryDays"
                type="number"
                min={1}
                value={settings.expiryDays}
                onChange={handleValueChange}
              />
              <p className="text-xs text-muted-foreground">
                Number of days before the discount code expires
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prefix">Code Prefix</Label>
            <Input
              id="prefix"
              name="prefix"
              value={settings.prefix}
              onChange={handleValueChange}
              maxLength={10}
            />
            <p className="text-xs text-muted-foreground">
              Prefix for generated discount codes (e.g., THANKS-ABCD123)
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t px-6 py-4">
        <Button
          variant="outline"
          onClick={resetDefaults}
          disabled={isSaving}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset to Defaults
        </Button>
        <Button 
          onClick={saveSettings}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}