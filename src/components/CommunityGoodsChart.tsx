import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { communityGoodsByPerson } from '../lib/balance'
import { formatCurrency, isInTimeRange } from '../lib/dates'
import { useAppStore } from '../store/useAppStore'
import type { TimeRange } from '../types'
import { ExpenseForm } from './ExpenseForm'
import { PersonAvatar } from './PersonAvatar'
import { Card } from './ui/Card'

const RANGE_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: 'this-month', label: 'This month' },
  { value: 'last-3-months', label: 'Last 3 months' },
  { value: 'all-time', label: 'All time' },
]

export function CommunityGoodsChart() {
  const people = useAppStore((s) => s.people)
  const expenses = useAppStore((s) => s.expenses)
  const [range, setRange] = useState<TimeRange>('this-month')

  const filter = (date: string) => isInTimeRange(date, range)

  const totals = useMemo(
    () => communityGoodsByPerson(expenses, filter),
    [expenses, range]
  )

  const chartData = people.map((p) => ({
    name: p.name,
    total: totals[p.id] ?? 0,
    color: p.color,
  }))

  const purchases = useMemo(
    () =>
      expenses
        .filter((e) => e.category === 'community-good' && filter(e.date))
        .sort((a, b) => b.date.localeCompare(a.date)),
    [expenses, range]
  )

  return (
    <div className="space-y-6">
      <ExpenseForm
        category="community-good"
        title="Quick entry — community goods"
        submitLabel="Add community good"
      />

      <Card title="Spending comparison">
        <div className="mb-4 flex flex-wrap gap-2">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setRange(opt.value)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition ${
                range === opt.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {people.length === 0 ? (
          <p className="text-sm text-slate-500">Add roommates to see the chart.</p>
        ) : (
          <>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="pb-2 pr-4 font-medium">Person</th>
                    <th className="pb-2 pr-4 font-medium">Total spent</th>
                    <th className="pb-2 font-medium">Purchases</th>
                  </tr>
                </thead>
                <tbody>
                  {people.map((person) => {
                    const personPurchases = purchases.filter(
                      (e) => e.paidBy === person.id
                    )
                    return (
                      <tr key={person.id} className="border-b border-slate-100">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <PersonAvatar
                              name={person.name}
                              color={person.color}
                              size="sm"
                            />
                            {person.name}
                          </div>
                        </td>
                        <td className="py-3 pr-4 font-medium">
                          {formatCurrency(totals[person.id] ?? 0)}
                        </td>
                        <td className="py-3">
                          {personPurchases.length === 0 ? (
                            <span className="text-slate-400">—</span>
                          ) : (
                            <ul className="space-y-1">
                              {personPurchases.map((p) => (
                                <li key={p.id} className="text-slate-600">
                                  {p.description} — {formatCurrency(p.amount)}
                                </li>
                              ))}
                            </ul>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
