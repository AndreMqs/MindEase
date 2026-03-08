export type TaskStatus = 'todo' | 'doing' | 'done'

export interface ChecklistItem {
  id: string
  label: string
  done: boolean
}

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  checklist: ChecklistItem[]
  points: number
  /** set to true after points are awarded so we never double-count */
  pointsAwarded?: boolean

  createdAtISO: string
  updatedAtISO: string
  completedAtISO?: string
  order: number

  /** Timer de foco (Pomodoro cognitivo). Em ms. */
  focusTimerStartedAt?: number
  /** Quando pausado, timestamp da pausa; elapsed = (focusTimerPausedAt - focusTimerStartedAt) / 1000 */
  focusTimerPausedAt?: number
}
