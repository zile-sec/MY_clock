// This service will handle storage on mobile devices using Capacitor
import { Storage } from "@capacitor/storage"

export async function saveData(key: string, data: any): Promise<boolean> {
  try {
    if (typeof window !== "undefined" && "Capacitor" in window) {
      await Storage.set({
        key,
        value: JSON.stringify(data),
      })
      return true
    }
    return false
  } catch (error) {
    console.error("Error saving data:", error)
    return false
  }
}

export async function loadData(key: string): Promise<any> {
  try {
    if (typeof window !== "undefined" && "Capacitor" in window) {
      const { value } = await Storage.get({ key })
      return value ? JSON.parse(value) : null
    }
    return null
  } catch (error) {
    console.error("Error loading data:", error)
    return null
  }
}

export async function removeData(key: string): Promise<boolean> {
  try {
    if (typeof window !== "undefined" && "Capacitor" in window) {
      await Storage.remove({ key })
      return true
    }
    return false
  } catch (error) {
    console.error("Error removing data:", error)
    return false
  }
}

export async function clearAllData(): Promise<boolean> {
  try {
    if (typeof window !== "undefined" && "Capacitor" in window) {
      await Storage.clear()
      return true
    }
    return false
  } catch (error) {
    console.error("Error clearing all data:", error)
    return false
  }
}
