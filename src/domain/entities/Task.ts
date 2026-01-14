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
}
