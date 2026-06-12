"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface ProductImageProps {
  src?: string | null
  alt: string
  className?: string
  imageClassName?: string
  fallbackClassName?: string
  width?: number
  height?: number
}

export function ProductImage({
  src,
  alt,
  className,
  imageClassName,
  fallbackClassName,
  width = 200,
  height = 200,
}: ProductImageProps) {
  const [error, setError] = useState(false)
  const hasImage = !!src && !error

  if (!hasImage) {
    return (
      <div
        className={cn(
          "flex aspect-square items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 text-4xl font-bold text-blue-400",
          fallbackClassName,
          className,
        )}
      >
        {alt.charAt(0).toUpperCase()}
      </div>
    )
  }

  return (
    <div className={cn("relative aspect-square overflow-hidden", className)}>
      <Image
        src={src!}
        alt={alt}
        width={width}
        height={height}
        className={cn("h-full w-full object-cover", imageClassName)}
        onError={() => setError(true)}
      />
    </div>
  )
}
