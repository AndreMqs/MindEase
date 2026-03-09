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
}
