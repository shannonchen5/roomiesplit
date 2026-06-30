import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  calculateShare,
  computeNetBalance,
  computePairwiseDebts,
} from '../lib/balance'
import { formatCurrency, formatDate } from '../lib/dates'
import { useAppStore, usePersonExpenses } from '../store/useAppStore'
import { PersonAvatar } from './PersonAvatar'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { Input } from './ui/Input'

interface PersonTabProps {
  personId: string
}

export function PersonTab({ personId }: PersonTabProps) {
  const people = useAppStore((s) => s.people)
  const expenses = useAppStore((s) => s.expenses)
  const settlements = useAppStore((s) => s.settlements)
  const addSettlement = useAppStore((s) => s.addSettlement)
  const personExpenses = usePersonExpenses(personId)

  const [settleTo, setSettleTo] = useState('')
  const [settleAmount, setSettleAmount] = useState('')

  const person = people.find((p) => p.id === personId)

  const { debts, netBalance, owedTo, owedBy } = useMemo(() => {
    const debts = computePairwiseDebts(people, expenses, settlements)
    const netBalance = computeNetBalance(personId, people, debts)

    const owedTo: { personId: string; amount: number }[] = []
    const owedBy: { personId: string; amount: number }[] = []

    for (const other of people) {
      if (other.id === personId) continue
      const theyOweMe = debts[other.id]?.[personId] ?? 0
      const iOweThem = debts[personId]?.[other.id] ?? 0
      if (theyOweMe > 0) owedTo.push({ personId: other.id, amount: theyOweMe })
      if (iOweThem > 0) owedBy.push({ personId: other.id, amount: iOweThem })
    }

    return { debts, netBalance, owedTo, owedBy }
  }, [people, expenses, settlements, personId])

  if (!person) {
    return (
      <Card>
        <p className="text-sm text-slate-500">Person not found.</p>
      </Card>
    )
  }

  const handleSettle = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(settleAmount)
    const maxOwed = debts[personId]?.[settleTo] ?? 0

    if (!settleTo || isNaN(amount) || amount <= 0) {
      toast.error('Enter a valid settlement amount')
      return
    }
    if (amount > maxOwed) {
      toast.error(`Maximum owed is ${formatCurrency(maxOwed)}`)
      return
    }

    addSettlement(personId, settleTo, amount)
    setSettleAmount('')
    setSettleTo('')
    toast.success('Settlement recorded')
  }

  const getName = (id: string) => people.find((p) => p.id === id)?.name ?? '?'

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <PersonAvatar name={person.name} color={person.color} size="lg" />
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{person.name}</h2>
          <p
            className={`text-lg font-medium ${
              netBalance >= 0 ? 'text-emerald-600' : 'text-red-600'
            }`}
          >
            {netBalance >= 0 ? '+' : ''}
            {formatCurrency(netBalance)} net
          </p>
          <p className="text-sm text-slate-500">
            {netBalance >= 0 ? 'Others owe you overall' : 'You owe others overall'}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card title="Owed to you">
          {owedTo.length === 0 ? (
            <p className="text-sm text-slate-500">Nothing owed to you.</p>
          ) : (
            <ul className="space-y-2">
              {owedTo.map(({ personId: id, amount }) => {
                const p = people.find((x) => x.id === id)!
                return (
                  <li
                    key={id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <PersonAvatar name={p.name} color={p.color} size="sm" />
                      {p.name}
                    </div>
                    <span className="font-medium text-emerald-600">
                      {formatCurrency(amount)}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>

        <Card title="You owe">
          {owedBy.length === 0 ? (
            <p className="text-sm text-slate-500">You owe nothing.</p>
          ) : (
            <ul className="space-y-2">
              {owedBy.map(({ personId: id, amount }) => {
                const p = people.find((x) => x.id === id)!
                return (
                  <li
                    key={id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <PersonAvatar name={p.name} color={p.color} size="sm" />
                      {p.name}
                    </div>
                    <span className="font-medium text-red-600">
                      {formatCurrency(amount)}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>
      </div>

      {owedBy.length > 0 && (
        <Card title="Settle up">
          <form onSubmit={handleSettle} className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Pay to
              </label>
              <select
                value={settleTo}
                onChange={(e) => {
                  setSettleTo(e.target.value)
                  const owed = debts[personId]?.[e.target.value] ?? 0
                  setSettleAmount(owed.toFixed(2))
                }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">Select roommate</option>
                {owedBy.map(({ personId: id, amount }) => (
                  <option key={id} value={id}>
                    {getName(id)} ({formatCurrency(amount)} owed)
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <Input
                label="Amount"
                type="number"
                min="0.01"
                step="0.01"
                value={settleAmount}
                onChange={(e) => setSettleAmount(e.target.value)}
              />
            </div>
            <Button type="submit">Mark as paid</Button>
          </form>
        </Card>
      )}

      <Card title="Activity">
        {personExpenses.length === 0 ? (
          <p className="text-sm text-slate-500">No expenses yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {personExpenses.map((expense) => {
              const share = calculateShare(expense, personId)
              const isPayer = expense.paidBy === personId
              const payer = people.find((p) => p.id === expense.paidBy)

              return (
                <li key={expense.id} className="flex gap-3 py-3">
                  <PersonAvatar
                    name={payer?.name ?? '?'}
                    color={payer?.color ?? '#94a3b8'}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-800">
                      {expense.description}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDate(expense.date)} · {expense.category.replace('-', ' ')}
                      {isPayer ? ' · you paid' : ` · paid by ${payer?.name}`}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-medium">{formatCurrency(expense.amount)}</p>
                    <p
                      className={
                        isPayer
                          ? 'text-emerald-600'
                          : share > 0
                            ? 'text-red-600'
                            : 'text-slate-500'
                      }
                    >
                      {isPayer
                        ? `+${formatCurrency(expense.amount - share)}`
                        : share > 0
                          ? `-${formatCurrency(share)}`
                          : '—'}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Card>
    </div>
  )
}
