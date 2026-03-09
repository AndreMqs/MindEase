import type { PreferencesRepository } from '../../domain/ports/PreferencesRepository'
import type { Preferences } from '../../domain/entities/Preferences'
import { FirestorePreferencesRepositoryImpl } from './FirestorePreferencesRepositoryImpl'

/**
 * Adaptador: implementa o port PreferencesRepository da web (get(), set())
 * e delega para Firestore usando o userId atual. Mesmos dados do mobile.
 */
export class PreferencesRepositoryFirebase implements PreferencesRepository {
  private readonly getCurrentUserId: () => string | null
  private readonly impl: FirestorePreferencesRepositoryImpl
  constructor(getCurrentUserId: () => string | null, impl: FirestorePreferencesRepositoryImpl) {
    this.getCurrentUserId = getCurrentUserId
    this.impl = impl
  }

  private requireUserId(): string {
    const uid = this.getCurrentUserId()
    if (!uid) throw new Error('Usuário não autenticado.')
    return uid
  }

  async get(): Promise<Preferences> {
    return this.impl.get(this.requireUserId())
  }

  async set(next: Preferences): Promise<void> {
    return this.impl.set(this.requireUserId(), next)
  }
}
