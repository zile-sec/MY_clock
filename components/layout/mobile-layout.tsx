"use client"

import type React from "react"
import { Home, Calendar, List, Settings, Plus } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useTheme } from "@/components/theme-provider"

interface MobileLayoutProps {
  children: React.ReactNode
  onOpenAddTask: () => void
  onOpenCategoryManager: () => void
  onOpenReminderSettings: () => void
  onOpenGoogleCalendarSettings: () => void
  onBackgroundChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function MobileLayout({
  children,
  onOpenAddTask,
  onOpenCategoryManager,
  onOpenReminderSettings,
  onOpenGoogleCalendarSettings,
  onBackgroundChange,
  activeTab,
  setActiveTab,
}: MobileLayoutProps) {
  const { theme } = useTheme()

  return (
    <div className="flex flex-col h-[100dvh]">
      {/* Header */}
      <div className="p-4 flex justify-between items-center border-b border-border">
        <h1 className="text-foreground text-xl font-bold">Productivity</h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <label className="cursor-pointer text-foreground">
            <Settings size={20} />
            <input type="file" accept="image/*" className="hidden" onChange={onBackgroundChange} />
          </label>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4">{children}</div>

      {/* Add Button (Floating) */}
      <button
        className="absolute bottom-20 right-4 z-10 bg-primary text-primary-foreground p-3 rounded-full shadow-lg"
        onClick={onOpenAddTask}
      >
        <Plus size={24} />
      </button>

      {/* Bottom Navigation */}
      <div className="bg-card border-t border-border p-2 grid grid-cols-4 gap-1">
        <button
          className={`flex flex-col items-center justify-center p-2 rounded-lg ${
            activeTab === "home" ? "bg-primary/10 text-primary" : "text-muted-foreground"
          }`}
          onClick={() => setActiveTab("home")}
        >
          <Home size={20} />
          <span className="text-xs mt-1">Home</span>
        </button>
        <button
          className={`flex flex-col items-center justify-center p-2 rounded-lg ${
            activeTab === "tasks" ? "bg-primary/10 text-primary" : "text-muted-foreground"
          }`}
          onClick={() => setActiveTab("tasks")}
        >
          <List size={20} />
          <span className="text-xs mt-1">Tasks</span>
        </button>
        <button
          className={`flex flex-col items-center justify-center p-2 rounded-lg ${
            activeTab === "calendar" ? "bg-primary/10 text-primary" : "text-muted-foreground"
          }`}
          onClick={() => setActiveTab("calendar")}
        >
          <Calendar size={20} />
          <span className="text-xs mt-1">Calendar</span>
        </button>
        <button
          className={`flex flex-col items-center justify-center p-2 rounded-lg ${
            activeTab === "settings" ? "bg-primary/10 text-primary" : "text-muted-foreground"
          }`}
          onClick={() => setActiveTab("settings")}
        >
          <Settings size={20} />
          <span className="text-xs mt-1">Settings</span>
        </button>
      </div>
    </div>
  )
}
