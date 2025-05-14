// Review service to maintain consistent data across components
import { apiRequest } from "./queryClient";

export interface Review {
  id: number;
  userId: number;
  productId: number;
  userName: string;
  rating: number;
  comment: string;  // Changed from 'content' to match the database schema
  createdAt: string;
}

// Get reviews for a specific product - React Query will handle caching
export async function getProductReviews(productId: string): Promise<Review[]> {
  try {
    // Fetch reviews from API
    const reviews = await apiRequest(`/api/products/${productId}/reviews`);
    
    // Return the reviews directly, let React Query handle the caching
    return reviews;
  } catch (error) {
    console.error("Error fetching reviews:", error);
    // If there's an error with the API call, return an empty array
    return [];
  }
}

// Submit a review for a product
export async function submitReview(
  productId: string, 
  reviewData: { 
    rating: number; 
    comment: string;  // Changed from 'content' to match schema
    userName?: string; // For guest reviews
  }
): Promise<Review | null> {
  try {
    const isLoggedIn = !!localStorage.getItem('token');
    
    let url = `/api/products/${productId}/reviews`;
    
    // For guest reviews, use the guest-reviews endpoint
    if (!isLoggedIn) {
      url = `/api/products/${productId}/guest-reviews`;
      if (!reviewData.userName) {
        throw new Error("Guest reviews require a userName");
      }
    }
    
    // Submit review to API and return the result
    // React Query will handle cache invalidation via the UI components
    const review = await apiRequest(url, 'POST', reviewData);
    return review;
  } catch (error) {
    console.error("Error submitting review:", error);
    return null;
  }
}

// Helper functions to calculate review stats from an array of reviews
// Used by React Query-powered components
export function calculateReviewCount(reviews: Review[]): number {
  return reviews.length;
}

export function calculateAverageRating(reviews: Review[]): number {
  if (!reviews || reviews.length === 0) return 0;
  const sum = reviews.reduce((total: number, review: Review) => total + review.rating, 0);
  return parseFloat((sum / reviews.length).toFixed(1));
}

// Async versions for fetching from the server - React Query compatible
// Get review count for a product
export async function fetchReviewCount(productId: string): Promise<number> {
  try {
    const reviews = await getProductReviews(productId);
    return calculateReviewCount(reviews);
  } catch (error) {
    console.error("Error getting review count:", error);
    return 0;
  }
}

// Calculate average rating for a product
export async function fetchAverageRating(productId: string): Promise<number> {
  try {
    const reviews = await getProductReviews(productId);
    return calculateAverageRating(reviews);
  } catch (error) {
    console.error("Error calculating average rating:", error);
    return 0;
  }
}

// Temporary home page testimonials - we don't remove these as requested
export const homePageTestimonials = [
  {
    id: 1,
    text: "The most luxurious chocolate I've ever tasted. The richness and complexity of flavors is outstanding. Highly recommend!",
    name: "Elena G.",
    location: "Dubai",
    rating: 5
  },
  {
    id: 2,
    text: "These chocolates make the perfect gift. The packaging is exquisite and the quality is unmatched.",
    name: "James B.",
    location: "London",
    rating: 5
  },
  {
    id: 3,
    text: "Premium quality in every bite. Worth every penny for a special occasion.",
    name: "Sophia L.",
    location: "Paris",
    rating: 5
  }
];