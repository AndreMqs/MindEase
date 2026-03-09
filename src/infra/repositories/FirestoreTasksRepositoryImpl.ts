import type { IDatabaseRepository } from '../../domain/ports/DatabaseRepository'
import type { Task, TaskStatus } from '../../domain/entities/Task'

const USERS_COLLECTION = 'users'

type UserDoc = {
  id?: string
  profile?: unknown
  preferences?: unknown
  settings?: unknown
  kanban?: {
    boards?: Record<string, unknown>
    tasks?: Record<string, unknown>
  }
}

function nowISO(): string {
  return new Date().toISOString()
}

function makeId(): string {
  return 't_' + Math.random().toString(36).slice(2, 11)
}

function mapChecklist(raw: unknown): Task['checklist'] {
  if (!Array.isArray(raw)) return []
  return raw.map((item) => {
    const o = item && typeof item === 'object' ? (item as Record<string, unknown>) : {}
    return {
      id: String(o.id ?? ''),
      label: String(o.label ?? ''),
      done: Boolean(o.done),
    }
  })
}

function mapRawToTask(raw: Record<string, unknown>, id: string): Task {
  const status: TaskStatus =
    raw.status === 'doing' || raw.status === 'done' ? (raw.status as TaskStatus) : 'todo'
  const checklist = mapChecklist(raw.checklist)
  return {
    id,
    title: String(raw.title ?? ''),
    description: typeof raw.description === 'string' ? raw.description : undefined,
    status,
    checklist,
    points: typeof raw.points === 'number' ? raw.points : Number(raw.points ?? 10),
    pointsAwarded: typeof raw.pointsAwarded === 'boolean' ? raw.pointsAwarded : status === 'done',
    createdAtISO: typeof raw.createdAtISO === 'string' ? raw.createdAtISO : nowISO(),
    updatedAtISO: typeof raw.updatedAtISO === 'string' ? raw.updatedAtISO : nowISO(),
    completedAtISO: typeof raw.completedAtISO === 'string' ? raw.completedAtISO : undefined,
    order: typeof raw.order === 'number' ? raw.order : 0,
    boardId: typeof raw.boardId === 'string' ? raw.boardId : 'default',
    focusTimerStartedAt:
      typeof raw.focusTimerStartedAt === 'number' ? raw.focusTimerStartedAt : undefined,
    focusTimerPausedAt:
      typeof raw.focusTimerPausedAt === 'number' ? raw.focusTimerPausedAt : undefined,
  }
}

function getKanban(doc: UserDoc | null): UserDoc['kanban'] {
  if (!doc?.kanban || typeof doc.kanban !== 'object') return undefined
  return doc.kanban
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v
  }
  return out
}

/**
 * Implementação Firestore de tarefas por userId.
 * Mesmo contrato e estrutura do mobile: users/{userId}.kanban.tasks.
 */
export class FirestoreTasksRepositoryImpl {
  private readonly databaseRepository: IDatabaseRepository
  constructor(databaseRepository: IDatabaseRepository) {
    this.databaseRepository = databaseRepository
  }

  async list(userId: string): Promise<Task[]> {
    const doc = await this.databaseRepository.get<UserDoc>(USERS_COLLECTION, userId)
    const kanban = getKanban(doc)
    const tasksMap = kanban?.tasks
    if (!tasksMap || typeof tasksMap !== 'object') return []
    return Object.entries(tasksMap).map(([id, raw]) =>
      mapRawToTask((raw as Record<string, unknown>) ?? {}, id)
    )
  }

  private async getKanbanRaw(userId: string): Promise<UserDoc['kanban']> {
    const doc = await this.databaseRepository.get<UserDoc>(USERS_COLLECTION, userId)
    return getKanban(doc)
  }

  private async setKanban(userId: string, kanban: NonNullable<UserDoc['kanban']>): Promise<void> {
    await this.databaseRepository.update(USERS_COLLECTION, userId, {
      kanban,
    } as Partial<UserDoc>)
  }

  async create(
    userId: string,
    input: Omit<Task, 'id' | 'createdAtISO' | 'updatedAtISO'>
  ): Promise<Task> {
    const now = nowISO()
    const id = makeId()
    const task: Task = {
      ...input,
      id,
      createdAtISO: now,
      updatedAtISO: now,
      boardId: input.boardId ?? 'default',
    }
    const kanban = (await this.getKanbanRaw(userId)) ?? { tasks: {}, boards: {} }
    const tasks = { ...(kanban.tasks ?? {}), [id]: stripUndefined(task as unknown as Record<string, unknown>) }
    await this.setKanban(userId, { ...kanban, tasks })
    return task
  }

  async update(userId: string, task: Task): Promise<Task> {
    const updated = { ...task, updatedAtISO: nowISO() }
    const kanban = (await this.getKanbanRaw(userId)) ?? { tasks: {}, boards: {} }
    const tasks = { ...(kanban.tasks ?? {}), [task.id]: stripUndefined(updated as Record<string, unknown>) }
    await this.setKanban(userId, { ...kanban, tasks })
    return updated
  }

  async remove(userId: string, id: string): Promise<void> {
    const kanban = (await this.getKanbanRaw(userId)) ?? { tasks: {}, boards: {} }
    const tasks = { ...(kanban.tasks ?? {}) }
    delete tasks[id]
    await this.setKanban(userId, { ...kanban, tasks })
  }

  async move(userId: string, id: string, status: TaskStatus): Promise<Task> {
    const list = await this.list(userId)
    const found = list.find((t) => t.id === id)
    if (!found) throw new Error('Task not found')
    const moved: Task = {
      ...found,
      status,
      completedAtISO: status === 'done' ? found.completedAtISO ?? nowISO() : undefined,
      updatedAtISO: nowISO(),
    }
    return this.update(userId, moved)
  }
}
