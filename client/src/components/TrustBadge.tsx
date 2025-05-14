import { LucideIcon } from "lucide-react";

interface TrustBadgeProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const TrustBadge = ({ icon: Icon, title, description }: TrustBadgeProps) => {
  return (
    <div className="flex flex-col items-center">
      <Icon className="text-3xl text-[#4A2C2A] mb-3" size={32} />
      <h3 className="font-montserrat font-semibold mb-1">{title}</h3>
      <p className="text-sm text-[#6F4E37] text-center">{description}</p>
    </div>
  );
};

export default TrustBadge;
