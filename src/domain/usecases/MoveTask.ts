import type { TasksRepository } from '../ports/TasksRepository'
import type { TaskStatus } from '../entities/Task'

export class MoveTask {
  constructor(private readonly repo: TasksRepository) {}
  execute(id: string, status: TaskStatus) {
    return this.repo.move(id, status)
  }
}
