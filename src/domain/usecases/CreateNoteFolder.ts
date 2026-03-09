import type { NoteFolder } from '../entities/Note'
import type { NotesRepository } from '../ports/NotesRepository'

export class CreateNoteFolder {
  constructor(private readonly notesRepository: NotesRepository) {}

  execute(name: string): Promise<NoteFolder> {
    return this.notesRepository.createFolder(name)
  }
}
