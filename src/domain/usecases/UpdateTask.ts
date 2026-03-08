import type { TasksRepository } from '../ports/TasksRepository'
import type { Task } from '../entities/Task'

export class UpdateTask {
  private readonly repo: TasksRepository
  constructor(repo: TasksRepository) {
    this.repo = repo
  }
  execute(task: Task): Promise<Task> {
    return this.repo.update({ ...task, updatedAtISO: new Date().toISOString() })
  }
}
