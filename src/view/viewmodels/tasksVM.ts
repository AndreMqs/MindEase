import { create } from 'zustand'
import { container } from '../../shared/container'
import { useShellStore } from '../../shared/store/useShellStore'
import type { Task, TaskStatus } from '../../domain/entities/Task'

type TasksState = {
  loading: boolean
  error?: string
  tasks: Task[]
  init: () => Promise<void>
  add: (title: string, description?: string, points?: number, checklist?: { label: string }[]) => Promise<void>
  update: (task: Task) => Promise<void>
  remove: (id: string) => Promise<void>
  move: (id: string, status: TaskStatus) => Promise<void>
  apply: (next: Task[]) => Promise<void>
}

function normalizeOrders(tasks: Task[]): Task[] {
  const counters: Record<TaskStatus, number> = { todo: 0, doing: 0, done: 0 }
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
      const items = normalizeOrders(await container.usecases.listTasks.execute())
      useShellStore.getState().syncTaskPoints(items)
      set({ tasks: items, loading: false })
    } catch (e) {
      set({ loading: false, error: (e as Error).message })
    }
  },

  async add(title, description, points = 10, checklist) {
    set({ loading: true, error: undefined })
    try {
      const created = await container.usecases.createTask.execute({
        title,
        description,
        points,
        checklist,
      })
      const next = normalizeOrders([created, ...get().tasks])
      useShellStore.getState().syncTaskPoints(next)
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
      const next = normalizeOrders(prev.map((t) => (t.id === task.id ? task : t)))
      useShellStore.getState().syncTaskPoints(next)
      set({ tasks: next, loading: false })
    } catch (e) {
      set({ loading: false, error: (e as Error).message })
    }
  },

  async remove(id) {
    set({ loading: true, error: undefined })
    try {
      await container.usecases.removeTask.execute(id)
      const next = get().tasks.filter((t) => t.id !== id)
      useShellStore.getState().syncTaskPoints(next)
      set({ tasks: next, loading: false })
    } catch (e) {
      set({ loading: false, error: (e as Error).message })
    }
  },

  async move(id, status) {
    const prev = get().tasks
    const next = prev.map((t) => {
      if (t.id !== id) return t
      const updated = {
        ...t,
        status,
        completedAtISO: status === 'done' ? (t.completedAtISO ?? new Date().toISOString()) : undefined,
        updatedAtISO: new Date().toISOString(),
      }
      if (status === 'done' && t.focusTimerStartedAt != null && t.focusTimerPausedAt == null) {
        updated.focusTimerPausedAt = Date.now()
      }
      return updated
    })
    await get().apply(next)
  },

  async apply(next) {
    const prev = get().tasks
    const prevById = new Map(prev.map((t) => [t.id, t]))

    const nextWithAwards = next.map((t) => {
      let out = t
      const old = prevById.get(t.id)
      const transitionedToDone = Boolean(old && old.status !== 'done' && t.status === 'done')
      const transitionedOutOfDone = Boolean(old && old.status === 'done' && t.status !== 'done')

      if (transitionedOutOfDone) {
        out = { ...out, pointsAwarded: false, completedAtISO: undefined }
      } else if (transitionedToDone) {
        out = {
          ...out,
          pointsAwarded: true,
          completedAtISO: t.completedAtISO ?? new Date().toISOString(),
        }
      } else {
        out = { ...out, pointsAwarded: out.status === 'done' }
      }

      if (out.status === 'done' && out.focusTimerStartedAt != null && out.focusTimerPausedAt == null) {
        out = { ...out, focusTimerPausedAt: Date.now() }
      }

      return out
    })

    const normalized = normalizeOrders(nextWithAwards)
    useShellStore.getState().syncTaskPoints(normalized)
    set({ tasks: normalized, loading: false, error: undefined })

    try {
      const changed = normalized.filter((t) => {
        const p = prevById.get(t.id)
        return !p || JSON.stringify(p) !== JSON.stringify(t)
      })

      for (const t of changed) {
        await container.usecases.updateTask.execute(t)
      }
    } catch (e) {
      await get().init()
      set({ error: (e as Error).message })
    }
  },
}))
