import React, { useState } from 'react';
import { format } from 'date-fns';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Banner height constants
export const AWAY_BANNER_HEIGHT = "3.25rem"; // Slightly taller than discount banner
export const AWAY_BANNER_HEIGHT_PX = 52; // Same as 3.25rem in pixels
// Header height constant - typical height of the navigation header
export const HEADER_HEIGHT_PX = 60; // Average height of the header in pixels

interface AwayModeSettings {
  enabled: boolean;
  message: string;
  showReturnDate: boolean;
  returnDate: string;
  disableOrders: boolean;
}

interface AwayModeBannerProps {
  settings: AwayModeSettings;
  onDismiss?: () => void; // Callback for parent to know when banner is dismissed
}

export function AwayModeBanner({ settings, onDismiss }: AwayModeBannerProps) {
  // No local states needed - we'll let the parent component handle everything
  
  // Format the date for display if needed
  const formattedDate = settings.showReturnDate && settings.returnDate
    ? format(new Date(settings.returnDate), 'MMMM do, yyyy')
    : null;

  return (
    <div className="w-full h-full flex items-center justify-between px-4">
      <div className="flex items-center gap-2 text-white font-medium">
        <AlertTriangle className="h-5 w-5 text-white flex-shrink-0" />
        <div className="text-sm md:text-base">
          <span className="font-bold">Sweet Moment is on a break.</span>{' '}
          {settings.message}
          {formattedDate && (
            <span> We'll be back on {formattedDate}. </span>
          )}
          {settings.disableOrders && (
            <span className="font-bold"> New orders are temporarily disabled.</span>
          )}
        </div>
      </div>
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-7 w-7 p-0 text-white hover:text-yellow-800 hover:bg-amber-400 ml-2 flex-shrink-0" 
        onClick={onDismiss}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Dismiss</span>
      </Button>
    </div>
  );
}