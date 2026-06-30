import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { computeUtilityShares } from '../lib/balance'
import { formatCurrency } from '../lib/dates'
import { useAppStore } from '../store/useAppStore'
import { CalendarDaySelector } from './CalendarDaySelector'
import { PersonAvatar } from './PersonAvatar'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { Input, Select } from './ui/Input'

function initSelectedDays(
  people: { id: string }[]
): Record<string, Set<string>> {
  const result: Record<string, Set<string>> = {}
  for (const p of people) {
    result[p.id] = new Set()
  }
  return result
}

export function UtilityProrationForm() {
  const people = useAppStore((s) => s.people)
  const addUtilityBill = useAppStore((s) => s.addUtilityBill)

  const [totalAmount, setTotalAmount] = useState('')
  const [paidBy, setPaidBy] = useState('')
  const [billingStart, setBillingStart] = useState('')
  const [billingEnd, setBillingEnd] = useState('')
  const [selectedDays, setSelectedDays] = useState<
    Record<string, Set<string>>
  >({})

  const effectivePaidBy = paidBy || people[0]?.id || ''

  const daysPresent = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const person of people) {
      counts[person.id] = selectedDays[person.id]?.size ?? 0
    }
    return counts
  }, [people, selectedDays])

  const previewShares = useMemo(() => {
    const amount = parseFloat(totalAmount)
    if (isNaN(amount) || amount <= 0) return null
    return computeUtilityShares(amount, daysPresent, people)
  }, [totalAmount, daysPresent, people])

  const handlePeriodChange = (start: string, end: string) => {
    setBillingStart(start)
    setBillingEnd(end)
    if (start && end && start <= end) {
      setSelectedDays(initSelectedDays(people))
    }
  }

  const toggleDay = (personId: string, day: string) => {
    setSelectedDays((prev) => {
      const next = { ...prev }
      const set = new Set(prev[personId] ?? [])
      if (set.has(day)) set.delete(day)
      else set.add(day)
      next[personId] = set
      return next
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(totalAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('Enter a valid bill amount')
      return
    }
    if (!billingStart || !billingEnd || billingStart > billingEnd) {
      toast.error('Enter a valid billing period')
      return
    }
    const totalDays = Object.values(daysPresent).reduce((s, d) => s + d, 0)
    if (totalDays === 0) {
      toast.error('Select at least one day present for someone')
      return
    }

    addUtilityBill({
      totalAmount: amount,
      paidBy: effectivePaidBy,
      billingPeriodStart: billingStart,
      billingPeriodEnd: billingEnd,
      daysPresent,
    })

    setTotalAmount('')
    setBillingStart('')
    setBillingEnd('')
    setSelectedDays({})
    toast.success('Utility bill prorated and added to balances')
  }

  if (people.length === 0) {
    return (
      <Card title="Utility bill proration">
        <p className="text-sm text-slate-500">
          Add roommates first before entering utility bills.
        </p>
      </Card>
    )
  }

  return (
    <Card title="Utility bill proration">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Total bill amount"
            type="number"
            min="0.01"
            step="0.01"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            placeholder="0.00"
          />
          <Select
            label="Paid by"
            value={effectivePaidBy}
            onChange={(e) => setPaidBy(e.target.value)}
            options={people.map((p) => ({ value: p.id, label: p.name }))}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Billing period start"
            type="date"
            value={billingStart}
            onChange={(e) => handlePeriodChange(e.target.value, billingEnd)}
          />
          <Input
            label="Billing period end"
            type="date"
            value={billingEnd}
            onChange={(e) => handlePeriodChange(billingStart, e.target.value)}
          />
        </div>

        <div>
          <h3 className="mb-3 text-sm font-medium text-slate-700">
            Days present during billing period
          </h3>
          <p className="mb-4 text-xs text-slate-500">
            Click each day a roommate was in the apartment. Shares are
            proportional to days present.
          </p>
          <CalendarDaySelector
            startDate={billingStart}
            endDate={billingEnd}
            selectedDays={selectedDays}
            onToggleDay={toggleDay}
          />
        </div>

        {previewShares && (
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="mb-2 text-sm font-medium text-slate-700">
              Prorated shares preview
            </p>
            <ul className="space-y-1">
              {people.map((person) => (
                <li
                  key={person.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <PersonAvatar
                      name={person.name}
                      color={person.color}
                      size="sm"
                    />
                    {person.name}
                    <span className="text-slate-400">
                      ({daysPresent[person.id]} days)
                    </span>
                  </div>
                  <span className="font-medium">
                    {formatCurrency(previewShares[person.id] ?? 0)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button type="submit">Add utility bill</Button>
      </form>
    </Card>
  )
}
