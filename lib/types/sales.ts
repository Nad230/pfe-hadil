export interface Sale {
    id: string
    date: string
    product: string
    client: string
    clientId: string
    quantity: number
    amount: number
    notes?: string
  }