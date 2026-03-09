import type { NoteDocument, NoteFolder } from '../../domain/entities/Note'
import type { NotesRepository } from '../../domain/ports/NotesRepository'

const KEY = 'mindease:notes'

function nowISO() {
  return new Date().toISOString()
}

function makeId(prefix: 'folder' | 'note') {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

type NotesStorage = {
  folders: NoteFolder[]
  documents: NoteDocument[]
}

function seedData(): NotesStorage {
  const now = nowISO()
  const mathId = 'folder_math'
  const historyId = 'folder_history'
  return {
    folders: [
      { id: mathId, name: 'Matemática', createdAtISO: now, updatedAtISO: now },
      { id: historyId, name: 'História', createdAtISO: now, updatedAtISO: now },
    ],
    documents: [
      {
        id: 'note_math_1',
        folderId: mathId,
        title: 'Aula 01 - Funções',
        content: 'Definição de função\n\nf(x) = ax + b\n\nExemplo:\nf(2) = 3',
        createdAtISO: now,
        updatedAtISO: now,
      },
      {
        id: 'note_history_1',
        folderId: historyId,
        title: 'Roma Antiga',
        content: 'Resumo da aula:\n- República\n- Senado\n- Expansão territorial',
        createdAtISO: now,
        updatedAtISO: now,
      },
    ],
  }
}

function normalizeFolder(raw: Record<string, unknown>): NoteFolder {
  const now = nowISO()
  return {
    id: String(raw.id ?? makeId('folder')),
    name: String(raw.name ?? ''),
    createdAtISO: typeof raw.createdAtISO === 'string' ? raw.createdAtISO : now,
    updatedAtISO: typeof raw.updatedAtISO === 'string' ? raw.updatedAtISO : now,
  }
}

function normalizeDocument(raw: Record<string, unknown>): NoteDocument {
  const now = nowISO()
  return {
    id: String(raw.id ?? makeId('note')),
    folderId: String(raw.folderId ?? ''),
    title: String(raw.title ?? ''),
    content: typeof raw.content === 'string' ? raw.content : '',
    createdAtISO: typeof raw.createdAtISO === 'string' ? raw.createdAtISO : now,
    updatedAtISO: typeof raw.updatedAtISO === 'string' ? raw.updatedAtISO : now,
  }
}

function load(): NotesStorage {
  const raw = localStorage.getItem(KEY)
  if (!raw) {
    const seeded = seedData()
    localStorage.setItem(KEY, JSON.stringify(seeded))
    return seeded
  }
  try {
    const parsed = JSON.parse(raw) as Partial<NotesStorage>
    return {
      folders: Array.isArray(parsed.folders) ? parsed.folders.map((item) => normalizeFolder(item as Record<string, any>)) : [],
      documents: Array.isArray(parsed.documents)
        ? parsed.documents.map((item) => normalizeDocument(item as Record<string, any>))
        : [],
    }
  } catch {
    const seeded = seedData()
    localStorage.setItem(KEY, JSON.stringify(seeded))
    return seeded
  }
}

function save(data: NotesStorage) {
  localStorage.setItem(KEY, JSON.stringify(data))
}

export class NotesRepositoryLocalStorage implements NotesRepository {
  async listFolders(): Promise<NoteFolder[]> {
    return load().folders.sort((a, b) => a.name.localeCompare(b.name))
  }

  async createFolder(name: string): Promise<NoteFolder> {
    const data = load()
    const now = nowISO()
    const folder: NoteFolder = {
      id: makeId('folder'),
      name: name.trim(),
      createdAtISO: now,
      updatedAtISO: now,
    }
    save({ ...data, folders: [folder, ...data.folders] })
    return folder
  }

  async updateFolder(folder: NoteFolder): Promise<NoteFolder> {
    const data = load()
    const next: NoteFolder = { ...folder, updatedAtISO: nowISO() }
    save({
      ...data,
      folders: data.folders.map((item) => (item.id === folder.id ? next : item)),
    })
    return next
  }

  async removeFolder(id: string): Promise<void> {
    const data = load()
    save({
      folders: data.folders.filter((folder) => folder.id !== id),
      documents: data.documents.filter((document) => document.folderId !== id),
    })
  }

  async listDocuments(): Promise<NoteDocument[]> {
    return load().documents.sort((a, b) => b.updatedAtISO.localeCompare(a.updatedAtISO))
  }

  async createDocument(input: Omit<NoteDocument, 'id' | 'createdAtISO' | 'updatedAtISO'>): Promise<NoteDocument> {
    const data = load()
    const now = nowISO()
    const document: NoteDocument = {
      id: makeId('note'),
      folderId: input.folderId,
      title: input.title.trim(),
      content: input.content,
      createdAtISO: now,
      updatedAtISO: now,
    }
    save({ ...data, documents: [document, ...data.documents] })
    return document
  }

  async updateDocument(document: NoteDocument): Promise<NoteDocument> {
    const data = load()
    const next: NoteDocument = {
      ...document,
      title: document.title.trim(),
      updatedAtISO: nowISO(),
    }
    save({
      ...data,
      documents: data.documents.map((item) => (item.id === document.id ? next : item)),
    })
    return next
  }

  async removeDocument(id: string): Promise<void> {
    const data = load()
    save({ ...data, documents: data.documents.filter((document) => document.id !== id) })
  }
}
