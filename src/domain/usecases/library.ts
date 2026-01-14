import type { LibraryRepository, LibrarySnapshot } from '../ports/LibraryRepository'
import type { LibraryFolder } from '../entities/LibraryFolder'
import type { LibraryNote } from '../entities/LibraryNote'

const now = () => Date.now()
const uid = () => Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)

export class LibraryUseCases {
  constructor(private repo: LibraryRepository) {}

  async load() {
    return this.repo.getSnapshot()
  }

  async save(next: LibrarySnapshot) {
    await this.repo.saveSnapshot(next)
  }

  async createFolder(name: string): Promise<LibraryFolder> {
    const snap = await this.repo.getSnapshot()
    const folder: LibraryFolder = { id: uid(), name: name.trim() || 'Sem título', createdAt: now(), updatedAt: now(), order: -1 }
    const folders = [folder, ...snap.folders].map((f, i) => ({ ...f, order: i }))
    const next = { ...snap, folders }
    await this.repo.saveSnapshot(next)
    return folder
  }

  async renameFolder(folderId: string, name: string): Promise<void> {
    const snap = await this.repo.getSnapshot()
    const nextFolders = snap.folders.map((f) =>
      f.id === folderId ? { ...f, name: name.trim() || f.name, updatedAt: now() } : f,
    )
    await this.repo.saveSnapshot({ ...snap, folders: nextFolders })
  }

  async deleteFolder(folderId: string): Promise<void> {
    const snap = await this.repo.getSnapshot()
    const nextFolders = snap.folders.filter((f) => f.id !== folderId)
    const nextNotes = snap.notes.filter((n) => n.folderId !== folderId)
    await this.repo.saveSnapshot({ folders: nextFolders, notes: nextNotes })
  }

  async createNote(folderId: string, title = 'Nova nota'): Promise<LibraryNote> {
    const snap = await this.repo.getSnapshot()
    const note: LibraryNote = {
      id: uid(),
      folderId,
      title: title.trim() || 'Nova nota',
      content: '',
      createdAt: now(),
      updatedAt: now(),
    }
    const notesInFolder = snap.notes.filter((n) => n.folderId === folderId)
    const other = snap.notes.filter((n) => n.folderId !== folderId)
    const notes = [{ ...note }, ...notesInFolder]
      .map((n, i) => ({ ...n, order: i }))
      .concat(other)
    const next = { ...snap, notes }
    await this.repo.saveSnapshot(next)
    return note
  }

  async updateNote(noteId: string, patch: Partial<Pick<LibraryNote, 'title' | 'content' | 'folderId'>>): Promise<void> {
    const snap = await this.repo.getSnapshot()
    const nextNotes = snap.notes.map((n) =>
      n.id === noteId ? { ...n, ...patch, updatedAt: now() } : n,
    )
    await this.repo.saveSnapshot({ ...snap, notes: nextNotes })
  }

  async deleteNote(noteId: string): Promise<void> {
    const snap = await this.repo.getSnapshot()
    await this.repo.saveSnapshot({ ...snap, notes: snap.notes.filter((n) => n.id !== noteId) })
  }
}
