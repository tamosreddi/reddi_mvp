"use client"

import { useState } from "react"
import Image from "next/image"
import { X } from "lucide-react"

interface InfoButtonProps {
  imageSrc: string
  title: string
  description: string
  className?: string
}

export default function InfoButton({
  imageSrc,
  title,
  description,
  className = "",
}: InfoButtonProps) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) {
    return null
  }

  return (
    <div
      className={`relative flex items-center gap-4 py-4 pl-4 pr-10 bg-gray-200 rounded-2xl shadow-none border-gray-100 ${className}`}
    >
      <div className="flex-shrink-0">
        <Image
          src={imageSrc}
          alt="Info"
          width={48}
          height={48}
          className="rounded-lg object-cover"
        />
      </div>
      <div className="flex-grow">
        <h3 className="font-bold text-gray-900 text-base">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Dismiss"
      >
        <X size={18} />
      </button>
    </div>
  )
} 