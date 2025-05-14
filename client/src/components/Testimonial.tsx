import { Star, User } from "lucide-react";

interface TestimonialProps {
  text: string;
  name?: string;  // From default testimonials in reviewService
  author?: string; // From site customization admin panel
  location?: string;
  rating: number;
  date?: string;
  avatar?: string;
}

const Testimonial = ({ text, name, author, location, rating, date }: TestimonialProps) => {
  // Use author from site customization or name from default testimonials
  const displayName = author || name || 'Anonymous';
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            className={`${i < rating ? 'text-[#E5C976] fill-[#E5C976]' : 'text-[#E5C976] opacity-25'}`}
          />
        ))}
      </div>
      <p className="text-[#6F4E37] mb-4">{text}</p>
      <div className="flex items-center">
        <div className="mr-4">
          <div className="w-10 h-10 bg-[#8D6142] rounded-full flex items-center justify-center text-white font-semibold">
            {displayName ? (
              displayName.charAt(0).toUpperCase()
            ) : (
              <User size={18} className="text-white" />
            )}
          </div>
        </div>
        <div>
          <h4 className="font-semibold">{displayName}</h4>
          <p className="text-sm text-gray-600">{location || ''}</p>
        </div>
      </div>
    </div>
  );
};

export default Testimonial;
