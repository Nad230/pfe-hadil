// Add mock businesses
export const mockBusinesses = [
  'Main Business',
  'Side Project',
  'Consulting LLC',
  'Freelance Work'
] as const

// Extending mock data with more realistic transactions
export const mockCategories = [
  'Product Sales',
  'Services',
  'Infrastructure',
  'Tools',
  'Marketing',
  'Office Expenses',
  'Travel',
  'Consulting',
] as const

export const mockSources = [
  'App Store',
  'Google Play',
  'Stripe',
  'PayPal',
  'Direct Deposit',
  'AWS',
  'Digital Ocean',
  'Freelancing',
] as const

export const mockMonthlyStats = [
  {
    month: '2024-03',
    totalIncome: 5500,
    totalExpenses: 750,
    netIncome: 3625,
    goals: [
      {
        id: '1',
        type: 'netIncome',
        target: 3000,
        current: 3625,
        period: 'monthly',
        priority: 1,
        description: 'Monthly Net Income Target'
      },
      {
        id: '2',
        type: 'revenue',
        target: 6000,
        current: 5500,
        period: 'monthly',
        priority: 2,
        description: 'Monthly Revenue Target'
      },
      {
        id: '3',
        type: 'expenses',
        target: 1000,
        current: 750,
        period: 'monthly',
        priority: 2,
        description: 'Keep Monthly Expenses Under'
      },
      {
        id: '4',
        type: 'savings',
        target: 1000,
        current: 800,
        period: 'monthly',
        priority: 3,
        description: 'Monthly Savings Goal'
      }
    ],
    deductions: {
      taxes: 975,
      fees: 900,
      other: 0
    },
    businessStats: {
      'Main Business': {
        income: 0,
        expenses: 250,
        netIncome: -250
      },
      'Side Project': {
        income: 2500,
        expenses: 500,
        netIncome: 1250
      },
      'Freelance Work': {
        income: 3000,
        expenses: 0,
        netIncome: 2250
      }
    },
    sources: {
      'App Store': 2500,
      'Freelancing': 3000
    }
  }
]