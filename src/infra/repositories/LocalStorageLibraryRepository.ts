import type { LibraryRepository, LibrarySnapshot } from '../../domain/ports/LibraryRepository'

const KEY = 'mindease-library-v1'

const defaultSnapshot = (): LibrarySnapshot => ({
  folders: [
    { id: 'default', name: 'Aulas', createdAt: Date.now(), updatedAt: Date.now(), order: 0 },
  ],
  notes: [
    {
      id: 'welcome',
      folderId: 'default',
      title: 'Bem-vindo(a)!',
      content:
        'Crie pastas para separar matérias e use notas para registrar pontos importantes.\n\nDica: use o Painel Cognitivo para ajustar o nível de detalhe e o contraste.',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ],
})

export class LocalStorageLibraryRepository implements LibraryRepository {
  async getSnapshot(): Promise<LibrarySnapshot> {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaultSnapshot()
    try {
      return JSON.parse(raw) as LibrarySnapshot
    } catch {
      return defaultSnapshot()
    }
  }

  async saveSnapshot(next: LibrarySnapshot): Promise<void> {
    localStorage.setItem(KEY, JSON.stringify(next))
  }
}
