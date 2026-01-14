import type { PreferencesRepository } from '../../domain/ports/PreferencesRepository'
import { defaultPreferences, type Preferences } from '../../domain/entities/Preferences'

const KEY = 'mindease:preferences'

export class PreferencesRepositoryLocalStorage implements PreferencesRepository {
  async get(): Promise<Preferences> {
    try {
      const raw = localStorage.getItem(KEY)
      if (!raw) return defaultPreferences
      const parsed = JSON.parse(raw) as Partial<Preferences>
      return { ...defaultPreferences, ...parsed }
    } catch {
      return defaultPreferences
    }
  }

  async set(next: Preferences): Promise<void> {
    localStorage.setItem(KEY, JSON.stringify(next))
  }
}
