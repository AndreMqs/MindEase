import type { User } from '../entities/User'

export type UpdateProfileData = { displayName?: string; email?: string }

/** Contrato alinhado ao mobile: mesmos fluxos e Firebase Auth. */
export interface AuthRepository {
  getCurrentUser(): Promise<User | null>
  /** Síncrono para uso em repositórios que precisam do userId atual (ex.: tarefas Firestore). */
  getCurrentUserSync(): User | null
  /** Subscreve mudanças de auth (Firebase). Opcional; fake pode retornar no-op. */
  subscribeAuthState?(listener: (user: User | null) => void): () => void
  login(email: string, password: string): Promise<User>
  register(email: string, password: string, displayName?: string): Promise<User>
  logout(): Promise<void>
  sendPasswordResetEmail(email: string): Promise<void>
  updateProfile(data: UpdateProfileData): Promise<void>
  /** Senha atual obrigatória no Firebase (reautenticação). */
  updatePassword(currentPassword: string, newPassword: string): Promise<void>
}
