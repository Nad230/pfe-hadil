"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "lucide-react"
import Cookies from "js-cookie"
import { useMascotStore } from '@/lib/stores/mascot-store'
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface EditInvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice: any
  onSuccess: () => void
}

export function EditInvoiceDialog({ open, onOpenChange, invoice, onSuccess }: EditInvoiceDialogProps) {
  const { setMood, setIsVisible } = useMascotStore()
  const [formData, setFormData] = useState({
    status: invoice?.status || 'pending',
    dueDate: invoice?.dueDate?.split('T')[0] || ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (invoice) {
      setFormData({
        id:invoice.id,
        status: invoice.status,
        dueDate: invoice.dueDate.split('T')[0]
      })
    }
  }, [invoice])

  const handleSubmit = async () => {
    try {
      setLoading(true)
      setError('')
      
      const token = Cookies.get("token")
      const response = await fetch(`http://localhost:3000/invoice/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          dueDate: new Date(formData.dueDate).toISOString()
        })
      })

      if (!response.ok) throw new Error('Failed to update invoice')
      
      setMood('happy', 'Invoice updated successfully!')
      setIsVisible(true)
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      console.error("Error updating invoice:", err)
      setError(err instanceof Error ? err.message : 'Failed to update invoice')
      setMood('error', 'Failed to update invoice')
      setIsVisible(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Edit Invoice</h2>
                <p className="text-muted-foreground">Update invoice details</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>

              {error && <p className="text-destructive text-sm">{error}</p>}

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  )
}