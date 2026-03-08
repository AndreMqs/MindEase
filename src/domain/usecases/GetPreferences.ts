import type { PreferencesRepository } from '../ports/PreferencesRepository'
import type { Preferences } from '../entities/Preferences'

export class GetPreferences {
  private readonly repo: PreferencesRepository
  constructor(repo: PreferencesRepository) {
    this.repo = repo
  }
  execute(): Promise<Preferences> {
    return this.repo.get()
  }
}
