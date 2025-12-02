/**
 * Storage Service for Firefox Extension
 * Uses browser.storage.local API for persistent data storage
 */

const STORAGE_KEYS = {
  TASKS: "productivity_app_tasks",
  CATEGORIES: "productivity_app_categories",
  EVENTS: "productivity_app_events",
  SETTINGS: "productivity_app_settings",
  BACKGROUND: "productivity_app_background",
  BACKGROUND_FIT: "productivity_app_background_fit",
  BACKGROUND_INDEX: "productivity_app_background_index",
  REMINDER_SETTINGS: "productivity_app_reminder_settings",
  AUTO_DELETE: "productivity_app_auto_delete",
  THEME: "productivity_app_theme",
}

// Default background images (bundled with extension)
const DEFAULT_BACKGROUNDS = [
  "backgrounds/bg1.jpeg",
  "backgrounds/bg2.jpeg",
  "backgrounds/bg3.jpeg",
  "backgrounds/bg4.jpeg",
  "backgrounds/bg5.jpeg",
  "backgrounds/bg6.jpeg",
  "backgrounds/bg7.jpeg",
  "backgrounds/bg8.jpeg",
  "backgrounds/bg9.jpeg",
  "backgrounds/bg10.jpeg",
]

const browser = require("webextension-polyfill") // Declare the browser variable

/**
 * Save data to browser storage
 */
async function saveToStorage(key, data) {
  try {
    await browser.storage.local.set({ [key]: data })
    console.log(`Data saved to ${key}`)
    return true
  } catch (err) {
    console.error(`Error saving data to ${key}:`, err)
    return false
  }
}

/**
 * Load data from browser storage
 */
async function loadFromStorage(key, defaultValue = null) {
  try {
    const result = await browser.storage.local.get(key)
    return result[key] !== undefined ? result[key] : defaultValue
  } catch (err) {
    console.error(`Error loading data from ${key}:`, err)
    return defaultValue
  }
}

/**
 * Save all app data
 */
async function saveAppData(data) {
  const promises = []

  if (data.tasks !== undefined) {
    promises.push(saveToStorage(STORAGE_KEYS.TASKS, data.tasks))
  }
  if (data.categories !== undefined) {
    promises.push(saveToStorage(STORAGE_KEYS.CATEGORIES, data.categories))
  }
  if (data.events !== undefined) {
    promises.push(saveToStorage(STORAGE_KEYS.EVENTS, data.events))
  }
  if (data.customBackgroundImage !== undefined) {
    promises.push(saveToStorage(STORAGE_KEYS.BACKGROUND, data.customBackgroundImage))
  }
  if (data.backgroundFitMode !== undefined) {
    promises.push(saveToStorage(STORAGE_KEYS.BACKGROUND_FIT, data.backgroundFitMode))
  }
  if (data.backgroundIndex !== undefined) {
    promises.push(saveToStorage(STORAGE_KEYS.BACKGROUND_INDEX, data.backgroundIndex))
  }
  if (data.reminderSettings !== undefined) {
    promises.push(saveToStorage(STORAGE_KEYS.REMINDER_SETTINGS, data.reminderSettings))
  }
  if (data.autoDeleteCompleted !== undefined) {
    promises.push(saveToStorage(STORAGE_KEYS.AUTO_DELETE, data.autoDeleteCompleted))
  }
  if (data.theme !== undefined) {
    promises.push(saveToStorage(STORAGE_KEYS.THEME, data.theme))
  }

  await Promise.all(promises)
}

/**
 * Load all app data
 */
async function loadAppData() {
  const [
    tasks,
    categories,
    events,
    customBackgroundImage,
    backgroundFitMode,
    backgroundIndex,
    reminderSettings,
    autoDeleteCompleted,
    theme,
  ] = await Promise.all([
    loadFromStorage(STORAGE_KEYS.TASKS, []),
    loadFromStorage(STORAGE_KEYS.CATEGORIES, []),
    loadFromStorage(STORAGE_KEYS.EVENTS, []),
    loadFromStorage(STORAGE_KEYS.BACKGROUND, null),
    loadFromStorage(STORAGE_KEYS.BACKGROUND_FIT, "cover"),
    loadFromStorage(STORAGE_KEYS.BACKGROUND_INDEX, 0),
    loadFromStorage(STORAGE_KEYS.REMINDER_SETTINGS, { enabled: true, reminderTime: 30 }),
    loadFromStorage(STORAGE_KEYS.AUTO_DELETE, false),
    loadFromStorage(STORAGE_KEYS.THEME, "dark"),
  ])

  return {
    tasks,
    categories,
    events,
    customBackgroundImage,
    backgroundFitMode,
    backgroundIndex,
    reminderSettings,
    autoDeleteCompleted,
    theme,
  }
}

/**
 * Export all data as JSON
 */
async function exportData() {
  const data = await loadAppData()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url
  a.download = `minimalist-productivity-backup-${new Date().toISOString().split("T")[0]}.json`
  a.click()

  URL.revokeObjectURL(url)
}

/**
 * Import data from JSON file
 */
async function importData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result)
        await saveAppData(data)
        resolve(data)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}

/**
 * Get rotating background based on time
 */
function getRotatingBackground(index) {
  if (index >= 0 && index < DEFAULT_BACKGROUNDS.length) {
    return DEFAULT_BACKGROUNDS[index]
  }
  // Calculate based on current hour
  const hour = new Date().getHours()
  const bgIndex = hour % DEFAULT_BACKGROUNDS.length
  return DEFAULT_BACKGROUNDS[bgIndex]
}

/**
 * Get next background index
 */
function getNextBackgroundIndex(currentIndex) {
  return (currentIndex + 1) % DEFAULT_BACKGROUNDS.length
}
