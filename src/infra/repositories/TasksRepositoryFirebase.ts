import type { TasksRepository } from '../../domain/ports/TasksRepository'
import type { Task, TaskStatus } from '../../domain/entities/Task'

// Placeholder: implemente com Firebase (Firestore) depois.
export class TasksRepositoryFirebase implements TasksRepository {
  async list(): Promise<Task[]> {
    throw new Error('Not implemented: TasksRepositoryFirebase.list')
  }
  async create(_input: Omit<Task, 'id' | 'createdAtISO' | 'updatedAtISO'>): Promise<Task> {
    throw new Error('Not implemented: TasksRepositoryFirebase.create')
  }
  async update(_task: Task): Promise<Task> {
    throw new Error('Not implemented: TasksRepositoryFirebase.update')
  }
  async remove(_id: string): Promise<void> {
    throw new Error('Not implemented: TasksRepositoryFirebase.remove')
  }
  async move(_id: string, _status: TaskStatus): Promise<Task> {
    throw new Error('Not implemented: TasksRepositoryFirebase.move')
  }
}
