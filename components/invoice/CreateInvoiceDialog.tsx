"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command"
import { Check, Plus, X, FileText, Calendar, Briefcase, User } from "lucide-react"
import confetti from 'canvas-confetti'
import Cookies from 'js-cookie'
import { useMascotStore } from '@/lib/stores/mascot-store'

interface CreateInvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface InvoiceItem {
  description: string
  amount: string
}

interface Project {
  id: string
  name: string
}

interface Client {
  id: string
  name: string
}

export function CreateInvoiceDialog({ open, onOpenChange, onSuccess }: CreateInvoiceDialogProps) {
  const [step, setStep] = useState<number>(1)
  const { setMood, setIsVisible } = useMascotStore()
  const [invoiceData, setInvoiceData] = useState({
    items: [{ description: '', amount: '' }],
    dueDate: '',
    clientId: '',
    projectId: ''
  })
  const [clients, setClients] = useState<Client[]>([])
  const [clientProjects, setClientProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const token = Cookies.get("token")
        const response = await fetch('http://localhost:3000/client', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!response.ok) throw new Error('Failed to fetch clients')
        setClients(await response.json())
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load clients')
      }
    }

    if (open) fetchClients()
  }, [open])

  useEffect(() => {
    const fetchClientProjects = async () => {
      if (!invoiceData.clientId) return
      
      try {
        const token = Cookies.get("token")
        const response = await fetch(
          `http://localhost:3000/client/${invoiceData.clientId}/projects`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (!response.ok) throw new Error('Failed to fetch client projects')
        setClientProjects(await response.json())
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load projects')
      } finally {
        setLoading(false)
      }
    }

    if (invoiceData.clientId) fetchClientProjects()
  }, [invoiceData.clientId])

  const handleNext = () => {
    if (step < 5) setStep(prev => prev + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(prev => prev - 1)
  }

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string) => {
    const newItems = [...invoiceData.items]
    newItems[index][field] = value
    setInvoiceData(prev => ({ ...prev, items: newItems }))
  }

  const addNewItem = () => {
    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', amount: '' }]
    }))
  }

  const removeItem = (index: number) => {
    const newItems = invoiceData.items.filter((_, i) => i !== index)
    setInvoiceData(prev => ({ ...prev, items: newItems }))
  }

  const handleCreateInvoice = async () => {
    try {
      const token = Cookies.get("token")
      const payload = {
        status: "pending",
        dueDate: new Date(invoiceData.dueDate).toISOString(),
        clientId: invoiceData.clientId,
        projectId: invoiceData.projectId,
        items: invoiceData.items.map(item => ({
          description: item.description,
          amount: Number(item.amount)
        }))
      }

      const response = await fetch("http://localhost:3000/invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) throw new Error('Failed to create invoice')

      confetti({ particleCount: 100, spread: 70 })
      setIsVisible(true)
      onSuccess?.()
      onOpenChange(false)
      setStep(1)
      setInvoiceData({
        items: [{ description: '', amount: '' }],
        dueDate: '',
        clientId: '',
        projectId: ''
      })
    } catch (err) {
      console.error("Error creating invoice:", err)
      setIsVisible(true)
    }
  }

  if (error) return <div className="text-center p-4 text-destructive">{error}</div>

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Step 1: Items */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Invoice Items</h2>
                      <p className="text-muted-foreground">Add items to include in the invoice</p>
                    </div>
                  </div>

                  {invoiceData.items.map((item, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      />
                      <Input
                        placeholder="Amount"
                        type="number"
                        value={item.amount}
                        onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                      />
                      {invoiceData.items.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}

                  <Button variant="outline" onClick={addNewItem}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </div>
              )}

              {/* Step 2: Client Selection */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-teal-500/20 flex items-center justify-center">
                      <User className="h-6 w-6 text-teal-500" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Select Client</h2>
                      <p className="text-muted-foreground">Choose the client for this invoice</p>
                    </div>
                  </div>

                  <Command className="border rounded-lg">
                    <CommandInput placeholder="Search clients..." />
                    <CommandList className="max-h-[200px] overflow-y-auto">
                      <CommandGroup>
                        {clients.map((client) => (
                          <CommandItem
                            key={client.id}
                            onSelect={() => setInvoiceData(prev => ({ ...prev, clientId: client.id }))}
                          >
                            <Check className={`mr-2 h-4 w-4 ${
                              invoiceData.clientId === client.id ? "opacity-100" : "opacity-0"
                            }`} />
                            {client.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </div>
              )}

              {/* Step 3: Project Selection */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <Briefcase className="h-6 w-6 text-purple-500" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Select Project</h2>
                      <p className="text-muted-foreground">Choose a project from {clients.find(c => c.id === invoiceData.clientId)?.name}</p>
                    </div>
                  </div>

                  <Command className="border rounded-lg">
                    <CommandInput placeholder="Search projects..." />
                    <CommandList className="max-h-[200px] overflow-y-auto">
                      {loading ? (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                          <div className="animate-pulse">Loading projects...</div>
                        </div>
                      ) : (
                        <CommandGroup>
                          {clientProjects.map((project) => (
                            <CommandItem
                              key={project.id}
                              onSelect={() => setInvoiceData(prev => ({ ...prev, projectId: project.id }))}
                            >
                              <Check className={`mr-2 h-4 w-4 ${
                                invoiceData.projectId === project.id ? "opacity-100" : "opacity-0"
                              }`} />
                              {project.name}
                            </CommandItem>
                          ))}
                          <CommandEmpty>No projects found for this client</CommandEmpty>
                        </CommandGroup>
                      )}
                    </CommandList>
                  </Command>
                </div>
              )}

              {/* Step 4: Due Date & Review */}
              {step === 4 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-orange-500" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Due Date & Review</h2>
                      <p className="text-muted-foreground">Finalize invoice details</p>
                    </div>
                  </div>

                  <Input
                    type="date"
                    value={invoiceData.dueDate}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, dueDate: e.target.value }))}
                  />

                  <div className="space-y-2">
                    <h3 className="font-semibold">Items:</h3>
                    {invoiceData.items.map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{item.description}</span>
                        <span>${item.amount}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between">
                    <span>Client:</span>
                    <span>
                      {clients.find(c => c.id === invoiceData.clientId)?.name || 'Not selected'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Project:</span>
                    <span>
                      {clientProjects.find(p => p.id === invoiceData.projectId)?.name || 'Not selected'}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="absolute bottom-0 left-0 right-0 flex justify-between pt-4">
            <Button variant="ghost" onClick={handleBack} disabled={step === 1}>
              Back
            </Button>
            <Button
              onClick={step === 4 ? handleCreateInvoice : handleNext}
              disabled={
                (step === 1 && invoiceData.items.some(item => !item.description || !item.amount)) ||
                (step === 2 && !invoiceData.clientId) ||
                (step === 3 && !invoiceData.projectId) ||
                (step === 4 && !invoiceData.dueDate)
              }
            >
              {step === 4 ? 'Create Invoice 🚀' : 'Next'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}