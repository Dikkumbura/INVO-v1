import React, { useState } from 'react';
import clsx from 'clsx';

interface InsuranceTypeSelectProps {
  onSelect: (type: string) => void;
  isLoading: boolean;
}

const insuranceTypes = [
  "Workers' Comp",
  "Temp Staffing",
  "Trucking"
] as const;

export default function InsuranceTypeSelect({ onSelect, isLoading }: InsuranceTypeSelectProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    if (!selectedValue) return;

    setIsTransitioning(true);
    
    // Trigger the loading animation
    setTimeout(() => {
      onSelect(selectedValue);
      // Animation duration matches CSS transition
      setTimeout(() => setIsTransitioning(false), 800);
    }, 50);
  };

  return (
    <div className="w-full max-w-xs relative">
      <select
        id="insurance-type"
        aria-label="Select Insurance Type"
        onChange={handleChange}
        defaultValue=""
        disabled={isLoading || isTransitioning}
        className={clsx(
          "block w-full rounded-md border-gray-300 shadow-sm",
          "focus:border-accent focus:ring focus:ring-accent focus:ring-opacity-50",
          "disabled:bg-gray-100 disabled:cursor-not-allowed",
          "transition-opacity duration-300",
          {
            "opacity-50": isTransitioning
          }
        )}
      >
        <option value="" disabled>Select Insurance Type</option>
        {insuranceTypes.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
      
      {/* Loading indicator */}
      {isTransitioning && (
        <div 
          className="absolute inset-y-0 right-8 flex items-center"
          aria-hidden="true"
        >
          <div className="h-4 w-4 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}