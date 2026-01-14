import type { PreferencesRepository } from '../../domain/ports/PreferencesRepository'
import type { Preferences } from '../../domain/entities/Preferences'

// Placeholder: implemente com Firebase (Firestore/Realtime DB) depois.
export class PreferencesRepositoryFirebase implements PreferencesRepository {
  async get(): Promise<Preferences> {
    throw new Error('Not implemented: PreferencesRepositoryFirebase.get')
  }
  async set(_next: Preferences): Promise<void> {
    throw new Error('Not implemented: PreferencesRepositoryFirebase.set')
  }
}
