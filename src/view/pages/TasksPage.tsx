import React, { useEffect, useMemo, useRef, useState } from 'react'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'
import Snackbar from '@mui/material/Snackbar'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

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

import type { Task, TaskStatus, ChecklistItem } from '../../domain/entities/Task'
import { ROUTINE_POMODORO } from '../../domain/entities/Preferences'
import { useTasksVM } from '../viewmodels/tasksVM'
import { usePreferencesVM } from '../viewmodels/preferencesVM'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { TextField } from '../components/TextField'
import { Select } from '../components/Select'
import Checkbox from '@mui/material/Checkbox'
import { AddIcon, DeleteIcon, DragIndicatorIcon, SearchIcon, TimerIcon } from '../icons'

type SortKey = 'order' | 'title' | 'updatedAt' | 'createdAt' | 'points'

function formatRelativeDate(iso: string): string {
  const d = new Date(iso)
  const today = new Date()
  if (d.toDateString() === today.toDateString()) return 'hoje'
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return 'ontem'
  return d.toLocaleDateString()
}

/** Segundos em foco (rodando ou pausado). */
function getFocusElapsed(task: Task): number {
  if (task.focusTimerStartedAt == null) return 0
  if (task.focusTimerPausedAt != null) {
    return Math.floor((task.focusTimerPausedAt - task.focusTimerStartedAt) / 1000)
  }
  return Math.floor((Date.now() - task.focusTimerStartedAt) / 1000)
}

function formatFocusTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function isFocusRunning(task: Task): boolean {
  return task.focusTimerStartedAt != null && task.focusTimerPausedAt == null
}

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
  onUpdate,
  onMove,
  animationsEnabled = true,
  onStartFocus,
}: {
  task: Task
  complexity: 'simple' | 'standard' | 'detailed'
  onRemove: (id: string) => void
  onUpdate: (task: Task) => void
  onMove: (id: string, status: TaskStatus) => void
  animationsEnabled?: boolean
  onStartFocus?: (taskId: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: animationsEnabled ? transition : 'none',
    opacity: isDragging ? 0.45 : 1,
  } as const

  const focusElapsed = getFocusElapsed(task)
  const focusRunning = isFocusRunning(task)
  const checklistTotal = task.checklist?.length ?? 0
  const checklistDone = task.checklist?.filter((c) => c.done).length ?? 0
  const allChecklistDone = checklistTotal > 0 && checklistDone === checklistTotal

  const handleToggleCheck = (itemId: string, checked: boolean) => {
    const nextChecklist = (task.checklist ?? []).map((c) => (c.id === itemId ? { ...c, done: checked } : c))
    onUpdate({ ...task, checklist: nextChecklist, updatedAtISO: new Date().toISOString() })
  }

  const handleFocusToggle = () => {
    if (focusRunning) {
      onUpdate({
        ...task,
        focusTimerPausedAt: Date.now(),
        updatedAtISO: new Date().toISOString(),
      })
    } else if (task.focusTimerStartedAt != null && task.focusTimerPausedAt != null) {
      const elapsedMs = task.focusTimerPausedAt - task.focusTimerStartedAt
      onUpdate({
        ...task,
        focusTimerStartedAt: Date.now() - elapsedMs,
        focusTimerPausedAt: undefined,
        updatedAtISO: new Date().toISOString(),
      })
    } else {
      // Iniciar foco: só notifica o pai; ele aplica o update (e aviso de transição se houver)
      onStartFocus?.(task.id)
    }
  }

  return (
    <Card
      ref={setNodeRef as React.RefCallback<HTMLDivElement>}
      className="me-card me-anim"
      style={style as React.CSSProperties}
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
            sx={{ mt: 0.3, cursor: 'grab', color: 'text.secondary', display: 'inline-flex' }}
            className="me-anim"
          >
            <DragIndicatorIcon fontSize="small" />
          </Box>
        </Tooltip>

        <Stack spacing={0.6} sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
            <Typography sx={{ fontWeight: 800, lineHeight: 1.2 }}>{task.title}</Typography>
            <Chip className="me-complexity-simple-hide" size="small" label={`${task.points ?? 0} pts`} variant="outlined" />
            {task.focusTimerStartedAt != null && (
              <Chip size="small" icon={<TimerIcon sx={{ fontSize: 14 }} />} label={`⏱ ${formatFocusTime(focusElapsed)}`} variant="outlined" />
            )}
            {complexity === 'detailed' && task.completedAtISO && (
              <Chip size="small" label={`Concluída: ${new Date(task.completedAtISO).toLocaleDateString()}`} />
            )}
          </Stack>

          {(complexity !== 'simple' || checklistTotal > 0) && checklistTotal > 0 ? (
            <Stack direction="row" alignItems="center" flexWrap="wrap" gap={0.5}>
              <Typography color="text.secondary" sx={{ fontSize: 12 }}>
                Checklist: {checklistDone}/{checklistTotal}
              </Typography>
              {focusElapsed > 0 && (
                <Typography color="text.secondary" sx={{ fontSize: 12 }}>
                  • Foco: {Math.floor(focusElapsed / 60)} min
                </Typography>
              )}
            </Stack>
          ) : null}

          {task.checklist?.length ? (
            <Stack spacing={0.25}>
              {task.checklist.map((item: ChecklistItem) => (
                <Stack key={item.id} direction="row" alignItems="center" spacing={0.5}>
                  <Checkbox
                    size="small"
                    checked={item.done}
                    onChange={(_, checked) => handleToggleCheck(item.id, checked)}
                    sx={{ py: 0, px: 0.5 }}
                  />
                  <Typography sx={{ fontSize: 13, textDecoration: item.done ? 'line-through' : 'none', color: item.done ? 'text.secondary' : 'text.primary' }}>
                    {item.label}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          ) : null}

          {allChecklistDone && task.status !== 'done' ? (
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
              <Typography sx={{ fontSize: 13, color: 'success.main' }}>✔ {checklistDone}/{checklistTotal} etapas concluídas</Typography>
              <Button size="small" variant="outlined" onClick={() => onMove(task.id, 'done')}>
                Mover para Feito
              </Button>
            </Stack>
          ) : null}

          <Stack direction="row" alignItems="center" spacing={0.5} flexWrap="wrap">
            <Button
              size="small"
              variant={focusRunning ? 'contained' : 'outlined'}
              startIcon={<TimerIcon />}
              onClick={handleFocusToggle}
            >
              {focusRunning ? 'Em foco' : task.focusTimerStartedAt != null ? 'Retomar' : 'Iniciar foco'}
            </Button>
          </Stack>

          {task.description ? (
            <Typography className="me-task-description" color="text.secondary" sx={{ fontSize: 13, lineHeight: 1.35 }}>
              {task.description}
            </Typography>
          ) : null}

          {complexity === 'detailed' ? (
            <Typography color="text.secondary" sx={{ fontSize: 12 }}>
              {task.points ?? 0} pts • criada {formatRelativeDate(task.createdAtISO)} • atualizada {formatRelativeDate(task.updatedAtISO)}
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
  complexity,
  onRemove,
  onUpdate,
  onMove,
  onStartFocus,
  animationsEnabled = true,
}: {
  title: string
  status: TaskStatus
  tasks: Task[]
  complexity: 'simple' | 'standard' | 'detailed'
  onRemove: (id: string) => void
  onUpdate: (task: Task) => void
  onMove: (id: string, status: TaskStatus) => void
  onStartFocus?: (taskId: string) => void
  animationsEnabled?: boolean
}) {
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({ id: status })

  return (
    <Card
      ref={setDroppableRef as React.RefCallback<HTMLDivElement>}
      className="me-card me-anim"
      sx={{
        p: 2,
        minHeight: 420,
        outline: isOver ? '2px solid rgba(76, 154, 255, 0.5)' : 'none',
        transition: animationsEnabled ? 'outline 0.18s ease' : 'none',
      }}
    >
      <Stack spacing={1.2}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              {title}
            </Typography>
            <Typography className="me-focus-hide me-complexity-simple-hide" color="text.secondary" sx={{ fontSize: 13 }}>
              {tasks.length} item(ns)
            </Typography>
          </Stack>
        </Stack>

        <Divider />

        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <Stack spacing={1}>
            {tasks.map((t) => (
              <TaskCard
                key={t.id}
                task={t}
                complexity={complexity}
                onRemove={onRemove}
                onUpdate={onUpdate}
                onMove={onMove}
                onStartFocus={onStartFocus}
                animationsEnabled={animationsEnabled}
              />
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

const COGNITIVE_LIMIT_DOING = 3

export function TasksPage() {
  const { init, tasks, loading, error, add, remove, update, move, apply } = useTasksVM()
  const prefs = usePreferencesVM((s) => s.preferences)

  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [points, setPoints] = useState('10')

  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('order')

  const [local, setLocal] = useState<Task[]>([])
  const [activeId, setActiveId] = useState<string | undefined>(undefined)

  const [snackOpen, setSnackOpen] = useState(false)
  const [snackMessage, setSnackMessage] = useState('')
  const [alert45Open, setAlert45Open] = useState(false)
  const [alert45TaskTitle, setAlert45TaskTitle] = useState('')
  const [cognitiveTick, setCognitiveTick] = useState(0)
  const [timerTick, setTimerTick] = useState(0)
  const cognitiveShownRef = useRef<{ taskId: string; shown15: boolean; shown30: boolean; shown45: boolean }>({ taskId: '', shown15: false, shown30: false, shown45: false })
  const pomodoro25ShownRef = useRef<Set<string>>(new Set())

  const [transitionDialogOpen, setTransitionDialogOpen] = useState(false)
  const [transitionPayload, setTransitionPayload] = useState<{ fromTaskId: string; toTaskId: string; fromTitle: string } | null>(null)
  const [cognitiveLimitSnackOpen, setCognitiveLimitSnackOpen] = useState(false)
  const [doneDialogOpen, setDoneDialogOpen] = useState(false)
  const [doneDialogTaskId, setDoneDialogTaskId] = useState<string | null>(null)
  const [nextTaskSuggestion, setNextTaskSuggestion] = useState<{ taskId: string; title: string } | null>(null)

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

  // 8️⃣ Alertas cognitivos: 15 min toast, 30 min toast, 45 min modal (usa grouped, por isso depois do useMemo)
  useEffect(() => {
    if (!prefs.cognitiveAlertsEnabled || grouped.doing.length === 0) return
    const taskInDoing = grouped.doing.reduce((oldest, t) =>
      (oldest ? new Date(t.updatedAtISO).getTime() < new Date(oldest.updatedAtISO).getTime() : true) ? t : oldest,
    null as Task | null)
    if (!taskInDoing) return
    const minutes = (Date.now() - new Date(taskInDoing.updatedAtISO).getTime()) / 60000
    const { taskId } = cognitiveShownRef.current
    if (taskId !== taskInDoing.id) {
      cognitiveShownRef.current = { taskId: taskInDoing.id, shown15: false, shown30: false, shown45: false }
    }
    const cur = cognitiveShownRef.current
    if (minutes >= 45 && !cur.shown45) {
      cur.shown45 = true
      setAlert45TaskTitle(taskInDoing.title)
      setAlert45Open(true)
    } else if (minutes >= 30 && !cur.shown30) {
      cur.shown30 = true
      setSnackMessage(`🧠 Você está nesta tarefa há 30 minutos. Talvez seja uma boa hora para uma pausa.`)
      setSnackOpen(true)
    } else if (minutes >= 15 && !cur.shown15) {
      cur.shown15 = true
      setSnackMessage(`🧠 Você está nesta tarefa há 15 minutos. Que tal revisar ou fazer uma pausa?`)
      setSnackOpen(true)
    }
  }, [prefs.cognitiveAlertsEnabled, grouped.doing, cognitiveTick])

  useEffect(() => {
    if (!prefs.cognitiveAlertsEnabled) return
    const id = setInterval(() => setCognitiveTick((t) => t + 1), 60_000)
    return () => clearInterval(id)
  }, [prefs.cognitiveAlertsEnabled])

  const hasAnyFocusRunning = local.some((t) => isFocusRunning(t))
  useEffect(() => {
    if (!hasAnyFocusRunning) return
    const id = setInterval(() => setTimerTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [hasAnyFocusRunning])

  const pomodoroMinutes = ROUTINE_POMODORO[prefs.routine].focusMinutes
  useEffect(() => {
    if (!prefs.cognitiveAlertsEnabled) return
    local.forEach((task) => {
      if (!isFocusRunning(task)) return
      const elapsed = getFocusElapsed(task)
      if (elapsed >= pomodoroMinutes * 60 && !pomodoro25ShownRef.current.has(task.id)) {
        pomodoro25ShownRef.current.add(task.id)
        setSnackMessage(`⏱ Pausa sugerida: você está há ${pomodoroMinutes} min em foco. Que tal uma pausa?`)
        setSnackOpen(true)
      }
    })
  }, [prefs.cognitiveAlertsEnabled, prefs.routine, pomodoroMinutes, local, timerTick])

  const handleStartFocus = (taskId: string) => {
    const task = local.find((t) => t.id === taskId)
    if (!task) return
    const otherWithFocus = local.find((t) => t.id !== taskId && isFocusRunning(t))
    if (otherWithFocus) {
      setTransitionPayload({
        fromTaskId: otherWithFocus.id,
        fromTitle: otherWithFocus.title,
        toTaskId: taskId,
      })
      setTransitionDialogOpen(true)
      return
    }
    const others = local.filter((t) => t.id !== taskId && (t.focusTimerStartedAt != null))
    others.forEach((t) => void update({ ...t, focusTimerStartedAt: undefined, focusTimerPausedAt: undefined, updatedAtISO: new Date().toISOString() }))
    void update({ ...task, focusTimerStartedAt: Date.now(), focusTimerPausedAt: undefined, updatedAtISO: new Date().toISOString() })
  }

  const handleTransitionTrocar = () => {
    if (!transitionPayload) return
    const { fromTaskId, toTaskId } = transitionPayload
    const fromTask = local.find((t) => t.id === fromTaskId)
    const toTask = local.find((t) => t.id === toTaskId)
    if (fromTask) void update({ ...fromTask, focusTimerStartedAt: undefined, focusTimerPausedAt: undefined, updatedAtISO: new Date().toISOString() })
    if (toTask) void update({ ...toTask, focusTimerStartedAt: Date.now(), focusTimerPausedAt: undefined, updatedAtISO: new Date().toISOString() })
    setTransitionDialogOpen(false)
    setTransitionPayload(null)
  }

  const handleTransitionContinuar = () => {
    setTransitionDialogOpen(false)
    setTransitionPayload(null)
  }

  useEffect(() => {
    if (grouped.doing.length >= COGNITIVE_LIMIT_DOING && prefs.cognitiveAlertsEnabled) {
      setCognitiveLimitSnackOpen(true)
    }
  }, [grouped.doing.length, prefs.cognitiveAlertsEnabled])

  const handleMoveOrShowDoneDialog = (id: string, status: TaskStatus) => {
    if (status === 'done') {
      setDoneDialogTaskId(id)
      setDoneDialogOpen(true)
    } else {
      void move(id, status)
    }
  }

  const handleDoneDialogDepois = () => {
    if (doneDialogTaskId) void move(doneDialogTaskId, 'done')
    setDoneDialogOpen(false)
    setDoneDialogTaskId(null)
  }

  const handleDoneDialogSim = () => {
    if (!doneDialogTaskId) return
    const todo = grouped.todo.filter((t) => t.id !== doneDialogTaskId)
    const doing = grouped.doing.filter((t) => t.id !== doneDialogTaskId)
    const next = todo[0] ?? doing[0]
    void move(doneDialogTaskId, 'done')
    setDoneDialogOpen(false)
    setDoneDialogTaskId(null)
    if (next) setNextTaskSuggestion({ taskId: next.id, title: next.title })
  }

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

            <Stack className="me-focus-hide" direction={{ xs: 'column', sm: 'row' }} spacing={1.2} alignItems={{ sm: 'center' }}>
              <TextField
                label="Buscar"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Título ou descrição..."
                InputProps={{ startAdornment: <SearchIcon fontSize="small" /> }}
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

          {prefs.navigationProfile === 'assisted' ? (
            <Alert severity="info" icon={false}>
              <Typography component="span" sx={{ fontWeight: 600 }}>💡 Dica</Typography>
              <Typography component="span" sx={{ ml: 0.5 }}>Você pode arrastar tarefas entre colunas.</Typography>
            </Alert>
          ) : null}

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
            <Column title="A fazer" status="todo" tasks={grouped.todo} complexity={prefs.complexity} onRemove={(id) => void remove(id)} onUpdate={(t) => void update(t)} onMove={handleMoveOrShowDoneDialog} onStartFocus={handleStartFocus} animationsEnabled={prefs.animationsEnabled} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Column title="Fazendo" status="doing" tasks={grouped.doing} complexity={prefs.complexity} onRemove={(id) => void remove(id)} onUpdate={(t) => void update(t)} onMove={handleMoveOrShowDoneDialog} onStartFocus={handleStartFocus} animationsEnabled={prefs.animationsEnabled} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Column title="Feito" status="done" tasks={grouped.done} complexity={prefs.complexity} onRemove={(id) => void remove(id)} onUpdate={(t) => void update(t)} onMove={handleMoveOrShowDoneDialog} onStartFocus={handleStartFocus} animationsEnabled={prefs.animationsEnabled} />
          </Grid>
        </Grid>

        <DragOverlay>
          {activeTask ? (
            <Box sx={{ width: 360, pointerEvents: 'none' }}>
              <TaskCard task={activeTask} complexity={prefs.complexity} onRemove={() => {}} onUpdate={() => {}} onMove={() => {}} animationsEnabled={prefs.animationsEnabled} />
            </Box>
          ) : null}
        </DragOverlay>
      </DndContext>

      <Snackbar
        open={snackOpen}
        autoHideDuration={6000}
        onClose={() => setSnackOpen(false)}
        message={snackMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />

      <Dialog open={alert45Open} onClose={() => setAlert45Open(false)} maxWidth="sm" fullWidth>
        <DialogTitle>🧠 Pausa sugerida</DialogTitle>
        <DialogContent>
          <Typography>
            Você está na tarefa &quot;{alert45TaskTitle}&quot; há 45 minutos ou mais.
          </Typography>
          <Typography sx={{ mt: 1 }}>
            Sugerimos uma pausa para manter o foco e o bem-estar.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAlert45Open(false)}>Entendi</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={transitionDialogOpen} onClose={handleTransitionContinuar} maxWidth="xs" fullWidth>
        <DialogTitle>Mudança de atividade</DialogTitle>
        <DialogContent>
          <Typography>
            Você está mudando de atividade. Deseja finalizar a tarefa atual (&quot;{transitionPayload?.fromTitle ?? ''}&quot;) e iniciar foco na nova?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleTransitionContinuar}>Continuar na atual</Button>
          <Button variant="contained" onClick={handleTransitionTrocar}>Trocar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={cognitiveLimitSnackOpen}
        autoHideDuration={8000}
        onClose={() => setCognitiveLimitSnackOpen(false)}
        message={`Você já tem ${grouped.doing.length} tarefas em andamento. Talvez seja melhor finalizar uma antes de iniciar outra.`}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />

      <Dialog open={doneDialogOpen} onClose={handleDoneDialogDepois} maxWidth="xs" fullWidth>
        <DialogTitle>Boa! 🎉</DialogTitle>
        <DialogContent>
          <Typography>Deseja iniciar a próxima tarefa?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDoneDialogDepois}>Depois</Button>
          <Button variant="contained" onClick={handleDoneDialogSim}>Sim</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!nextTaskSuggestion}
        autoHideDuration={null}
        onClose={() => setNextTaskSuggestion(null)}
        message={nextTaskSuggestion ? `Próxima tarefa sugerida: ${nextTaskSuggestion.title}` : ''}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        action={
          nextTaskSuggestion ? (
            <Button size="small" color="primary" onClick={() => { handleStartFocus(nextTaskSuggestion.taskId); setNextTaskSuggestion(null); }}>
              Iniciar foco
            </Button>
          ) : null
        }
      />
    </Stack>
  )
}
