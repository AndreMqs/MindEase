import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { container } from '../container'
import { defaultPreferences, type Preferences } from '../../domain/entities/Preferences'

export type RewardProduct = {
  id: string
  title: string
  cost: number
}

type GlobalEvent = { type: string; payload?: unknown; at: number }

type ShellState = {
  // shared preferences (cognitive panel)
  preferences: Preferences
  loading: boolean
  error?: string

  // gamification
  pointsBalance: number
  pointsTotalEarned: number
  completedTaskIds: Record<string, true>
  rewards: RewardProduct[]

  // actions
  initPreferences: () => Promise<void>
  setPreferences: (next: Preferences) => Promise<void>
  patchPreferences: (partial: Partial<Preferences>) => Promise<void>
  resetPreferences: () => Promise<void>

  // aliases used by viewmodels/pages (keeps API stable)
  init: () => Promise<void>
  patch: (partial: Partial<Preferences>) => Promise<void>
  reset: () => Promise<void>

  awardPointsForTask: (taskId: string, points: number) => void
  addReward: (title: string, cost: number) => void
  removeReward: (id: string) => void
  redeemReward: (id: string) => { ok: true } | { ok: false; reason: 'INSUFFICIENT_POINTS' | 'NOT_FOUND' }

  // event bus
  lastGlobalEvent?: GlobalEvent
  emit: (type: string, payload?: unknown) => void
}

export const useShellStore = create<ShellState>()(
  persist(
    (set, get) => ({
      preferences: { ...defaultPreferences },
      loading: false,
      error: undefined,

      pointsBalance: 0,
      pointsTotalEarned: 0,
      completedTaskIds: {},
      rewards: [
        { id: 'reward-ep', title: 'Assistir 1 episódio de série', cost: 30 },
        { id: 'reward-game', title: '30 min de jogo', cost: 50 },
      ],

      initPreferences: async () => {
        try {
          set({ loading: true, error: undefined })
          // Persist middleware hydrates automatically; still keep a hook for future (Firebase/profile, etc.)
          set({ loading: false })
        } catch (e: any) {
          set({ loading: false, error: e?.message ?? 'Falha ao carregar preferências' })
        }
      },

      setPreferences: async (next) => {
        set({ preferences: next })
      },

      patchPreferences: async (partial) => {
        set({ preferences: { ...get().preferences, ...partial } })
      },

      resetPreferences: async () => {
        set({ preferences: { ...defaultPreferences } })
      },

      init: async () => {
        await get().initPreferences()
      },
      patch: async (partial) => {
        await get().patchPreferences(partial)
      },
      reset: async () => {
        await get().resetPreferences()
      },

      awardPointsForTask: (taskId, points) => {
        if (!points || points <= 0) return
        const done = get().completedTaskIds[taskId]
        if (done) return
        set((s) => ({
          completedTaskIds: { ...s.completedTaskIds, [taskId]: true },
          pointsBalance: s.pointsBalance + points,
          pointsTotalEarned: s.pointsTotalEarned + points,
        }))
      },

      addReward: (title, cost) => {
        const id = `reward-${Math.random().toString(16).slice(2)}`
        set((s) => ({ rewards: [{ id, title: title.trim(), cost: Math.max(0, Math.round(cost)) }, ...s.rewards] }))
      },

      removeReward: (id) => {
        set((s) => ({ rewards: s.rewards.filter((r) => r.id !== id) }))
      },

      redeemReward: (id) => {
        const r = get().rewards.find((x) => x.id === id)
        if (!r) return { ok: false, reason: 'NOT_FOUND' as const }
        if (get().pointsBalance < r.cost) return { ok: false, reason: 'INSUFFICIENT_POINTS' as const }
        set((s) => ({ pointsBalance: s.pointsBalance - r.cost }))
        return { ok: true as const }
      },

      emit: (type, payload) => {
        set({ lastGlobalEvent: { type, payload, at: Date.now() } })
      },
    }),
    {
      name: 'mindease-shell-store',
      partialize: (s) => ({
        preferences: s.preferences,
        pointsBalance: s.pointsBalance,
        pointsTotalEarned: s.pointsTotalEarned,
        completedTaskIds: s.completedTaskIds,
        rewards: s.rewards,
      }),
    },
  ),
)
