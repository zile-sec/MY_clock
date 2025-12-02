"use client"

import type React from "react"
import { useState, useEffect } from "react"
import FlipClock from "@/components/flip-clock"
import TaskWidget from "@/components/task-widget"
import TaskList from "@/components/task-list"
import CalendarWidget from "@/components/calendar-widget"
import { CategoryManager } from "@/components/category-manager"
import { ReminderSettings as ReminderSettingsComponent } from "@/components/reminder-settings"
import { GoogleCalendarSettings } from "@/components/google-calendar-settings"
import { Header } from "@/components/layout/header"
import { MobileLayout } from "@/components/layout/mobile-layout"
import { Plus, Calendar } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "@/components/theme-provider"
import { useMobile } from "@/hooks/use-mobile"
import { ThemeToggle } from "@/components/theme-toggle"
import { fetchGoogleCalendarEvents, convertGoogleEventToAppEvent, isSignedInToGoogle } from "@/services/google-calendar"
import { AutoDeleteSetting } from "@/components/auto-delete-setting"
import { useRotatingBackground } from "@/hooks/use-rotating-background"
import { BackgroundInfo } from "@/components/background-info"
// Import the local storage service at the top of the file
import { saveAppData, loadAppData } from "@/services/local-storage"

// Define the Task type
interface Task {
  id: number
  text: string
  completed: boolean
  categoryId: string | null
  dueDate: string | null
  hasReminder: boolean
}

// Define the Category type
interface Category {
  id: string
  name: string
  color: string
}

// Define the ReminderSettings type
interface ReminderSettings {
  enabled: boolean
  reminderTime: number // minutes before due date
}

// Define the CalendarEvent type
interface CalendarEvent {
  id: string
  title: string
  date: string // ISO string
  startTime: string // HH:MM format
  endTime: string // HH:MM format
  status: "online" | "video" | "offline"
}

