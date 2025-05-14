import { GiftIcon, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface ComingSoonProps {
  pageName: string;
}

const ComingSoon = ({ pageName }: ComingSoonProps) => {

  return (
    <div className="py-24 flex flex-col items-center justify-center min-h-[50vh] bg-[#FCFAF7]">
      <div className="bg-white p-8 rounded-lg max-w-lg mx-auto text-center shadow-md border border-[#E8D9B5]">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#D4AF37]/20 mb-4">
          <GiftIcon className="h-8 w-8 text-[#D4AF37]" />
        </div>
        <h1 className="text-3xl font-bold mb-4 font-montserrat text-[#2A1A18]">{pageName}</h1>
        <p className="text-lg mb-6 text-[#5A3D3B]">
          We're working hard to bring you the best experience.
          <br />This page will be available soon!
        </p>
        <Link href="/">
          <Button 
            variant="outline" 
            className="mt-4 border-2 border-[#4A2C2A] bg-white text-[#4A2C2A] hover:bg-[#F5EFEA] rounded-md transition-colors font-semibold flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ComingSoon;