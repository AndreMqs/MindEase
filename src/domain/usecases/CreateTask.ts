import type { TasksRepository } from '../ports/TasksRepository'
import type { Task } from '../entities/Task'

export type CreateTaskInput = {
  title: string
  description?: string
  points: number
}

export class CreateTask {
  constructor(private readonly repo: TasksRepository) {}
  execute(input: CreateTaskInput): Promise<Task> {
    return this.repo.create({
      title: input.title,
      description: input.description,
      status: 'todo',
      points: input.points,
      pointsAwarded: false,
      checklist: [],
      order: 0,
    })
  }
}
