"use client"

import { useState } from "react"
import { Info, X } from "lucide-react"

interface BackgroundInfoProps {
  backgroundUrl: string
}

export function BackgroundInfo({ backgroundUrl }: BackgroundInfoProps) {
  const [isVisible, setIsVisible] = useState(false)

  // Get the background number from the URL
  const getBgNumber = () => {
    const match = backgroundUrl.match(/bg(\d+)\.jpeg/)
    return match ? match[1] : null
  }

  // Get motivational message based on background number
  const getMessage = () => {
    const bgNumber = getBgNumber()
    if (!bgNumber) return "Custom background"

    switch (bgNumber) {
      case "1":
        return "at night, i hit my knees, i prayed for better days then found a better me, i got my head on straight"
      case "2":
        return "DISCIPLINE & CONSISTENCY"
      case "3":
        return "DON'T STOP UNTIL YOU'RE PROUD"
      case "4":
        return "Your patience is your power"
      case "5":
        return "The problem is, You think you have time."
      case "6":
        return "CONSUME LESS, CREATE MORE"
      case "7":
        return "Do what is Hard Until it becomes Easy."
      case "8":
        return "God first"
      case "9":
        return "MAKE SACRIFICES FOR YOUR DREAMS, OR YOUR DREAMS WILL BECOME THE SACRIFICE"
      case "10":
        return "GOD IS SO MUCH BIGGER THAN..."
      default:
        return "Custom background"
    }
  }

  if (!backgroundUrl.includes("/backgrounds/bg")) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 z-10">
      {isVisible ? (
        <div className="bg-card/90 backdrop-blur-sm p-3 rounded-lg shadow-lg max-w-xs">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">Background #{getBgNumber()}</h3>
            <button onClick={() => setIsVisible(false)} className="text-muted-foreground">
              <X size={16} />
            </button>
          </div>
          <p className="text-xs text-muted-foreground">{getMessage()}</p>
        </div>
      ) : (
        <button
          onClick={() => setIsVisible(true)}
          className="bg-card/80 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-card/90 transition-colors"
        >
          <Info size={16} className="text-primary" />
        </button>
      )}
    </div>
  )
}
