import type { User } from '../entities/User'

/**
 * Porta de autenticação. Implementação fake usa localStorage;
 * depois trocar por Firebase (AuthRepositoryFirebase).
 */
export interface AuthRepository {
  getCurrentUser(): Promise<User | null>
  login(email: string, password: string): Promise<User>
  register(email: string, password: string): Promise<User>
  logout(): Promise<void>
  sendPasswordResetEmail(email: string): Promise<void>
}
