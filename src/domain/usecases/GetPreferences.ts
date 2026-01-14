import type { PreferencesRepository } from '../ports/PreferencesRepository'
import type { Preferences } from '../entities/Preferences'

export class GetPreferences {
  constructor(private readonly repo: PreferencesRepository) {}
  execute(): Promise<Preferences> {
    return this.repo.get()
  }
}
