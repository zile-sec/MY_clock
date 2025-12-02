// This service will handle notifications on mobile devices using Capacitor
import { LocalNotifications } from "@capacitor/local-notifications"

export async function scheduleNotification(title: string, body: string, id: number, scheduleTime?: Date) {
  try {
    // Check if we're in a Capacitor environment
    if (typeof window !== "undefined" && "Capacitor" in window) {
      // Request permission first
      const permission = await LocalNotifications.requestPermissions()

      if (permission.display !== "granted") {
        console.warn("Notification permission not granted")
        return false
      }

      // Schedule the notification
      await LocalNotifications.schedule({
        notifications: [
          {
            id,
            title,
            body,
            schedule: scheduleTime ? { at: scheduleTime } : undefined,
            sound: "default",
            actionTypeId: "",
            extra: null,
          },
        ],
      })

      return true
    }

    return false
  } catch (error) {
    console.error("Error scheduling notification:", error)
    return false
  }
}

export async function cancelNotification(id: number) {
  try {
    if (typeof window !== "undefined" && "Capacitor" in window) {
      await LocalNotifications.cancel({ notifications: [{ id }] })
      return true
    }
    return false
  } catch (error) {
    console.error("Error canceling notification:", error)
    return false
  }
}

export async function getPendingNotifications() {
  try {
    if (typeof window !== "undefined" && "Capacitor" in window) {
      const pending = await LocalNotifications.getPending()
      return pending.notifications
    }
    return []
  } catch (error) {
    console.error("Error getting pending notifications:", error)
    return []
  }
}
