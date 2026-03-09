import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  limit as firestoreLimit,
  type DocumentData,
  type WhereFilterOp,
} from 'firebase/firestore'
import { db } from '../../lib/firebase'
import type { IDatabaseDataSource } from '../data-sources/database/IDatabaseDataSource'

/**
 * Implementação do data source de banco com Firestore.
 * Mesma estrutura do mobile para users/{userId} (profile, preferences, kanban.tasks).
 */
export class FirebaseFirestoreDataSource implements IDatabaseDataSource {
  async get<T>(collectionName: string, id: string): Promise<T | null> {
    const ref = doc(db, collectionName, id)
    const snapshot = await getDoc(ref)
    if (!snapshot.exists()) return null
    return { id: snapshot.id, ...snapshot.data() } as T
  }

  async set<T>(collectionName: string, id: string, data: T): Promise<void> {
    const ref = doc(db, collectionName, id)
    await setDoc(ref, data as DocumentData)
  }

  async update<T extends Record<string, unknown>>(
    collectionName: string,
    id: string,
    data: Partial<T>
  ): Promise<void> {
    const ref = doc(db, collectionName, id)
    await updateDoc(ref, data as DocumentData)
  }

  async delete(collectionName: string, id: string): Promise<void> {
    const ref = doc(db, collectionName, id)
    await deleteDoc(ref)
  }

  async query<T>(
    collectionName: string,
    options?: { where?: Array<[string, string, unknown]>; limit?: number }
  ): Promise<T[]> {
    const colRef = collection(db, collectionName)
    const constraints: ReturnType<typeof where>[] = []
    if (options?.where?.length) {
      for (const [field, op, value] of options.where) {
        constraints.push(where(field, op as WhereFilterOp, value))
      }
    }
    const q =
      constraints.length > 0
        ? options?.limit != null
          ? query(colRef, ...constraints, firestoreLimit(options.limit))
          : query(colRef, ...constraints)
        : options?.limit != null
          ? query(colRef, firestoreLimit(options.limit))
          : colRef
    const snapshot = await getDocs(q)
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as T)
  }
}
