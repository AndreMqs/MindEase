import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { auth, db, isFirebaseConfigured } from '../../lib/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { defaultPreferences, type Preferences } from '../../domain/entities/Preferences'
import type { Task } from '../../domain/entities/Task'

export type RewardProduct = {
  id: string
  title: string
  cost: number
}

export type RewardRedemption = {
  id: string
  rewardId: string
  rewardTitle: string
  cost: number
  redeemedAtISO: string
}

type GlobalEvent = { type: string; payload?: unknown; at: number }

type UserGamificationState = {
  pointsBalance: number
  pointsTotalEarned: number
  completedTaskIds: Record<string, boolean>
  rewards: RewardProduct[]
  redemptionHistory: RewardRedemption[]
}

type ShellState = {
  preferences: Preferences
  loading: boolean
  error?: string

  activeUserId: string | null
  gamificationByUser: Record<string, UserGamificationState>

  pointsBalance: number
  pointsTotalEarned: number
  completedTaskIds: Record<string, boolean>
  rewards: RewardProduct[]
  redemptionHistory: RewardRedemption[]

  initPreferences: () => Promise<void>
  setPreferences: (next: Preferences) => Promise<void>
  patchPreferences: (partial: Partial<Preferences>) => Promise<void>
  resetPreferences: () => Promise<void>

  setActiveUser: (userId: string | null) => void
  hydrateActiveUserGamification: () => Promise<void>

  init: () => Promise<void>
  patch: (partial: Partial<Preferences>) => Promise<void>
  reset: () => Promise<void>

  awardPointsForTask: (taskId: string, points: number) => void
  revokePointsForTask: (taskId: string, points: number) => void
  syncTaskPoints: (tasks: Pick<Task, 'id' | 'status' | 'points' | 'pointsAwarded'>[]) => void
  addReward: (title: string, cost: number) => void
  removeReward: (id: string) => void
  redeemReward: (id: string) => { ok: true } | { ok: false; reason: 'INSUFFICIENT_POINTS' | 'NOT_FOUND' }

  lastGlobalEvent?: GlobalEvent
  emit: (type: string, payload?: unknown) => void
}

const DEFAULT_REWARDS: RewardProduct[] = [
  { id: 'reward-ep', title: 'Assistir 1 episódio de série', cost: 30 },
  { id: 'reward-game', title: '30 min de jogo', cost: 50 },
]

const GUEST_USER_ID = '__guest__'

function cloneRewards(rewards: RewardProduct[]): RewardProduct[] {
  return rewards.map((reward) => ({ ...reward }))
}

function buildDefaultGamification(): UserGamificationState {
  return {
    pointsBalance: 0,
    pointsTotalEarned: 0,
    completedTaskIds: {},
    rewards: cloneRewards(DEFAULT_REWARDS),
    redemptionHistory: [],
  }
}

function getScopedUserId(userId: string | null | undefined): string {
  return userId && userId.trim().length > 0 ? userId : GUEST_USER_ID
}

function getUserGamification(state: Pick<ShellState, 'activeUserId' | 'gamificationByUser'>, userId?: string | null): UserGamificationState {
  const scopedUserId = getScopedUserId(userId ?? state.activeUserId)
  return state.gamificationByUser[scopedUserId] ?? buildDefaultGamification()
}

function applyGamificationForUser(
  state: ShellState,
  userId: string | null,
  patch?: Partial<UserGamificationState>,
): Partial<ShellState> {
  const scopedUserId = getScopedUserId(userId)
  const currentGamification = getUserGamification(state, scopedUserId)
  const nextGamification: UserGamificationState = {
    ...currentGamification,
    ...(patch ?? {}),
  }

  return {
    activeUserId: userId,
    pointsBalance: nextGamification.pointsBalance,
    pointsTotalEarned: nextGamification.pointsTotalEarned,
    completedTaskIds: nextGamification.completedTaskIds,
    rewards: nextGamification.rewards,
    redemptionHistory: nextGamification.redemptionHistory,
    gamificationByUser: {
      ...state.gamificationByUser,
      [scopedUserId]: nextGamification,
    },
  }
}

