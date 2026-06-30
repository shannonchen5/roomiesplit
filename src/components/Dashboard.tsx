import { useMemo } from 'react'
import {
  communityGoodsByPerson,
  computePairwiseDebts,
  largestOutstandingBalance,
  totalHouseholdSpending,
} from '../lib/balance'
import { formatCurrency, isInTimeRange } from '../lib/dates'
import { useAppStore } from '../store/useAppStore'
import type { ViewId } from '../types'
import { PersonAvatar } from './PersonAvatar'
import { Card } from './ui/Card'

interface DashboardProps {
  onNavigate: (view: ViewId, personId?: string) => void
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const people = useAppStore((s) => s.people)
  const expenses = useAppStore((s) => s.expenses)
  const settlements = useAppStore((s) => s.settlements)

  const thisMonth = (date: string) => isInTimeRange(date, 'this-month')

  const monthlyTotal = useMemo(
    () => totalHouseholdSpending(expenses, thisMonth),
    [expenses]
  )

  const communityTotals = useMemo(
    () => communityGoodsByPerson(expenses, thisMonth),
    [expenses]
  )

  const topCommunitySpender = useMemo(() => {
    let maxId: string | null = null
    let maxAmount = 0
    for (const [id, amount] of Object.entries(communityTotals)) {
      if (amount > maxAmount) {
        maxAmount = amount
        maxId = id
      }
    }
    if (!maxId || maxAmount === 0) return null
    const person = people.find((p) => p.id === maxId)
    return person ? { person, amount: maxAmount } : null
  }, [communityTotals, people])

  const largestBalance = useMemo(() => {
    const debts = computePairwiseDebts(people, expenses, settlements)
    return largestOutstandingBalance(people, debts)
  }, [people, expenses, settlements])

  const quickLinks: { view: ViewId; label: string; description: string }[] = [
    {
      view: 'people',
      label: 'Manage roommates',
      description: 'Add or remove people in your household',
    },
    {
      view: 'expenses',
      label: 'Log an expense',
      description: 'Split costs and view personal tabs',
    },
    {
      view: 'community-goods',
      label: 'Community goods',
      description: 'Track shared supplies and compare spending',
    },
    {
      view: 'utilities',
      label: 'Utility bills',
      description: 'Prorate bills by days present',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">Household spending this month</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {formatCurrency(monthlyTotal)}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-slate-500">Top community goods spender</p>
          {topCommunitySpender ? (
            <div className="mt-2 flex items-center gap-3">
              <PersonAvatar
                name={topCommunitySpender.person.name}
                color={topCommunitySpender.person.color}
              />
              <div>
                <p className="font-semibold text-slate-900">
                  {topCommunitySpender.person.name}
                </p>
                <p className="text-sm text-slate-600">
                  {formatCurrency(topCommunitySpender.amount)} this month
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-1 text-lg text-slate-400">No purchases yet</p>
          )}
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <p className="text-sm text-slate-500">Largest outstanding balance</p>
          {largestBalance ? (
            <div className="mt-2">
              <p className="text-lg font-semibold text-slate-900">
                {formatCurrency(largestBalance.amount)}
              </p>
              <p className="text-sm text-slate-600">
                {largestBalance.from.name} owes {largestBalance.to.name}
              </p>
            </div>
          ) : (
            <p className="mt-1 text-lg text-slate-400">All settled up</p>
          )}
        </Card>
      </div>

      <Card title="Quick links">
        <div className="grid gap-3 sm:grid-cols-2">
          {quickLinks.map((link) => (
            <button
              key={link.view}
              type="button"
              onClick={() => onNavigate(link.view)}
              className="rounded-lg border border-slate-200 p-4 text-left transition hover:border-indigo-300 hover:bg-indigo-50/50"
            >
              <p className="font-medium text-slate-900">{link.label}</p>
              <p className="mt-1 text-sm text-slate-500">{link.description}</p>
            </button>
          ))}
        </div>
      </Card>

      {people.length > 0 && (
        <Card title="Roommate tabs">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {people.map((person) => (
              <button
                key={person.id}
                type="button"
                onClick={() => onNavigate('person-tab', person.id)}
                className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-left transition hover:border-indigo-300 hover:bg-indigo-50/50"
              >
                <PersonAvatar name={person.name} color={person.color} />
                <span className="font-medium text-slate-800">{person.name}</span>
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
