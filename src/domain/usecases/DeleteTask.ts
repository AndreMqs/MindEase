import type { TasksRepository } from '../ports/TasksRepository'

export class DeleteTask {
  private readonly repo: TasksRepository
  constructor(repo: TasksRepository) {
    this.repo = repo
  }
  execute(id: string): Promise<void> {
    return this.repo.remove(id)
  }
}
