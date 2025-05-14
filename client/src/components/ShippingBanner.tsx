import { Truck } from "lucide-react";

const ShippingBanner = () => {
  return (
    <div className="bg-[#003366] text-white py-2 px-4 text-center w-full shadow-md">
      <div className="container mx-auto flex items-center justify-center">
        <Truck className="mr-2 h-4 w-4" />
        <p className="text-sm font-medium">Free Standard Shipping on Orders $75+</p>
      </div>
    </div>
  );
};

export default ShippingBanner;