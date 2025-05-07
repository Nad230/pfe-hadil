"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { AddProductDialog } from "@/components/sales/add-product-dialog"
import { ProductCard } from "@/components/sales/product-card"
import { SaleSummary } from "@/components/sales/sale-summary"
import { toast } from "sonner"
import Cookies from "js-cookie"
import { Trash, Pencil } from "lucide-react"
import { useTranslation } from "@/components/context/translation-context"; // ✅ Import Translation Hook

interface Product {
  id: string
  name: string
  price: number
  quantity: number
  icon: "coffee" | "shopping"
}

export default function NewSalePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [productToEdit, setProductToEdit] = useState<Product | null>(null)
/*const handleDeleteProduct = async (id: string) => {
  try {
    const token = Cookies.get("token")
    if (!token) {
      toast.error("No token found")
      return
    }

    const res = await fetch(`http://localhost:3000/products/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) throw new Error("Delete failed")

    setProducts(prev => prev.filter(p => p.id !== id))
    toast.success("Product deleted")
  } catch (err) {
    console.error(err)
    toast.error("Failed to delete product")
  }
}*/

const handleEditProduct = (product: Product) => {
  setProductToEdit(product)
  setShowEditDialog(true)
}
const { t } = useTranslation();

  
const fetchProducts = useCallback(async () => {
  try {
    const token = Cookies.get("token")
    if (!token) {
      toast.error("No token found")
      return
    }

    const res = await fetch("http://localhost:3000/products", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) {
      throw new Error("Failed to fetch products")
    }

    const data = await res.json()

    const formattedProducts: Product[] = data.map((p: any) => ({
      ...p,
      quantity: 0,
    }))

    setProducts(formattedProducts)
  } catch (err) {
    console.error(err)
    toast.error("Failed to load products")
  }
}, [])

useEffect(() => {
  fetchProducts()
}, [])


  const handleQuantityChange = (id: string, change: number) => {
    setProducts(prev =>
      prev.map(product =>
        product.id === id
          ? { ...product, quantity: Math.max(0, product.quantity + change) }
          : product
      )
    )
  }

  const handleAddProduct = (product: Omit<Product, "id" | "quantity">) => {
    const newProduct = {
      ...product,
      id: crypto.randomUUID(),
      quantity: 0,
    }
    setProducts(prev => [...prev, newProduct])
    setShowAddDialog(false)
    toast.success("Product added successfully")
  }

  const handleSave = async () => {
    const soldProducts = products.filter(p => p.quantity > 0)
    if (soldProducts.length === 0) {
      toast.error("No products selected")
      return
    }
  
    try {
      const token = Cookies.get("token")

  
      if (!token) {
        toast.error("No token found")
        return
      }
  
      const res = await fetch("http://localhost:3000/sales/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(
          soldProducts.map(p => ({
            productId: p.id,
            quantity: p.quantity,
          }))
        )
      })
  
      if (!res.ok) {
        throw new Error("Failed to save sale")
      }
  
      toast.success("Sale recorded successfully")
      setProducts(prev => prev.map(p => ({ ...p, quantity: 0 })))
    } catch (err) {
      console.error(err)
      toast.error("Failed to save sale")
    }
  }
  

  const handleReset = () => {
    setProducts(prev => prev.map(p => ({ ...p, quantity: 0 })))
    toast.success("Quantities reset")
  }

  const total = products.reduce((sum, p) => sum + p.price * p.quantity, 0)

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">{t("New Sale")}</h1>
            <p className="text-muted-foreground">
              {new Date().toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
           {t(" Add Product")}
          </Button>
        </div>

        <div className="grid gap-8 md:grid-cols-[2fr,1fr]">
          {/* Products List */}
          <div className="space-y-4">
            <AnimatePresence>
              {products.map((product) => (
                
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <ProductCard
                    product={product}
                    onQuantityChange={(change) =>
                      handleQuantityChange(product.id, change)
                    }
                    


                  />
                
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <div className="space-y-4">
            <SaleSummary products={products} total={total} />

            <Card>
              <CardContent className="pt-6 space-y-4">
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={handleSave}
                >
                  {t("Save Sale")} ({formatCurrency(total)})
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleReset}
                >
                  {t("Reset All")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>

      <AddProductDialog
  open={showAddDialog}
  onOpenChange={setShowAddDialog}
  onProductAdded={fetchProducts}
/>

    </div>
  )
}
