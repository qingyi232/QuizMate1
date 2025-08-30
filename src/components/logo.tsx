import Image from 'next/image'
import { useState } from 'react'

interface LogoProps {
  className?: string
  size?: number
}

export default function Logo({ className, size = 40 }: LogoProps) {
  const [imageError, setImageError] = useState(false)

  const handleImageError = () => {
    setImageError(true)
  }

  return (
    <div className={`rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden ${className}`} style={{ width: `${size}px`, height: `${size}px` }}>
      {!imageError ? (
        <Image 
          src="/logo-32.png"
          alt="QuizMate Logo" 
          width={size}
          height={size}
          className="object-contain"
          style={{ width: `${size}px`, height: `${size}px` }}
          onError={handleImageError}
        />
      ) : (
        <div className="bg-gradient-to-r from-blue-600 to-green-500 w-full h-full flex items-center justify-center">
          <span className="text-xl font-bold text-white" style={{ fontSize: `${size * 0.5}px` }}>Q</span>
        </div>
      )}
    </div>
  )
}