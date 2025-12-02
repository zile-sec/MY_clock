"use client"

import { useState, useEffect } from "react"
import { Plus, CalendarIcon, RefreshCw } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMobile } from "@/hooks/use-mobile"
import {
  fetchGoogleCalendarEvents,
  createGoogleCalendarEvent,
  isSignedInToGoogle,
  convertAppEventToGoogleEvent,
  convertGoogleEventToAppEvent,
} from "@/services/google-calendar"
// Import the local storage service at the top of the file
import { saveToLocalStorage, loadFromLocalStorage, STORAGE_KEYS } from "@/services/local-storage"

type CalendarEvent = {
  id: string
  title: string
  date: string // ISO string
  startTime: string // HH:MM format
  endTime: string // HH:MM format
  status: "online" | "video" | "offline"
}

export default function CalendarWidget() {
  const isMobile = useMobile()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isAddEventOpen, setIsAddEventOpen] = useState(false)
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    title: "",
    date: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "10:00",
    status: "online",
  })
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth())
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [googleCalendarConnected, setGoogleCalendarConnected] = useState(false)
  const [syncingWithGoogle, setSyncingWithGoogle] = useState(false)
  const [autoSyncWithGoogle, setAutoSyncWithGoogle] = useState(false)

  // Load events from local storage
  useEffect(() => {
    const loadEvents = async () => {
      if (typeof window !== "undefined") {
        try {
          // Try to load from Electron if available
          if (window.electron) {
            const data = await window.electron.loadData()
            if (data && data.events) {
              setEvents(data.events)
            }
            if (data && data.googleCalendarSettings) {
              setAutoSyncWithGoogle(data.googleCalendarSettings.autoSync || false)
            }
          } else {
            // Otherwise try to load from local storage
            const storedEvents = loadFromLocalStorage(STORAGE_KEYS.EVENTS, [])
            if (storedEvents.length > 0) {
              setEvents(storedEvents)
            }

            const googleSettings = loadFromLocalStorage(STORAGE_KEYS.GOOGLE_CALENDAR_SETTINGS, {
              autoSync: false,
            })
            setAutoSyncWithGoogle(googleSettings.autoSync)
          }

          // Check if Google Calendar is connected
          const signedIn = await isSignedInToGoogle()
          setGoogleCalendarConnected(signedIn)

          // If auto-sync is enabled and Google Calendar is connected, sync events
          if (signedIn && autoSyncWithGoogle) {
            syncWithGoogleCalendar()
          }
        } catch (error) {
          console.error("Failed to load events:", error)
        }
      }
    }

    loadEvents()
  }, [])

  // Save events to local storage
  useEffect(() => {
    const saveEvents = async () => {
      if (typeof window !== "undefined" && events.length > 0) {
        try {
          if (window.electron) {
            const data = (await window.electron.loadData()) || {}
            await window.electron.saveData({
              ...data,
              events,
              googleCalendarSettings: {
                autoSync: autoSyncWithGoogle,
              },
            })
          } else {
            // Save to local storage
            saveToLocalStorage(STORAGE_KEYS.EVENTS, events)
            saveToLocalStorage(STORAGE_KEYS.GOOGLE_CALENDAR_SETTINGS, {
              autoSync: autoSyncWithGoogle,
            })
          }
        } catch (error) {
          console.error("Failed to save events:", error)
        }
      }
    }

    saveEvents()
  }, [events, autoSyncWithGoogle])

  // Update current date every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  const month = new Date(selectedYear, selectedMonth).toLocaleString("default", { month: "long" })

  // Generate calendar days
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay()

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i)

  // Get today's events
  const todayEvents = events
    .filter((event) => {
      const eventDate = new Date(event.date)
      return (
        eventDate.getDate() === currentDate.getDate() &&
        eventDate.getMonth() === currentDate.getMonth() &&
        eventDate.getFullYear() === currentDate.getFullYear()
      )
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  // Get next event
  const now = new Date()
  const currentTimeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`

  const upcomingEvents = events
    .filter((event) => {
      const eventDate = new Date(event.date)
      const isToday =
        eventDate.getDate() === now.getDate() &&
        eventDate.getMonth() === now.getMonth() &&
        eventDate.getFullYear() === now.getFullYear()

      return isToday && event.startTime > currentTimeStr
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  const nextEvent = upcomingEvents.length > 0 ? upcomingEvents[0] : null

  // Calculate time until next event
  const getTimeUntilNextEvent = () => {
    if (!nextEvent) return null

    const [nextHours, nextMinutes] = nextEvent.startTime.split(":").map(Number)
    const nextEventTime = new Date()
    nextEventTime.setHours(nextHours, nextMinutes, 0)

    const diffMs = nextEventTime.getTime() - now.getTime()
    if (diffMs <= 0) return null

    const diffMinutes = Math.floor(diffMs / 60000)
    if (diffMinutes < 60) {
      return `${diffMinutes} min`
    } else {
      const hours = Math.floor(diffMinutes / 60)
      const minutes = diffMinutes % 60
      return `${hours}h ${minutes}m`
    }
  }

  const timeUntilNext = getTimeUntilNextEvent()

  // Handle month navigation
  const prevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11)
      setSelectedYear(selectedYear - 1)
    } else {
      setSelectedMonth(selectedMonth - 1)
    }
  }

  const nextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0)
      setSelectedYear(selectedYear + 1)
    } else {
      setSelectedMonth(selectedMonth + 1)
    }
  }

  // Handle adding new event
  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.date || !newEvent.startTime || !newEvent.endTime) {
      return
    }

    const event: CalendarEvent = {
      id: Date.now().toString(),
      title: newEvent.title || "",
      date: newEvent.date || new Date().toISOString().split("T")[0],
      startTime: newEvent.startTime || "09:00",
      endTime: newEvent.endTime || "10:00",
      status: (newEvent.status as "online" | "video" | "offline") || "online",
    }

    // Add to local events
    setEvents([...events, event])

    // If Google Calendar is connected and auto-sync is enabled, add to Google Calendar
    if (googleCalendarConnected && autoSyncWithGoogle) {
      try {
        const googleEvent = convertAppEventToGoogleEvent(event)
        const createdEvent = await createGoogleCalendarEvent(googleEvent)

        if (createdEvent) {
          // Update the event ID to match Google Calendar
          setEvents((prev) => prev.map((e) => (e.id === event.id ? { ...e, id: createdEvent.id } : e)))
        }
      } catch (error) {
        console.error("Failed to create event in Google Calendar:", error)
      }
    }

    setIsAddEventOpen(false)
    setNewEvent({
      title: "",
      date: new Date().toISOString().split("T")[0],
      startTime: "09:00",
      endTime: "10:00",
      status: "online",
    })
  }

  // Format time for display
  const formatTimeRange = (start: string, end: string) => {
    return `${start}-${end.split(":")[0]}:${end.split(":")[1]}`
  }

  // Sync with Google Calendar
  const syncWithGoogleCalendar = async () => {
    if (!googleCalendarConnected) return

    setSyncingWithGoogle(true)

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
    } catch (error) {
      console.error("Failed to sync with Google Calendar:", error)
    } finally {
      setSyncingWithGoogle(false)
    }
  }

  return (
    <div className={`bg-card rounded-3xl p-4 ${isMobile ? "w-full" : "w-80"}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-muted-foreground text-sm">Calendar</span>
        <div className="flex items-center">
          <button onClick={prevMonth} className="text-muted-foreground px-1">
            &lt;
          </button>
          <span className="text-muted-foreground text-sm px-2">
            {month} {selectedYear}
          </span>
          <button onClick={nextMonth} className="text-muted-foreground px-1">
            &gt;
          </button>
        </div>
      </div>

      {/* Google Calendar sync indicator */}
      {googleCalendarConnected && (
        <div className="flex items-center justify-between mb-2 text-xs">
          <div className="flex items-center gap-1 text-primary">
            <CalendarIcon size={12} />
            <span>Google Calendar</span>
          </div>
          {syncingWithGoogle ? (
            <div className="flex items-center gap-1 text-muted-foreground">
              <RefreshCw size={12} className="animate-spin" />
              <span>Syncing...</span>
            </div>
          ) : (
            <button onClick={syncWithGoogleCalendar} className="text-primary hover:underline">
              Sync Now
            </button>
          )}
        </div>
      )}

      {nextEvent && timeUntilNext && (
        <div className="mb-4">
          <h2 className="text-foreground text-xl font-semibold">{nextEvent.title}</h2>
          <p className="text-foreground">in {timeUntilNext}</p>
        </div>
      )}

      <div className="grid grid-cols-7 gap-1 mb-4">
        {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
          <div key={i} className="text-center text-muted-foreground text-xs">
            {day}
          </div>
        ))}

        {blanks.map((_, i) => (
          <div key={`blank-${i}`} className="h-6"></div>
        ))}

        {days.map((day) => {
          // Check if this day has events
          const hasEvents = events.some((event) => {
            const eventDate = new Date(event.date)
            return (
              eventDate.getDate() === day &&
              eventDate.getMonth() === selectedMonth &&
              eventDate.getFullYear() === selectedYear
            )
          })

          const isToday =
            day === currentDate.getDate() &&
            selectedMonth === currentDate.getMonth() &&
            selectedYear === currentDate.getFullYear()

          return (
            <div
              key={day}
              className={`text-center text-xs h-6 flex items-center justify-center rounded-full
                ${isToday ? "bg-primary text-black" : hasEvents ? "border border-primary text-foreground" : "text-foreground"}`}
            >
              {day}
            </div>
          )
        })}
      </div>

      <h3 className="text-muted-foreground text-sm mb-2">Today</h3>

      <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto mb-4">
        {todayEvents.length > 0 ? (
          todayEvents.map((event) => (
            <div key={event.id} className="bg-secondary rounded-lg p-2">
              <h4 className="text-foreground text-sm">{event.title}</h4>
              <div className="flex items-center gap-1 text-muted-foreground text-xs">
                {event.status === "online" && <div className="w-2 h-2 rounded-full bg-green-500"></div>}
                {event.status === "video" && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                {event.status === "offline" && <div className="w-2 h-2 rounded-full bg-gray-500"></div>}
                <span>{event.status}</span>
              </div>
              <p className="text-muted-foreground text-xs">{formatTimeRange(event.startTime, event.endTime)}</p>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground text-sm">No events today</p>
        )}
      </div>

      <button
        onClick={() => setIsAddEventOpen(true)}
        className="w-full bg-secondary text-secondary-foreground rounded-lg p-2 flex items-center justify-center gap-2"
      >
        <Plus size={16} />
        <span>Add Event</span>
      </button>

      {/* Add Event Dialog */}
      <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <DialogContent className="bg-card text-card-foreground border-border">
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="event-title">Event Title</Label>
              <Input
                id="event-title"
                value={newEvent.title || ""}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="Meeting title"
                className="bg-background border-input"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="event-date">Date</Label>
              <Input
                id="event-date"
                type="date"
                value={newEvent.date || ""}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                className="bg-background border-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={newEvent.startTime || ""}
                  onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                  className="bg-background border-input"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end-time">End Time</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={newEvent.endTime || ""}
                  onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                  className="bg-background border-input"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="event-status">Status</Label>
              <Select
                value={newEvent.status || "online"}
                onValueChange={(value) => setNewEvent({ ...newEvent, status: value as any })}
              >
                <SelectTrigger id="event-status" className="bg-background border-input">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {googleCalendarConnected && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarIcon size={16} className="text-primary" />
                <span>This event will sync with Google Calendar</span>
              </div>
            )}

            <Button onClick={handleAddEvent} className="mt-2">
              Add Event
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
