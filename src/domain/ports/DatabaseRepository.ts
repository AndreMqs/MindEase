/**
 * Contrato genérico para acesso ao Firestore (users/{userId}, etc.).
 * Mesmo contrato do mobile; implementação em infra.
 */
export interface IDatabaseRepository {
  get<T>(collection: string, id: string): Promise<T | null>
  set<T>(collection: string, id: string, data: T): Promise<void>
  update<T extends Record<string, unknown>>(
    collection: string,
    id: string,
    data: Partial<T>
  ): Promise<void>
  delete(collection: string, id: string): Promise<void>
  query<T>(
    collection: string,
    options?: { where?: Array<[string, string, unknown]>; limit?: number }
  ): Promise<T[]>
}
