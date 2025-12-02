"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#1A1A1A] text-white p-4">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <Button
        onClick={reset}
        className="px-4 py-2 bg-primary text-black rounded-md hover:bg-primary/90 transition-colors"
      >
        Try again
      </Button>
    </div>
  )
}
