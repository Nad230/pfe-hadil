import { Clock, Check, CheckCheck, AlertCircle } from "lucide-react"

interface MessageStatusIndicatorProps {
  status: "SENDING" | "DELIVERED" | "SENT" | "SEEN" | "FAILED" | "EDITED"
}

export default function MessageStatusIndicator({ status }: MessageStatusIndicatorProps) {
  switch (status) {
    case "SENDING":
      return (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Envoi en cours...</span>
        </div>
      )
    case "DELIVERED":
      return (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Check className="h-3 w-3" />
          <span>Livré</span>
        </div>
      )
    case "SENT":
      return (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Check className="h-3 w-3" />
          <span>Envoyé</span>
        </div>
      )
    case "SEEN":
      return (
        <div className="flex items-center gap-1 text-xs text-blue-500">
          <CheckCheck className="h-3 w-3" />
          <span>Vu</span>
        </div>
      )
    case "FAILED":
      return (
        <div className="flex items-center gap-1 text-xs text-red-500">
          <AlertCircle className="h-3 w-3" />
          <span>Échec</span>
        </div>
      )
    case "EDITED":
      return (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>Modifié</span>
        </div>
      )
    default:
      return null
  }
}
