import { useAppStore } from '../store/useAppStore'
import { PersonAvatar } from './PersonAvatar'

interface PersonRosterProps {
  selectedPersonId?: string | null
  onSelectPerson?: (id: string) => void
}

export function PersonRoster({
  selectedPersonId,
  onSelectPerson,
}: PersonRosterProps) {
  const people = useAppStore((s) => s.people)

  if (people.length === 0) {
    return (
      <p className="text-sm text-slate-500">No roommates yet. Add some above.</p>
    )
  }

  return (
    <ul className="space-y-2">
      {people.map((person) => {
        const selected = person.id === selectedPersonId
        return (
          <li key={person.id}>
            <button
              type="button"
              onClick={() => onSelectPerson?.(person.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition ${
                selected
                  ? 'bg-indigo-50 ring-1 ring-indigo-200'
                  : 'hover:bg-slate-50'
              } ${onSelectPerson ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <PersonAvatar name={person.name} color={person.color} size="sm" />
              <span className="text-sm font-medium text-slate-800">
                {person.name}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
