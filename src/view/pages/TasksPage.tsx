import { useEffect, useMemo, useState } from 'react'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  useDroppable,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useSortable } from '@dnd-kit/sortable'

import type { Task, TaskStatus } from '../../domain/entities/Task'
import { useTasksVM } from '../viewmodels/tasksVM'
import { usePreferencesVM } from '../viewmodels/preferencesVM'
import { useShellStore } from '../../shared/store/useShellStore'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { TextField } from '../components/TextField'
import { Select } from '../components/Select'
import { AddIcon, DeleteIcon, DragIndicatorIcon, SearchIcon } from '../icons'

type SortKey = 'order' | 'title' | 'updatedAt' | 'createdAt' | 'points'

function sortTasks(list: Task[], key: SortKey): Task[] {
  const copy = list.slice()
  switch (key) {
    case 'title':
      return copy.sort((a, b) => a.title.localeCompare(b.title))
    case 'points':
      return copy.sort((a, b) => (b.points ?? 0) - (a.points ?? 0))
    case 'createdAt':
      return copy.sort((a, b) => a.createdAtISO.localeCompare(b.createdAtISO))
    case 'updatedAt':
      return copy.sort((a, b) => b.updatedAtISO.localeCompare(a.updatedAtISO))
    case 'order':
    default:
      return copy.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  }
}

function TaskCard({
  task,
  complexity,
  onRemove,
}: {
  task: Task
  complexity: 'simple' | 'standard' | 'detailed'
  onRemove: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
  } as const

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({ id: status })

  return (
    <Card
      ref={setNodeRef as any}
      className="me-card me-anim"
      style={style as any}
      sx={{
        p: 1.25,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'rgba(0,0,0,0.12)',
      }}
    >
      <Stack direction="row" spacing={1} alignItems="flex-start">
        <Tooltip title="Arraste para reorganizar">
          <Box
            {...attributes}
            {...listeners}
            sx={{
              mt: 0.3,
              cursor: 'grab',
              color: 'text.secondary',
              display: 'inline-flex',
            }}
            className="me-anim"
          >
            <DragIndicatorIcon fontSize="small" />
          </Box>
        </Tooltip>

        <Stack spacing={0.6} sx={{ flex: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
            <Typography sx={{ fontWeight: 800, lineHeight: 1.2 }}>{task.title}</Typography>
            <Chip size="small" label={`${task.points ?? 0} pts`} variant="outlined" />
            {complexity === 'detailed' && task.completedAtISO && (
              <Chip size="small" label={`Concluída: ${new Date(task.completedAtISO).toLocaleDateString()}`} />
            )}
          </Stack>

          {complexity !== 'simple' && task.description ? (
            <Typography color="text.secondary" sx={{ fontSize: 13, lineHeight: 1.35 }}>
              {task.description}
            </Typography>
          ) : null}

          {complexity === 'detailed' ? (
            <Typography color="text.secondary" sx={{ fontSize: 12 }}>
              Criada em {new Date(task.createdAtISO).toLocaleString()} • Atualizada em {new Date(task.updatedAtISO).toLocaleString()}
            </Typography>
          ) : null}
        </Stack>

        <Tooltip title="Remover">
          <IconButton onClick={() => onRemove(task.id)} size="small">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
    </Card>
  )
}

function Column({
  title,
  status,
  tasks,
  activeId,
  complexity,
  onRemove,
}: {
  title: string
  status: TaskStatus
  tasks: Task[]
  activeId?: string
  complexity: 'simple' | 'standard' | 'detailed'
  onRemove: (id: string) => void
}) {
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({ id: status })

  return (
    <Card ref={setDroppableRef as any} className="me-card me-anim" sx={{ p: 2, minHeight: 420, outline: isOver ? "2px solid rgba(255,30,75,0.65)" : "none" }}>
      <Stack spacing={1.2}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              {title}
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: 13 }}>
              {tasks.length} item(ns)
            </Typography>
          </Stack>
        </Stack>

        <Divider />

        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <Stack spacing={1}>
            {tasks.map((t) => (
              <TaskCard key={t.id} task={t} complexity={complexity} onRemove={onRemove} />
            ))}
            {tasks.length === 0 ? (
              <Typography color="text.secondary" sx={{ fontSize: 13 }}>
                Arraste tarefas para cá.
              </Typography>
            ) : null}
          </Stack>
        </SortableContext>
      </Stack>
    </Card>
  )
}

function findContainer(tasks: Task[], id: string): TaskStatus | undefined {
  if (id === 'todo' || id === 'doing' || id === 'done') return id
  const t = tasks.find((x) => x.id === id)
  return t?.status
}

