import type { TasksRepository } from '../../domain/ports/TasksRepository'
import type { Task, TaskStatus } from '../../domain/entities/Task'

const KEY = 'mindease:tasks'

const nowISO = () => new Date().toISOString()

const seedTasks = (): Task[] => {
  const now = nowISO()
  return [
    {
      id: 't1',
      title: 'Preparar ambiente do projeto',
      description: 'Instalar dependências, subir o dev server e validar a base.',
      status: 'todo',
      points: 20,
      pointsAwarded: false,
      checklist: [
        { id: 'c1', label: 'npm install', done: true },
        { id: 'c2', label: 'npm run dev', done: false },
      ],
      createdAtISO: now,
      updatedAtISO: now,
      order: 0,
    },
    {
      id: 't2',
      title: 'Configurar preferências de acessibilidade',
      description: 'Ajustar foco, contraste e complexidade conforme necessidade.',
      status: 'doing',
      points: 15,
      pointsAwarded: false,
      checklist: [
        { id: 'c3', label: 'Testar modo foco', done: false },
        { id: 'c4', label: 'Testar contraste alto', done: false },
      ],
      createdAtISO: now,
      updatedAtISO: now,
      order: 0,
    },
    {
      id: 't3',
      title: 'Criar notas na Biblioteca',
      description: 'Criar pastas e notas para organizar anotações da aula.',
      status: 'done',
      points: 10,
      pointsAwarded: true,
      checklist: [{ id: 'c5', label: 'Criar uma pasta', done: true }],
      createdAtISO: now,
      updatedAtISO: now,
      completedAtISO: now,
      order: 0,
    },
  ]
}

function migrateTask(t: any, fallbackOrder: number): Task {
  const createdAtISO = typeof t.createdAtISO === 'string' ? t.createdAtISO : nowISO()
  const updatedAtISO = typeof t.updatedAtISO === 'string' ? t.updatedAtISO : createdAtISO
  const status: TaskStatus = t.status === 'doing' || t.status === 'done' ? t.status : 'todo'
  const points = typeof t.points === 'number' ? t.points : Number(t.points ?? 10)
  const order = typeof t.order === 'number' ? t.order : fallbackOrder
  const pointsAwarded = typeof t.pointsAwarded === 'boolean' ? t.pointsAwarded : status === 'done'

  return {
    id: String(t.id),
    title: String(t.title ?? ''),
    description: typeof t.description === 'string' ? t.description : undefined,
    status,
    checklist: Array.isArray(t.checklist) ? t.checklist : [],
    points: Number.isFinite(points) ? points : 10,
    pointsAwarded,
    createdAtISO,
    updatedAtISO,
    completedAtISO: typeof t.completedAtISO === 'string' ? t.completedAtISO : undefined,
    order,
  }
}

function load(): Task[] {
  const raw = localStorage.getItem(KEY)
  if (!raw) {
    const seeded = seedTasks()
    localStorage.setItem(KEY, JSON.stringify(seeded))
    return seeded
  }
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) throw new Error('Invalid tasks storage')
    return parsed.map((t, i) => migrateTask(t, i))
  } catch {
    const seeded = seedTasks()
    localStorage.setItem(KEY, JSON.stringify(seeded))
    return seeded
  }
}

function save(tasks: Task[]) {
  localStorage.setItem(KEY, JSON.stringify(tasks))
}

function makeId() {
  return 't_' + Math.random().toString(36).slice(2, 9)
}

export class TasksRepositoryLocalStorage implements TasksRepository {
  async list(): Promise<Task[]> {
    return load()
  }

  async create(input: Omit<Task, 'id' | 'createdAtISO' | 'updatedAtISO'>): Promise<Task> {
    const now = nowISO()
    const items = load()
    const task: Task = {
      ...input,
      id: makeId(),
      createdAtISO: now,
      updatedAtISO: now,
      pointsAwarded: input.pointsAwarded ?? false,
    }
    save([...items, task])
    return task
  }

  async update(task: Task): Promise<Task> {
    const items = load()
    const next: Task = { ...task, updatedAtISO: nowISO() }
    save(items.map((t) => (t.id === task.id ? next : t)))
    return next
  }

  async move(id: string, status: TaskStatus): Promise<Task> {
    const items = load()
    const found = items.find((t) => t.id === id)
    if (!found) throw new Error('Task not found')
    const moved: Task = {
      ...found,
      status,
      completedAtISO: status === 'done' ? (found.completedAtISO ?? nowISO()) : undefined,
      updatedAtISO: nowISO(),
    }
    save(items.map((t) => (t.id === id ? moved : t)))
    return moved
  }

  async remove(id: string): Promise<void> {
    const items = load()
    save(items.filter((t) => t.id !== id))
  }
}
