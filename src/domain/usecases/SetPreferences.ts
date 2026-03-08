import type { PreferencesRepository } from '../ports/PreferencesRepository'
import type { Preferences } from '../entities/Preferences'

export class SetPreferences {
  private readonly repo: PreferencesRepository
  constructor(repo: PreferencesRepository) {
    this.repo = repo
  }
  execute(next: Preferences): Promise<void> {
    return this.repo.set(next)
  }
}
