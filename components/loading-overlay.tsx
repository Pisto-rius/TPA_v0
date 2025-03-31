"use client"

import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"
import { LoadingSpinner } from "@/components/loading-spinner"

interface LoadingOverlayProps {
  isLoading: boolean
  progress?: number
  message?: string
  showProgress?: boolean
}

export function LoadingOverlay({
  isLoading,
  progress = 0,
  message = "Loading data...",
  showProgress = true,
}: LoadingOverlayProps) {
  const [displayProgress, setDisplayProgress] = useState(progress)

  // Simulate progress if no progress is provided
  useEffect(() => {
    if (!isLoading) return

    if (progress > 0) {
      setDisplayProgress(progress)
      return
    }

    // Simulate progress if none is provided
    const interval = setInterval(() => {
      setDisplayProgress((prev) => {
        // Cap at 90% for simulated progress to avoid false completion
        if (prev >= 90) return 90
        return prev + Math.random() * 5
      })
    }, 500)

    return () => clearInterval(interval)
  }, [isLoading, progress])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
      <div className="bg-card border rounded-lg shadow-lg p-6 max-w-md w-full">
        <LoadingSpinner size={32} text="" className="mb-4" />
        <h3 className="text-lg font-medium text-center mb-2">{message}</h3>

        {showProgress && (
          <div className="space-y-2">
            <Progress value={displayProgress} className="h-2" />
            <p className="text-sm text-muted-foreground text-center">{Math.round(displayProgress)}%</p>
          </div>
        )}
      </div>
    </div>
  )
}

