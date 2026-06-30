import { parseISO, format } from 'date-fns'
import { useMemo } from 'react'
import { eachDayInRange } from '../lib/dates'
import { useAppStore } from '../store/useAppStore'
import { PersonAvatar } from './PersonAvatar'

interface CalendarDaySelectorProps {
  startDate: string
  endDate: string
  /** personId -> set of ISO date strings they were present */
  selectedDays: Record<string, Set<string>>
  onToggleDay: (personId: string, day: string) => void
}

export function CalendarDaySelector({
  startDate,
  endDate,
  selectedDays,
  onToggleDay,
}: CalendarDaySelectorProps) {
  const people = useAppStore((s) => s.people)

  const days = useMemo(() => {
    if (!startDate || !endDate || startDate > endDate) return []
    return eachDayInRange(startDate, endDate)
  }, [startDate, endDate])

  if (!startDate || !endDate) {
    return (
      <p className="text-sm text-slate-500">
        Set billing period dates to select days present.
      </p>
    )
  }

  if (days.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        End date must be on or after start date.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      {people.map((person) => {
        const personDays = selectedDays[person.id] ?? new Set<string>()
        return (
          <div key={person.id}>
            <div className="mb-2 flex items-center gap-2">
              <PersonAvatar name={person.name} color={person.color} size="sm" />
              <span className="text-sm font-medium text-slate-800">
                {person.name}
              </span>
              <span className="text-xs text-slate-500">
                ({personDays.size} days)
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {days.map((day) => {
                const selected = personDays.has(day)
                const label = format(parseISO(day), 'MMM d')
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => onToggleDay(person.id, day)}
                    className={`rounded-md px-2 py-1 text-xs font-medium transition ${
                      selected
                        ? 'text-white shadow-sm'
                        : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                    style={
                      selected ? { backgroundColor: person.color } : undefined
                    }
                    title={day}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
