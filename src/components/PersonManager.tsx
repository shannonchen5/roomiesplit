import { useState } from 'react'
import { toast } from 'sonner'
import { useAppStore } from '../store/useAppStore'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { Input } from './ui/Input'
import { PersonAvatar } from './PersonAvatar'
import { PersonRoster } from './PersonRoster'

export function PersonManager() {
  const people = useAppStore((s) => s.people)
  const addPerson = useAppStore((s) => s.addPerson)
  const removePerson = useAppStore((s) => s.removePerson)
  const [name, setName] = useState('')

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    addPerson(trimmed)
    setName('')
    toast.success(`${trimmed} added to the household`)
  }

  const handleRemove = (id: string, personName: string) => {
    removePerson(id)
    toast.success(`${personName} removed`)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card title="Add roommate">
        <form onSubmit={handleAdd} className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <Input
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex"
            />
          </div>
          <Button type="submit" className="self-end sm:mt-6">
            Add
          </Button>
        </form>
      </Card>

      <Card title="Household roster">
        {people.length === 0 ? (
          <PersonRoster />
        ) : (
          <ul className="space-y-2">
            {people.map((person) => (
              <li
                key={person.id}
                className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <PersonAvatar name={person.name} color={person.color} />
                  <span className="font-medium text-slate-800">
                    {person.name}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => handleRemove(person.id, person.name)}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
