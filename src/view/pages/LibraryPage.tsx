import { useEffect, useMemo, useState } from 'react'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'

import {
  DndContext,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useSortable } from '@dnd-kit/sortable'

import type { LibraryFolder } from '../../domain/entities/LibraryFolder'
import type { LibraryNote } from '../../domain/entities/LibraryNote'
import { useLibraryVM } from '../viewmodels/libraryVM'
import { usePreferencesVM } from '../viewmodels/preferencesVM'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { TextField } from '../components/TextField'
import { Select } from '../components/Select'
import { AddIcon, DeleteIcon, DragIndicatorIcon, SearchIcon } from '../icons'

type SortKey = 'order' | 'name' | 'updatedAt' | 'createdAt'

function sortFolders(list: LibraryFolder[], key: SortKey) {
  const copy = list.slice()
  switch (key) {
    case 'name':
      return copy.sort((a, b) => a.name.localeCompare(b.name))
    case 'createdAt':
      return copy.sort((a, b) => a.createdAt - b.createdAt)
    case 'updatedAt':
      return copy.sort((a, b) => b.updatedAt - a.updatedAt)
    case 'order':
    default:
      return copy.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  }
}

function sortNotes(list: LibraryNote[], key: SortKey) {
  const copy = list.slice()
  switch (key) {
    case 'name':
      return copy.sort((a, b) => a.title.localeCompare(b.title))
    case 'createdAt':
      return copy.sort((a, b) => a.createdAt - b.createdAt)
    case 'updatedAt':
      return copy.sort((a, b) => b.updatedAt - a.updatedAt)
    case 'order':
    default:
      return copy.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  }
}

