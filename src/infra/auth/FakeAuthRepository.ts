import type { AuthRepository, UpdateProfileData } from '../../domain/ports/AuthRepository'
import type { User } from '../../domain/entities/User'

const STORAGE_KEY = 'mindease:auth'

type StoredUser = { id: string; email: string; displayName?: string }
type StoredAuth = { user: StoredUser; password?: string }

/** Por enquanto aceita qualquer email/senha e persiste no localStorage. Substituir por Firebase no container. */
export class FakeAuthRepository implements AuthRepository {
  private currentUser: User | null = null

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
    this.currentUser =
      data?.user?.id && data?.user?.email
        ? { id: data.user.id, email: data.user.email, displayName: data.user.displayName ?? null }
        : null
    return this.currentUser
  }

  getCurrentUserSync(): User | null {
    return this.currentUser
  }

  async login(email: string, password: string): Promise<User> {
    const normalized = email.trim().toLowerCase()
    const existing = this.getStored()?.user
    const user: User = {
      id: normalized,
      email: normalized,
      displayName: existing?.email === normalized ? (existing.displayName ?? null) : null,
    }
    this.setStored({ user: { id: user.id, email: user.email ?? '', displayName: user.displayName ?? undefined }, password })
    this.currentUser = user
    return user
  }

  async register(email: string, password: string, displayName?: string): Promise<User> {
    const user: User = {
      id: email.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      displayName: (displayName?.trim() || email.trim()) || null,
    }
    this.currentUser = user
    this.setStored({
      user: { id: user.id, email: user.email ?? '', displayName: user.displayName ?? undefined },
      password,
    })
    return user
  }

  async logout(): Promise<void> {
    this.currentUser = null
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
    stored.user.id = stored.user.email ?? stored.user.id
    this.currentUser = {
      id: stored.user.id,
      email: stored.user.email,
      displayName: stored.user.displayName ?? null,
    }
    this.setStored(stored)
  }

  async updatePassword(_currentPassword: string, newPassword: string): Promise<void> {
    const stored = this.getStored()
    if (!stored) return
    stored.password = newPassword
    this.setStored(stored)
  }
}
