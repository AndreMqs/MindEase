import type { NoteDocument } from '../entities/Note'
import type { NotesRepository } from '../ports/NotesRepository'

export class CreateNoteDocument {
  constructor(private readonly notesRepository: NotesRepository) {}

  execute(input: Omit<NoteDocument, 'id' | 'createdAtISO' | 'updatedAtISO'>): Promise<NoteDocument> {
    return this.notesRepository.createDocument(input)
  }
}