function SortableRow({
  id,
  label,
  selected,
  secondary,
  onClick,
  onDelete,
}: {
  id: string
  label: string
  selected?: boolean
  secondary?: string
  onClick: () => void
  onDelete?: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.55 : 1,
  } as const

  return (
    <Card
      ref={setNodeRef as any}
      className="me-card me-anim"
      style={style as any}
      sx={{
        px: 1.2,
        py: 1,
        borderRadius: 2,
        border: '1px solid',
        borderColor: selected ? 'primary.main' : 'divider',
        backgroundColor: selected ? 'rgba(228,0,43,0.18)' : 'rgba(0,0,0,0.12)',
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <Tooltip title="Arraste para reorganizar / mover">
          <Box {...attributes} {...listeners} sx={{ cursor: 'grab', color: 'text.secondary', display: 'inline-flex' }}>
            <DragIndicatorIcon fontSize="small" />
          </Box>
        </Tooltip>

        <Box sx={{ flex: 1, cursor: 'pointer' }} onClick={onClick}>
          <Typography sx={{ fontWeight: 800, lineHeight: 1.2 }}>{label}</Typography>
          {secondary ? (
            <Typography color="text.secondary" sx={{ fontSize: 12 }}>
              {secondary}
            </Typography>
          ) : null}
        </Box>

        {onDelete ? (
          <Tooltip title="Remover">
            <IconButton size="small" onClick={onDelete}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : null}
      </Stack>
    </Card>
  )
}

export function LibraryPage() {
  const prefs = usePreferencesVM((s) => s.preferences)
  const vm = useLibraryVM()
  const { init, loading, error, folders, notes, selectedFolderId, selectedNoteId } = vm

  const [folderName, setFolderName] = useState('')
  const [noteTitle, setNoteTitle] = useState('')
  const [search, setSearch] = useState('')
  const [folderSort, setFolderSort] = useState<SortKey>('order')
  const [noteSort, setNoteSort] = useState<SortKey>('order')

  const [localFolders, setLocalFolders] = useState<LibraryFolder[]>([])
  const [localNotes, setLocalNotes] = useState<LibraryNote[]>([])
  const [activeId, setActiveId] = useState<string | undefined>(undefined)

  useEffect(() => {
    void init()
  }, [init])

  useEffect(() => {
    setLocalFolders(folders)
    setLocalNotes(notes)
  }, [folders, notes])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const filteredFolders = useMemo(() => {
    const q = search.trim().toLowerCase()
    const list = q ? localFolders.filter((f) => f.name.toLowerCase().includes(q)) : localFolders
    return sortFolders(list, folderSort)
  }, [localFolders, search, folderSort])

  const activeFolderId = selectedFolderId ?? filteredFolders[0]?.id

  const notesInFolder = useMemo(() => {
    const list = localNotes.filter((n) => n.folderId === activeFolderId)
    const q = search.trim().toLowerCase()
    const filtered = q ? list.filter((n) => (n.title + ' ' + n.content).toLowerCase().includes(q)) : list
    return sortNotes(filtered, noteSort)
  }, [localNotes, activeFolderId, search, noteSort])

  const selectedNote = useMemo(() => localNotes.find((n) => n.id === selectedNoteId), [localNotes, selectedNoteId])

  const normalizeFolderOrders = (next: LibraryFolder[]) => next.map((f, i) => ({ ...f, order: i }))
  const normalizeNoteOrdersForFolder = (folderId: string, all: LibraryNote[]) => {
    const inFolder = all.filter((n) => n.folderId === folderId).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    const other = all.filter((n) => n.folderId !== folderId)
    const normalized = inFolder.map((n, i) => ({ ...n, order: i }))
    return normalized.concat(other)
  }

  const handleDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id))

  const handleDragEnd = (e: DragEndEvent) => {
    const active = String(e.active.id)
    const over = e.over?.id ? String(e.over.id) : undefined
    setActiveId(undefined)
    if (!over || active === over) return

    // Folders reorder
    if (active.startsWith('folder:') && over.startsWith('folder:')) {
      const aId = active.replace('folder:', '')
      const oId = over.replace('folder:', '')
      setLocalFolders((prev) => {
        const ordered = sortFolders(prev, 'order')
        const from = ordered.findIndex((f) => f.id === aId)
        const to = ordered.findIndex((f) => f.id === oId)
        if (from === -1 || to === -1) return prev
        const moved = arrayMove(ordered, from, to)
        const normalized = normalizeFolderOrders(moved)
        // persist
        queueMicrotask(() => void vm.applySnapshot(normalized, localNotes))
        return normalized
      })
      return
    }

    // Notes: reorder or move between folders
    if (active.startsWith('note:')) {
      const noteId = active.replace('note:', '')

      setLocalNotes((prev) => {
        const current = prev.find((n) => n.id === noteId)
        if (!current) return prev

        // drop over a folder
        if (over.startsWith('folder:')) {
          const targetFolderId = over.replace('folder:', '')
          const movedNote: LibraryNote = { ...current, folderId: targetFolderId, updatedAt: Date.now() }
          const replaced = prev.map((n) => (n.id === noteId ? movedNote : n))
          const normalized = normalizeNoteOrdersForFolder(targetFolderId, normalizeNoteOrdersForFolder(current.folderId, replaced))
          queueMicrotask(() => void vm.applySnapshot(localFolders, normalized))
          // auto-select target folder to show the moved note (detailed mode makes this more visible)
          if (prefs.complexity !== 'simple') {
            vm.selectFolder(targetFolderId)
            vm.selectNote(noteId)
          }
          return normalized
        }

        // drop over another note (possibly in another folder)
        if (over.startsWith('note:')) {
          const overId = over.replace('note:', '')
          const overNote = prev.find((n) => n.id === overId)
          if (!overNote) return prev

          const sourceFolder = current.folderId
          const targetFolder = overNote.folderId

          const sourceList = prev.filter((n) => n.folderId === sourceFolder).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          const targetList = prev.filter((n) => n.folderId === targetFolder).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

          // same folder reorder
          if (sourceFolder === targetFolder) {
            const from = sourceList.findIndex((n) => n.id === noteId)
            const to = sourceList.findIndex((n) => n.id === overId)
            if (from === -1 || to === -1) return prev
            const moved = arrayMove(sourceList, from, to).map((n, i) => ({ ...n, order: i }))
            const other = prev.filter((n) => n.folderId !== sourceFolder)
            const rebuilt = other.concat(moved)
            queueMicrotask(() => void vm.applySnapshot(localFolders, rebuilt))
            return rebuilt
          }

          // cross folder: remove from source and insert into target
          const fromIdx = sourceList.findIndex((n) => n.id === noteId)
          const toIdx = targetList.findIndex((n) => n.id === overId)
          const moving = { ...current, folderId: targetFolder, updatedAt: Date.now() }

          const nextSource = sourceList.filter((n) => n.id !== noteId).map((n, i) => ({ ...n, order: i }))
          const nextTarget = [
            ...targetList.slice(0, toIdx),
            moving,
            ...targetList.slice(toIdx),
          ].map((n, i) => ({ ...n, order: i }))

          const other = prev.filter((n) => n.folderId !== sourceFolder && n.folderId !== targetFolder)
          const rebuilt = other.concat(nextSource, nextTarget)
          queueMicrotask(() => void vm.applySnapshot(localFolders, rebuilt))
          return rebuilt
        }

        return prev
      })
    }
  }

  return (
    <Stack spacing={2}>
      <Card className="me-card me-anim" sx={{ p: 2 }}>
        <Stack spacing={1.6}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ md: 'center' }} justifyContent="space-between">
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900 }}>
                Biblioteca
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.4 }}>
                Pastas e notas para anotações. Arraste para mover e reorganizar.
              </Typography>
            </Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} alignItems={{ sm: 'center' }}>
              <TextField
                label="Buscar"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pastas, notas, conteúdo..."
                sx={{ minWidth: 260 }}
                InputProps={{ startAdornment: <SearchIcon fontSize="small" /> as any }}
              />
              <Select
                label="Ordenar pastas"
                value={folderSort}
                onChange={(v) => setFolderSort(v as SortKey)}
                sx={{ minWidth: 190 }}
                options={[
                  { value: 'order', label: 'Posição' },
                  { value: 'name', label: 'Nome' },
                  { value: 'updatedAt', label: 'Atualização' },
                  { value: 'createdAt', label: 'Criação' },
                ]}
              />
              <Select
                label="Ordenar notas"
                value={noteSort}
                onChange={(v) => setNoteSort(v as SortKey)}
                sx={{ minWidth: 190 }}
                options={[
                  { value: 'order', label: 'Posição' },
                  { value: 'name', label: 'Nome' },
                  { value: 'updatedAt', label: 'Atualização' },
                  { value: 'createdAt', label: 'Criação' },
                ]}
              />
            </Stack>
          </Stack>

          <Divider />

          {error ? <Alert severity="error">{error}</Alert> : null}
        </Stack>
      </Card>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Card className="me-card me-anim" sx={{ p: 2, minHeight: 520 }}>
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <TextField
                    label="Nova pasta"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    placeholder="Ex: Aula 05"
                    fullWidth
                  />
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    disabled={folderName.trim().length < 2 || loading}
                    onClick={() => {
                      void vm.createFolder(folderName)
                      setFolderName('')
                    }}
                  >
                    Add
                  </Button>
                </Stack>

                <Divider />

                <SortableContext items={filteredFolders.map((f) => `folder:${f.id}`)} strategy={verticalListSortingStrategy}>
                  <Stack spacing={1}>
                    {filteredFolders.map((f) => (
                      <SortableRow
                        key={f.id}
                        id={`folder:${f.id}`}
                        label={f.name}
                        selected={f.id === activeFolderId}
                        secondary={prefs.complexity === 'detailed' ? `Atualizada: ${new Date(f.updatedAt).toLocaleString()}` : undefined}
                        onClick={() => vm.selectFolder(f.id)}
                        onDelete={f.id === 'default' ? undefined : () => void vm.deleteFolder(f.id)}
                      />
                    ))}
                    {filteredFolders.length === 0 ? (
                      <Typography color="text.secondary" sx={{ fontSize: 13 }}>
                        Nenhuma pasta. Crie uma para começar.
                      </Typography>
                    ) : null}
                  </Stack>
                </SortableContext>
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card className="me-card me-anim" sx={{ p: 2, minHeight: 520 }}>
              <Stack spacing={1.5}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }} justifyContent="space-between">
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 900 }}>
                      Notas
                    </Typography>
                    <Typography color="text.secondary" sx={{ fontSize: 13 }}>
                      Arraste notas para outra pasta no painel à esquerda.
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <TextField
                      label="Nova nota"
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      placeholder="Ex: Aula 03 - Hooks"
                      sx={{ minWidth: 240 }}
                    />
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      disabled={!activeFolderId || noteTitle.trim().length < 2 || loading}
                      onClick={() => {
                        if (!activeFolderId) return
                        void vm.createNote(activeFolderId, noteTitle)
                        setNoteTitle('')
                      }}
                    >
                      Add
                    </Button>
                  </Stack>
                </Stack>

                <Divider />

                <Grid container spacing={2}>
                  <Grid item xs={12} md={5}>
                    <SortableContext items={notesInFolder.map((n) => `note:${n.id}`)} strategy={verticalListSortingStrategy}>
                      <Stack spacing={1}>
                        {notesInFolder.map((n) => (
                          <SortableRow
                            key={n.id}
                            id={`note:${n.id}`}
                            label={n.title}
                            selected={n.id === selectedNoteId}
                            secondary={prefs.complexity === 'detailed' ? `Atualizada: ${new Date(n.updatedAt).toLocaleString()}` : undefined}
                            onClick={() => vm.selectNote(n.id)}
                            onDelete={() => void vm.deleteNote(n.id)}
                          />
                        ))}
                        {notesInFolder.length === 0 ? (
                          <Typography color="text.secondary" sx={{ fontSize: 13 }}>
                            Nenhuma nota nesta pasta.
                          </Typography>
                        ) : null}
                      </Stack>
                    </SortableContext>
                  </Grid>

                  <Grid item xs={12} md={7}>
                    {selectedNote ? (
                      <Stack spacing={1.2}>
                        <Typography variant="h6" sx={{ fontWeight: 900 }}>
                          {selectedNote.title}
                        </Typography>
                        {prefs.complexity !== 'simple' ? (
                          <Typography color="text.secondary" sx={{ fontSize: 13 }}>
                            Dica: use este campo para anotações rápidas durante a aula.
                          </Typography>
                        ) : null}
                        <TextField
                          label="Conteúdo"
                          value={selectedNote.content}
                          onChange={(e) => vm.updateNote(selectedNote.id, { content: e.target.value })}
                          multiline
                          minRows={8}
                        />
                      </Stack>
                    ) : (
                      <Typography color="text.secondary">Selecione uma nota para editar.</Typography>
                    )}
                  </Grid>
                </Grid>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </DndContext>
    </Stack>
  )
}
