import type { AppData } from '../types'

const STORAGE_KEY = 'roomiesplit-data'

/** Abstraction over localStorage so a future API client can replace this module. */
export interface DataStore {
  load(): AppData | null
  save(data: AppData): void
}

export const localStorageStore: DataStore = {
  load(): AppData | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return null
      return JSON.parse(raw) as AppData
    } catch {
      return null
    }
  },

  save(data: AppData): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  },
}

export const emptyAppData = (): AppData => ({
  people: [],
  expenses: [],
  utilityBills: [],
  settlements: [],
})
