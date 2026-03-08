import type { User } from '../entities/User'


export interface AuthRepository {
  getCurrentUser(): Promise<User | null>
  login(email: string, password: string): Promise<User>
  register(email: string, password: string): Promise<User>
  logout(): Promise<void>
  sendPasswordResetEmail(email: string): Promise<void>
}
