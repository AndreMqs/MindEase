import type { NotesRepository } from '../ports/NotesRepository'

export class RemoveNoteFolder {
  constructor(private readonly notesRepository: NotesRepository) {}

  execute(id: string): Promise<void> {
    return this.notesRepository.removeFolder(id)
  }
}