export default function Home() {
  const { theme } = useTheme()
  const isMobile = useMobile()
  const [activeTab, setActiveTab] = useState("home")
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, text: "Get some food", completed: false, categoryId: null, dueDate: null, hasReminder: false },
    { id: 2, text: "Feed my dog", completed: false, categoryId: null, dueDate: null, hasReminder: false },
    { id: 3, text: "Prepare everything", completed: false, categoryId: null, dueDate: null, hasReminder: false },
  ])

  const [categories, setCategories] = useState<Category[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const rotatingBackground = useRotatingBackground()
  const [customBackgroundImage, setCustomBackgroundImage] = useState<string | null>(null)
  const [backgroundFitMode, setBackgroundFitMode] = useState<
    "cover" | "contain" | "stretch" | "fit-width" | "fit-height"
  >("cover")
  const backgroundImage = customBackgroundImage || rotatingBackground || "/background.jpeg"
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false)
  const [isReminderSettingsOpen, setIsReminderSettingsOpen] = useState(false)
  const [isGoogleCalendarSettingsOpen, setIsGoogleCalendarSettingsOpen] = useState(false)
  const [newTaskText, setNewTaskText] = useState("")
  const [newTaskCategory, setNewTaskCategory] = useState<string | null>(null)
  const [newTaskDueDate, setNewTaskDueDate] = useState<string>("")
  const [newTaskHasReminder, setNewTaskHasReminder] = useState(false)
  const [isElectron, setIsElectron] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [dueDateFilter, setDueDateFilter] = useState<string>("all")
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>({
    enabled: true,
    reminderTime: 30, // Default to 30 minutes
  })
  const [autoSyncGoogleCalendar, setAutoSyncGoogleCalendar] = useState(false)
  const [googleCalendarConnected, setGoogleCalendarConnected] = useState(false)
  const [autoDeleteCompleted, setAutoDeleteCompleted] = useState(false)
  const [isAutoDeleteSettingsOpen, setIsAutoDeleteSettingsOpen] = useState(false)

  // Load data from storage
  useEffect(() => {
    const loadData = async () => {
      try {
        // First try to load from Electron if available
        if (typeof window !== "undefined" && window.electron) {
          setIsElectron(true)
          try {
            const data = await window.electron.loadData()
            if (data) {
              if (data.tasks) setTasks(data.tasks)
              if (data.categories) setCategories(data.categories)
              if (data.events) setEvents(data.events)
              if (data.reminderSettings) setReminderSettings(data.reminderSettings)
              if (data.googleCalendarSettings) {
                setAutoSyncGoogleCalendar(data.googleCalendarSettings.autoSync || false)
              }
              // Don't override the default background image unless user has explicitly set one
              if (data.customBackgroundImage && data.customBackgroundImage !== "/placeholder.svg?key=jhb6a") {
                setCustomBackgroundImage(data.customBackgroundImage)
              }
              if (data.autoDeleteCompleted !== undefined) setAutoDeleteCompleted(data.autoDeleteCompleted)
              if (data.backgroundFitMode) setBackgroundFitMode(data.backgroundFitMode)
            }
          } catch (electronError) {
            console.error("Failed to load data from Electron:", electronError)

            // Fall back to browser local storage
            const localData = loadAppData()
            if (localData.tasks && localData.tasks.length > 0) setTasks(localData.tasks)
            if (localData.categories && localData.categories.length > 0) setCategories(localData.categories)
            if (localData.events && localData.events.length > 0) setEvents(localData.events)
            if (localData.reminderSettings) setReminderSettings(localData.reminderSettings)
            if (localData.googleCalendarSettings) {
              setAutoSyncGoogleCalendar(localData.googleCalendarSettings.autoSync || false)
            }
            if (localData.customBackgroundImage) setCustomBackgroundImage(localData.customBackgroundImage)
            if (localData.autoDeleteCompleted !== undefined) setAutoDeleteCompleted(localData.autoDeleteCompleted)
          }
        } else {
          // Browser environment - use local storage
          const localData = loadAppData()
          if (localData.tasks && localData.tasks.length > 0) setTasks(localData.tasks)
          if (localData.categories && localData.categories.length > 0) setCategories(localData.categories)
          if (localData.events && localData.events.length > 0) setEvents(localData.events)
          if (localData.reminderSettings) setReminderSettings(localData.reminderSettings)
          if (localData.googleCalendarSettings) {
            setAutoSyncGoogleCalendar(localData.googleCalendarSettings.autoSync || false)
          }
          if (localData.customBackgroundImage) setCustomBackgroundImage(localData.customBackgroundImage)
          if (localData.autoDeleteCompleted !== undefined) setAutoDeleteCompleted(localData.autoDeleteCompleted)
        }

        // Check if Google Calendar is connected
        try {
          const signedIn = await isSignedInToGoogle()
          setGoogleCalendarConnected(signedIn)
        } catch (error) {
          console.error("Failed to check Google Calendar connection:", error)
        }
      } catch (error) {
        console.error("Failed to load data:", error)
      }
    }

    loadData()
  }, [])

  // Save data to storage
  useEffect(() => {
    const saveData = async () => {
      // Skip saving if there's nothing to save
      if (tasks.length === 0 && categories.length === 0 && events.length === 0) {
        return
      }

      // Save to Electron if available
      if (isElectron && window.electron) {
        try {
          const data = (await window.electron.loadData()) || {}
          await window.electron.saveData({
            ...data,
            tasks,
            categories,
            events,
            customBackgroundImage,
            reminderSettings,
            googleCalendarSettings: {
              autoSync: autoSyncGoogleCalendar,
            },
            autoDeleteCompleted,
            backgroundFitMode,
          })
        } catch (error) {
          console.error("Failed to save data to Electron:", error)

          // Fall back to browser local storage
          saveAppData({
            tasks,
            categories,
            events,
            customBackgroundImage,
            reminderSettings,
            googleCalendarSettings: {
              autoSync: autoSyncGoogleCalendar,
            },
            autoDeleteCompleted,
          })
        }
      } else {
        // Browser environment - use local storage
        saveAppData({
          tasks,
          categories,
          events,
          customBackgroundImage,
          reminderSettings,
          googleCalendarSettings: {
            autoSync: autoSyncGoogleCalendar,
          },
          autoDeleteCompleted,
        })
      }
    }

    const saveTimeout = setTimeout(() => {
      saveData()
    }, 1000) // Debounce save operations

    return () => clearTimeout(saveTimeout)
  }, [
    tasks,
    categories,
    events,
    customBackgroundImage,
    reminderSettings,
    autoSyncGoogleCalendar,
    isElectron,
    autoDeleteCompleted,
    backgroundFitMode,
  ])

  // Check for reminders when the app starts
  useEffect(() => {
    if (isElectron && window.electron) {
      window.electron.checkReminders()
    }
  }, [isElectron])

  const toggleTask = (id: number) => {
    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task))

      // If auto-delete is enabled and the task was just completed, remove it after a short delay
      if (autoDeleteCompleted) {
        const completedTask = updatedTasks.find((task) => task.id === id && task.completed)
        if (completedTask) {
          // Set a timeout to remove the task after 1 second
          setTimeout(() => {
            setTasks((current) => current.filter((t) => t.id !== id))
          }, 1000)
        }
      }

      return updatedTasks
    })
  }

  const addTask = () => {
    if (newTaskText.trim() === "") return

    const newTask: Task = {
      id: Date.now(),
      text: newTaskText,
      completed: false,
      categoryId: newTaskCategory,
      dueDate: newTaskDueDate || null,
      hasReminder: newTaskHasReminder && !!newTaskDueDate,
    }

    setTasks([...tasks, newTask])
    setNewTaskText("")
    setNewTaskCategory(null)
    setNewTaskDueDate("")
    setNewTaskHasReminder(false)
    setIsAddTaskOpen(false)
  }

  const addCategory = (category: Omit<Category, "id">) => {
    const newCategory: Category = {
      ...category,
      id: Date.now().toString(),
    }
    setCategories([...categories, newCategory])
  }

  const deleteCategory = (id: string) => {
    // Remove the category
    setCategories(categories.filter((cat) => cat.id !== id))

    // Update tasks that had this category
    setTasks(tasks.map((task) => (task.categoryId === id ? { ...task, categoryId: null } : task)))

    // Reset filter if it was set to this category
    if (categoryFilter === id) {
      setCategoryFilter(null)
    }
  }

  const updateReminderSettings = (settings: ReminderSettings) => {
    setReminderSettings(settings)
  }

  const handleBackgroundChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size before reading (limit to ~5MB to avoid storage issues)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image is too large. Please select an image under 5MB.")
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        setCustomBackgroundImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Filter tasks based on selected category and due date
  const getFilteredTasks = () => {
    let filtered = tasks

    // Apply category filter
    if (categoryFilter) {
      filtered = filtered.filter((task) => task.categoryId === categoryFilter)
    }

    // Apply due date filter
    if (dueDateFilter !== "all") {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const nextWeek = new Date(today)
      nextWeek.setDate(nextWeek.getDate() + 7)

      switch (dueDateFilter) {
        case "today":
          filtered = filtered.filter((task) => {
            if (!task.dueDate) return false
            const dueDate = new Date(task.dueDate)
            return dueDate.getTime() === today.getTime()
          })
          break
        case "tomorrow":
          filtered = filtered.filter((task) => {
            if (!task.dueDate) return false
            const dueDate = new Date(task.dueDate)
            return dueDate.getTime() === tomorrow.getTime()
          })
          break
        case "upcoming":
          filtered = filtered.filter((task) => {
            if (!task.dueDate) return false
            const dueDate = new Date(task.dueDate)
            return dueDate >= today && dueDate <= nextWeek
          })
          break
        case "overdue":
          filtered = filtered.filter((task) => {
            if (!task.dueDate) return false
            const dueDate = new Date(task.dueDate)
            return dueDate < today
          })
          break
        case "no-date":
          filtered = filtered.filter((task) => !task.dueDate)
          break
      }
    }

    return filtered
  }

  const filteredTasks = getFilteredTasks()

  // Default background colors based on theme
  const defaultBackground = theme === "dark" ? "#1A1A1A" : "#F5F5F5"

  // Sync with Google Calendar
  const syncWithGoogleCalendar = async () => {
    if (!googleCalendarConnected) return

    try {
      // Get events from Google Calendar for the next month
      const endDate = new Date()
      endDate.setMonth(endDate.getMonth() + 1)

      const googleEvents = await fetchGoogleCalendarEvents(new Date(), endDate)

      if (googleEvents.length > 0) {
        // Convert Google events to app format
        const appEvents = googleEvents.map(convertGoogleEventToAppEvent)

        // Merge with existing events (avoid duplicates by ID)
        const existingIds = new Set(events.map((e) => e.id))
        const newEvents = appEvents.filter((e) => !existingIds.has(e.id))

        if (newEvents.length > 0) {
          setEvents((prev) => [...prev, ...newEvents])
        }
      }

      return true
    } catch (error) {
      console.error("Failed to sync with Google Calendar:", error)
      return false
    }
  }

  // Get background CSS class based on fit mode
  const getBackgroundClass = () => {
    const baseClass = "win11-background"
    switch (backgroundFitMode) {
      case "contain":
        return `${baseClass} contain-mode`
      case "stretch":
        return `${baseClass} stretch-mode`
      case "fit-width":
        return `${baseClass} fit-width`
      case "fit-height":
        return `${baseClass} fit-height`
      default:
        return baseClass
    }
  }

  // Render mobile content based on active tab
  const renderMobileContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <div className="flex flex-col gap-6">
            <FlipClock />
            <TaskWidget title="Current Focus" tasks={filteredTasks} categories={categories} onTaskToggle={toggleTask} />
          </div>
        )
      case "tasks":
        return (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-primary">Tasks</h2>
            <div className="w-full">
              <TaskList
                tasks={filteredTasks}
                categories={categories}
                onTaskToggle={toggleTask}
                onCategoryFilter={setCategoryFilter}
                onDueDateFilter={setDueDateFilter}
                activeFilter={categoryFilter}
                activeDateFilter={dueDateFilter}
                autoDeleteCompleted={autoDeleteCompleted}
              />
            </div>
          </div>
        )
      case "calendar":
        return (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-primary">Calendar</h2>
            <div className="w-full">
              <CalendarWidget />
            </div>
          </div>
        )
      case "settings":
        return (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-primary">Settings</h2>
            <Button onClick={() => setIsCategoryManagerOpen(true)} className="w-full justify-start">
              Manage Categories
            </Button>
            <Button onClick={() => setIsReminderSettingsOpen(true)} className="w-full justify-start">
              Reminder Settings
            </Button>
            <Button onClick={() => setIsGoogleCalendarSettingsOpen(true)} className="w-full justify-start">
              <Calendar className="mr-2 h-4 w-4" />
              Google Calendar
              {googleCalendarConnected && (
                <span className="ml-auto bg-green-500/20 text-green-500 text-xs px-2 py-0.5 rounded-full">
                  Connected
                </span>
              )}
            </Button>
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Task Management</h3>
              <AutoDeleteSetting enabled={autoDeleteCompleted} onToggle={setAutoDeleteCompleted} />
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Background Settings</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="background-fit">Background Fit Mode</Label>
                  <Select value={backgroundFitMode} onValueChange={(value: any) => setBackgroundFitMode(value)}>
                    <SelectTrigger id="background-fit" className="bg-background border-input">
                      <SelectValue placeholder="Select fit mode" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="cover">Cover (Windows style)</SelectItem>
                      <SelectItem value="contain">Contain (fit entire image)</SelectItem>
                      <SelectItem value="stretch">Stretch (may distort)</SelectItem>
                      <SelectItem value="fit-width">Fit Width</SelectItem>
                      <SelectItem value="fit-height">Fit Height</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className="bg-primary text-primary-foreground p-2 rounded-md">Change Background</div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleBackgroundChange} />
                </label>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Theme</h3>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <span>Toggle Dark/Light Mode</span>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  // Main render
  return (
    <>
      {/* Fixed background that covers the entire viewport */}
      <div
        className={getBackgroundClass()}
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundColor: !backgroundImage ? defaultBackground : undefined,
        }}
      />

      {/* Content container */}
      <div className="content-container">
        {isMobile ? (
          <div className="backdrop-blur-sm bg-background/70 min-h-screen">
            <MobileLayout
              onOpenAddTask={() => setIsAddTaskOpen(true)}
              onOpenCategoryManager={() => setIsCategoryManagerOpen(true)}
              onOpenReminderSettings={() => setIsReminderSettingsOpen(true)}
              onOpenGoogleCalendarSettings={() => setIsGoogleCalendarSettingsOpen(true)}
              onBackgroundChange={handleBackgroundChange}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            >
              {renderMobileContent()}
              <BackgroundInfo backgroundUrl={backgroundImage} />
            </MobileLayout>
          </div>
        ) : (
          <div className="container mx-auto backdrop-blur-sm bg-background/70 p-8 rounded-3xl">
            {/* Header */}
            <Header
              onOpenCategoryManager={() => setIsCategoryManagerOpen(true)}
              onOpenReminderSettings={() => setIsReminderSettingsOpen(true)}
              onBackgroundChange={handleBackgroundChange}
              onOpenAutoDeleteSettings={() => setIsAutoDeleteSettingsOpen(true)}
            />

            {/* Main content */}
            <div className="flex flex-col gap-8">
              {/* Clock section */}
              <div className="flex justify-center">
                <FlipClock />
              </div>

              {/* Widgets section */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
                <TaskWidget
                  title="Production Sync"
                  tasks={filteredTasks}
                  categories={categories}
                  onTaskToggle={toggleTask}
                />
                <TaskList
                  tasks={filteredTasks}
                  categories={categories}
                  onTaskToggle={toggleTask}
                  onCategoryFilter={setCategoryFilter}
                  onDueDateFilter={setDueDateFilter}
                  activeFilter={categoryFilter}
                  activeDateFilter={dueDateFilter}
                  autoDeleteCompleted={autoDeleteCompleted}
                />
                <CalendarWidget />
              </div>
            </div>
            <BackgroundInfo backgroundUrl={backgroundImage} />
            {/* Google Calendar button */}
            <button
              className="fixed bottom-8 left-8 bg-secondary text-secondary-foreground p-3 rounded-full shadow-lg flex items-center justify-center"
              onClick={() => setIsGoogleCalendarSettingsOpen(true)}
            >
              <Calendar size={24} />
            </button>

            {/* Add button */}
            <button
              className="fixed bottom-8 right-8 bg-primary text-primary-foreground p-4 rounded-full shadow-lg"
              onClick={() => setIsAddTaskOpen(true)}
            >
              <Plus size={24} />
            </button>
          </div>
        )}
      </div>

      {/* Add Task Dialog */}
      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogContent className="bg-card text-card-foreground border-border">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="task">Task</Label>
              <Input
                id="task"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="Enter task description"
                className="bg-background border-input"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={newTaskCategory || ""} onValueChange={(value) => setNewTaskCategory(value || null)}>
                <SelectTrigger id="category" className="bg-background border-input">
                  <SelectValue placeholder="Select a category (optional)" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="none">No category</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></span>
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="due-date">Due Date (optional)</Label>
              <Input
                id="due-date"
                type="date"
                value={newTaskDueDate}
                onChange={(e) => setNewTaskDueDate(e.target.value)}
                className="bg-background border-input"
              />
            </div>

            {newTaskDueDate && (
              <div className="flex items-center space-x-2">
                <Switch id="reminder" checked={newTaskHasReminder} onCheckedChange={setNewTaskHasReminder} />
                <Label htmlFor="reminder">Set reminder</Label>
              </div>
            )}

            <Button onClick={addTask} className="mt-2">
              Add Task
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Category Manager */}
      <CategoryManager
        categories={categories}
        onAddCategory={addCategory}
        onDeleteCategory={deleteCategory}
        open={isCategoryManagerOpen}
        onOpenChange={setIsCategoryManagerOpen}
      />

      {/* Reminder Settings */}
      <ReminderSettingsComponent
        settings={reminderSettings}
        onUpdateSettings={updateReminderSettings}
        open={isReminderSettingsOpen}
        onOpenChange={setIsReminderSettingsOpen}
      />

      {/* Auto Delete Setting */}
      <Dialog open={isAutoDeleteSettingsOpen} onOpenChange={setIsAutoDeleteSettingsOpen}>
        <DialogContent className="bg-card text-card-foreground border-border">
          <DialogHeader>
            <DialogTitle>Task Management Settings</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <AutoDeleteSetting enabled={autoDeleteCompleted} onToggle={setAutoDeleteCompleted} />
            <Button onClick={() => setIsAutoDeleteSettingsOpen(false)} className="mt-2">
              Save Settings
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Google Calendar Settings */}
      <GoogleCalendarSettings
        open={isGoogleCalendarSettingsOpen}
        onOpenChange={setIsGoogleCalendarSettingsOpen}
        onSyncEvents={syncWithGoogleCalendar}
        autoSync={autoSyncGoogleCalendar}
        onAutoSyncChange={setAutoSyncGoogleCalendar}
      />
    </>
  )
}
