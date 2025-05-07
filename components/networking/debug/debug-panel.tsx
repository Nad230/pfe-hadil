"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DebugPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  connectionStatus: string
  wsConnected: boolean
  queuedMessages: any[]
  onReconnect: () => void
  onClearQueue: () => void
}

export default function DebugPanel({
  open,
  onOpenChange,
  connectionStatus,
  wsConnected,
  queuedMessages,
  onReconnect,
  onClearQueue,
}: DebugPanelProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Panneau de débogage</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">État de la connexion WebSocket</h3>
            <div className="flex items-center gap-2">
              <Badge
                variant={wsConnected ? "default" : "destructive"}
                className={wsConnected ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}
              >
                {wsConnected ? "Connecté" : "Déconnecté"}
              </Badge>
              <span className="text-sm text-muted-foreground">{connectionStatus}</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Messages en file d'attente ({queuedMessages.length})</h3>
            {queuedMessages.length > 0 ? (
              <ScrollArea className="h-40 border rounded-md p-2">
                {queuedMessages.map((msg, index) => (
                  <div key={index} className="text-xs border-b pb-2 mb-2 last:border-0 last:mb-0 last:pb-0">
                    <div className="font-medium">ID: {msg.id}</div>
                    <div>Type: {msg.type}</div>
                    <div className="truncate">Contenu: {msg.content}</div>
                    <div>Horodatage: {new Date(msg.timestamp).toLocaleString()}</div>
                  </div>
                ))}
              </ScrollArea>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-2 border rounded-md">
                Aucun message en attente
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={onReconnect} variant="outline">
              Reconnecter WebSocket
            </Button>
            <Button
              onClick={onClearQueue}
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
              disabled={queuedMessages.length === 0}
            >
              Vider la file d'attente
            </Button>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
