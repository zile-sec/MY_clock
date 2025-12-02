// Google Calendar integration service - Client-side only implementation
import { saveData, loadData } from "./mobile-storage"

// Constants
const CALENDAR_STORAGE_KEY = "google_calendar_auth"
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
const REDIRECT_URI = typeof window !== "undefined" ? `${window.location.origin}` : "http://localhost:3000"

// Types
export interface GoogleCalendarEvent {
  id: string
  summary: string
  description?: string
  start: {
    dateTime: string
    timeZone?: string
  }
  end: {
    dateTime: string
    timeZone?: string
  }
  location?: string
  colorId?: string
}

export interface GoogleCalendarAuth {
  access_token: string
  refresh_token?: string
  expiry_date: number
  token_type: string
  scope: string
}

// Add this validation function at the top of the file, after the imports
function isValidGoogleClientId(clientId: string | undefined): boolean {
  if (!clientId) return false
  return clientId.endsWith(".apps.googleusercontent.com")
}

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined"

// Load the Google API client library dynamically
export async function loadGoogleApi(): Promise<boolean> {
  if (!isBrowser) return false

  // Validate the client ID format
  if (!isValidGoogleClientId(GOOGLE_CLIENT_ID)) {
    console.error(
      "❌ Invalid Google Client ID format. Client ID must end with '.apps.googleusercontent.com'.",
      "Current value:",
      GOOGLE_CLIENT_ID || "undefined",
    )
    return false
  }

  // Debug: Log the client ID (with partial masking for security)
  const maskedId = GOOGLE_CLIENT_ID
    ? GOOGLE_CLIENT_ID.substring(0, 12) + "..." + GOOGLE_CLIENT_ID.substring(GOOGLE_CLIENT_ID.length - 30)
    : "undefined"
  console.log("🔑 Using Google Client ID:", maskedId)

  return new Promise((resolve) => {
    // Check if the API is already loaded
    if (window.gapi) {
      console.log("✅ Google API already loaded")
      resolve(true)
      return
    }

    console.log("📡 Loading Google API client library...")

    // Load the Google API client library
    const script = document.createElement("script")
    script.src = "https://apis.google.com/js/api.js"
    script.onload = () => {
      console.log("📦 Google API script loaded, initializing client...")
      window.gapi.load("client:auth2", () => {
        console.log("🔧 Google client and auth2 libraries loaded, initializing...")
        window.gapi.client
          .init({
            clientId: GOOGLE_CLIENT_ID,
            scope: "https://www.googleapis.com/auth/calendar",
            discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
          })
          .then(() => {
            console.log("✅ Google API client initialized successfully")
            console.log("🌐 Current origin:", window.location.origin)
            resolve(true)
          })
          .catch((error: any) => {
            console.error("❌ Error initializing Google API client:", error)
            // Show more detailed error information
            if (error.details) {
              console.error("📋 Error details:", error.details)
            }
            if (error.error) {
              console.error("🔍 Error type:", error.error)
            }
            resolve(false)
          })
      })
    }
    script.onerror = () => {
      console.error("❌ Failed to load Google API client library")
      resolve(false)
    }
    document.body.appendChild(script)
  })
}

// Sign in to Google
export async function signInToGoogle(): Promise<boolean> {
  if (!isBrowser) return false

  try {
    console.log("🚀 Starting Google sign-in process...")
    const apiLoaded = await loadGoogleApi()

    if (!apiLoaded) {
      console.error("❌ Failed to load Google API, cannot sign in")
      return false
    }

    console.log("🔐 Requesting Google sign-in...")
    const googleAuth = window.gapi.auth2.getAuthInstance()

    // Check if already signed in
    if (googleAuth.isSignedIn.get()) {
      console.log("✅ Already signed in to Google")
      return true
    }

    // Add more detailed options for debugging
    const user = await googleAuth.signIn({
      prompt: "select_account",
      ux_mode: "popup",
    })

    console.log("🎉 Sign-in successful, getting auth response...")
    const authResponse = user.getAuthResponse(true)

    if (authResponse) {
      console.log("💾 Auth response received, saving token...")
      console.log("🔑 Token expires at:", new Date(authResponse.expires_at))

      // Save auth data
      await saveData(CALENDAR_STORAGE_KEY, {
        access_token: authResponse.access_token,
        expiry_date: authResponse.expires_at,
        token_type: "Bearer",
        scope: authResponse.scope,
      })

      console.log("✅ Google Calendar authentication successful!")
      return true
    }

    console.error("❌ No auth response received from Google")
    return false
  } catch (error) {
    console.error("❌ Google sign in error:", error)
    // Show more detailed error information if available
    if (error && typeof error === "object") {
      if ("error" in error) console.error("🔍 Error type:", (error as any).error)
      if ("details" in error) console.error("📋 Error details:", (error as any).details)
      if ("message" in error) console.error("💬 Error message:", (error as any).message)
    }
    return false
  }
}

