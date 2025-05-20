"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { DateRange } from "react-day-picker"
import { formatCurrency, formatDate } from "@/lib/utils"

interface Product {
  name: string
  price: number
  icon?: string  // Added optional icon field from API
}

interface Sale {
  id: string
  productId: string
  quantity: number
  date: string
  userId: string
  product: Product
}

interface SalesTableProps {
  data: Sale[]
  dateRange: DateRange
}

export function SalesTable({ data, dateRange }: SalesTableProps) {
  const [search, setSearch] = useState("")

  const filteredData = data.filter(sale => {
    const saleDate = new Date(sale.date)
    const matchesDate = (!dateRange.from || saleDate >= dateRange.from) &&
                       (!dateRange.to || saleDate <= dateRange.to)
    
    const searchTerm = search.toLowerCase()
    const matchesSearch = search === "" ||
      sale.product.name.toLowerCase().includes(searchTerm) ||
      sale.userId.toLowerCase().includes(searchTerm)

    return matchesDate && matchesSearch
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search by product or user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  No sales found
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>{formatDate(sale.date)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {sale.product.icon && (
                        <span>{sale.product.icon}</span>
                      )}
                      {sale.product.name}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">
  {sale.userId ? `${sale.userId.slice(0, 8)}...` : "N/A"}
</TableCell>

                  <TableCell>{sale.quantity}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(sale.product.price * sale.quantity)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}