"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Calendar, FileText, Plus, CheckCircle2, Clock, MoreVertical, Pencil } from "lucide-react"
import { CreateInvoiceDialog } from "@/components/invoice/CreateInvoiceDialog"
import { useState, useEffect, useCallback } from "react"
import Cookies from "js-cookie"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// Add these imports to InvoiceManager.tsx
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Trash2, Edit } from "lucide-react"                                                                                 
import { EditInvoiceDialog } from "@/components/invoice/EditInvoiceDialog "
import { EditInvoiceItemsDialog } from "@/components/invoice/EditInvoiceItemsDialog"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface InvoiceItem {
  id: string
  description: string
  amount: number
}

interface EditChoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (choice: 'invoice' | 'items') => void
}

interface Invoice {
  id: string
  status: string
  dueDate: string
  createdBy: string
  client: {
    id: string
    name: string
    photo?: string
  }
  project: {
    name: string
  }
  items: InvoiceItem[]
}

// EditChoiceDialog component
const EditChoiceDialog: React.FC<EditChoiceDialogProps> = ({ open, onOpenChange, onSelect }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-[400px]">
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Pencil className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Edit Options</h2>
              <p className="text-muted-foreground">Choose what to update</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => {
                onSelect('invoice')
                onOpenChange(false)
              }}
            >
              Update Invoice Details
            </Button>
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => {
                onSelect('items')
                onOpenChange(false)
              }}
            >
              Update Items
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
)

export default function InvoiceManager() {
  const [showDialog, setShowDialog] = useState(false)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [currentUserId, setCurrentUserId] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showEditItemsDialog, setShowEditItemsDialog] = useState(false)
  const [showEditChoiceDialog, setShowEditChoiceDialog] = useState(false)



  const handleDelete = async (invoiceId: string) => {
  try {
    const token = Cookies.get('token')
    const response = await fetch(`http://localhost:3000/invoice/${invoiceId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to delete invoice')
    }

    // Update state to remove the deleted invoice
    setInvoices(prevInvoices => 
      prevInvoices.filter(invoice => invoice.id !== invoiceId)
    )
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to delete invoice')
  }
}

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get("token")
        
        // Fetch current user
        const userResponse = await fetch("http://localhost:3000/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!userResponse.ok) throw new Error("Failed to fetch user")
        const userData = await userResponse.json()
        setCurrentUserId(userData.sub)

        // Fetch invoices
        const invoicesResponse = await fetch("http://localhost:3000/invoice", {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!invoicesResponse.ok) throw new Error("Failed to fetch invoices")
        const invoicesData = await invoicesResponse.json()
        setInvoices(invoicesData)

        console.log(currentUserId, 'the login now', invoicesData.createdBy)
        
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const fetchData = useCallback(async () => {
    try {
      const token = Cookies.get("token")
      
      // Fetch current user
      const userResponse = await fetch("http://localhost:3000/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!userResponse.ok) throw new Error("Failed to fetch user")
      const userData = await userResponse.json()
      setCurrentUserId(userData.sub)
  
      // Fetch invoices
      const invoicesResponse = await fetch("http://localhost:3000/invoice", {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!invoicesResponse.ok) throw new Error("Failed to fetch invoices")
      const invoicesData = await invoicesResponse.json()
      setInvoices(invoicesData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data")
    } finally {
      setLoading(false)
    }
  }, [])
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
      case "overdue":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
      default:
        return ""
    }
  }
  
  const handleEditOptionSelect = (choice: 'invoice' | 'items') => {
    if (choice === 'invoice') {
      setShowEditDialog(true)
    } else {
      setShowEditItemsDialog(true)
    }
  }

  const handleEditClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setShowEditChoiceDialog(true)
  }

  const calculateTotals = () => {
    const totalOutstanding = invoices
      .filter(inv => inv.status === "pending")
      .reduce((sum, inv) => sum + inv.items.reduce((a, b) => a + b.amount, 0), 0)

    const totalPaid = invoices
      .filter(inv => inv.status === "paid")
      .reduce((sum, inv) => sum + inv.items.reduce((a, b) => a + b.amount, 0), 0)

    return { totalOutstanding, totalPaid }
  }

  const { totalOutstanding, totalPaid } = calculateTotals()

  if (loading) return <div className="text-center p-4">Loading invoices...</div>
  if (error) return <div className="text-center p-4 text-destructive">{error}</div>

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalOutstanding.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From {invoices.length} invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPaid.toLocaleString()}</div>
          </CardContent>
        </Card>

        {/* Removed average time and next due date cards for simplicity */}
      </div>
      
      <CreateInvoiceDialog 
        open={showDialog} 
        onOpenChange={setShowDialog}
        onSuccess={fetchData}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Invoices</CardTitle>
            <Button onClick={() => setShowDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Invoice
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {invoices.map((invoice) => {
              const totalAmount = invoice.items.reduce((sum, item) => sum + item.amount, 0)
              const isCreator = currentUserId === invoice.createdBy
              
              return (
                <div
                  key={invoice.id}
                  className="flex flex-col space-y-4 rounded-lg border p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={invoice.client.photo || ""} />
                        <AvatarFallback>{invoice.client.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <h3 className="font-semibold">{invoice.client.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {invoice.project.name}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status.toUpperCase()}
                      </Badge>
                      
                      {isCreator && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:bg-accent">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent 
                            align="end" 
                            className="w-48 bg-background rounded-md shadow-lg border"
                          >
                            <DropdownMenuItem 
                              className="flex items-center px-4 py-2 hover:bg-accent cursor-pointer"
                              onClick={() => handleEditClick(invoice)}
                            >
                              <Edit className="mr-2 h-4 w-4 text-primary" />
                              <span>Edit</span>
                            </DropdownMenuItem>
                           <DropdownMenuItem 
  className="flex items-center px-4 py-2 hover:bg-accent cursor-pointer text-destructive"
  onClick={() => handleDelete(invoice.id)}
>
  <Trash2 className="mr-2 h-4 w-4" />
  <span>Delete</span>
</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {invoice.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-muted-foreground">
                          {item.description}
                        </span>
                        <span>${item.amount.toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between font-medium">
                      <span>Total</span>
                      <span>${totalAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Due {new Date(invoice.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">View</Button>
                      <Button size="sm">Send Reminder</Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
      
      {selectedInvoice && (
        <>
          <EditChoiceDialog
            open={showEditChoiceDialog}
            onOpenChange={setShowEditChoiceDialog}
            onSelect={handleEditOptionSelect}
          />
          
  <EditInvoiceDialog
    open={showEditDialog}
    onOpenChange={setShowEditDialog}
    invoice={selectedInvoice}
    project={selectedInvoice.project} // Pass the project data from the invoice
    onSuccess={fetchData}
  />
        
          <EditInvoiceItemsDialog
            open={showEditItemsDialog}
            onOpenChange={setShowEditItemsDialog}
            items={selectedInvoice.items}
            onSuccess={fetchData}
          />
        </>
      )}
    </div>
  )
}