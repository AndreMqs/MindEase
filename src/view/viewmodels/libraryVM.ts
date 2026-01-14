import { create } from 'zustand'
import { container } from '../../shared/container'
import type { LibraryFolder } from '../../domain/entities/LibraryFolder'
import type { LibraryNote } from '../../domain/entities/LibraryNote'

type LibraryState = {
  loading: boolean
  error?: string

  folders: LibraryFolder[]
  notes: LibraryNote[]

  selectedFolderId?: string
  selectedNoteId?: string

  init: () => Promise<void>

  applySnapshot: (folders: LibraryFolder[], notes: LibraryNote[]) => Promise<void>

  selectFolder: (folderId: string) => void
  selectNote: (noteId: string) => void

  createFolder: (name: string) => Promise<void>
  renameFolder: (folderId: string, name: string) => Promise<void>
  deleteFolder: (folderId: string) => Promise<void>

  createNote: (folderId: string, title?: string) => Promise<void>
  updateNote: (noteId: string, patch: Partial<Pick<LibraryNote, 'title' | 'content'>>) => Promise<void>
  deleteNote: (noteId: string) => Promise<void>
}

export const useLibraryVM = create<LibraryState>((set, get) => ({
  loading: false,
  folders: [],
  notes: [],

  init: async () => {
    set({ loading: true, error: undefined })
    try {
      const snap = await container.usecases.library.load()
      const firstFolder = snap.folders[0]?.id
      const firstNote = snap.notes.find((n) => n.folderId === firstFolder)?.id
      set({
        folders: snap.folders,
        notes: snap.notes,
        selectedFolderId: firstFolder,
        selectedNoteId: firstNote,
        loading: false,
      })
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : 'Erro ao carregar biblioteca' })
    }
  },

  selectFolder: (folderId) => {
    const notes = get().notes.filter((n) => n.folderId === folderId)
    set({ selectedFolderId: folderId, selectedNoteId: notes[0]?.id })
  },

  selectNote: (noteId) => set({ selectedNoteId: noteId }),

  createFolder: async (name) => {
    set({ loading: true, error: undefined })
    try {
      const folder = await container.usecases.library.createFolder(name)
      const snap = await container.usecases.library.load()
      set({
        folders: snap.folders,
        notes: snap.notes,
        selectedFolderId: folder.id,
        selectedNoteId: snap.notes.find((n) => n.folderId === folder.id)?.id,
        loading: false,
      })
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : 'Erro ao criar pasta' })
    }
  },

  renameFolder: async (folderId, name) => {
    set({ loading: true, error: undefined })
    try {
      await container.usecases.library.renameFolder(folderId, name)
      const snap = await container.usecases.library.load()
      set({ folders: snap.folders, notes: snap.notes, loading: false })
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : 'Erro ao renomear pasta' })
    }
  },

  deleteFolder: async (folderId) => {
    set({ loading: true, error: undefined })
    try {
      await container.usecases.library.deleteFolder(folderId)
      const snap = await container.usecases.library.load()
      const nextFolder = snap.folders[0]?.id
      const nextNote = snap.notes.find((n) => n.folderId === nextFolder)?.id
      set({
        folders: snap.folders,
        notes: snap.notes,
        selectedFolderId: nextFolder,
        selectedNoteId: nextNote,
        loading: false,
      })
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : 'Erro ao remover pasta' })
    }
  },

  createNote: async (folderId, title) => {
    set({ loading: true, error: undefined })
    try {
      const note = await container.usecases.library.createNote(folderId, title)
      const snap = await container.usecases.library.load()
      set({
        folders: snap.folders,
        notes: snap.notes,
        selectedFolderId: folderId,
        selectedNoteId: note.id,
        loading: false,
      })
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : 'Erro ao criar nota' })
    }
  },

  updateNote: async (noteId, patch) => {
    try {
      await container.usecases.library.updateNote(noteId, patch)
      const snap = await container.usecases.library.load()
      set({ folders: snap.folders, notes: snap.notes })
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Erro ao salvar nota' })
    }
  },

  deleteNote: async (noteId) => {
    set({ loading: true, error: undefined })
    try {
      await container.usecases.library.deleteNote(noteId)
      const snap = await container.usecases.library.load()
      const { selectedFolderId } = get()
      const nextNote = snap.notes.find((n) => n.folderId === selectedFolderId)?.id
      set({ folders: snap.folders, notes: snap.notes, selectedNoteId: nextNote, loading: false })
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : 'Erro ao remover nota' })
    }
  },
  async applySnapshot(folders, notes) {
    set({ folders, notes, error: undefined })
    try {
      await container.usecases.library.save({ folders, notes })
    } catch (e) {
      await get().init()
      set({ error: (e as Error).message })
    }
  },

}))
