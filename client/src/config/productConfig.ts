/**
 * Product Configuration
 * 
 * This file centralizes all product-specific configurations for special handling
 * of products with unique requirements for shapes, sizes, and defaults.
 */

// Map of products that have shape options
export const shapeEnabledProducts: Record<string, boolean> = {
  // Numeric IDs
  "47": true, // Dubai Bar
  "49": true, 
  "50": true,
  // "48": true, // Signature Collection doesn't have shape options
  
  // String-based IDs
  "dubaibar": true,
  "goldbar": true,
  "signaturegold": true
  // "signaturecollection": true // Signature Collection doesn't have shape options
};

// Map of products that don't have size options
export const productsWithoutSizes: Record<string, boolean> = {
  // Numeric IDs
  "47": true, // Dubai Bar
  
  // String-based IDs
  "dubaibar": true,
  "goldbar": true,
  "signaturegold": true
};

// Map of products that don't have type options (e.g. milk/dark chocolate)
export const productsWithoutTypes: Record<string, boolean> = {
  // Signature collection doesn't have chocolate type options
  "48": true, // Signature Collection (numeric ID)
  "signaturecollection": true // String ID
};

// Product-specific size options
export const productSizeOptions: Record<string, string[]> = {
  // Regular products have all three sizes
  "42": ["small", "medium", "large"], // Classic Chocolate
  "44": ["small", "medium", "large"], // Caramel Chocolate
  "46": ["small", "medium", "large"], // Assorted Nuts
  
  // Signature Collection only has small and large (no medium)
  "48": ["small", "large"],
  "signaturecollection": ["small", "large"],
  
  // Default for all other products
  "default": ["small", "medium", "large"]
};

// Default shape configurations for shape-enabled products
export const defaultShapes: Record<string, string> = {
  // Numeric IDs
  "47": "Rectangular", // Dubai Bar default shape is rectangular
  // "48": "Round",    // Signature Collection doesn't have shape options
  "49": "Round",       // Other product default shape
  "50": "Curved",      // Other product default shape
  
  // String-based IDs
  "dubaibar": "Rectangular",
  "goldbar": "Rectangular",
  "signaturegold": "Rectangular"
  // "signaturecollection": "Round" // Signature Collection doesn't have shape options
};

// Map of available shapes for specific products
export const productAvailableShapes: Record<string, string[]> = {
  // Dubai Bar has only rectangular and curved options
  "47": ["rectangular", "curved"],
  "dubaibar": ["rectangular", "curved"],
  
  // Gold bar has only rectangular
  "goldbar": ["rectangular"],
  
  // Signature gold products have rectangular and curved
  "signaturegold": ["rectangular", "curved"],
  
  // Signature collection doesn't have shape options
  // "48": ["round", "rectangular", "curved"],
  // "signaturecollection": ["round", "rectangular", "curved"],
  
  // Default products with all options
  "default": ["round", "rectangular", "curved"]
};

// Helper function to check if a product has shape options
export function hasShapeOption(productId: string | number): boolean {
  const productIdStr = productId ? String(productId).toLowerCase() : '';
  return shapeEnabledProducts[productIdStr] === true;
}

// Helper function to check if a product has size options
export function hasSizeOption(productId: string | number): boolean {
  const productIdStr = productId ? String(productId).toLowerCase() : '';
  return productsWithoutSizes[productIdStr] !== true;
}

// Helper function to check if a product has type options (milk/dark)
export function hasTypeOption(productId: string | number): boolean {
  const productIdStr = productId ? String(productId).toLowerCase() : '';
  return productsWithoutTypes[productIdStr] !== true;
}

// Get default shape for a product if available
export function getDefaultShape(productId: string | number): string {
  const productIdStr = productId ? String(productId).toLowerCase() : '';
  return defaultShapes[productIdStr] || '';
}

// Get available shapes for a specific product
export function getAvailableShapes(productId: string | number): string[] {
  if (!productId) return productAvailableShapes.default;
  
  const productIdStr = String(productId).toLowerCase();
  return productAvailableShapes[productIdStr] || productAvailableShapes.default;
}

// Get available sizes for a specific product
export function getAvailableSizes(productId: string | number): string[] {
  if (!productId) return productSizeOptions.default;
  
  const productIdStr = String(productId).toLowerCase();
  return productSizeOptions[productIdStr] || productSizeOptions.default;
}