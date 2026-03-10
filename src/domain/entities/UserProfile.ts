/**
 * Dados de perfil do usuário persistidos no Firestore (users/{userId}).
 * Mesma estrutura do mobile para sincronização web/mobile.
 */
export type UserProfileData = {
  name: string
  email: string
  acceptedTerms: boolean
  createdAt: string
  updatedAt: string
}

export type UserDocument = {
  profile: UserProfileData
  preferences: Record<string, unknown>
  settings: Record<string, unknown>
  metadata: Record<string, unknown>
  notes?: {
    folders?: Record<string, unknown>
    documents?: Record<string, unknown>
  }
  gamification?: {
    pointsBalance?: number
    pointsSpent?: number
    pointsTotalEarned?: number
    completedTaskIds?: Record<string, boolean>
    rewards?: Array<{ id: string; title: string; cost: number }>
    redemptionHistory?: Array<{
      id: string
      rewardId: string
      rewardTitle?: string
      title?: string
      cost: number
      redeemedAtISO: string
    }>
  }
}
