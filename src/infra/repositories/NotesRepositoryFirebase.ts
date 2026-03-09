import type { NoteDocument, NoteFolder } from '../../domain/entities/Note'
import type { NotesRepository } from '../../domain/ports/NotesRepository'
import { FirestoreNotesRepositoryImpl } from './FirestoreNotesRepositoryImpl'

export class NotesRepositoryFirebase implements NotesRepository {
  constructor(
    private readonly getCurrentUserId: () => string | null,
    private readonly impl: FirestoreNotesRepositoryImpl,
  ) {}

  private requireUserId() {
    const uid = this.getCurrentUserId()
    if (!uid) throw new Error('Usuário não autenticado.')
    return uid
  }

  listFolders(): Promise<NoteFolder[]> {
    return this.impl.listFolders(this.requireUserId())
  }

  createFolder(name: string): Promise<NoteFolder> {
    return this.impl.createFolder(this.requireUserId(), name)
  }

  updateFolder(folder: NoteFolder): Promise<NoteFolder> {
    return this.impl.updateFolder(this.requireUserId(), folder)
  }

  removeFolder(id: string): Promise<void> {
    return this.impl.removeFolder(this.requireUserId(), id)
  }

  listDocuments(): Promise<NoteDocument[]> {
    return this.impl.listDocuments(this.requireUserId())
  }

  createDocument(input: Omit<NoteDocument, 'id' | 'createdAtISO' | 'updatedAtISO'>): Promise<NoteDocument> {
    return this.impl.createDocument(this.requireUserId(), input)
  }

  updateDocument(document: NoteDocument): Promise<NoteDocument> {
    return this.impl.updateDocument(this.requireUserId(), document)
  }

  removeDocument(id: string): Promise<void> {
    return this.impl.removeDocument(this.requireUserId(), id)
  }
}
