"use client"

import { useState, useEffect } from "react"
import { Check, ChevronLeft, ChevronRight } from "lucide-react"
import { CategoryBadge } from "./category-badge"
import { DueDateBadge } from "./due-date-badge"

interface Task {
  id: number
  text: string
  completed: boolean
  categoryId: string | null
  dueDate: string | null
  hasReminder: boolean
}

interface Category {
  id: string
  name: string
  color: string
}

interface TaskWidgetProps {
  title: string
  tasks: Task[]
  categories: Category[]
  onTaskToggle: (id: number) => void
}

export default function TaskWidget({ title, tasks, categories, onTaskToggle }: TaskWidgetProps) {
  const completedCount = tasks.filter((task) => task.completed).length
  const totalCount = tasks.length

  const [currentTime, setCurrentTime] = useState(new Date())
  const [endTime, setEndTime] = useState(new Date(currentTime.getTime() + 15 * 60000)) // 15 minutes from now
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [])

  // Update current task index when tasks change
  useEffect(() => {
    if (tasks.length > 0) {
      const uncompletedIndex = tasks.findIndex((task) => !task.completed)
      if (uncompletedIndex !== -1) {
        setCurrentTaskIndex(uncompletedIndex)
      } else {
        setCurrentTaskIndex(0)
      }
    }
  }, [tasks])

  const formatTime = (date: Date) => {
    return date
      .toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .toLowerCase()
  }

  // Calculate progress based on current time and end time
  const calculateProgress = () => {
    const now = currentTime.getTime()
    const start = currentTime.getTime() - 15 * 60000 // 15 minutes before now
    const end = endTime.getTime()

    // Ensure we don't divide by zero
    if (end === start) return 0

    const progress = ((now - start) / (end - start)) * 100
    return Math.min(100, Math.max(0, progress))
  }

  const progress = calculateProgress()

  const handlePrevTask = () => {
    if (tasks.length === 0) return
    setCurrentTaskIndex((prev) => (prev === 0 ? tasks.length - 1 : prev - 1))
  }

  const handleNextTask = () => {
    if (tasks.length === 0) return
    setCurrentTaskIndex((prev) => (prev === tasks.length - 1 ? 0 : prev + 1))
  }

  const handleCompleteTask = () => {
    if (tasks.length === 0) return
    onTaskToggle(tasks[currentTaskIndex].id)
  }

  const getCategoryById = (categoryId: string | null) => {
    if (!categoryId) return null
    return categories.find((cat) => cat.id === categoryId) || null
  }

  const currentTask = tasks[currentTaskIndex]
  const currentCategory = currentTask ? getCategoryById(currentTask.categoryId) : null

  return (
    <div className="bg-card rounded-3xl p-4 w-64 h-64 flex flex-col">
      <h2 className="text-primary text-xl font-semibold mb-1">{title}</h2>
      <p className="text-muted-foreground text-sm mb-3">
        {completedCount} OF {totalCount} TASKS DONE
      </p>

      <div className="relative h-2 bg-secondary rounded-full mb-2">
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-linear"
          style={{
            width: `${progress}%`,
            backgroundColor: currentCategory ? currentCategory.color : "#FF9500",
          }}
        />
        <div
          className="absolute -top-1 h-4 w-4 rounded-full transition-all duration-1000 ease-linear"
          style={{
            left: `${progress}%`,
            transform: "translateX(-50%)",
            backgroundColor: currentCategory ? currentCategory.color : "#FF9500",
          }}
        />
      </div>

      <div className="flex justify-between text-muted-foreground text-sm mb-4">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(endTime)}</span>
      </div>

      <div className="flex-grow flex items-center justify-center">
        <button className="text-muted-foreground p-2" onClick={handlePrevTask}>
          <ChevronLeft size={24} />
        </button>
        <button
          className="rounded-lg p-4 mx-2"
          onClick={handleCompleteTask}
          style={{ backgroundColor: currentCategory ? currentCategory.color : "white" }}
        >
          <Check className="text-black" size={24} />
        </button>
        <button className="text-muted-foreground p-2" onClick={handleNextTask}>
          <ChevronRight size={24} />
        </button>
      </div>

      {tasks.length > 0 && currentTask && (
        <div className="text-center mt-2 flex flex-col items-center gap-1">
          <div className="text-foreground text-sm truncate">{currentTask.text}</div>
          <div className="flex flex-wrap gap-1 justify-center">
            {currentCategory && (
              <CategoryBadge
                name={currentCategory.name}
                color={currentCategory.color}
                className="text-[10px] px-1.5 py-0.5"
              />
            )}
            {currentTask.dueDate && (
              <DueDateBadge dueDate={currentTask.dueDate} className="text-[10px] px-1.5 py-0.5" />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
