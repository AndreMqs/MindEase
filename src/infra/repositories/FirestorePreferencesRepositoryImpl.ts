import type { IDatabaseRepository } from '../../domain/ports/DatabaseRepository'
import { defaultPreferences, type Preferences } from '../../domain/entities/Preferences'

const USERS_COLLECTION = 'users'

type UserDocument = {
  id?: string
  profile?: unknown
  preferences?: Partial<Preferences>
  settings?: unknown
  metadata?: unknown
}

/**
 * Persiste preferências em users/{userId}.preferences (Firestore).
 * Mesmo contrato do mobile; web e mobile leem o mesmo documento.
 */
export class FirestorePreferencesRepositoryImpl {
  private readonly databaseRepository: IDatabaseRepository
  constructor(databaseRepository: IDatabaseRepository) {
    this.databaseRepository = databaseRepository
  }

  async get(userId: string): Promise<Preferences> {
    const doc = await this.databaseRepository.get<UserDocument>(USERS_COLLECTION, userId)
    const raw = doc?.preferences
    if (!raw || typeof raw !== 'object') return { ...defaultPreferences }
    return {
      ...defaultPreferences,
      ...raw,
      complexity: (raw.complexity as Preferences['complexity']) ?? defaultPreferences.complexity,
      contrast: (raw.contrast as Preferences['contrast']) ?? defaultPreferences.contrast,
      fontSizePx:
        typeof raw.fontSizePx === 'number' ? raw.fontSizePx : defaultPreferences.fontSizePx,
      spacingPx: typeof raw.spacingPx === 'number' ? raw.spacingPx : defaultPreferences.spacingPx,
      navigationProfile:
        (raw.navigationProfile as Preferences['navigationProfile']) ??
        defaultPreferences.navigationProfile,
      routine: (raw.routine as Preferences['routine']) ?? defaultPreferences.routine,
      cognitiveCondition:
        (raw.cognitiveCondition as Preferences['cognitiveCondition']) ??
        defaultPreferences.cognitiveCondition,
    }
  }

  async set(userId: string, preferences: Preferences): Promise<void> {
    await this.databaseRepository.update(USERS_COLLECTION, userId, { preferences })
  }
}
