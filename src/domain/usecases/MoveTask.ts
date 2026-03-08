import type { TasksRepository } from '../ports/TasksRepository'
import type { TaskStatus } from '../entities/Task'

export class MoveTask {
  private readonly repo: TasksRepository
  constructor(repo: TasksRepository) {
    this.repo = repo
  }
  execute(id: string, status: TaskStatus) {
    return this.repo.move(id, status)
  }
}
