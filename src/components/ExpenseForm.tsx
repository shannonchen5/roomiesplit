import { useState } from 'react'
import { toast } from 'sonner'
import { todayISO } from '../lib/dates'
import { useAppStore } from '../store/useAppStore'
import type { ExpenseCategory } from '../types'
import { PersonAvatar } from './PersonAvatar'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { Input, Select } from './ui/Input'

interface ExpenseFormProps {
  category?: ExpenseCategory
  title?: string
  submitLabel?: string
}

export function ExpenseForm({
  category = 'expense',
  title = 'Add expense',
  submitLabel = 'Add expense',
}: ExpenseFormProps) {
  const people = useAppStore((s) => s.people)
  const addExpense = useAppStore((s) => s.addExpense)

  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [paidBy, setPaidBy] = useState('')
  const [date, setDate] = useState(todayISO())
  const [splitBetween, setSplitBetween] = useState<string[]>([])

  const effectivePaidBy = paidBy || people[0]?.id || ''
  const effectiveSplit =
    splitBetween.length > 0 ? splitBetween : people.map((p) => p.id)

  const toggleSplit = (personId: string) => {
    setSplitBetween((prev) => {
      const base = prev.length > 0 ? prev : people.map((p) => p.id)
      if (base.includes(personId)) {
        if (base.length <= 1) return base
        return base.filter((id) => id !== personId)
      }
      return [...base, personId]
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = parseFloat(amount)
    if (!description.trim() || isNaN(parsed) || parsed <= 0) {
      toast.error('Enter a description and valid amount')
      return
    }
    if (!effectivePaidBy || effectiveSplit.length === 0) {
      toast.error('Select who paid and who to split between')
      return
    }

    addExpense({
      description: description.trim(),
      amount: parsed,
      paidBy: effectivePaidBy,
      splitBetween: effectiveSplit,
      date,
      category,
    })

    setDescription('')
    setAmount('')
    setDate(todayISO())
    setSplitBetween([])
    toast.success(
      category === 'community-good'
        ? 'Community good recorded'
        : 'Expense added'
    )
  }

  if (people.length === 0) {
    return (
      <Card title={title}>
        <p className="text-sm text-slate-500">
          Add roommates first before logging expenses.
        </p>
      </Card>
    )
  }

  return (
    <Card title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={
            category === 'community-good'
              ? 'e.g. Toilet paper'
              : 'e.g. Groceries'
          }
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Amount"
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <Select
          label="Paid by"
          value={effectivePaidBy}
          onChange={(e) => setPaidBy(e.target.value)}
          options={people.map((p) => ({ value: p.id, label: p.name }))}
        />

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-slate-700">
            Split between
          </legend>
          <div className="flex flex-wrap gap-2">
            {people.map((person) => {
              const selected = effectiveSplit.includes(person.id)
              return (
                <button
                  key={person.id}
                  type="button"
                  onClick={() => toggleSplit(person.id)}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
                    selected
                      ? 'border-indigo-300 bg-indigo-50 text-indigo-800'
                      : 'border-slate-200 bg-white text-slate-500'
                  }`}
                >
                  <PersonAvatar
                    name={person.name}
                    color={person.color}
                    size="sm"
                  />
                  {person.name}
                </button>
              )
            })}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Equal split among selected people (
            {effectiveSplit.length > 0
              ? `$${((parseFloat(amount) || 0) / effectiveSplit.length).toFixed(2)} each`
              : '—'}
            )
          </p>
        </fieldset>

        <Button type="submit">{submitLabel}</Button>
      </form>
    </Card>
  )
}
