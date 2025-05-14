/**
 * Global type declarations for the static site implementation
 */

/**
 * Extends the Window interface to include our static site specific global variables
 */
interface Window {
  /**
   * Flag to indicate that we're in static site mode
   */
  STATIC_SITE_MODE?: boolean;
  
  /**
   * Static data object containing all the data needed for the static site
   */
  STATIC_DATA?: any;
  
  /**
   * Base URL for the static site (used for resource path handling)
   */
  STATIC_SITE_BASE_URL?: string;
  
  /**
   * Generation timestamp for the static site
   */
  STATIC_SITE_GENERATED_AT?: string;
}

/**
 * Declare global CSS modules
 */
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}