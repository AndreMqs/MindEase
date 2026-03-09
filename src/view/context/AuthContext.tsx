import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { User } from '../../domain/entities/User'
import type { UpdateProfileData } from '../../domain/ports/AuthRepository'
import { container } from '../../shared/container'
import { useShellStore } from '../../shared/store/useShellStore'

type AuthState = {
  user: User | null
  isLoading: boolean
  isInitialized: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, displayName?: string) => Promise<void>
  logout: () => Promise<void>
  sendPasswordResetEmail: (email: string) => Promise<void>
  updateProfile: (data: UpdateProfileData) => Promise<void>
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

const repo = container.repos.authRepo

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const hasResolvedInitialSession = useRef(false)

  const init = useCallback(async () => {
    try {
      const current = await repo.getCurrentUser()
      setUser(current)
      useShellStore.getState().setActiveUser(current?.id ?? null)
      if (current?.id) {
        void useShellStore.getState().hydrateActiveUserGamification()
      }
    } catch {
      setUser(null)
    } finally {
      setIsInitialized(true)
    }
  }, [])

  useEffect(() => {
    if (repo.subscribeAuthState) {
      const unsubscribe = repo.subscribeAuthState((nextUser) => {
        setUser(nextUser)
        useShellStore.getState().setActiveUser(nextUser?.id ?? null)
        if (nextUser?.id) {
          void useShellStore.getState().hydrateActiveUserGamification()
        }

        if (!hasResolvedInitialSession.current) {
          hasResolvedInitialSession.current = true
          setIsInitialized(true)
        }
      })

      return () => unsubscribe()
    }

    void init()
  }, [init])

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const u = await repo.login(email, password)
      setUser(u)
      useShellStore.getState().setActiveUser(u.id)
      void useShellStore.getState().hydrateActiveUserGamification()
      hasResolvedInitialSession.current = true
      setIsInitialized(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = useCallback(async (email: string, password: string, displayName?: string) => {
    setIsLoading(true)
    try {
      const u = await repo.register(email, password, displayName)
      setUser(u)
      useShellStore.getState().setActiveUser(u.id)
      void useShellStore.getState().hydrateActiveUserGamification()
      hasResolvedInitialSession.current = true
      setIsInitialized(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    setIsLoading(true)
    try {
      await repo.logout()
      setUser(null)
      useShellStore.getState().setActiveUser(null)
      hasResolvedInitialSession.current = true
      setIsInitialized(true)
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

  const updateProfile = useCallback(
    async (data: UpdateProfileData) => {
      if (!user) return
      setIsLoading(true)
      try {
        await repo.updateProfile(data)
        setUser({
          ...user,
          email: data.email ?? user.email,
          displayName: data.displayName ?? user.displayName,
        })
      } finally {
        setIsLoading(false)
      }
    },
    [user]
  )

  const updatePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    setIsLoading(true)
    try {
      await repo.updatePassword(currentPassword, newPassword)
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
    updateProfile,
    updatePassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
