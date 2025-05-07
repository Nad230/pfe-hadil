"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Minus } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { useState, useEffect } from "react"
import Cookies from "js-cookie"
import { toast } from "sonner"
import { EditProductDialog } from "./edit-product-dialog"
import { useTranslation } from "@/components/context/translation-context"; // ✅ Import Translation Hook

interface Product {
  id: string
  name: string
  price: number
  quantity: number
  icon: string  // Changed to string type for emojis
}
interface ProductCardProps {
  product: Product
  onQuantityChange: (change: number) => void
  onEditClick?: (product: Product) => void // NEW
}


export function ProductCard({ product, onQuantityChange }: ProductCardProps) {
const [products, setProducts] = useState<Product[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [productToEdit, setProductToEdit] = useState<Product | null>(null)
  
  const handleEditProduct = (product: Product) => {
    setProductToEdit(product)
    setShowEditDialog(true)
  }
  
  const handleUpdateProduct = async (updated: Omit<Product, "quantity">) => {
    try {
      const token = Cookies.get("token")
      if (!token) {
        toast.error("No token found")
        return
      }
  
      const res = await fetch(`http://localhost:3000/products/${updated.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updated),
      })
  
      if (!res.ok) throw new Error("Update failed")
  
      setProducts(prev =>
        prev.map(p => (p.id === updated.id ? { ...p, ...updated } : p))
      )
      toast.success("Product updated")
      setShowEditDialog(false)
    } catch (err) {
      console.error(err)
      toast.error("Failed to update product")
    }
  }
  const { t } = useTranslation();

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
        <div
            className={`rounded-full p-4 cursor-pointer transition hover:scale-105
              ${product.quantity > 0 
                ? 'bg-primary/10 text-primary'
                : 'bg-muted text-muted-foreground'}
            `}
            onClick={() => handleEditProduct(product)}
            >
            <span className="text-2xl">{product.icon}</span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">{product.name}</h3>
            <p className="text-muted-foreground">
              {formatCurrency(product.price)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onQuantityChange(-1)}
              disabled={product.quantity === 0}
            >
              <Minus className="h-4 w-4" />
            </Button>

            <motion.span
              key={product.quantity}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="w-8 text-center font-mono"
            >
              {product.quantity}
            </motion.span>

            <Button
              variant="outline"
              size="icon"
              onClick={() => onQuantityChange(1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {product.quantity > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t"
          >
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("Subtotal")}</span>
              <span className="font-medium">
                {formatCurrency(product.price * product.quantity)}
              </span>
            </div>
          </motion.div>
        )}
      </CardContent>
      {productToEdit && (
  <EditProductDialog
    open={showEditDialog}
    onOpenChange={setShowEditDialog}
    product={productToEdit}
    onUpdate={handleUpdateProduct}
  />
)}

    </Card>


  )
  
}