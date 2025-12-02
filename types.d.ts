interface ElectronAPI {
  getAppPath: () => Promise<string>
  saveData: (data: any) => Promise<{ success: boolean; error?: string }>
  loadData: () => Promise<any>
  sendNotification: (title: string, body: string) => Promise<{ success: boolean; error?: string }>
  checkReminders: () => void
}

interface Window {
  electron?: ElectronAPI
}

interface Task {
  id: number
  text: string
  completed: boolean
  categoryId: string | null
  dueDate: string | null // ISO date string
  hasReminder: boolean
}

interface Category {
  id: string
  name: string
  color: string
}

interface CalendarEvent {
  id: string
  title: string
  date: string
  startTime: string
  endTime: string
  status: "online" | "video" | "offline"
}

interface ReminderSettings {
  enabled: boolean
  reminderTime: number // minutes before due date
}
