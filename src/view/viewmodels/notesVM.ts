import { create } from 'zustand'
import type { NoteDocument, NoteFolder } from '../../domain/entities/Note'
import { container } from '../../shared/container'

type NotesState = {
  loading: boolean
  saving: boolean
  error?: string
  folders: NoteFolder[]
  documents: NoteDocument[]
  init: () => Promise<void>
  createFolder: (name: string) => Promise<NoteFolder>
  renameFolder: (folderId: string, name: string) => Promise<NoteFolder>
  removeFolder: (folderId: string) => Promise<void>
  createDocument: (folderId: string, title: string) => Promise<NoteDocument>
  updateDocument: (document: NoteDocument) => Promise<NoteDocument>
  removeDocument: (documentId: string) => Promise<void>
}

function sortFolders(items: NoteFolder[]) {
  return [...items].sort((a, b) => a.name.localeCompare(b.name))
}

function sortDocuments(items: NoteDocument[]) {
  return [...items].sort((a, b) => b.updatedAtISO.localeCompare(a.updatedAtISO))
}

export const useNotesVM = create<NotesState>()((set, get) => ({
  loading: false,
  saving: false,
  error: undefined,
  folders: [],
  documents: [],

  async init() {
    set({ loading: true, error: undefined })
    try {
      const [folders, documents] = await Promise.all([
        container.usecases.listNoteFolders.execute(),
        container.usecases.listNoteDocuments.execute(),
      ])
      set({ folders: sortFolders(folders), documents: sortDocuments(documents), loading: false })
    } catch (e) {
      set({ loading: false, error: (e as Error).message })
    }
  },

  async createFolder(name) {
    set({ saving: true, error: undefined })
    try {
      const folder = await container.usecases.createNoteFolder.execute(name)
      set((state) => ({ folders: sortFolders([folder, ...state.folders]), saving: false }))
      return folder
    } catch (e) {
      set({ saving: false, error: (e as Error).message })
      throw e
    }
  },

  async renameFolder(folderId, name) {
    const current = get().folders.find((item) => item.id === folderId)
    if (!current) throw new Error('Pasta não encontrada.')
    set({ saving: true, error: undefined })
    try {
      const folder = await container.usecases.updateNoteFolder.execute({ ...current, name })
      set((state) => ({
        folders: sortFolders(state.folders.map((item) => (item.id === folder.id ? folder : item))),
        saving: false,
      }))
      return folder
    } catch (e) {
      set({ saving: false, error: (e as Error).message })
      throw e
    }
  },

  async removeFolder(folderId) {
    set({ saving: true, error: undefined })
    try {
      await container.usecases.removeNoteFolder.execute(folderId)
      set((state) => ({
        folders: state.folders.filter((folder) => folder.id !== folderId),
        documents: state.documents.filter((document) => document.folderId !== folderId),
        saving: false,
      }))
    } catch (e) {
      set({ saving: false, error: (e as Error).message })
      throw e
    }
  },

  async createDocument(folderId, title) {
    set({ saving: true, error: undefined })
    try {
      const document = await container.usecases.createNoteDocument.execute({
        folderId,
        title,
        content: '',
      })
      set((state) => ({ documents: sortDocuments([document, ...state.documents]), saving: false }))
      return document
    } catch (e) {
      set({ saving: false, error: (e as Error).message })
      throw e
    }
  },

  async updateDocument(document) {
    set({ saving: true, error: undefined })
    try {
      const updated = await container.usecases.updateNoteDocument.execute(document)
      set((state) => ({
        documents: sortDocuments(
          state.documents.map((item) => (item.id === updated.id ? updated : item))
        ),
        saving: false,
      }))
      return updated
    } catch (e) {
      set({ saving: false, error: (e as Error).message })
      throw e
    }
  },

  async removeDocument(documentId) {
    set({ saving: true, error: undefined })
    try {
      await container.usecases.removeNoteDocument.execute(documentId)
      set((state) => ({
        documents: state.documents.filter((document) => document.id !== documentId),
        saving: false,
      }))
    } catch (e) {
      set({ saving: false, error: (e as Error).message })
      throw e
    }
  },
}))
