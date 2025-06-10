import React from "react";
import Image from "next/image"

interface ExploreButtonProps {
  imgSrc: string;
  imgAlt: string;
  label: string;
  onClick: () => void;
  ariaLabel?: string;
  subtitle?: string;
}

const ExploreButton: React.FC<ExploreButtonProps> = ({
  imgSrc,
  imgAlt,
  label,
  onClick,
  ariaLabel,
  subtitle,
}) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center transition hover:text-reddi-bottom focus:outline-none focus:ring-2 focus:ring-reddi-bottom"
    aria-label={ariaLabel || label}
    type="button"
  >
    <div className="relative w-14 h-14 flex items-center justify-center overflow-visible">
      {/* Background circle with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full shadow-lg" />
      
      {/* Icon that overflows the container */}
      <Image 
        src={imgSrc} 
        alt={imgAlt} 
        width={72} 
        height={72} 
        className="object-contain absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
      />
    </div>
    <div className="flex flex-col items-center justify-center">
      <span className="text-center text-sm font-extra-light mt-2">{label}</span>
      {subtitle && <span className="text-center text-sm text-gray-600">{subtitle}</span>}
    </div>
  </button>
);

export default ExploreButton;
