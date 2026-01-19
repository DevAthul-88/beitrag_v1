"use client"

import { AlertCircle, RotateCcw } from "lucide-react"
import { Button } from "../ui/button"

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  fullScreen?: boolean
}

export function ErrorState({ title = "Something went wrong", message, onRetry, fullScreen = false }: ErrorStateProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4 text-center">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm" className="gap-2 bg-transparent">
          <RotateCcw className="h-4 w-4" />
          Try again
        </Button>
      )}
    </div>
  )

  if (fullScreen) {
    return <div className="flex h-screen w-full items-center justify-center bg-background">{content}</div>
  }

  return <div className="flex justify-center py-12">{content}</div>
}
