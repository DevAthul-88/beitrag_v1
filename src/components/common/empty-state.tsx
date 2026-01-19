import type React from "react"
import { Inbox } from "lucide-react"

interface EmptyStateProps {
  title?: string
  message: string
  icon?: React.ReactNode
}

export function EmptyState({
  title = "No items found",
  message,
  icon = <Inbox className="h-12 w-12 text-muted-foreground" />,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
      {icon}
      <div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}
