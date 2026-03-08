import type { AuthRepository, UpdateProfileData } from '../../domain/ports/AuthRepository'
import type { User } from '../../domain/entities/User'

const STORAGE_KEY = 'mindease:auth'

type StoredAuth = { user: User; password?: string }

/** Por enquanto aceita qualquer email/senha e persiste no localStorage. Substituir por Firebase depois. */
export class FakeAuthRepository implements AuthRepository {
  private getStored(): StoredAuth | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return null
      return JSON.parse(raw) as StoredAuth
    } catch {
      return null
    }
  }

  private setStored(data: StoredAuth): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }

  async getCurrentUser(): Promise<User | null> {
    const data = this.getStored()
    return data?.user?.id && data?.user?.email ? data.user : null
  }

  async login(email: string, password: string): Promise<User> {
    const normalized = email.trim().toLowerCase()
    const existing = this.getStored()?.user
    const user: User = {
      id: normalized,
      email: normalized,
      displayName: existing?.email === normalized ? existing.displayName : undefined,
    }
    this.setStored({ user, password })
    return user
  }

  async register(email: string, password: string, displayName?: string): Promise<User> {
    const user: User = {
      id: email.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      displayName: displayName?.trim() || undefined,
    }
    this.setStored({ user, password })
    return user
  }

  async logout(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY)
  }

  async sendPasswordResetEmail(_email: string): Promise<void> {
    // Placeholder: quando integrar Firebase, chamar sendPasswordResetEmail do Auth
  }

  async updateProfile(data: UpdateProfileData): Promise<void> {
    const stored = this.getStored()
    if (!stored?.user) return
    if (data.displayName !== undefined) stored.user.displayName = data.displayName
    if (data.email !== undefined) stored.user.email = data.email.trim().toLowerCase()
    stored.user.id = stored.user.email
    this.setStored(stored)
  }

  async updatePassword(newPassword: string): Promise<void> {
    const stored = this.getStored()
    if (!stored) return
    stored.password = newPassword
    this.setStored(stored)
  }
}
