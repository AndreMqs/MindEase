import type { Task, TaskStatus } from '../entities/Task'

export interface TasksRepository {
  list(): Promise<Task[]>
  create(input: Omit<Task, 'id' | 'createdAtISO' | 'updatedAtISO'>): Promise<Task>
  update(task: Task): Promise<Task>
  remove(id: string): Promise<void>
  move(id: string, status: TaskStatus): Promise<Task>
}
