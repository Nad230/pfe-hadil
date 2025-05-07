"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { useTranslation } from "@/components/context/translation-context"; // ✅ Import Translation Hook

interface Product {
  id: string
  name: string
  price: number
  quantity: number
}

interface SaleSummaryProps {
  products: Product[]
  total: number
}

export function SaleSummary({ products, total }: SaleSummaryProps) {
  const soldProducts = products.filter(p => p.quantity > 0)
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("Sale Summary")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <AnimatePresence>
            {soldProducts.map(product => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex justify-between text-sm"
              >
                <span className="text-muted-foreground">
                  {product.name} × {product.quantity}
                </span>
                <span>
                  {formatCurrency(product.price * product.quantity)}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>

          {soldProducts.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-4">
              {t("No items added yet")}
            </p>
          )}
        </div>

        {soldProducts.length > 0 && (
          <div className="pt-4 border-t">
            <div className="flex justify-between font-medium">
              <span>{t("Total")}</span>
              <motion.span
                key={total}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-xl"
              >
                {formatCurrency(total)}
              </motion.span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}