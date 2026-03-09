import type { NoteDocument } from '../entities/Note'
import type { NotesRepository } from '../ports/NotesRepository'

export class ListNoteDocuments {
  constructor(private readonly notesRepository: NotesRepository) {}

  execute(): Promise<NoteDocument[]> {
    return this.notesRepository.listDocuments()
  }
}