function buildPersistedGamification(input: Partial<UserGamificationState> | null | undefined): UserGamificationState {
  const fallback = buildDefaultGamification()
  return {
    pointsBalance: typeof input?.pointsBalance === 'number' ? input.pointsBalance : fallback.pointsBalance,
    pointsTotalEarned:
      typeof input?.pointsTotalEarned === 'number' ? input.pointsTotalEarned : fallback.pointsTotalEarned,
    completedTaskIds:
      input?.completedTaskIds && typeof input.completedTaskIds === 'object'
        ? (input.completedTaskIds as Record<string, boolean>)
        : fallback.completedTaskIds,
    rewards: Array.isArray(input?.rewards) && input?.rewards.length > 0 ? cloneRewards(input.rewards) : fallback.rewards,
    redemptionHistory: Array.isArray(input?.redemptionHistory)
      ? input.redemptionHistory.map((item) => ({ ...item }))
      : fallback.redemptionHistory,
  }
}

async function persistGamificationForUser(userId: string | null, gamification: UserGamificationState) {
  if (!isFirebaseConfigured || !userId || auth.currentUser?.uid !== userId) return
  try {
    await updateDoc(doc(db, 'users', userId), {
      gamification: {
        pointsBalance: gamification.pointsBalance,
        pointsTotalEarned: gamification.pointsTotalEarned,
        completedTaskIds: gamification.completedTaskIds,
        rewards: gamification.rewards,
        redemptionHistory: gamification.redemptionHistory,
      },
    })
  } catch {
    // no-op: local state remains the source of truth until next successful sync
  }
}

