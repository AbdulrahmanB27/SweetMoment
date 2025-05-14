import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

interface LegalPageProps {
  title: string;
  contentKey: "privacyPolicy" | "termsOfService" | "shippingPolicy";
}

const LegalPage = ({ title, contentKey }: LegalPageProps) => {
  const [content, setContent] = useState<string>("");
  
  // Fetch site customization data
  const { data: siteConfig, isLoading } = useQuery({
    queryKey: ["/api/site-customization"],
    queryFn: async () => {
      const response = await fetch("/api/site-customization");
      if (!response.ok) {
        throw new Error("Failed to fetch site customization data");
      }
      return response.json();
    }
  });
  
  // Initialize state with fetched data
  useEffect(() => {
    if (siteConfig && siteConfig.legalInfo) {
      try {
        const parsedLegalInfo = typeof siteConfig.legalInfo === 'string'
          ? JSON.parse(siteConfig.legalInfo)
          : siteConfig.legalInfo;
        
        setContent(parsedLegalInfo[contentKey] || "Content is being updated. Please check back soon.");
      } catch (e) {
        console.error(`Error parsing legalInfo for ${contentKey}:`, e);
        setContent("Could not load content. Please try again later.");
      }
    }
  }, [siteConfig, contentKey]);
  
  // Replace newlines with <br> tags for proper rendering
  const formatContent = (text: string) => {
    if (!text) return "Content is being updated. Please check back soon.";
    return text.split('\n').map((line, i) => (
      <p key={i} className="mb-4">{line || <br />}</p>
    ));
  };
  
  return (
    <div className="container mx-auto px-4 pt-28 pb-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">{title}</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 md:p-8">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="prose max-w-none">
            {formatContent(content)}
          </div>
        )}
      </div>
    </div>
  );
};

export default LegalPage;