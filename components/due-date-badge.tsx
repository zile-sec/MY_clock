"use client"

import { cn } from "@/lib/utils"
import { Calendar } from "lucide-react"

interface DueDateBadgeProps {
  dueDate: string | null
  className?: string
}

export function DueDateBadge({ dueDate, className }: DueDateBadgeProps) {
  if (!dueDate) return null

  const dueDateObj = new Date(dueDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const isToday = dueDateObj.getTime() === today.getTime()
  const isTomorrow = dueDateObj.getTime() === tomorrow.getTime()
  const isPast = dueDateObj < today

  // Format the date
  let formattedDate = ""
  if (isToday) {
    formattedDate = "Today"
  } else if (isTomorrow) {
    formattedDate = "Tomorrow"
  } else {
    formattedDate = dueDateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  // Determine the color based on due date
  let colorClass = "bg-secondary text-secondary-foreground" // Default
  if (isPast) {
    colorClass = "bg-red-900/30 text-red-300" // Overdue
  } else if (isToday) {
    colorClass = "bg-orange-900/30 text-orange-300" // Due today
  } else if (isTomorrow) {
    colorClass = "bg-yellow-900/30 text-yellow-300" // Due tomorrow
  }

  return (
    <div className={cn("inline-flex items-center px-2 py-1 rounded-full text-xs font-medium", colorClass, className)}>
      <Calendar className="w-3 h-3 mr-1" />
      {formattedDate}
    </div>
  )
}
