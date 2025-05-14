// Define constant image references to ensure consistency across the application

export const DEFAULT_HERO_IMAGES = [
  '/static/hero-default-1.jpg',
  '/static/hero-default-2.jpg',
  '/static/hero-default-3.jpg'
];

export const DEFAULT_PRODUCT_IMAGE = '/static/hero-default-1.jpg';

// Function to get a default hero image by index with wraparound
export function getDefaultHeroImage(index: number = 0): string {
  const wrappedIndex = index % DEFAULT_HERO_IMAGES.length;
  return DEFAULT_HERO_IMAGES[wrappedIndex];
}