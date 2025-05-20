"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileText } from "lucide-react"
import Cookies from "js-cookie"
import { useMascotStore } from '@/lib/stores/mascot-store'

interface EditInvoiceItemsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: any[]
  onSuccess: () => void
}

export function EditInvoiceItemsDialog({ open, onOpenChange, items, onSuccess }: EditInvoiceItemsDialogProps) {
  const { setMood, setIsVisible } = useMascotStore()
  const [localItems, setLocalItems] = useState(items)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setLocalItems(items.map(item => ({ ...item })))
  }, [items])

  const handleItemChange = (index: number, field: string, value: string) => {
    const newItems = [...localItems]
    newItems[index][field] = value
    setLocalItems(newItems)
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      setError('')
      const token = Cookies.get("token")

      // Update all items
      await Promise.all(localItems.map(async (item) => {
        const response = await fetch(`http://localhost:3000/invoice/items/${item.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            description: item.description,
            amount: Number(item.amount)
          })
        })
        if (!response.ok) throw new Error('Failed to update items')
      }))

      setMood('happy', 'Items updated successfully!')
      setIsVisible(true)
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      console.error("Error updating items:", err)
      setError(err instanceof Error ? err.message : 'Failed to update items')
      setMood('error', 'Failed to update items')
      setIsVisible(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <FileText className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Edit Invoice Items</h2>
                <p className="text-muted-foreground">Update item details</p>
              </div>
            </div>

            <div className="space-y-4">
              {localItems.map((item, index) => (
                <div key={item.id} className="flex gap-2 items-center">
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
                </div>
              ))}

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
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save All Changes"}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  )
}