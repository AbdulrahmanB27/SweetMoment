import React from 'react';
import CountdownTimer from '../components/CountdownTimer';

// Simple pattern to match (countdown) anywhere in text
const COUNTDOWN_PATTERN = /\(countdown\)/i;

/**
 * Parses a product description and replaces any countdown placeholder
 * with an actual countdown component
 * 
 * @param description The product description text
 * @param saleEndDate The end date of the sale
 * @param saleActive Whether the sale is active
 * @returns JSX element with parsed description
 */
export const parseProductDescription = (
  description: string,
  saleEndDate?: string | null,
  saleActive?: boolean
): JSX.Element | string => {
  // If there's no description, return the original description
  if (!description) {
    return description;
  }

  // Log description and sale information for debugging
  console.log("Parsing description:", { 
    text: description, 
    endDate: saleEndDate, 
    active: saleActive,
    hasCountdown: COUNTDOWN_PATTERN.test(description)
  });
  
  // If no sale end date or not active, return the original description
  if (!saleEndDate || !saleActive) {
    return description;
  }

  // Check if the description contains the countdown pattern
  if (COUNTDOWN_PATTERN.test(description)) {
    try {
      // Parse the end date
      const endDate = new Date(saleEndDate);
      
      // If the end date is invalid, return the original description
      if (isNaN(endDate.getTime())) {
        console.error('Invalid sale end date:', saleEndDate);
        return description;
      }
      
      // Use a more direct approach - Get the index of the countdown pattern
      const indexOfCountdown = description.indexOf("(countdown)");
      
      // If found, split text into before and after parts
      if (indexOfCountdown !== -1) {
        const beforeText = description.substring(0, indexOfCountdown);
        const afterText = description.substring(indexOfCountdown + "(countdown)".length);
        
        console.log("Better parsing:", { beforeText, afterText });
        
        // Create display with explicit space preservation
        return (
          <>
            <span>{beforeText}</span>
            <CountdownTimer 
              key="countdown" 
              endDate={endDate} 
              className="my-1" 
              compact={true}  /* Use compact mode for banner displays */
            />
            <span>{afterText}</span>
          </>
        );
      }
      
      // Fallback to original description if split didn't work as expected
      return description;
    } catch (error) {
      console.error('Error parsing sale end date:', error);
      return description;
    }
  }
  
  // If no countdown pattern found, return the original description
  return description;
};