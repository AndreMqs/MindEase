import type { TasksRepository } from '../ports/TasksRepository'

export class RemoveTask {
  constructor(private readonly repo: TasksRepository) {}
  execute(id: string): Promise<void> {
    return this.repo.remove(id)
  }
}
