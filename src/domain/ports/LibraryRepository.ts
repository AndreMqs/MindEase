import type { LibraryFolder } from '../entities/LibraryFolder'
import type { LibraryNote } from '../entities/LibraryNote'

export type LibrarySnapshot = {
  folders: LibraryFolder[]
  notes: LibraryNote[]
}

export interface LibraryRepository {
  getSnapshot(): Promise<LibrarySnapshot>
  saveSnapshot(next: LibrarySnapshot): Promise<void>
}
