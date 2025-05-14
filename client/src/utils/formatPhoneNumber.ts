/**
 * Utility to format phone numbers as they are typed
 * Formats to: (XXX) XXX-XXXX
 */

export function formatPhoneNumber(value: string): string {
  // Remove all non-numeric characters, but preserve any existing '+' at the beginning
  const hasPlus = value.startsWith('+');
  
  // Remove all non-numeric characters
  let phoneNumber = value.replace(/\D/g, '');
  
  // Format the phone number based on length
  if (phoneNumber.length < 4) {
    return hasPlus ? '+' + phoneNumber : phoneNumber;
  } else if (phoneNumber.length < 7) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
  } else {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  }
}

/**
 * Utility function to validate email addresses
 * Returns true if the email format is valid
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}