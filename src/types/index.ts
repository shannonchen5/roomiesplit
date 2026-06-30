export interface Person {
  id: string
  name: string
  color: string
}

export type ExpenseCategory = 'expense' | 'community-good' | 'utility'

export interface Expense {
  id: string
  description: string
  amount: number
  paidBy: string
  splitBetween: string[]
  /** When set, overrides equal split (used for utility proration). */
  customShares?: Record<string, number>
  date: string
  category: ExpenseCategory
  utilityBillId?: string
}

export interface UtilityBill {
  id: string
  totalAmount: number
  paidBy: string
  billingPeriodStart: string
  billingPeriodEnd: string
  daysPresent: Record<string, number>
  date: string
}

export interface Settlement {
  id: string
  fromPersonId: string
  toPersonId: string
  amount: number
  date: string
  /** When set, ties this settlement to a specific expense debt line. */
  debtLineId?: string
}

export interface DebtLine {
  id: string
  expenseId: string
  description: string
  fromPersonId: string
  toPersonId: string
  amount: number
  date: string
}

/** Shape persisted to storage / sent to a future API. */
export interface AppData {
  people: Person[]
  expenses: Expense[]
  utilityBills: UtilityBill[]
  settlements: Settlement[]
}

export type TimeRange = 'this-month' | 'last-3-months' | 'all-time'

export type ViewId =
  | 'dashboard'
  | 'people'
  | 'expenses'
  | 'community-goods'
  | 'utilities'
  | 'person-tab'
