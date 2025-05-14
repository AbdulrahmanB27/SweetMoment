import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) return;
    
    // This would normally call the subscribe API endpoint
    toast({
      title: "Thank you for subscribing!",
      description: "You'll receive updates on our latest products and offers.",
    });
    
    setEmail("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex">
      <Input
        type="email"
        placeholder="Your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded-l-md px-4 py-2 w-full text-[#2A1A18] focus:outline-none border-r-0"
        required
      />
      <Button 
        type="submit"
        className="bg-[#D4AF37] hover:bg-[#B8860B] transition-colors rounded-l-none py-2 px-4"
        aria-label="Subscribe"
      >
        <Send size={16} />
      </Button>
    </form>
  );
};

export default Newsletter;
