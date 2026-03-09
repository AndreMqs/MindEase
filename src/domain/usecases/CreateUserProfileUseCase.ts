import type { IDatabaseRepository } from '../ports/DatabaseRepository'
import type { UserProfileData, UserDocument } from '../entities/UserProfile'

const USERS_COLLECTION = 'users'

/**
 * Cria o documento do usuário no Firestore (users/{userId}).
 * Mesma estrutura do mobile: profile, preferences, settings, metadata.
 */
export class CreateUserProfileUseCase {
  private readonly databaseRepository: IDatabaseRepository
  constructor(databaseRepository: IDatabaseRepository) {
    this.databaseRepository = databaseRepository
  }

  async execute(userId: string, profile: UserProfileData): Promise<void> {
    const now = new Date().toISOString()
    const document: UserDocument = {
      profile: {
        ...profile,
        createdAt: profile.createdAt ?? now,
        updatedAt: profile.updatedAt ?? now,
      },
      preferences: {},
      settings: {},
      metadata: {},
    }
    await this.databaseRepository.set(USERS_COLLECTION, userId, document)
  }
}
