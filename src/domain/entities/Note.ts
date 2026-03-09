export interface NoteFolder {
  id: string
  name: string
  createdAtISO: string
  updatedAtISO: string
}

export interface NoteDocument {
  id: string
  folderId: string
  title: string
  content: string
  createdAtISO: string
  updatedAtISO: string
}
