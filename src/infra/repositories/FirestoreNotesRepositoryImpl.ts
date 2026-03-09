import type { NoteDocument, NoteFolder } from '../../domain/entities/Note'
import type { IDatabaseRepository } from '../../domain/ports/DatabaseRepository'

const USERS_COLLECTION = 'users'

type UserDoc = {
  id?: string
  notes?: {
    folders?: Record<string, unknown>
    documents?: Record<string, unknown>
  }
}

function nowISO() {
  return new Date().toISOString()
}

function makeId(prefix: 'folder' | 'note') {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) out[key] = value
  }
  return out
}

function getNotes(raw: UserDoc | null): NonNullable<UserDoc['notes']> {
  if (!raw?.notes || typeof raw.notes !== 'object') {
    return { folders: {}, documents: {} }
  }
  return {
    folders: raw.notes.folders && typeof raw.notes.folders === 'object' ? raw.notes.folders : {},
    documents:
      raw.notes.documents && typeof raw.notes.documents === 'object' ? raw.notes.documents : {},
  }
}

function mapFolder(raw: Record<string, unknown>, id: string): NoteFolder {
  const now = nowISO()
  return {
    id,
    name: String(raw.name ?? ''),
    createdAtISO: typeof raw.createdAtISO === 'string' ? raw.createdAtISO : now,
    updatedAtISO: typeof raw.updatedAtISO === 'string' ? raw.updatedAtISO : now,
  }
}

function mapDocument(raw: Record<string, unknown>, id: string): NoteDocument {
  const now = nowISO()
  return {
    id,
    folderId: String(raw.folderId ?? ''),
    title: String(raw.title ?? ''),
    content: typeof raw.content === 'string' ? raw.content : '',
    createdAtISO: typeof raw.createdAtISO === 'string' ? raw.createdAtISO : now,
    updatedAtISO: typeof raw.updatedAtISO === 'string' ? raw.updatedAtISO : now,
  }
}

export class FirestoreNotesRepositoryImpl {
  constructor(private readonly databaseRepository: IDatabaseRepository) {}

  private async getNotesRaw(userId: string) {
    const userDoc = await this.databaseRepository.get<UserDoc>(USERS_COLLECTION, userId)
    return getNotes(userDoc)
  }

  private async setNotes(userId: string, notes: NonNullable<UserDoc['notes']>) {
    await this.databaseRepository.update(USERS_COLLECTION, userId, { notes } as Partial<UserDoc>)
  }

  async listFolders(userId: string): Promise<NoteFolder[]> {
    const notes = await this.getNotesRaw(userId)
    return Object.entries(notes.folders ?? {})
      .map(([id, raw]) => mapFolder((raw as Record<string, unknown>) ?? {}, id))
      .sort((a, b) => a.name.localeCompare(b.name))
  }

  async createFolder(userId: string, name: string): Promise<NoteFolder> {
    const notes = await this.getNotesRaw(userId)
    const now = nowISO()
    const folder: NoteFolder = {
      id: makeId('folder'),
      name: name.trim(),
      createdAtISO: now,
      updatedAtISO: now,
    }
    await this.setNotes(userId, {
      ...notes,
      folders: {
        ...(notes.folders ?? {}),
        [folder.id]: stripUndefined(folder as unknown as Record<string, unknown>),
      },
    })
    return folder
  }

  async updateFolder(userId: string, folder: NoteFolder): Promise<NoteFolder> {
    const notes = await this.getNotesRaw(userId)
    const next: NoteFolder = { ...folder, updatedAtISO: nowISO() }
    await this.setNotes(userId, {
      ...notes,
      folders: {
        ...(notes.folders ?? {}),
        [next.id]: stripUndefined(next as unknown as Record<string, unknown>),
      },
    })
    return next
  }

  async removeFolder(userId: string, id: string): Promise<void> {
    const notes = await this.getNotesRaw(userId)
    const folders = { ...(notes.folders ?? {}) }
    const documents = { ...(notes.documents ?? {}) }
    delete folders[id]
    for (const [documentId, raw] of Object.entries(documents)) {
      const folderId = (raw as Record<string, unknown>)?.folderId
      if (folderId === id) delete documents[documentId]
    }
    await this.setNotes(userId, { ...notes, folders, documents })
  }

  async listDocuments(userId: string): Promise<NoteDocument[]> {
    const notes = await this.getNotesRaw(userId)
    return Object.entries(notes.documents ?? {})
      .map(([id, raw]) => mapDocument((raw as Record<string, unknown>) ?? {}, id))
      .sort((a, b) => b.updatedAtISO.localeCompare(a.updatedAtISO))
  }

  async createDocument(
    userId: string,
    input: Omit<NoteDocument, 'id' | 'createdAtISO' | 'updatedAtISO'>
  ): Promise<NoteDocument> {
    const notes = await this.getNotesRaw(userId)
    const now = nowISO()
    const document: NoteDocument = {
      id: makeId('note'),
      folderId: input.folderId,
      title: input.title.trim(),
      content: input.content,
      createdAtISO: now,
      updatedAtISO: now,
    }
    await this.setNotes(userId, {
      ...notes,
      documents: {
        ...(notes.documents ?? {}),
        [document.id]: stripUndefined(document as unknown as Record<string, unknown>),
      },
    })
    return document
  }

  async updateDocument(userId: string, document: NoteDocument): Promise<NoteDocument> {
    const notes = await this.getNotesRaw(userId)
    const next: NoteDocument = {
      ...document,
      title: document.title.trim(),
      updatedAtISO: nowISO(),
    }
    await this.setNotes(userId, {
      ...notes,
      documents: {
        ...(notes.documents ?? {}),
        [next.id]: stripUndefined(next as unknown as Record<string, unknown>),
      },
    })
    return next
  }

  async removeDocument(userId: string, id: string): Promise<void> {
    const notes = await this.getNotesRaw(userId)
    const documents = { ...(notes.documents ?? {}) }
    delete documents[id]
    await this.setNotes(userId, { ...notes, documents })
  }
}
