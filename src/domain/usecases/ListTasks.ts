import type { TasksRepository } from '../ports/TasksRepository'
import type { Task } from '../entities/Task'

export class ListTasks {
  constructor(private readonly repo: TasksRepository) {}
  execute(): Promise<Task[]> {
    return this.repo.list()
  }
}
