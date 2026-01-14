import type { Preferences } from '../entities/Preferences'

export interface PreferencesRepository {
  get(): Promise<Preferences>
  set(next: Preferences): Promise<void>
}
