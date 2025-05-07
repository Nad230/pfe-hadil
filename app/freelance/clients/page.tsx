"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Users, DollarSign } from "lucide-react"
import { CreateClientDialog } from "@/components/client/CreateClientDialog"
import { useState, useEffect } from "react"
import Cookies from 'js-cookie'

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

  useEffect(() => {
    const token = Cookies.get("token")

    const fetchClients = async () => {
      try {
        const response = await fetch("http://localhost:3000/client", {
          method: "GET",
          headers: {
            "Content-Type":  "application/json",        
            "Authorization": `Bearer ${token}`
          },
        })
        if (!response.ok) throw new Error('Failed to fetch clients')
          const data = await response.json()

        // Transform each client to add totalRevenue
        const transformedClients = data.map((client: any) => {
          const totalRevenue = client.Invoice?.reduce((sum: number, invoice: any) => {
            const invoiceTotal = invoice.items?.reduce(
              (itemSum: number, item: any) => itemSum + (item.amount || 0),
              0
            ) || 0
            return sum + invoiceTotal
          }, 0)
        
          return {
            id: client.id,
            name: client.name,
            avatar: client.photo,
            activeProjects: client.projects?.length || 0,
            totalRevenue,
            status: "active", // or compute real status if available
            lastInteraction: client.updatedAt,
          }
        })
        
        setClients(transformedClients)
        
    
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load clients')
      } finally {
        setLoading(false)
      }
    }

    fetchClients()
  }, [])

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

  if (loading) return <div className="container py-8 text-center">Loading clients...</div>
  if (error) return <div className="container py-8 text-center text-destructive">{error}</div>

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <CreateClientDialog open={showDialog} onOpenChange={setShowDialog} />
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
          {clients.map((client) => (
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
  ${client.totalRevenue != null 
     ? client.totalRevenue.toLocaleString() 
     : '0'} total revenue
</span>
                    </div>
                  </div>
                </div>
                <Badge className={getStatusColor(client.status ?? '')}>
  {(client.status ?? 'unknown').toUpperCase()}
</Badge>

              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Last interaction: {new Date(client.lastInteraction).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">View Details</Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}