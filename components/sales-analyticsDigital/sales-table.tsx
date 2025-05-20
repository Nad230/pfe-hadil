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

interface Client {
  id: string
  name: string
}

interface Project {
  id: string
  name: string
}

interface InvoiceItem {
  id: string
  description: string
  amount: number
}

interface Invoice {
  id: string
  status: string
  dueDate: string
  client?: Client
  project?: Project
  items?: InvoiceItem[]
}

interface InvoiceSale {
  id: string
  invoiceId: string
  date: string
  userId: string
  invoice: Invoice
}

interface SalesTableProps {
  data: InvoiceSale[]
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
      (sale.invoice.client?.name?.toLowerCase().includes(searchTerm)) ||
      (sale.invoice.project?.name?.toLowerCase().includes(searchTerm)) ||
      sale.userId.toLowerCase().includes(searchTerm)

    return matchesDate && matchesSearch
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search by client, project or user..."
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
              <TableHead>Client</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  No invoices found
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((sale) => {
                const totalAmount = (sale.invoice.items || []).reduce(
                  (sum, item) => sum + item.amount, 0
                )
                
                return (
                  <TableRow key={sale.id}>
                    <TableCell>{formatDate(sale.date)}</TableCell>
                    <TableCell>
                      {sale.invoice.client?.name || "N/A"}
                    </TableCell>
                    <TableCell>
                      {sale.invoice.project?.name || "N/A"}
                    </TableCell>
                    <TableCell>{sale.invoice.status}</TableCell>
                    <TableCell>{formatDate(sale.invoice.dueDate)}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(totalAmount)}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}