'use client'

import Image from 'next/image'
import { useState } from 'react'

interface SafeLogoProps {
  className?: string
  size?: number
}

export default function SafeLogo({ className, size = 40 }: SafeLogoProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const handleImageError = () => {
    setImageError(true)
    setImageLoaded(false)
  }

  const handleImageLoad = () => {
    setImageLoaded(true)
    setImageError(false)
  }

  return (
    <div className={`rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden ${className}`} style={{ width: `${size}px`, height: `${size}px` }} suppressHydrationWarning>
      {!imageError ? (
        <Image
          src="/logo-32.png"
          alt="QuizMate Logo"
          width={size}
          height={size}
          className="object-contain w-full h-full"
          onError={handleImageError}
          onLoad={handleImageLoad}
          priority
          suppressHydrationWarning
        />
      ) : (
        <div className="bg-gradient-to-r from-blue-600 to-green-500 w-full h-full flex items-center justify-center">
          <span className="text-xl font-bold text-white" style={{ fontSize: `${size * 0.5}px` }}>Q</span>
        </div>
      )}
    </div>
  )
}