// Sign out from Google
export async function signOutFromGoogle(): Promise<boolean> {
  if (!isBrowser) return false

  try {
    console.log("🚪 Starting Google sign-out process...")
    await loadGoogleApi()

    const googleAuth = window.gapi.auth2.getAuthInstance()
    await googleAuth.signOut()
    await saveData(CALENDAR_STORAGE_KEY, null)
    console.log("✅ Google sign-out completed successfully")
    return true
  } catch (error) {
    console.error("❌ Google sign out error:", error)
    return false
  }
}

// Check if user is signed in
export async function isSignedInToGoogle(): Promise<boolean> {
  if (!isBrowser) return false

  try {
    console.log("🔍 Checking Google sign-in status...")
    const tokens = await loadData(CALENDAR_STORAGE_KEY)

    if (!tokens) {
      console.log("📭 No stored tokens found")
      return false
    }

    // Check if token is expired
    const expiryDate = tokens.expiry_date
    if (expiryDate && Date.now() > expiryDate) {
      console.log("⏰ Token expired, signing out")
      await signOutFromGoogle()
      return false
    }

    // Also check with Google API if possible
    try {
      await loadGoogleApi()
      const googleAuth = window.gapi.auth2.getAuthInstance()
      const isSignedIn = googleAuth.isSignedIn.get()
      console.log("🔐 Google API reports sign-in status:", isSignedIn)
      return isSignedIn
    } catch (e) {
      console.warn("⚠️ Failed to check sign-in status with Google API, falling back to token check")
      return true
    }
  } catch (error) {
    console.error("❌ Error checking Google sign in status:", error)
    return false
  }
}

