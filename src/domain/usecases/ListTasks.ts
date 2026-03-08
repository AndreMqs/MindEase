import type { TasksRepository } from '../ports/TasksRepository'
import type { Task } from '../entities/Task'

export class ListTasks {
  private readonly repo: TasksRepository
  constructor(repo: TasksRepository) {
    this.repo = repo
  }
  execute(): Promise<Task[]> {
    return this.repo.list()
  }
}
