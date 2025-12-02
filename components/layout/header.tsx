"use client"

import type React from "react"
import { Settings, Bell, Tag, Clock, Calendar, Trash2 } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

interface HeaderProps {
  onOpenCategoryManager: () => void
  onOpenReminderSettings: () => void
  onOpenGoogleCalendarSettings?: () => void
  onOpenAutoDeleteSettings: () => void
  onBackgroundChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function Header({
  onOpenCategoryManager,
  onOpenReminderSettings,
  onOpenGoogleCalendarSettings,
  onOpenAutoDeleteSettings,
  onBackgroundChange,
}: HeaderProps) {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-foreground text-2xl font-bold">Minimalist Productivity</h1>
      <div className="flex gap-4">
        <button className="text-foreground" onClick={onOpenReminderSettings}>
          <Clock size={20} />
        </button>
        <button className="text-foreground" onClick={onOpenCategoryManager}>
          <Tag size={20} />
        </button>
        {onOpenGoogleCalendarSettings && (
          <button className="text-foreground" onClick={onOpenGoogleCalendarSettings}>
            <Calendar size={20} />
          </button>
        )}
        <button className="text-foreground" onClick={onOpenAutoDeleteSettings}>
          <Trash2 size={20} />
        </button>
        <button className="text-foreground">
          <Bell size={20} />
        </button>
        <ThemeToggle />
        <label className="cursor-pointer text-foreground">
          <Settings size={20} />
          <input type="file" accept="image/*" className="hidden" onChange={onBackgroundChange} />
        </label>
      </div>
    </div>
  )
}
