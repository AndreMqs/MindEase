import type { NoteDocument, NoteFolder } from '../entities/Note'

export interface NotesRepository {
  listFolders(): Promise<NoteFolder[]>
  createFolder(name: string): Promise<NoteFolder>
  updateFolder(folder: NoteFolder): Promise<NoteFolder>
  removeFolder(id: string): Promise<void>

  listDocuments(): Promise<NoteDocument[]>
  createDocument(input: Omit<NoteDocument, 'id' | 'createdAtISO' | 'updatedAtISO'>): Promise<NoteDocument>
  updateDocument(document: NoteDocument): Promise<NoteDocument>
  removeDocument(id: string): Promise<void>
}
