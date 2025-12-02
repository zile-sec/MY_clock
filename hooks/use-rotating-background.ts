"use client"

import { useState, useEffect } from "react"
import { loadFromLocalStorage, STORAGE_KEYS } from "@/services/local-storage"

const BACKGROUNDS = [
  "/backgrounds/bg1.jpeg",
  "/backgrounds/bg2.jpeg",
  "/backgrounds/bg3.jpeg",
  "/backgrounds/bg4.jpeg",
  "/backgrounds/bg5.jpeg",
  "/backgrounds/bg6.jpeg",
  "/backgrounds/bg7.jpeg",
  "/backgrounds/bg8.jpeg",
  "/backgrounds/bg9.jpeg",
  "/backgrounds/bg10.jpeg",
]

// Change background every hour
const ROTATION_INTERVAL = 60 * 60 * 1000 // 1 hour in milliseconds

export function useRotatingBackground() {
  const [currentBackground, setCurrentBackground] = useState<string>("")
  const [imagesLoaded, setImagesLoaded] = useState<boolean>(false)

  // Preload images to ensure they're in the cache
  useEffect(() => {
    const preloadImages = async () => {
      try {
        const imagePromises = BACKGROUNDS.map((src) => {
          return new Promise((resolve, reject) => {
            const img = new Image()
            img.src = src
            img.onload = () => resolve(src)
            img.onerror = () => reject(`Failed to load image: ${src}`)
          })
        })

        await Promise.all(imagePromises)
        setImagesLoaded(true)
        console.log("All background images preloaded successfully")
      } catch (error) {
        console.error("Error preloading background images:", error)
        // Continue anyway, some images might still work
        setImagesLoaded(true)
      }
    }

    preloadImages()
  }, [])

  useEffect(() => {
    if (!imagesLoaded) return

    // Check if there's a custom background image
    const customBg = loadFromLocalStorage(STORAGE_KEYS.BACKGROUND, "")
    if (customBg) {
      setCurrentBackground(customBg)
      return
    }

    // Function to get the current background based on the hour
    const getCurrentBackground = () => {
      const now = new Date()
      const hour = now.getHours()
      // Use the hour to determine which background to show (cycling through the array)
      const index = hour % BACKGROUNDS.length
      return BACKGROUNDS[index]
    }

    // Set initial background
    setCurrentBackground(getCurrentBackground())

    // Set up interval to check and update background every hour
    const interval = setInterval(() => {
      setCurrentBackground(getCurrentBackground())
    }, ROTATION_INTERVAL)

    // Clean up interval on unmount
    return () => clearInterval(interval)
  }, [imagesLoaded])

  return currentBackground
}
