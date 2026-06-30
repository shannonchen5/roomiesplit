import { useMemo } from 'react'
import {
  computeDebtLines,
  debtLinesForPerson,
  isDebtLineSettled,
} from '../lib/balance'
import { formatCurrency } from '../lib/dates'
import { useAppStore } from '../store/useAppStore'
import { PersonAvatar } from './PersonAvatar'
import { Card } from './ui/Card'

export function ExpensesTracker() {
  const people = useAppStore((s) => s.people)
  const expenses = useAppStore((s) => s.expenses)
  const settlements = useAppStore((s) => s.settlements)
  const toggleDebtLineSettlement = useAppStore((s) => s.toggleDebtLineSettlement)

  const debtLines = useMemo(
    () => computeDebtLines(expenses),
    [expenses]
  )

  const getName = (id: string) =>
    people.find((p) => p.id === id)?.name ?? '?'

  if (people.length === 0) {
    return (
      <Card title="Balances">
        <p className="text-sm text-slate-500">
          Add roommates to see who owes whom.
        </p>
      </Card>
    )
  }

  return (
    <Card title="Balances">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {people.map((person) => {
          const lines = debtLinesForPerson(debtLines, person.id)

          return (
            <div
              key={person.id}
              className="flex min-h-72 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              style={{ borderTopWidth: 4, borderTopColor: person.color }}
            >
              <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-3">
                <PersonAvatar
                  name={person.name}
                  color={person.color}
                  size="sm"
                />
                <span className="font-semibold text-slate-800">
                  {person.name}
                </span>
              </div>

              <ul className="flex-1 space-y-2 overflow-y-auto p-3">
                {lines.length === 0 ? (
                  <li className="text-sm text-slate-400">No debts yet</li>
                ) : (
                  lines.map((line) => {
                    const settled = isDebtLineSettled(line.id, settlements)

                    return (
                      <li key={line.id}>
                        <label className="flex cursor-pointer items-start gap-2 text-sm leading-snug">
                          <input
                            type="checkbox"
                            checked={settled}
                            onChange={() => toggleDebtLineSettlement(line)}
                            className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span
                            className={
                              settled
                                ? 'text-slate-400 line-through'
                                : 'text-slate-700'
                            }
                          >
                            {getName(line.fromPersonId)} owes{' '}
                            {getName(line.toPersonId)}{' '}
                            {formatCurrency(line.amount)}
                          </span>
                        </label>
                      </li>
                    )
                  })
                )}
              </ul>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
