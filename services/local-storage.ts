// Local storage service for persistent data storage

// Keys for different data types
export const STORAGE_KEYS = {
  TASKS: "productivity_app_tasks",
  CATEGORIES: "productivity_app_categories",
  EVENTS: "productivity_app_events",
  SETTINGS: "productivity_app_settings",
  BACKGROUND: "productivity_app_background",
  REMINDER_SETTINGS: "productivity_app_reminder_settings",
  GOOGLE_CALENDAR_SETTINGS: "productivity_app_google_calendar_settings",
  AUTO_DELETE: "productivity_app_auto_delete",
}

// Type definitions
export interface StorageData {
  tasks?: any[]
  categories?: any[]
  events?: any[]
  customBackgroundImage?: string
  reminderSettings?: any
  googleCalendarSettings?: any
  autoDeleteCompleted?: boolean
}

/**
 * Save data to local storage
 */
export function saveToLocalStorage(key: string, data: any): void {
  if (typeof window === "undefined") return

  try {
    const serializedData = JSON.stringify(data)
    localStorage.setItem(key, serializedData)
    console.log(`Data saved to ${key}`)
  } catch (err) {
    console.error(`Error saving data to ${key}:`, err)
  }
}

/**
 * Load data from local storage with type
 */
export function loadFromLocalStorage(key: string, defaultValue: any): any {
  if (typeof window === "undefined") return defaultValue

  try {
    const serializedData = localStorage.getItem(key)
    if (serializedData === null) {
      return defaultValue
    }
    return JSON.parse(serializedData)
  } catch (err) {
    console.error(`Error loading data from ${key}:`, err)
    return defaultValue
  }
}

/**
 * Save all app data to local storage
 */
export function saveAppData(data: StorageData): void {
  if (data.tasks) {
    saveToLocalStorage(STORAGE_KEYS.TASKS, data.tasks)
  }

  if (data.categories) {
    saveToLocalStorage(STORAGE_KEYS.CATEGORIES, data.categories)
  }

  if (data.events) {
    saveToLocalStorage(STORAGE_KEYS.EVENTS, data.events)
  }

  if (data.customBackgroundImage) {
    saveToLocalStorage(STORAGE_KEYS.BACKGROUND, data.customBackgroundImage)
  }

  if (data.reminderSettings) {
    saveToLocalStorage(STORAGE_KEYS.REMINDER_SETTINGS, data.reminderSettings)
  }

  if (data.googleCalendarSettings) {
    saveToLocalStorage(STORAGE_KEYS.GOOGLE_CALENDAR_SETTINGS, data.googleCalendarSettings)
  }

  if (data.autoDeleteCompleted !== undefined) {
    saveToLocalStorage(STORAGE_KEYS.AUTO_DELETE, data.autoDeleteCompleted)
  }
}

/**
 * Load all app data from local storage
 */
export function loadAppData(): StorageData {
  return {
    tasks: loadFromLocalStorage(STORAGE_KEYS.TASKS, []),
    categories: loadFromLocalStorage(STORAGE_KEYS.CATEGORIES, []),
    events: loadFromLocalStorage(STORAGE_KEYS.EVENTS, []),
    customBackgroundImage: loadFromLocalStorage(STORAGE_KEYS.BACKGROUND, ""),
    reminderSettings: loadFromLocalStorage(STORAGE_KEYS.REMINDER_SETTINGS, {
      enabled: true,
      reminderTime: 30,
    }),
    googleCalendarSettings: loadFromLocalStorage(STORAGE_KEYS.GOOGLE_CALENDAR_SETTINGS, {
      autoSync: false,
    }),
    autoDeleteCompleted: loadFromLocalStorage(STORAGE_KEYS.AUTO_DELETE, false),
  }
}
