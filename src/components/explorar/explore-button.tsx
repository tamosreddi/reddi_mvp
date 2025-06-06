import React from "react";
import Image from "next/image"

interface ExploreButtonProps {
  imgSrc: string;
  imgAlt: string;
  label: string;
  onClick: () => void;
  ariaLabel?: string;
}

const ExploreButton: React.FC<ExploreButtonProps> = ({
  imgSrc,
  imgAlt,
  label,
  onClick,
  ariaLabel,
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
    <span className="text-xs text-gray-800 font-extra-light text-center mt-1">{label}</span>
  </button>
);

export default ExploreButton;
