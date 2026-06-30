import type { DebtLine, Expense, Person, Settlement } from '../types'

export function calculateShare(expense: Expense, personId: string): number {
  if (!expense.splitBetween.includes(personId)) return 0

  if (expense.customShares && expense.customShares[personId] !== undefined) {
    return expense.customShares[personId]
  }

  return expense.amount / expense.splitBetween.length
}

/** debts[debtorId][creditorId] = amount debtor owes creditor */
export type PairwiseDebts = Record<string, Record<string, number>>

export function initPairwiseDebts(people: Person[]): PairwiseDebts {
  const debts: PairwiseDebts = {}
  for (const p of people) {
    debts[p.id] = {}
    for (const q of people) {
      if (p.id !== q.id) debts[p.id][q.id] = 0
    }
  }
  return debts
}

export function computePairwiseDebts(
  people: Person[],
  expenses: Expense[],
  settlements: Settlement[]
): PairwiseDebts {
  const debts = initPairwiseDebts(people)

  for (const expense of expenses) {
    const payer = expense.paidBy
    for (const personId of expense.splitBetween) {
      if (personId === payer) continue
      const share = calculateShare(expense, personId)
      if (share > 0) {
        debts[personId][payer] = (debts[personId][payer] ?? 0) + share
      }
    }
  }

  for (const settlement of settlements) {
    const { fromPersonId, toPersonId, amount } = settlement
    if (debts[fromPersonId]?.[toPersonId] !== undefined) {
      debts[fromPersonId][toPersonId] = Math.max(
        0,
        debts[fromPersonId][toPersonId] - amount
      )
    }
  }

  return debts
}

/** Positive = net owed to this person; negative = net they owe others. */
export function computeDebtLines(expenses: Expense[]): DebtLine[] {
  const lines: DebtLine[] = []

  for (const expense of expenses) {
    const payer = expense.paidBy
    for (const personId of expense.splitBetween) {
      if (personId === payer) continue
      const share = calculateShare(expense, personId)
      if (share <= 0) continue

      lines.push({
        id: `${expense.id}:${personId}:${payer}`,
        expenseId: expense.id,
        description: expense.description,
        fromPersonId: personId,
        toPersonId: payer,
        amount: share,
        date: expense.date,
      })
    }
  }

  return lines.sort((a, b) => b.date.localeCompare(a.date))
}

export function isDebtLineSettled(
  debtLineId: string,
  settlements: Settlement[]
): boolean {
  return settlements.some((s) => s.debtLineId === debtLineId)
}

export function debtLinesForPerson(
  lines: DebtLine[],
  personId: string
): DebtLine[] {
  return lines.filter(
    (line) =>
      line.fromPersonId === personId || line.toPersonId === personId
  )
}

export function computeNetBalance(
  personId: string,
  people: Person[],
  debts: PairwiseDebts
): number {
  let net = 0
  for (const other of people) {
    if (other.id === personId) continue
    net += debts[other.id]?.[personId] ?? 0
    net -= debts[personId]?.[other.id] ?? 0
  }
  return net
}

export function computeUtilityShares(
  totalAmount: number,
  daysPresent: Record<string, number>,
  people: Person[]
): Record<string, number> {
  const totalDays = people.reduce(
    (sum, p) => sum + (daysPresent[p.id] ?? 0),
    0
  )

  if (totalDays === 0) {
    const equal = totalAmount / people.length
    return Object.fromEntries(people.map((p) => [p.id, equal]))
  }

  return Object.fromEntries(
    people.map((p) => [
      p.id,
      ((daysPresent[p.id] ?? 0) / totalDays) * totalAmount,
    ])
  )
}

export function totalHouseholdSpending(
  expenses: Expense[],
  filter: (date: string) => boolean
): number {
  return expenses
    .filter((e) => filter(e.date))
    .reduce((sum, e) => sum + e.amount, 0)
}

export function communityGoodsByPerson(
  expenses: Expense[],
  filter: (date: string) => boolean
): Record<string, number> {
  const totals: Record<string, number> = {}

  for (const expense of expenses) {
    if (expense.category !== 'community-good') continue
    if (!filter(expense.date)) continue
    totals[expense.paidBy] = (totals[expense.paidBy] ?? 0) + expense.amount
  }

  return totals
}

export function largestOutstandingBalance(
  people: Person[],
  debts: PairwiseDebts
): { from: Person; to: Person; amount: number } | null {
  let max: { from: Person; to: Person; amount: number } | null = null

  for (const from of people) {
    for (const to of people) {
      if (from.id === to.id) continue
      const amount = debts[from.id]?.[to.id] ?? 0
      if (amount > 0 && (!max || amount > max.amount)) {
        max = { from, to, amount }
      }
    }
  }

  return max
}
