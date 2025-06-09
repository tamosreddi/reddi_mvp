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
    <div className="w-12 h-12 flex items-center justify-center bg-blue-50 rounded-full mr-4 shadow-md">
      <Image src={imgSrc} alt={imgAlt} width={48} height={48} className="object-contain" />
    </div>
    <div className="flex flex-col items-center justify-center">
      <span className="text-center text-sm font-extra-light mt-2">{label}</span>
      {subtitle && <span className="text-center text-sm text-gray-600">{subtitle}</span>}
    </div>
  </button>
);

export default ExploreButton;
