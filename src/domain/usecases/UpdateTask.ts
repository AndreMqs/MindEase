import type { TasksRepository } from '../ports/TasksRepository'
import type { Task } from '../entities/Task'

export class UpdateTask {
  constructor(private readonly repo: TasksRepository) {}
  execute(task: Task): Promise<Task> {
    return this.repo.update({ ...task, updatedAtISO: new Date().toISOString() })
  }
}
