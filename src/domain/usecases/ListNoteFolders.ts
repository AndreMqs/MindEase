import type { NoteFolder } from '../entities/Note'
import type { NotesRepository } from '../ports/NotesRepository'

export class ListNoteFolders {
  constructor(private readonly notesRepository: NotesRepository) {}

  execute(): Promise<NoteFolder[]> {
    return this.notesRepository.listFolders()
  }
}
