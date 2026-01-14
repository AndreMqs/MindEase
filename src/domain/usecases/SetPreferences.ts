import type { PreferencesRepository } from '../ports/PreferencesRepository'
import type { Preferences } from '../entities/Preferences'

export class SetPreferences {
  constructor(private readonly repo: PreferencesRepository) {}
  execute(next: Preferences): Promise<void> {
    return this.repo.set(next)
  }
}
