import { Sale } from "../types/sales"

export const mockSalesData: Sale[] = [
  {
    id: "1",
    date: "2024-03-01",
    product: "Premium Package",
    client: "John Smith",
    clientId: "cs_1",
    quantity: 1,
    amount: 499.99,
    notes: "First time customer"
  },
  {
    id: "2",
    date: "2024-03-02",
    product: "Basic Subscription",
    client: "Sarah Johnson",
    clientId: "cs_2",
    quantity: 1,
    amount: 29.99,
    notes: "Monthly renewal"
  },
  {
    id: "3",
    date: "2024-03-03",
    product: "Enterprise Solution",
    client: "Tech Corp",
    clientId: "cs_3",
    quantity: 1,
    amount: 1499.99,
    notes: "Annual contract"
  },
  // Add more mock data as needed...
]