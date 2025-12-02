/**
 * Background script for Firefox Extension
 * Handles alarms and notifications
 */

// Import the browser API
const browser = require("webextension-polyfill")

// Check for reminders every minute
browser.alarms.create("checkReminders", {
  periodInMinutes: 1,
})

// Listen for alarm events
browser.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "checkReminders") {
    await checkReminders()
  }
})

/**
 * Check for due tasks and send notifications
 */
async function checkReminders() {
  try {
    const result = await browser.storage.local.get(["productivity_app_tasks", "productivity_app_reminder_settings"])

    const tasks = result.productivity_app_tasks || []
    const settings = result.productivity_app_reminder_settings || { enabled: true, reminderTime: 30 }

    if (!settings.enabled) return

    const now = new Date()
    const reminderTime = settings.reminderTime || 30 // minutes

    tasks.forEach((task) => {
      if (task.completed || !task.dueDate || !task.hasReminder) return

      const dueDate = new Date(task.dueDate)
      const timeDiff = dueDate.getTime() - now.getTime()
      const minutesUntilDue = timeDiff / (1000 * 60)

      // Send notification if task is due within the reminder time
      if (minutesUntilDue > 0 && minutesUntilDue <= reminderTime) {
        sendNotification(task.text, `Due in ${Math.round(minutesUntilDue)} minutes`)
      }
    })
  } catch (err) {
    console.error("Error checking reminders:", err)
  }
}

/**
 * Send a browser notification
 */
function sendNotification(title, message) {
  browser.notifications.create({
    type: "basic",
    iconUrl: "icons/icon-96.png",
    title: `Task Reminder: ${title}`,
    message: message,
  })
}

// Listen for notification clicks
browser.notifications.onClicked.addListener((notificationId) => {
  // Open the new tab page when notification is clicked
  browser.tabs.create({ url: "newtab.html" })
})

// Background rotation alarm (every hour)
browser.alarms.create("rotateBackground", {
  periodInMinutes: 60,
})

browser.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "rotateBackground") {
    try {
      const result = await browser.storage.local.get([
        "productivity_app_background_index",
        "productivity_app_background",
      ])

      // Only rotate if no custom background is set
      if (!result.productivity_app_background) {
        const currentIndex = result.productivity_app_background_index || 0
        const nextIndex = (currentIndex + 1) % 10 // 10 default backgrounds

        await browser.storage.local.set({ productivity_app_background_index: nextIndex })
      }
    } catch (err) {
      console.error("Error rotating background:", err)
    }
  }
})
