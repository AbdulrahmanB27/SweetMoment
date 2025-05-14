import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { normalizeDate } from "@/lib/dateUtils" // Import the shared normalizeDate function

// Simple interface to handle the date issues directly
interface CalendarProps {
  className?: string;
  classNames?: Record<string, string>;
  showOutsideDays?: boolean;
  mode?: "single";
  selected?: Date;
  defaultMonth?: Date;
  disabled?: (date: Date) => boolean;
  onSelect?: (date?: Date) => void;
  [key: string]: any;
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  mode = "single",
  selected,
  onSelect,
  defaultMonth,
  disabled,
  ...props
}: CalendarProps) {
  const [animationClass, setAnimationClass] = React.useState<string | null>(null);
  
  // Custom navigation with animations
  const handlePreviousMonth = () => {
    setAnimationClass("animate-slide-from-left");
    setTimeout(() => setAnimationClass(null), 300);
  }
  
  const handleNextMonth = () => {
    setAnimationClass("animate-slide-from-right");
    setTimeout(() => setAnimationClass(null), 300);
  }

  // Custom header to keep navigation buttons in a stable position
  const CustomCaption = ({ displayMonth, onMonthChange }: { displayMonth: Date, onMonthChange?: (date: Date) => void }) => {
    // Calculate previous and next months
    const previousMonth = new Date(displayMonth);
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    
    const nextMonth = new Date(displayMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    const handlePrevClick = () => {
      handlePreviousMonth();
      if (onMonthChange) onMonthChange(previousMonth);
    };
    
    const handleNextClick = () => {
      handleNextMonth();
      if (onMonthChange) onMonthChange(nextMonth);
    };
    
    return (
      <div className="flex justify-center items-center py-2 px-2 relative h-9">
        <div className="absolute left-0">
          <button
            onClick={handlePrevClick}
            className="h-7 w-7 inline-flex items-center justify-center rounded-md p-0 opacity-70 hover:opacity-100 hover:bg-primary/10 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        <div className="text-sm font-medium">
          {format(displayMonth, 'MMMM yyyy')}
        </div>

        <div className="absolute right-0">
          <button
            onClick={handleNextClick}
            className="h-7 w-7 inline-flex items-center justify-center rounded-md p-0 opacity-70 hover:opacity-100 hover:bg-primary/10 transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };
  
  // Get a normalized version of the default month or current date
  const normalizedDefaultMonth = React.useMemo(() => {
    return normalizeDate(defaultMonth || new Date()) as Date;
  }, [defaultMonth]);
  
  // A state to track the current month displayed in the DayPicker
  const [currentMonth, setCurrentMonth] = React.useState<Date>(normalizedDefaultMonth);

  // When the month changes, we'll apply our animations
  const handleMonthChange = (newMonth: Date) => {
    if (newMonth.getTime() > currentMonth.getTime()) {
      handleNextMonth();
    } else {
      handlePreviousMonth();
    }
    setCurrentMonth(newMonth);
  };

  // Create a handler that fixes the date selection issue by offsetting by one day
  const handleDateSelect = (day: Date | undefined) => {
    if (!onSelect) return;

    if (day) {
      // SIMPLE FIX: Add one day to the date to correct the displacement
      // Create a new date object that's one day after what was clicked
      // This corrects the timezone issue by directly addressing the displacement
      const correctedDate = new Date(day);
      correctedDate.setDate(correctedDate.getDate() + 1); // Add 1 day
      
      console.log('Original calendar date clicked:', day);
      console.log('Offset date (1 day later):', correctedDate);
      
      // Pass the corrected date (1 day later) to fix the selection issue
      onSelect(correctedDate);
    } else {
      onSelect(undefined);
    }
  };

  // Normalize the selected date to prevent timezone issues
  const normalizedSelected = React.useMemo(() => {
    if (!selected) return undefined;
    
    // Use the same manual normalization approach to ensure consistency
    const year = selected.getFullYear();
    const month = selected.getMonth();
    const date = selected.getDate();
    
    // Create a new date at noon local time
    return new Date(year, month, date, 12, 0, 0, 0);
  }, [selected]);
  
  // Create a properly typed disabled function that ensures dates are compared properly
  const handleDisabledDates = React.useCallback((date: Date) => {
    if (!disabled) return false;
    
    // Use the same manual normalization approach for disabled dates
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    
    // Create a new date at noon local time
    const manuallyNormalizedDate = new Date(year, month, day, 12, 0, 0, 0);
    
    // Pass the normalized date to the disabled function
    return disabled(manuallyNormalizedDate);
  }, [disabled]);

  // Debug selected date
  React.useEffect(() => {
    if (selected) {
      console.log('Calendar received selected date:', selected);
      console.log('Normalized to:', normalizedSelected);
    }
  }, [selected, normalizedSelected]);

  return (
    <div className="overflow-hidden rounded-md">
      <div className={cn(
        "transition-all duration-300 bg-background", 
        animationClass,
        // Fixed height calendar container - ensures consistent height
        "h-[352px]" // Height accommodates 6 rows of dates (worst case scenario)
      )}>
        <DayPicker
          mode="single"
          showOutsideDays={showOutsideDays}
          className={cn("p-3", className)}
          month={currentMonth}
          onMonthChange={handleMonthChange}
          selected={normalizedSelected}
          onSelect={handleDateSelect}
          disabled={disabled ? handleDisabledDates : undefined}
          classNames={{
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
            month: "space-y-4 w-full",
            caption: "flex justify-center pt-1 relative items-center",
            caption_label: "hidden", // Hide default caption, we'll use our custom one
            nav: "hidden", // Hide default nav, we'll use our custom one in the caption
            table: "w-full border-collapse space-y-1",
            head_row: "flex",
            head_cell:
              "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
            row: "flex w-full mt-2",
            cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
            day: cn(
              buttonVariants({ variant: "ghost" }),
              "h-9 w-9 p-0 font-normal aria-selected:opacity-100 transition-transform hover:scale-110 active:scale-95"
            ),
            day_range_end: "day-range-end",
            day_selected:
              "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
            day_today: "bg-accent text-accent-foreground",
            day_outside:
              "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
            day_disabled: "text-muted-foreground opacity-50",
            day_range_middle:
              "aria-selected:bg-accent aria-selected:text-accent-foreground",
            day_hidden: "invisible",
            ...classNames,
          }}
          components={{
            Caption: ({ displayMonth }) => (
              <CustomCaption 
                displayMonth={displayMonth} 
                onMonthChange={(date) => handleMonthChange(date)}
              />
            )
          }}
          fixedWeeks={true} // Ensure consistent height with 6 rows always shown
        />
      </div>
    </div>
  )
}

Calendar.displayName = "Calendar"

export { Calendar }
