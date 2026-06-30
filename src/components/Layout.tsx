import type { ReactNode } from 'react'
import type { ViewId } from '../types'
import { PersonRoster } from './PersonRoster'

interface LayoutProps {
  children: ReactNode
  currentView: ViewId
  onNavigate: (view: ViewId) => void
  selectedPersonId?: string | null
  onSelectPerson?: (id: string) => void
}

const NAV_ITEMS: { id: ViewId; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { id: 'people', label: 'Roommates', icon: '👥' },
  { id: 'expenses', label: 'Expenses', icon: '💸' },
  { id: 'community-goods', label: 'Community goods', icon: '🧻' },
  { id: 'utilities', label: 'Utilities', icon: '💡' },
]

export function Layout({
  children,
  currentView,
  onNavigate,
  selectedPersonId,
  onSelectPerson,
}: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="border-b border-slate-200 bg-white lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
        <div className="p-4 lg:p-6">
          <h1 className="text-xl font-bold text-indigo-600">RoomieSplit</h1>
          <p className="mt-0.5 text-xs text-slate-500">Shared expense tracker</p>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-4 pb-2 lg:flex-col lg:overflow-visible lg:px-3 lg:pb-0">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`shrink-0 rounded-lg px-3 py-2 text-left text-sm font-medium transition lg:w-full ${
                currentView === item.id ||
                (currentView === 'person-tab' && item.id === 'expenses')
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="hidden border-t border-slate-100 p-4 lg:block">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Roster
          </p>
          <PersonRoster
            selectedPersonId={selectedPersonId}
            onSelectPerson={onSelectPerson}
          />
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl">{children}</div>
      </main>
    </div>
  )
}
