import React from "react";

export interface Option {
  id: string;
  label: string;
  sublabel?: string;
  value: string;
  price?: number;
}

interface OptionSelectorProps {
  options: Option[];
  selectedValue: string;
  onChange: (value: string) => void;
  title: string;
}

const OptionSelector = ({ options, selectedValue, onChange, title }: OptionSelectorProps) => {
  return (
    <div className="mb-6">
      <h4 className="font-montserrat font-semibold mb-3">{title}</h4>
      <div className={`grid grid-cols-${options.length} gap-3`}>
        {options.map(option => (
          <div
            key={option.id}
            className={`cursor-pointer p-3 border rounded-md text-center hover:border-[#D4AF37] transition-all ${
              selectedValue === option.value 
                ? 'border-[#D4AF37] border-2' 
                : 'border-[#D2B48C]'
            }`}
            onClick={() => onChange(option.value)}
          >
            <p className="font-semibold">{option.label}</p>
            {option.sublabel && (
              <p className="text-sm text-[#6F4E37]">{option.sublabel}</p>
            )}
            {option.price !== undefined && !option.sublabel && (
              <p className="text-sm text-[#6F4E37]">${option.price.toFixed(2)}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OptionSelector;
