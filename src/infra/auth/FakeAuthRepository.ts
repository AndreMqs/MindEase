import type { AuthRepository } from '../../domain/ports/AuthRepository'
import type { User } from '../../domain/entities/User'

const STORAGE_KEY = 'mindease:auth'

/** Por enquanto aceita qualquer email/senha e persiste no localStorage. Substituir por Firebase depois. */
export class FakeAuthRepository implements AuthRepository {
  async getCurrentUser(): Promise<User | null> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return null
      const data = JSON.parse(raw) as User
      return data.id && data.email ? data : null
    } catch {
      return null
    }
  }

  async login(email: string, _password: string): Promise<User> {
    const user: User = { id: email, email: email.trim().toLowerCase() }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    return user
  }

  async register(email: string, _password: string): Promise<User> {
    return this.login(email, _password)
  }

  async logout(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY)
  }

  async sendPasswordResetEmail(_email: string): Promise<void> {
    // Placeholder: quando integrar Firebase, chamar sendPasswordResetEmail do Auth
  }
}
