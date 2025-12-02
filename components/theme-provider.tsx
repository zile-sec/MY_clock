"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const initialState: ThemeProviderState = {
  theme: "dark",
  setTheme: () => null,
  toggleTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({ children, defaultTheme = "dark", storageKey = "theme", ...props }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)

  useEffect(() => {
    const savedTheme = localStorage.getItem(storageKey) as Theme | null

    if (savedTheme) {
      setTheme(savedTheme)
    } else {
      // Check for system preference
      const systemPreference = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      setTheme(systemPreference)
    }
  }, [storageKey])

  useEffect(() => {
    const root = window.document.documentElement

    // Remove the old theme class
    root.classList.remove("light", "dark")

    // Add the new theme class
    root.classList.add(theme)

    // Save the theme preference
    localStorage.setItem(storageKey, theme)

    // Update the meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", theme === "dark" ? "#1A1A1A" : "#FFFFFF")
    }
  }, [theme, storageKey])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const value = {
    theme,
    setTheme,
    toggleTheme,
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
