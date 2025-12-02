"use client"

import { cn } from "@/lib/utils"

interface CategoryBadgeProps {
  name: string
  color: string
  className?: string
  onClick?: () => void
}

export function CategoryBadge({ name, color, className, onClick }: CategoryBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
        onClick ? "cursor-pointer" : "",
        className,
      )}
      style={{ backgroundColor: `${color}30`, color: color }} // Using hex opacity for background
      onClick={onClick}
    >
      <span className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: color }}></span>
      {name}
    </div>
  )
}
