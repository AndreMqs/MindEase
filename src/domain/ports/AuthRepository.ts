import type { User } from '../entities/User'

export type UpdateProfileData = { displayName?: string; email?: string }

export interface AuthRepository {
  getCurrentUser(): Promise<User | null>
  login(email: string, password: string): Promise<User>
  register(email: string, password: string, displayName?: string): Promise<User>
  logout(): Promise<void>
  sendPasswordResetEmail(email: string): Promise<void>
  updateProfile(data: UpdateProfileData): Promise<void>
  updatePassword(newPassword: string): Promise<void>
}
