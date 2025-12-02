const { app, BrowserWindow, ipcMain, Notification } = require("electron")
const path = require("path")
const isDev = require("electron-is-dev")
const fs = require("fs")

let mainWindow
let reminderCheckInterval

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    frame: true,
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "#1A1A1A",
      symbolColor: "#FFFFFF",
    },
  })

  // Load the app
  // For Next.js 15, the output is in the 'out' directory by default when using output: 'export'
  const startUrl = isDev ? "http://localhost:3000" : `file://${path.join(__dirname, "../out/index.html")}`

  mainWindow.loadURL(startUrl)

  // Open DevTools in development mode
  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: "detach" })
  }

  // Handle window closed
  mainWindow.on("closed", () => {
    mainWindow = null
    if (reminderCheckInterval) {
      clearInterval(reminderCheckInterval)
    }
  })

  // Start checking for reminders
  startReminderCheck()
}

// Create window when Electron is ready
app.whenReady().then(createWindow)

// Quit when all windows are closed, except on macOS
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// IPC handlers for any desktop-specific functionality
ipcMain.handle("get-app-path", () => app.getPath("userData"))

// Data persistence handlers
const getDataPath = () => {
  return path.join(app.getPath("userData"), "app-data.json")
}

ipcMain.handle("save-data", async (event, data) => {
  try {
    const dataPath = getDataPath()
    await fs.promises.writeFile(dataPath, JSON.stringify(data, null, 2))
    return { success: true }
  } catch (error) {
    console.error("Failed to save data:", error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle("load-data", async () => {
  try {
    const dataPath = getDataPath()

    // Check if the file exists
    if (!fs.existsSync(dataPath)) {
      return null
    }

    const data = await fs.promises.readFile(dataPath, "utf8")
    return JSON.parse(data)
  } catch (error) {
    console.error("Failed to load data:", error)
    return null
  }
})

// Notification handlers
ipcMain.handle("send-notification", async (event, title, body) => {
  try {
    if (Notification.isSupported()) {
      const notification = new Notification({
        title: title || "Minimalist Productivity",
        body: body || "",
        icon: path.join(__dirname, "../resources/icon.png"),
        silent: false,
      })

      notification.show()
      return { success: true }
    } else {
      console.warn("Notifications are not supported on this system")
      return { success: false, error: "Notifications not supported" }
    }
  } catch (error) {
    console.error("Failed to send notification:", error)
    return { success: false, error: error.message }
  }
})

// Reminder system
function startReminderCheck() {
  // Check for reminders every minute
  reminderCheckInterval = setInterval(checkReminders, 60000)
}

async function checkReminders() {
  try {
    const data = await loadData()
    if (!data || !data.tasks || !data.reminderSettings || !data.reminderSettings.enabled) {
      return
    }

    const now = new Date()
    const reminderMinutes = data.reminderSettings.reminderTime || 30 // Default to 30 minutes

    // Check each task
    data.tasks.forEach((task) => {
      if (task.completed || !task.dueDate || !task.hasReminder) {
        return
      }

      const dueDate = new Date(task.dueDate)

      // Calculate time difference in minutes
      const diffMs = dueDate.getTime() - now.getTime()
      const diffMinutes = Math.floor(diffMs / 60000)

      // If due date is within the reminder window and in the future
      if (diffMinutes <= reminderMinutes && diffMinutes > 0) {
        // Format the time until due
        let timeUntilDue = ""
        if (diffMinutes < 60) {
          timeUntilDue = `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""}`
        } else {
          const hours = Math.floor(diffMinutes / 60)
          const mins = diffMinutes % 60
          timeUntilDue = `${hours} hour${hours !== 1 ? "s" : ""}${mins > 0 ? ` and ${mins} minute${mins !== 1 ? "s" : ""}` : ""}`
        }

        // Send notification
        const notification = new Notification({
          title: "Task Due Soon",
          body: `"${task.text}" is due in ${timeUntilDue}`,
          icon: path.join(__dirname, "../resources/icon.png"), // Use PNG for notifications
        })
        notification.show()
      }
    })
  } catch (error) {
    console.error("Error checking reminders:", error)
  }
}

async function loadData() {
  try {
    const dataPath = getDataPath()
    if (!fs.existsSync(dataPath)) {
      return null
    }
    const data = await fs.promises.readFile(dataPath, "utf8")
    return JSON.parse(data)
  } catch (error) {
    console.error("Failed to load data for reminders:", error)
    return null
  }
}

ipcMain.handle("check-reminders", () => {
  checkReminders()
})
