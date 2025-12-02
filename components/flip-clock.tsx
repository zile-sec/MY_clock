"use client"

import { useEffect, useState } from "react"
import { useTheme } from "@/components/theme-provider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, Clock, Timer } from "lucide-react"

export default function FlipClock() {
  const { theme } = useTheme()
  const [time, setTime] = useState(new Date())
  const [isTimerMode, setIsTimerMode] = useState(false)

  // Timer state
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [timerStartTime, setTimerStartTime] = useState<number | null>(null)
  const [timerPausedElapsed, setTimerPausedElapsed] = useState(0)

  // Update clock every second
  useEffect(() => {
    // Only run the clock update when in clock mode
    if (!isTimerMode) {
      const timer = setInterval(() => {
        setTime(new Date())
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [isTimerMode])

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isTimerMode && timerRunning) {
      interval = setInterval(() => {
        const now = Date.now()
        const startTime = timerStartTime || now
        const elapsedSeconds = Math.floor((now - startTime) / 1000) + timerPausedElapsed
        setTimerSeconds(elapsedSeconds)
      }, 100)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isTimerMode, timerRunning, timerStartTime, timerPausedElapsed])

  // Format time for clock mode
  const hours = time.getHours().toString().padStart(2, "0")
  const minutes = time.getMinutes().toString().padStart(2, "0")
  const seconds = time.getSeconds().toString().padStart(2, "0")

  // Format time for timer mode
  const timerHours = Math.floor(timerSeconds / 3600)
    .toString()
    .padStart(2, "0")
  const timerMinutes = Math.floor((timerSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0")
  const timerSecs = (timerSeconds % 60).toString().padStart(2, "0")

  // Date string for clock mode
  const dateOptions: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
    weekday: "short",
  }
  const dateString = time.toLocaleDateString("en-US", dateOptions)

  // Timer controls
  const startTimer = () => {
    if (!timerRunning) {
      setTimerStartTime(Date.now())
      setTimerRunning(true)
    }
  }

  const pauseTimer = () => {
    if (timerRunning) {
      setTimerRunning(false)
      // Store the current elapsed time when pausing
      setTimerPausedElapsed(timerSeconds)
    }
  }

  const resetTimer = () => {
    setTimerRunning(false)
    setTimerSeconds(0)
    setTimerStartTime(null)
    setTimerPausedElapsed(0)
  }

  // Toggle between clock and timer modes
  const toggleMode = (checked: boolean) => {
    setIsTimerMode(checked)
    // If switching to timer mode, reset the timer
    if (checked && !isTimerMode) {
      resetTimer()
    }
  }

  return (
    <div className="flex flex-col items-center">
      {/* Mode toggle */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex items-center space-x-2">
          <Clock size={18} className={!isTimerMode ? "text-primary" : "text-muted-foreground"} />
          <Switch id="mode-toggle" checked={isTimerMode} onCheckedChange={toggleMode} />
          <Timer size={18} className={isTimerMode ? "text-primary" : "text-muted-foreground"} />
        </div>
        <Label htmlFor="mode-toggle" className="text-sm text-muted-foreground">
          {isTimerMode ? "Timer Mode" : "Clock Mode"}
        </Label>
      </div>

      {/* Date display (only in clock mode) */}
      {!isTimerMode && <div className="text-muted-foreground text-sm mb-2">{dateString}</div>}

      {/* Time display */}
      <div className="flex gap-2">
        <DigitCard value={isTimerMode ? timerHours : hours} />
        <div className="text-foreground text-4xl flex items-center">:</div>
        <DigitCard value={isTimerMode ? timerMinutes : minutes} />
        <div className="text-foreground text-4xl flex items-center">:</div>
        <DigitCard value={isTimerMode ? timerSecs : seconds} />
      </div>

      {/* Timer controls (only in timer mode) */}
      {isTimerMode && (
        <div className="flex gap-2 mt-4">
          {!timerRunning ? (
            <Button onClick={startTimer} size="sm" className="flex items-center gap-1">
              <Play size={16} />
              Start
            </Button>
          ) : (
            <Button onClick={pauseTimer} size="sm" className="flex items-center gap-1">
              <Pause size={16} />
              Pause
            </Button>
          )}
          <Button
            onClick={resetTimer}
            size="sm"
            variant="outline"
            className="flex items-center gap-1"
            disabled={timerSeconds === 0}
          >
            <RotateCcw size={16} />
            Reset
          </Button>
        </div>
      )}

      {/* Motivational text (only in clock mode) */}
      {!isTimerMode && <div className="text-muted-foreground text-xs mt-4">LESS IS MORE</div>}
    </div>
  )
}

function DigitCard({ value }: { value: string }) {
  const { theme } = useTheme()
  const bgColor = theme === "dark" ? "bg-black" : "bg-white"
  const textColor = theme === "dark" ? "text-white" : "text-black"
  const shadowColor = theme === "dark" ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 0.1)"

  return (
    <div
      className={`digit-card ${bgColor} w-20 h-24 flex items-center justify-center`}
      style={{ boxShadow: `0 4px 6px ${shadowColor}` }}
    >
      <span className={`${textColor} text-5xl font-bold`}>{value}</span>
    </div>
  )
}
