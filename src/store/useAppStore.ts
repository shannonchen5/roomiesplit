import { v4 as uuidv4 } from 'uuid'
import { create } from 'zustand'
import { computeUtilityShares } from '../lib/balance'
import { assignColor } from '../lib/colors'
import { todayISO } from '../lib/dates'
import { emptyAppData, localStorageStore } from '../lib/storage'
import type {
  AppData,
  Expense,
  ExpenseCategory,
  Person,
  Settlement,
  UtilityBill,
} from '../types'

interface AppState extends AppData {
  addPerson: (name: string) => void
  removePerson: (id: string) => void
  addExpense: (input: Omit<Expense, 'id'>) => void
  addCommunityGood: (input: {
    description: string
    amount: number
    paidBy: string
    date: string
  }) => void
  addUtilityBill: (input: {
    totalAmount: number
    paidBy: string
    billingPeriodStart: string
    billingPeriodEnd: string
    daysPresent: Record<string, number>
  }) => void
  addSettlement: (fromPersonId: string, toPersonId: string, amount: number) => void
  hydrate: () => void
}

function persist(state: AppData) {
  localStorageStore.save({
    people: state.people,
    expenses: state.expenses,
    utilityBills: state.utilityBills,
    settlements: state.settlements,
  })
}

export const useAppStore = create<AppState>((set, get) => ({
  ...emptyAppData(),

  hydrate: () => {
    const saved = localStorageStore.load()
    if (saved) {
      set(saved)
    }
  },

  addPerson: (name) => {
    const trimmed = name.trim()
    if (!trimmed) return

    const { people } = get()
    const person: Person = {
      id: uuidv4(),
      name: trimmed,
      color: assignColor(people.map((p) => p.color)),
    }

    set((state) => {
      const next = { ...state, people: [...state.people, person] }
      persist(next)
      return next
    })
  },

  removePerson: (id) => {
    set((state) => {
      const next: AppData = {
        people: state.people.filter((p) => p.id !== id),
        expenses: state.expenses.filter(
          (e) => e.paidBy !== id && !e.splitBetween.includes(id)
        ),
        utilityBills: state.utilityBills.filter((b) => b.paidBy !== id),
        settlements: state.settlements.filter(
          (s) => s.fromPersonId !== id && s.toPersonId !== id
        ),
      }
      persist(next)
      return { ...state, ...next }
    })
  },

  addExpense: (input) => {
    const expense: Expense = { ...input, id: uuidv4() }
    set((state) => {
      const next = { ...state, expenses: [...state.expenses, expense] }
      persist(next)
      return next
    })
  },

  addCommunityGood: (input) => {
    const { people, addExpense } = get()
    if (people.length === 0) return

    addExpense({
      description: input.description,
      amount: input.amount,
      paidBy: input.paidBy,
      splitBetween: people.map((p) => p.id),
      date: input.date,
      category: 'community-good',
    })
  },

  addUtilityBill: (input) => {
    const { people } = get()
    if (people.length === 0) return

    const billId = uuidv4()
    const bill: UtilityBill = {
      id: billId,
      totalAmount: input.totalAmount,
      paidBy: input.paidBy,
      billingPeriodStart: input.billingPeriodStart,
      billingPeriodEnd: input.billingPeriodEnd,
      daysPresent: input.daysPresent,
      date: todayISO(),
    }

    const shares = computeUtilityShares(
      input.totalAmount,
      input.daysPresent,
      people
    )

    const expense: Expense = {
      id: uuidv4(),
      description: `Utility (${input.billingPeriodStart} – ${input.billingPeriodEnd})`,
      amount: input.totalAmount,
      paidBy: input.paidBy,
      splitBetween: people.map((p) => p.id),
      customShares: shares,
      date: todayISO(),
      category: 'utility',
      utilityBillId: billId,
    }

    set((state) => {
      const next = {
        ...state,
        utilityBills: [...state.utilityBills, bill],
        expenses: [...state.expenses, expense],
      }
      persist(next)
      return next
    })
  },

  addSettlement: (fromPersonId, toPersonId, amount) => {
    if (amount <= 0) return

    const settlement: Settlement = {
      id: uuidv4(),
      fromPersonId,
      toPersonId,
      amount,
      date: todayISO(),
    }

    set((state) => {
      const next = {
        ...state,
        settlements: [...state.settlements, settlement],
      }
      persist(next)
      return next
    })
  },
}))

export function usePersonExpenses(personId: string): Expense[] {
  const expenses = useAppStore((s) => s.expenses)
  return expenses
    .filter(
      (e) => e.paidBy === personId || e.splitBetween.includes(personId)
    )
    .sort((a, b) => b.date.localeCompare(a.date))
}

export type { ExpenseCategory }
