import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { getProductReviews, submitReview, Review } from "@/lib/reviewService";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface ReviewSystemProps {
  productId: string;
}

const ReviewSystem = ({ productId }: ReviewSystemProps) => {
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: "", // Changed from 'content' to 'comment' to match the schema
    name: ""
  });
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const { toast } = useToast();

  const queryClient = useQueryClient();

  // Use React Query to fetch and cache reviews
  const {
    data: reviews = [],
    isLoading: isLoadingReviews,
    refetch: refetchReviewsQuery
  } = useQuery({
    queryKey: [`product-reviews-${productId}`],
    queryFn: () => getProductReviews(productId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Function to refetch reviews after submission
  const refetchReviews = async () => {
    try {
      console.log("Refetching reviews for product:", productId);
      
      // Refetch the current product's reviews
      await refetchReviewsQuery();
      
      // Completely invalidate all product-related queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: [`product-${productId}`] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      
      // Invalidate any dynamic product reviews
      queryClient.invalidateQueries({ queryKey: ['dynamic-product-reviews'] });
      
      // Invalidate specific product data
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}`] });
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      
      // Invalidate menu queries and all specific product queries
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      
      // Invalidate admin product data as well
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products-with-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/reviews'] });
      
      console.log("Invalidated all related queries");
    } catch (error) {
      console.error("Error refreshing reviews:", error);
    }
  };

  // Check if user is logged in on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!newReview.comment.trim()) {
        toast({
          title: "Error",
          description: "Please enter a review comment.",
          duration: 1000,
        });
        setLoading(false);
        return;
      }
      
      const reviewData: any = {
        rating: newReview.rating,
        comment: newReview.comment // Directly use comment field
      };
      
      if (!isLoggedIn) {
        // For guest reviews, use the provided name
        if (!newReview.name.trim()) {
          toast({
            title: "Error",
            description: "Please enter your name.",
            duration: 1000,
          });
          setLoading(false);
          return;
        }
        
        reviewData.userName = newReview.name;
      }
      
      // Submit review to API
      const review = await submitReview(productId, reviewData);
      
      if (review) {
        // Refresh the reviews list
        refetchReviews();
        
        // Reset form
        setNewReview({
          rating: 5,
          comment: "",
          name: ""
        });
        
        toast({
          title: "Success",
          description: "Your review has been submitted.",
          duration: 1000,
        });
      } else {
        throw new Error("Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({
        title: "Error",
        description: "Could not submit review. Please try again later.",
        duration: 1000,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
    
    return formatDate(dateString);
  };

  return (
    <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-2xl font-montserrat font-semibold mb-6">Customer Reviews</h3>
      
      {/* Review submission form */}
      <div className="mb-8 bg-[#FAF5F0] p-6 rounded-lg">
        <h4 className="font-montserrat font-medium text-lg mb-4">Write a Review</h4>
        <form onSubmit={handleSubmitReview}>
          {!isLoggedIn && (
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
              <Input
                id="name"
                type="text"
                value={newReview.name}
                onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                placeholder="Enter your name"
                className="w-full"
              />
            </div>
          )}
          
          <div className="mb-4">
            <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNewReview({ ...newReview, rating: star })}
                  className="focus:outline-none"
                  aria-label={`Rate ${star} stars`}
                >
                  <Star
                    size={24}
                    className={`${star <= newReview.rating ? 'text-[#D4AF37] fill-[#D4AF37]' : 'text-gray-300'}`}
                  />
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-1">Your Review</label>
            <Textarea
              id="review"
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              placeholder="Share your thoughts about this product..."
              className="w-full h-24"
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={loading}
            className="bg-[#4A2C2A] hover:bg-[#3A1F1D] text-white"
          >
            {loading ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      </div>
      
      {/* Reviews list */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No reviews yet. Be the first to review this product!</p>
        ) : (
          <>
            {(showAllReviews ? reviews : reviews.slice(0, 3)).map((review) => (
              <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="bg-[#D4AF37] text-white w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm mr-3">
                      {review.userName.charAt(0)}
                    </div>
                    <div>
                      <h5 className="font-montserrat font-medium">{review.userName}</h5>
                      <div className="flex mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={`${i < review.rating ? 'text-[#D4AF37] fill-[#D4AF37]' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{timeAgo(review.createdAt)}</span>
                </div>
                <p className="text-gray-700 mt-2">{review.comment}</p>
              </div>
            ))}
            
            {reviews.length > 3 && (
              <Button 
                variant="ghost" 
                onClick={() => setShowAllReviews(!showAllReviews)} 
                className="text-[#6F4E37] hover:text-[#4A2C2A] hover:bg-[#F5EFEA] w-full"
              >
                {showAllReviews ? "Show Less" : `Show All ${reviews.length} Reviews`}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ReviewSystem;