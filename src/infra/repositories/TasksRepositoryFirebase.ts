import type { TasksRepository } from '../../domain/ports/TasksRepository'
import type { Task, TaskStatus } from '../../domain/entities/Task'
import { FirestoreTasksRepositoryImpl } from './FirestoreTasksRepositoryImpl'

/**
 * Adaptador: implementa o port TasksRepository da web (list(), create(), ...)
 * e delega para Firestore usando o userId atual. Mesmos dados do mobile.
 */
export class TasksRepositoryFirebase implements TasksRepository {
  private readonly getCurrentUserId: () => string | null
  private readonly impl: FirestoreTasksRepositoryImpl
  constructor(getCurrentUserId: () => string | null, impl: FirestoreTasksRepositoryImpl) {
    this.getCurrentUserId = getCurrentUserId
    this.impl = impl
  }

  private requireUserId(): string {
    const uid = this.getCurrentUserId()
    if (!uid) throw new Error('Usuário não autenticado.')
    return uid
  }

  async list(): Promise<Task[]> {
    return this.impl.list(this.requireUserId())
  }

  async create(input: Omit<Task, 'id' | 'createdAtISO' | 'updatedAtISO'>): Promise<Task> {
    return this.impl.create(this.requireUserId(), input)
  }

  async update(task: Task): Promise<Task> {
    return this.impl.update(this.requireUserId(), task)
  }

  async remove(id: string): Promise<void> {
    return this.impl.remove(this.requireUserId(), id)
  }

  async move(id: string, status: TaskStatus): Promise<Task> {
    return this.impl.move(this.requireUserId(), id, status)
  }
}
