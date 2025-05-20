"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils"

interface ProfitTableProps {
  bestProduct?: {
    name: string
    totalSold: number
    revenueGenerated: number
  } | null
  commonExpense?: {
    type: string
    count: number
    totalSpent: number
  } | null
}

export function ProfitTable({ bestProduct, commonExpense }: ProfitTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Metric</TableHead>
            <TableHead>Details</TableHead>
            <TableHead className="text-right">Count</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Best Selling Product */}
          <TableRow>
            <TableCell className="font-medium">Top Product</TableCell>
            <TableCell>
              {bestProduct?.name || "N/A"}
            </TableCell>
            <TableCell className="text-right">
              {bestProduct?.totalSold || "-"}
            </TableCell>
            <TableCell className="text-right font-mono">
              {bestProduct ? formatCurrency(bestProduct.revenueGenerated) : "-"}
            </TableCell>
          </TableRow>

          {/* Most Common Expense */}
          <TableRow>
            <TableCell className="font-medium">Common Expense</TableCell>
            <TableCell>
              {commonExpense?.type || "N/A"}
            </TableCell>
            <TableCell className="text-right">
              {commonExpense?.count || "-"}
            </TableCell>
            <TableCell className="text-right font-mono">
              {commonExpense ? formatCurrency(commonExpense.totalSpent) : "-"}
            </TableCell>
          </TableRow>

          {/* Profit Margin Row */}
          <TableRow>
            <TableCell className="font-medium" colSpan={3}>
              Profitability Insight
            </TableCell>
            <TableCell className="text-right font-medium">
              {bestProduct && commonExpense ? (
                <span className={`${
                  (bestProduct.revenueGenerated - commonExpense.totalSpent) >= 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {formatCurrency(bestProduct.revenueGenerated - commonExpense.totalSpent)}
                </span>
              ) : "-"}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}