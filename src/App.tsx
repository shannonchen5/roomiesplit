import { useEffect, useState } from 'react'
import { CommunityGoodsChart } from './components/CommunityGoodsChart'
import { Dashboard } from './components/Dashboard'
import { ExpenseForm } from './components/ExpenseForm'
import { Layout } from './components/Layout'
import { PersonManager } from './components/PersonManager'
import { PersonRoster } from './components/PersonRoster'
import { PersonTab } from './components/PersonTab'
import { UtilityProrationForm } from './components/UtilityProrationForm'
import { Card } from './components/ui/Card'
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

  const handleSelectPerson = (id: string) => {
    setSelectedPersonId(id)
    setView('person-tab')
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
          {people.length > 0 && (
            <Card title="View by person">
              <div className="mb-4 lg:hidden">
                <PersonRoster
                  selectedPersonId={selectedPersonId}
                  onSelectPerson={handleSelectPerson}
                />
              </div>
              {selectedPersonId ? (
                <PersonTab personId={selectedPersonId} />
              ) : (
                <p className="text-sm text-slate-500">
                  Select a roommate to view their tab.
                </p>
              )}
            </Card>
          )}
        </div>
      )}

      {view === 'community-goods' && <CommunityGoodsChart />}

      {view === 'utilities' && <UtilityProrationForm />}

      {view === 'person-tab' && selectedPersonId && (
        <PersonTab personId={selectedPersonId} />
      )}
    </Layout>
  )
}

export default App
