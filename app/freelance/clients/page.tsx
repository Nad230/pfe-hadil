"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Users, DollarSign, Trash2, MoreVertical, Edit } from "lucide-react"
import { CreateClientDialog } from "@/components/client/CreateClientDialog"
import { useState, useEffect, useCallback } from "react"
import { EditClientDialog } from "@/components/client/EditClientDialog"
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog"

import Cookies from 'js-cookie'
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from "@/components/ui/dropdown-menu"

// Add DeleteChoiceDialog component
const DeleteChoiceDialog = ({ 
  open, 
  onOpenChange, 
  onDelete 
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDelete: (deleteInvoices: boolean) => void
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-[400px]">
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <Trash2 className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Delete Options</h2>
              <p className="text-muted-foreground">Choose deletion type</p>
            </div>
          </div>

           <div className="flex flex-col gap-2">
        <DialogClose asChild>
          <Button
            variant="destructive"
            onClick={() => onDelete(false)}
          >
            Delete Client Only
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button
            variant="destructive"
            onClick={() => onDelete(true)}
          >
            Delete Client with All Invoices
          </Button>
        </DialogClose>
      </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
)

interface Client {
  id: string
  name: string
  avatar: string
  activeProjects: number
  totalRevenue: number
  status: string
  lastInteraction: string
}
export default function ClientHubPage() {
   const [showDialog, setShowDialog] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string>("")
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)

    useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = Cookies.get("token")
        const response = await fetch("http://localhost:3000/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!response.ok) throw new Error("Failed to fetch user")
        const userData = await response.json()
        setCurrentUserId(userData.sub)
      } catch (err) {
        console.error("Error fetching current user:", err)
      }
    }
    fetchCurrentUser()
  }, [])


  const fetchClients = useCallback(async () => {
    setLoading(true)
    try {
      const token = Cookies.get("token")
      const response = await fetch("http://localhost:3000/client", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      })
      if (!response.ok) throw new Error('Failed to fetch clients')
      const data = await response.json()

      const transformedClients = data.map((client: any) => ({
        id: client.id,
        name: client.name,
        createdBy:client.createdBy,
        avatar: client.photo,
        activeProjects: client.projects?.length || 0,
        totalRevenue: client.Invoice?.reduce((sum: number, invoice: any) => 
          sum + (invoice.items?.reduce(
            (itemSum: number, item: any) => itemSum + (item.amount || 0), 0
          ) || 0), 0
        ),
        status: "active",
        lastInteraction: client.updatedAt,
        userId: client.userId
      }))

      setClients(transformedClients)
      console.log(transformedClients)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load clients')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
      case "inactive":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
      default:
        return ""
    }
  }
const handleDeleteClient = async (clientId: string, deleteInvoices: boolean) => {
    try {
      const token = Cookies.get("token")
      const response = await fetch(
        `http://localhost:3000/client/${clientId}?deleteInvoices=${deleteInvoices}`, 
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      if (!response.ok) throw new Error('Failed to delete client')
      
      setClients(prev => prev.filter(client => client.id !== clientId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete client')
    }
  }

  if (loading) return <div className="container py-8 text-center">Loading clients...</div>
  if (error) return <div className="container py-8 text-center text-destructive">{error}</div>
  return (
    <div className="container py-8 space-y-8">
       {selectedClient && (
        <EditClientDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          client={selectedClient}
          onSuccess={fetchClients}
        />
      )}
 <DeleteChoiceDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onDelete={(deleteInvoices) => 
          selectedClient && handleDeleteClient(selectedClient.id, deleteInvoices)
        }
      />
      <div className="flex items-center justify-between">
        <CreateClientDialog 
          open={showDialog} 
          onOpenChange={setShowDialog} 
          onSuccess={fetchClients}  // Add this prop
        />
        <div>
          <h1 className="text-3xl font-bold">Client Hub</h1>
          <p className="text-muted-foreground">Manage your client relationships and interactions</p>
        </div>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
            <p className="text-xs text-muted-foreground">Total active clients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${clients.reduce((sum, client) => sum + client.totalRevenue, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Across all clients</p>
          </CardContent>
        </Card>
      </div>

<Card>
        <CardHeader>
          <CardTitle>Client Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {clients.map((client) => {
            const isOwner = client.createdBy === currentUserId
            
            return (
              <div
                key={client.id}
                className="flex flex-col space-y-4 rounded-lg border p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={client.avatar} />
                      <AvatarFallback>{client.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{client.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{client.activeProjects} active projects</span>
                        <span>•</span>
                        <span>
                          ${client.totalRevenue?.toLocaleString() || 0} total revenue
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={getStatusColor(client.status ?? '')}>
                      {(client.status ?? 'unknown').toUpperCase()}
                    </Badge>
                    {isOwner && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedClient(client)
                              setShowEditDialog(true)
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setSelectedClient(client)
                              setShowDeleteDialog(true)
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Last interaction: {new Date(client.lastInteraction).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2">
                    {client.userId && (
                      <Button variant="outline">Send a Message</Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}