// Test Google Calendar API connection
export async function testGoogleCalendarConnection(): Promise<{ success: boolean; message: string; details?: any }> {
  if (!isBrowser) {
    return { success: false, message: "Not in browser environment" }
  }

  try {
    console.log("🧪 Testing Google Calendar connection...")

    // Check if signed in
    const isSignedIn = await isSignedInToGoogle()
    if (!isSignedIn) {
      return { success: false, message: "Not signed in to Google Calendar" }
    }

    // Try to fetch calendar list
    await loadGoogleApi()
    const response = await window.gapi.client.calendar.calendarList.list()

    console.log("📅 Calendar list response:", response)

    if (response.result && response.result.items) {
      const calendarCount = response.result.items.length
      return {
        success: true,
        message: `Successfully connected! Found ${calendarCount} calendar(s)`,
        details: {
          calendars: response.result.items.map((cal: any) => ({
            id: cal.id,
            summary: cal.summary,
            primary: cal.primary,
          })),
        },
      }
    } else {
      return { success: false, message: "Connected but no calendars found" }
    }
  } catch (error) {
    console.error("❌ Google Calendar connection test failed:", error)
    return {
      success: false,
      message: `Connection test failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      details: error,
    }
  }
}

// Fetch events from Google Calendar
export async function fetchGoogleCalendarEvents(
  timeMin: Date = new Date(),
  timeMax: Date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // One week from now
): Promise<GoogleCalendarEvent[]> {
  if (!isBrowser) return []

  try {
    console.log("📅 Fetching Google Calendar events...")
    const isSignedIn = await isSignedInToGoogle()

    if (!isSignedIn) {
      console.error("❌ User not signed in to Google")
      return []
    }

    await loadGoogleApi()

    console.log(`📊 Requesting events from ${timeMin.toISOString()} to ${timeMax.toISOString()}`)
    const response = await window.gapi.client.calendar.events.list({
      calendarId: "primary",
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    })

    console.log(`✅ Received ${response.result.items?.length || 0} events from Google Calendar`)
    return response.result.items || []
  } catch (error) {
    console.error("❌ Error fetching Google Calendar events:", error)
    return []
  }
}

// Create an event in Google Calendar
export async function createGoogleCalendarEvent(
  event: Omit<GoogleCalendarEvent, "id">,
): Promise<GoogleCalendarEvent | null> {
  if (!isBrowser) return null

  try {
    console.log("📝 Creating Google Calendar event:", event.summary)
    const isSignedIn = await isSignedInToGoogle()

    if (!isSignedIn) {
      console.error("❌ User not signed in to Google")
      return null
    }

    await loadGoogleApi()

    const response = await window.gapi.client.calendar.events.insert({
      calendarId: "primary",
      resource: event,
    })

    console.log("✅ Event created successfully:", response.result.id)
    return response.result || null
  } catch (error) {
    console.error("❌ Error creating Google Calendar event:", error)
    return null
  }
}

// Convert app event to Google Calendar event format
export function convertAppEventToGoogleEvent(event: CalendarEvent): Omit<GoogleCalendarEvent, "id"> {
  const [year, month, day] = event.date.split("-").map(Number)
  const [startHour, startMinute] = event.startTime.split(":").map(Number)
  const [endHour, endMinute] = event.endTime.split(":").map(Number)

  const startDate = new Date(year, month - 1, day, startHour, startMinute)
  const endDate = new Date(year, month - 1, day, endHour, endMinute)

  return {
    summary: event.title,
    description: `Status: ${event.status}`,
    start: {
      dateTime: startDate.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: endDate.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    colorId: event.status === "online" ? "2" : event.status === "video" ? "1" : "8", // Different colors for different statuses
  }
}

// Convert Google Calendar event to app event format
export function convertGoogleEventToAppEvent(event: GoogleCalendarEvent): CalendarEvent {
  const startDate = new Date(event.start.dateTime)
  const endDate = new Date(event.end.dateTime)

  // Determine status based on description or colorId
  let status: "online" | "video" | "offline" = "offline"
  if (event.description?.includes("online") || event.colorId === "2") {
    status = "online"
  } else if (event.description?.includes("video") || event.colorId === "1") {
    status = "video"
  }

  return {
    id: event.id,
    title: event.summary,
    date: startDate.toISOString().split("T")[0],
    startTime: `${startDate.getHours().toString().padStart(2, "0")}:${startDate.getMinutes().toString().padStart(2, "0")}`,
    endTime: `${endDate.getHours().toString().padStart(2, "0")}:${endDate.getMinutes().toString().padStart(2, "0")}`,
    status,
  }
}

// Add CalendarEvent type to avoid errors
interface CalendarEvent {
  id: string
  title: string
  date: string
  startTime: string
  endTime: string
  status: "online" | "video" | "offline"
}

// Add Google API types
declare global {
  interface Window {
    gapi: {
      load: (libraries: string, callback: () => void) => void
      client: {
        init: (config: any) => Promise<any>
        calendar: {
          calendarList: {
            list: () => Promise<{ result: { items: any[] } }>
          }
          events: {
            list: (params: any) => Promise<{ result: { items: GoogleCalendarEvent[] } }>
            insert: (params: any) => Promise<{ result: GoogleCalendarEvent }>
          }
        }
      }
      auth2: {
        getAuthInstance: () => {
          signIn: (options?: any) => Promise<{
            getAuthResponse: (includeAuthorizationData: boolean) => {
              access_token: string
              expires_at: number
              scope: string
            }
          }>
          signOut: () => Promise<void>
          isSignedIn: {
            get: () => boolean
          }
        }
      }
    }
  }
}