export function TasksPage() {
  const { init, tasks, loading, error, add, remove, apply } = useTasksVM()
  const prefs = usePreferencesVM((s) => s.preferences)
  const award = useShellStore((s) => s.awardPointsForTask)

  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [points, setPoints] = useState('10')

  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('order')

  const [local, setLocal] = useState<Task[]>([])
  const [activeId, setActiveId] = useState<string | undefined>(undefined)

  useEffect(() => {
    void init()
  }, [init])

  // keep a local board state so drag interactions are smooth
  useEffect(() => {
    setLocal(tasks)
  }, [tasks])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return local
    return local.filter((t) => (t.title + ' ' + (t.description ?? '')).toLowerCase().includes(q))
  }, [local, query])

  const grouped = useMemo(() => {
    const todo = sortTasks(filtered.filter((t) => t.status === 'todo'), sortKey)
    const doing = sortTasks(filtered.filter((t) => t.status === 'doing'), sortKey)
    const done = sortTasks(filtered.filter((t) => t.status === 'done'), sortKey)
    return { todo, doing, done }
  }, [filtered, sortKey])

  const canAdd = title.trim().length >= 2 && Number(points) > 0

  const handleDragStart = (e: DragStartEvent) => {
    setActiveId(String(e.active.id))
  }

  const handleDragOver = (e: DragOverEvent) => {
    const active = String(e.active.id)
    const over = e.over?.id ? String(e.over.id) : undefined
    if (!over) return

    const activeContainer = findContainer(local, active)
    const overContainer = findContainer(local, over)

    // If dragging over an item in another container, move it immediately for better UX
    if (activeContainer && overContainer && activeContainer !== overContainer) {
      setLocal((prev) => prev.map((t) => (t.id === active ? { ...t, status: overContainer } : t)))
    }
  }

  const handleDragEnd = async (e: DragEndEvent) => {
    const active = String(e.active.id)
    const over = e.over?.id ? String(e.over.id) : undefined
    setActiveId(undefined)
    if (!over || active === over) return

    setLocal((prev) => {
      const activeContainer = findContainer(prev, active)
      const overContainer = findContainer(prev, over)
      if (!activeContainer || !overContainer) return prev

      const activeItems = prev.filter((t) => t.status === activeContainer).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      const overItems = prev.filter((t) => t.status === overContainer).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

      const activeIndex = activeItems.findIndex((t) => t.id === active)
      const overIndexRaw = overItems.findIndex((t) => t.id === over)
      const overIndex = overIndexRaw === -1 ? overItems.length : overIndexRaw

      // same column reorder
      if (activeContainer === overContainer) {
        const moved = arrayMove(activeItems, activeIndex, overIndex)
        const rest = prev.filter((t) => t.status !== activeContainer)
        const rebuilt = rest.concat(moved.map((t, i) => ({ ...t, order: i })))
        // persist outside setState (below)
        queueMicrotask(() => void apply(rebuilt))
        return rebuilt
      }

      // cross column: remove from active, insert into over
      const movingTask = activeItems[activeIndex]
      const nextActive = activeItems.filter((t) => t.id !== active).map((t, i) => ({ ...t, order: i }))
      const movingUpdated: Task = {
        ...movingTask,
        status: overContainer,
        completedAtISO: overContainer === 'done' ? (movingTask.completedAtISO ?? new Date().toISOString()) : undefined,
      }
      const nextOver = [
        ...overItems.slice(0, Math.max(0, overIndex)),
        movingUpdated,
        ...overItems.slice(Math.max(0, overIndex)),
      ].map((t, i) => ({ ...t, order: i }))

      const rest = prev.filter((t) => t.status !== activeContainer && t.status !== overContainer)
      const rebuilt = rest.concat(nextActive, nextOver)

      queueMicrotask(() => void apply(rebuilt))
      return rebuilt
    })
  }

  const activeTask = activeId ? local.find((t) => t.id === activeId) : undefined

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({ id: status })

  return (
    <Stack spacing={2}>
      <Card className="me-card me-anim" sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ md: 'center' }} justifyContent="space-between">
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900 }}>
                Kanban
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.4 }}>
                Arraste para mover entre colunas e reorganizar.
              </Typography>
            </Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} alignItems={{ sm: 'center' }}>
              <TextField
                label="Buscar"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Título ou descrição..."
                InputProps={{ startAdornment: <SearchIcon fontSize="small" /> as any }}
                sx={{ minWidth: 240 }}
              />
              <Select
                label="Ordenar"
                value={sortKey}
                onChange={(v) => setSortKey(v as SortKey)}
                sx={{ minWidth: 200 }}
                options={[
                  { value: 'order', label: 'Posição (Kanban)' },
                  { value: 'updatedAt', label: 'Atualização' },
                  { value: 'createdAt', label: 'Criação' },
                  { value: 'title', label: 'Nome' },
                  { value: 'points', label: 'Pontos' },
                ]}
              />
            </Stack>
          </Stack>

          <Divider />

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField label="Título" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Estudar aula 3" />
            </Grid>
            <Grid item xs={12} md={5}>
              <TextField
                label="Descrição"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder={prefs.complexity === 'simple' ? 'Opcional' : 'Ex: fazer resumo e exercícios'}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField label="Pontos" value={points} onChange={(e) => setPoints(e.target.value.replace(/[^0-9]/g, ''))} inputMode="numeric" />
            </Grid>
            <Grid item xs={12} md={1}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                disabled={!canAdd || loading}
                onClick={() => {
                  void add(title, desc, Number(points))
                  setTitle('')
                  setDesc('')
                  setPoints('10')
                }}
                fullWidth
              >
                Add
              </Button>
            </Grid>
          </Grid>

          {error ? <Alert severity="error">{error}</Alert> : null}
        </Stack>
      </Card>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Column title="A fazer" status="todo" tasks={grouped.todo} activeId={activeId} complexity={prefs.complexity} onRemove={(id) => void remove(id)} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Column title="Fazendo" status="doing" tasks={grouped.doing} activeId={activeId} complexity={prefs.complexity} onRemove={(id) => void remove(id)} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Column title="Feito" status="done" tasks={grouped.done} activeId={activeId} complexity={prefs.complexity} onRemove={(id) => void remove(id)} />
          </Grid>
        </Grid>

        <DragOverlay>
          {activeTask ? (
            <Box sx={{ width: 360, pointerEvents: 'none' }}>
              <TaskCard task={activeTask} complexity={prefs.complexity} onRemove={() => {}} />
            </Box>
          ) : null}
        </DragOverlay>
      </DndContext>
    </Stack>
  )
}
