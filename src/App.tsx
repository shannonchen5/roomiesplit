import { useEffect, useState } from 'react'
import { CommunityGoodsChart } from './components/CommunityGoodsChart'
import { Dashboard } from './components/Dashboard'
import { ExpenseForm } from './components/ExpenseForm'
import { ExpensesTracker } from './components/ExpensesTracker'
import { Layout } from './components/Layout'
import { PersonManager } from './components/PersonManager'
import { UtilityProrationForm } from './components/UtilityProrationForm'
import { useAppStore } from './store/useAppStore'
import type { ViewId } from './types'

function App() {
  const hydrate = useAppStore((s) => s.hydrate)
  const people = useAppStore((s) => s.people)

  const [view, setView] = useState<ViewId>('dashboard')
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  const navigate = (next: ViewId, personId?: string) => {
    setView(next)
    if (personId) setSelectedPersonId(personId)
  }

  const handleSelectPerson = (_id: string) => {
    setView('expenses')
  }

  const pageTitle: Record<ViewId, string> = {
    dashboard: 'Dashboard',
    people: 'Roommates',
    expenses: 'Expenses',
    'community-goods': 'Community goods',
    utilities: 'Utilities',
    'person-tab': people.find((p) => p.id === selectedPersonId)?.name ?? 'Tab',
  }

  return (
    <Layout
      currentView={view}
      onNavigate={(v) => setView(v)}
      selectedPersonId={selectedPersonId}
      onSelectPerson={handleSelectPerson}
    >
      <header className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900">
          {pageTitle[view]}
        </h2>
      </header>

      {view === 'dashboard' && <Dashboard onNavigate={navigate} />}

      {view === 'people' && <PersonManager />}

      {view === 'expenses' && (
        <div className="space-y-6">
          <ExpenseForm />
          <ExpensesTracker />
        </div>
      )}

      {view === 'community-goods' && <CommunityGoodsChart />}

      {view === 'utilities' && <UtilityProrationForm />}
    </Layout>
  )
}

export default App