export const useShellStore = create<ShellState>()(
  persist(
    (set, get) => ({
      preferences: { ...defaultPreferences },
      loading: false,
      error: undefined,

      activeUserId: null,
      gamificationByUser: {},

      pointsBalance: 0,
      pointsTotalEarned: 0,
      completedTaskIds: {},
      rewards: cloneRewards(DEFAULT_REWARDS),
      redemptionHistory: [],

      initPreferences: async () => {
        try {
          set({ loading: true, error: undefined })
          set({ loading: false })
        } catch (e: unknown) {
          set({ loading: false, error: e instanceof Error ? e.message : 'Falha ao carregar preferências' })
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

      setActiveUser: (userId) => {
        set((state) => ({ ...applyGamificationForUser(state, userId) }))
      },

      hydrateActiveUserGamification: async () => {
        const userId = get().activeUserId
        if (!isFirebaseConfigured || !userId || auth.currentUser?.uid !== userId) return
        try {
          const snapshot = await getDoc(doc(db, 'users', userId))
          const raw = snapshot.exists() ? (snapshot.data().gamification as Partial<UserGamificationState> | undefined) : undefined
          const hydrated = buildPersistedGamification(raw)
          set((state) => ({ ...applyGamificationForUser(state, userId, hydrated) }))
        } catch {
          // keep local fallback
        }
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
        set((state) => {
          const currentGamification = getUserGamification(state)
          if (currentGamification.completedTaskIds[taskId]) return {}
          const nextCompletedTaskIds = { ...currentGamification.completedTaskIds, [taskId]: true }
          const nextGamification: UserGamificationState = {
            ...currentGamification,
            completedTaskIds: nextCompletedTaskIds,
            pointsBalance: currentGamification.pointsBalance + points,
            pointsTotalEarned: Math.max(0, currentGamification.pointsTotalEarned + points),
          }
          void persistGamificationForUser(state.activeUserId, nextGamification)
          return applyGamificationForUser(state, state.activeUserId, nextGamification)
        })
      },

      revokePointsForTask: (taskId, points) => {
        if (!points || points <= 0) return
        set((state) => {
          const currentGamification = getUserGamification(state)
          if (!currentGamification.completedTaskIds[taskId]) return {}
          const nextCompletedTaskIds = { ...currentGamification.completedTaskIds }
          delete nextCompletedTaskIds[taskId]
          const nextGamification: UserGamificationState = {
            ...currentGamification,
            completedTaskIds: nextCompletedTaskIds,
            pointsBalance: currentGamification.pointsBalance - points,
            pointsTotalEarned: Math.max(0, currentGamification.pointsTotalEarned - points),
          }
          void persistGamificationForUser(state.activeUserId, nextGamification)
          return applyGamificationForUser(state, state.activeUserId, nextGamification)
        })
      },

      syncTaskPoints: (tasks) => {
        set((state) => {
          const completedTaskIds = Object.fromEntries(
            tasks
              .filter((task) => task.status === 'done')
              .map((task) => [task.id, true as const]),
          )
          const pointsTotalEarned = tasks
            .filter((task) => task.status === 'done')
            .reduce((sum, task) => sum + Math.max(0, Number(task.points ?? 0)), 0)
          const currentGamification = getUserGamification(state)
          const spentPoints = currentGamification.redemptionHistory.reduce(
            (sum, item) => sum + Math.max(0, item.cost),
            0,
          )

          const nextGamification: UserGamificationState = {
            ...currentGamification,
            completedTaskIds,
            pointsTotalEarned,
            pointsBalance: pointsTotalEarned - spentPoints,
          }
          void persistGamificationForUser(state.activeUserId, nextGamification)
          return applyGamificationForUser(state, state.activeUserId, nextGamification)
        })
      },

      addReward: (title, cost) => {
        set((state) => {
          const currentGamification = getUserGamification(state)
          const id = `reward-${Math.random().toString(16).slice(2)}`
          const nextGamification: UserGamificationState = {
            ...currentGamification,
            rewards: [
              { id, title: title.trim(), cost: Math.max(0, Math.round(cost)) },
              ...currentGamification.rewards,
            ],
          }
          void persistGamificationForUser(state.activeUserId, nextGamification)
          return applyGamificationForUser(state, state.activeUserId, nextGamification)
        })
      },

      removeReward: (id) => {
        set((state) => {
          const currentGamification = getUserGamification(state)
          const nextGamification: UserGamificationState = {
            ...currentGamification,
            rewards: currentGamification.rewards.filter((reward) => reward.id !== id),
          }
          void persistGamificationForUser(state.activeUserId, nextGamification)
          return applyGamificationForUser(state, state.activeUserId, nextGamification)
        })
      },

      redeemReward: (id) => {
        const state = get()
        const currentGamification = getUserGamification(state)
        const reward = currentGamification.rewards.find((entry) => entry.id === id)
        if (!reward) return { ok: false, reason: 'NOT_FOUND' as const }
        if (currentGamification.pointsBalance < reward.cost) {
          return { ok: false, reason: 'INSUFFICIENT_POINTS' as const }
        }

        const redeemedAtISO = new Date().toISOString()
        set((currentState) => {
          const latestGamification = getUserGamification(currentState)
          const nextGamification: UserGamificationState = {
            ...latestGamification,
            pointsBalance: latestGamification.pointsBalance - reward.cost,
            redemptionHistory: [
              {
                id: `redeem-${Math.random().toString(16).slice(2)}`,
                rewardId: reward.id,
                rewardTitle: reward.title,
                cost: reward.cost,
                redeemedAtISO,
              },
              ...latestGamification.redemptionHistory,
            ],
          }
          void persistGamificationForUser(currentState.activeUserId, nextGamification)
          return applyGamificationForUser(currentState, currentState.activeUserId, nextGamification)
        })
        return { ok: true as const }
      },

      emit: (type, payload) => {
        set({ lastGlobalEvent: { type, payload, at: Date.now() } })
      },
    }),
    {
      name: 'mindease-shell-store',
      partialize: (state) => ({
        preferences: state.preferences,
        activeUserId: state.activeUserId,
        gamificationByUser: state.gamificationByUser,
      }),
      merge: (persisted, current) => {
        const persistedState = persisted as Partial<ShellState> | null
        const merged: ShellState = {
          ...current,
          ...(persistedState && typeof persistedState === 'object' ? persistedState : {}),
        }

        if (merged.preferences && typeof merged.preferences === 'object') {
          merged.preferences = { ...defaultPreferences, ...merged.preferences }
        }

        const activeUserId = merged.activeUserId
        const currentGamification = getUserGamification(merged, activeUserId)
        merged.pointsBalance = currentGamification.pointsBalance
        merged.pointsTotalEarned = currentGamification.pointsTotalEarned
        merged.completedTaskIds = currentGamification.completedTaskIds
        merged.rewards = currentGamification.rewards
        merged.redemptionHistory = currentGamification.redemptionHistory

        return merged
      },
    },
  ),
)
