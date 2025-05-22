"use client"

import type React from "react"
import { cn } from "@/lib/utils"

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  fallback?: string
  size?: "sm" | "md" | "lg"
}

export function Avatar({ src, alt = "", fallback, size = "md", className, ...props }: AvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  }

  return (
    <div
      className={cn("relative flex shrink-0 overflow-hidden rounded-full bg-muted", sizeClasses[size], className)}
      {...props}
    >
      {src ? (
        <img src={src || "/placeholder.svg"} alt={alt} className="aspect-square h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
          {fallback || alt.charAt(0).toUpperCase() || "U"}
        </div>
      )}
    </div>
  )
}
