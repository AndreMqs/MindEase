import type { NoteDocument } from '../entities/Note'
import type { NotesRepository } from '../ports/NotesRepository'

export class UpdateNoteDocument {
  constructor(private readonly notesRepository: NotesRepository) {}

  execute(document: NoteDocument): Promise<NoteDocument> {
    return this.notesRepository.updateDocument(document)
  }
}
