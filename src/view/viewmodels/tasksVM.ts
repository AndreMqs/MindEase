import { create } from 'zustand'
import { container } from '../../shared/container'
import { useShellStore } from '../../shared/store/useShellStore'
import type { Task, TaskStatus } from '../../domain/entities/Task'

type TasksState = {
  loading: boolean
  error?: string
  tasks: Task[]
  init: () => Promise<void>
  add: (title: string, description?: string, points?: number) => Promise<void>
  update: (task: Task) => Promise<void>
  remove: (id: string) => Promise<void>
  move: (id: string, status: TaskStatus) => Promise<void>
  apply: (next: Task[]) => Promise<void>
}

function normalizeOrders(tasks: Task[]): Task[] {
  const counters: Record<TaskStatus, number> = { todo: 0, doing: 0, done: 0 }
  // keep stable order per status (by current order)
  const sorted = [...tasks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  return sorted.map((t) => ({ ...t, order: counters[t.status]++ }))
}

export const useTasksVM = create<TasksState>()((set, get) => ({
  loading: false,
  error: undefined,
  tasks: [],

  async init() {
    set({ loading: true, error: undefined })
    try {
      const items = await container.usecases.listTasks.execute()
      set({ tasks: normalizeOrders(items), loading: false })
    } catch (e) {
      set({ loading: false, error: (e as Error).message })
    }
  },

  async add(title, description, points = 10) {
    set({ loading: true, error: undefined })
    try {
      const created = await container.usecases.createTask.execute({
        title,
        description,
        points,
      })
      const next = normalizeOrders([created, ...get().tasks])
      set({ tasks: next, loading: false })
    } catch (e) {
      set({ loading: false, error: (e as Error).message })
    }
  },

  async update(task) {
    set({ loading: true, error: undefined })
    try {
      await container.usecases.updateTask.execute(task)
      const prev = get().tasks
      const next = prev.map((t) => (t.id === task.id ? task : t))
      set({ tasks: normalizeOrders(next), loading: false })
    } catch (e) {
      set({ loading: false, error: (e as Error).message })
    }
  },

  async remove(id) {
    set({ loading: true, error: undefined })
    try {
      await container.usecases.removeTask.execute(id)
      set({ tasks: get().tasks.filter((t) => t.id !== id), loading: false })
    } catch (e) {
      set({ loading: false, error: (e as Error).message })
    }
  },

  async move(id, status) {
    // For small apps, reuse apply() logic so points are awarded consistently
    const prev = get().tasks
    const next = prev.map((t) =>
      t.id === id
        ? {
            ...t,
            status,
            completedAtISO: status === 'done' ? (t.completedAtISO ?? new Date().toISOString()) : undefined,
            updatedAtISO: new Date().toISOString(),
          }
        : t,
    )
    await get().apply(next)
  },

  async apply(next) {
    // Award points ONLY once per task, tracked on the task itself (pointsAwarded flag).
    const prev = get().tasks
    const prevById = new Map(prev.map((t) => [t.id, t]))
    const award = useShellStore.getState().awardPointsForTask

    const nextWithAwards = next.map((t) => {
      const old = prevById.get(t.id)
      const transitionedToDone = old && old.status !== 'done' && t.status === 'done'
      const shouldAward = transitionedToDone && !t.pointsAwarded
      if (shouldAward) {
        award(t.id, t.points ?? 0)
        return { ...t, pointsAwarded: true }
      }
      // if it is done and missing the flag (legacy), fix it
      if (t.status === 'done' && t.pointsAwarded == null) return { ...t, pointsAwarded: true }
      return t
    })

    // Normalize & set locally first (optimistic)
    const normalized = normalizeOrders(nextWithAwards)
    set({ tasks: normalized, loading: false, error: undefined })

    // Persist only changed tasks
    try {
      const changed = normalized.filter((t) => {
        const p = prevById.get(t.id)
        return !p || JSON.stringify(p) !== JSON.stringify(t)
      })

      for (const t of changed) {
        await container.usecases.updateTask.execute(t)
      }
    } catch (e) {
      // If persistence fails, re-init to recover
      await get().init()
      set({ error: (e as Error).message })
    }
  },
}))
