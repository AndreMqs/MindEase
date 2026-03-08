import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { User } from '../../domain/entities/User'
import { container } from '../../shared/container'

type AuthState = {
  user: User | null
  isLoading: boolean
  isInitialized: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  sendPasswordResetEmail: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

const repo = container.repos.authRepo

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  const init = useCallback(async () => {
    try {
      const current = await repo.getCurrentUser()
      setUser(current)
    } catch {
      setUser(null)
    } finally {
      setIsInitialized(true)
    }
  }, [])

  useEffect(() => {
    void init()
  }, [init])

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const u = await repo.login(email, password)
      setUser(u)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const u = await repo.register(email, password)
      setUser(u)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    setIsLoading(true)
    try {
      await repo.logout()
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const sendPasswordResetEmail = useCallback(async (email: string) => {
    setIsLoading(true)
    try {
      await repo.sendPasswordResetEmail(email)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const value: AuthState = {
    user,
    isLoading,
    isInitialized,
    login,
    register,
    logout,
    sendPasswordResetEmail,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
