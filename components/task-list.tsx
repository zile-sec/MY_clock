"use client"

import { useState } from "react"
import { CategoryBadge } from "./category-badge"
import { DueDateBadge } from "./due-date-badge"
import { Filter, Clock } from "lucide-react"
import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { useMobile } from "@/hooks/use-mobile"

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

interface TaskListProps {
  tasks: Task[]
  categories: Category[]
  onTaskToggle: (id: number) => void
  onCategoryFilter: (categoryId: string | null) => void
  onDueDateFilter: (filter: string) => void
  activeFilter: string | null
  activeDateFilter: string
  autoDeleteCompleted?: boolean
}

export default function TaskList({
  tasks,
  categories,
  onTaskToggle,
  onCategoryFilter,
  onDueDateFilter,
  activeFilter,
  activeDateFilter,
  autoDeleteCompleted = false,
}: TaskListProps) {
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false)
  const isMobile = useMobile()

  const completedCount = tasks.filter((task) => task.completed).length
  const totalCount = tasks.length

  const getCategoryById = (categoryId: string | null) => {
    if (!categoryId) return null
    return categories.find((cat) => cat.id === categoryId) || null
  }

  // Filter out completed tasks if autoDeleteCompleted is enabled
  const visibleTasks = autoDeleteCompleted ? tasks.filter((task) => !task.completed) : tasks

  // Sort tasks by due date (null dates at the end)
  const sortedTasks = [...visibleTasks].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0
    if (!a.dueDate) return 1
    if (!b.dueDate) return -1
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })

  return (
    <div className={`bg-card rounded-3xl p-4 ${isMobile ? "w-full h-[calc(100vh-12rem)]" : "w-64 h-64"} flex flex-col`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-primary text-xl font-semibold">Tasks today</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => setIsFilterDialogOpen(true)}
          >
            <Filter size={16} />
          </Button>
          <span className="text-foreground text-xl">{totalCount}</span>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto">
        {visibleTasks.length > 0 ? (
          <ul className="space-y-4">
            {sortedTasks.map((task) => {
              const category = getCategoryById(task.categoryId)

              return (
                <li key={task.id} className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onTaskToggle(task.id)}
                      className={`w-6 h-6 rounded-full border ${
                        task.completed ? "bg-primary border-primary" : "border-muted-foreground"
                      } flex items-center justify-center`}
                      style={category && !task.completed ? { borderColor: category.color } : undefined}
                    >
                      {task.completed && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M1 4L3.5 6.5L9 1"
                            stroke="black"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </button>
                    <span className={`text-foreground ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                      {task.text}
                    </span>
                  </div>
                  <div className="ml-9 flex flex-wrap gap-1">
                    {category && (
                      <CategoryBadge
                        name={category.name}
                        color={category.color}
                        className="text-[10px] px-1.5 py-0.5"
                      />
                    )}
                    {task.dueDate && <DueDateBadge dueDate={task.dueDate} className="text-[10px] px-1.5 py-0.5" />}
                    {task.hasReminder && task.dueDate && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-secondary text-secondary-foreground">
                        <Clock className="w-2 h-2 mr-0.5" />
                        Reminder
                      </span>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="text-muted-foreground text-center">No tasks yet</p>
        )}
      </div>

      <div className="mt-4 text-primary text-sm">
        {completedCount} OF {totalCount} IS DONE
      </div>

      {/* Filter Dialog */}
      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent className="bg-card text-card-foreground border-border">
          <DialogHeader>
            <DialogTitle>Filter Tasks</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <h3 className="text-sm font-medium mb-2">By Category</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`px-3 py-1 rounded-full text-sm ${
                    activeFilter === null ? "bg-primary text-black" : "bg-secondary text-secondary-foreground"
                  }`}
                  onClick={() => {
                    onCategoryFilter(null)
                  }}
                >
                  All
                </button>
                {categories.map((category) => (
                  <CategoryBadge
                    key={category.id}
                    name={category.name}
                    color={category.color}
                    className={activeFilter === category.id ? "ring-2 ring-foreground" : ""}
                    onClick={() => {
                      onCategoryFilter(category.id)
                    }}
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">By Due Date</h3>
              <Select
                value={activeDateFilter}
                onValueChange={(value) => {
                  onDueDateFilter(value)
                }}
              >
                <SelectTrigger className="bg-background border-input">
                  <SelectValue placeholder="Filter by due date" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">All tasks</SelectItem>
                  <SelectItem value="today">Due today</SelectItem>
                  <SelectItem value="tomorrow">Due tomorrow</SelectItem>
                  <SelectItem value="upcoming">Upcoming (7 days)</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="no-date">No due date</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={() => setIsFilterDialogOpen(false)} className="mt-2">
              Apply Filters
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
