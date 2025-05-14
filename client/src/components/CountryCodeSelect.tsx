import { useState, useEffect, useRef } from 'react';

interface CountryOption {
  code: string;
  dialCode: string;
}

interface CountryCodeSelectProps {
  countries: CountryOption[];
  value: string;
  onChange: (value: string) => void;
}

/**
 * A custom country code select component that maintains a fixed width
 */
export default function CountryCodeSelect({ countries, value, onChange }: CountryCodeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedCountry = countries.find(c => c.code === value);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-[90px] flex-shrink-0" ref={dropdownRef}>
      {/* Custom select trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2 border border-[#E8D9B5] rounded-md bg-white text-left"
        style={{ height: '46px', boxSizing: 'border-box' }}
      >
        <span className="text-sm">
          +{selectedCountry?.dialCode}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {/* Dropdown options */}
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-[#E8D9B5] rounded-md shadow-lg max-h-60 overflow-auto">
          {countries.map((country) => (
            <button
              key={country.code}
              type="button"
              className={`w-full text-left px-2 py-1 hover:bg-[#F8F4EA] text-sm ${
                country.code === value ? 'bg-[#F8F4EA] font-medium' : ''
              }`}
              onClick={() => {
                onChange(country.code);
                setIsOpen(false);
              }}
            >
              <div className="flex justify-between">
                <span>+{country.dialCode}</span>
                <span className="text-xs text-gray-500">{country.code}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}