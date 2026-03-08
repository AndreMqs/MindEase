import type { TasksRepository } from '../ports/TasksRepository'
import type { Task, ChecklistItem } from '../entities/Task'

export type CreateTaskInput = {
  title: string
  description?: string
  points: number

  checklist?: { label: string }[]
}

function toChecklistItem(item: { label: string }, index: number): ChecklistItem {
  return {
    id: `c_${Date.now()}_${index}`,
    label: item.label.trim() || 'Item',
    done: false,
  }
}

export class CreateTask {
  private readonly repo: TasksRepository
  constructor(repo: TasksRepository) {
    this.repo = repo
  }
  execute(input: CreateTaskInput): Promise<Task> {
    const checklist: ChecklistItem[] = (input.checklist ?? []).map(toChecklistItem)
    return this.repo.create({
      title: input.title,
      description: input.description,
      status: 'todo',
      points: input.points,
      pointsAwarded: false,
      checklist,
      order: 0,
    })
  }
}
