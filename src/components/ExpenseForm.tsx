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

  const addToSplit = (personId: string) => {
    setSplitBetween((prev) =>
      prev.includes(personId) ? prev : [...prev, personId]
    )
  }

  const removeFromSplit = (personId: string) => {
    setSplitBetween((prev) => prev.filter((id) => id !== personId))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = parseFloat(amount)
    if (!description.trim() || isNaN(parsed) || parsed <= 0) {
      toast.error('Enter a description and valid amount')
      return
    }
    if (!effectivePaidBy || splitBetween.length === 0) {
      toast.error('Select who paid and who to split between')
      return
    }

    addExpense({
      description: description.trim(),
      amount: parsed,
      paidBy: effectivePaidBy,
      splitBetween,
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
              const selected = splitBetween.includes(person.id)
              if (selected) {
                return (
                  <span
                    key={person.id}
                    className="inline-flex items-center gap-1 rounded-full border border-indigo-300 bg-indigo-50 py-1 pl-1.5 pr-1.5 text-sm text-indigo-800"
                  >
                    <PersonAvatar
                      name={person.name}
                      color={person.color}
                      size="sm"
                    />
                    <span>{person.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFromSplit(person.id)}
                      className="ml-0.5 flex h-5 w-5 items-center justify-center rounded-full text-indigo-500 transition hover:bg-indigo-200 hover:text-indigo-800"
                      aria-label={`Remove ${person.name} from split`}
                    >
                      ×
                    </button>
                  </span>
                )
              }

              return (
                <button
                  key={person.id}
                  type="button"
                  onClick={() => addToSplit(person.id)}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-500 transition hover:border-slate-300 hover:bg-slate-50"
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
            {splitBetween.length === 0
              ? 'Tap a roommate to include them in the split.'
              : `Equal split among ${splitBetween.length} ${
                  splitBetween.length === 1 ? 'person' : 'people'
                } ($${((parseFloat(amount) || 0) / splitBetween.length).toFixed(2)} each)`}
          </p>
        </fieldset>

        <Button type="submit">{submitLabel}</Button>
      </form>
    </Card>
  )
}
