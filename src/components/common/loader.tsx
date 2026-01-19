import { Loader2 } from "lucide-react"

interface LoaderProps {
  message?: string
  fullScreen?: boolean
}

export function Loader({ message = "Loading...", fullScreen = false }: LoaderProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )

  if (fullScreen) {
    return <div className="flex h-screen w-full items-center justify-center bg-background">{content}</div>
  }

  return <div className="flex justify-center py-12">{content}</div>
}
