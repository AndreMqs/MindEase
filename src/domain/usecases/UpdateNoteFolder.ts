import type { NoteFolder } from '../entities/Note'
import type { NotesRepository } from '../ports/NotesRepository'

export class UpdateNoteFolder {
  constructor(private readonly notesRepository: NotesRepository) {}

  execute(folder: NoteFolder): Promise<NoteFolder> {
    return this.notesRepository.updateFolder(folder)
  }
}
