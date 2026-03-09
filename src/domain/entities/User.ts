/** Alinhado ao mobile/Firebase Auth (email pode ser null até carregar). */
export interface User {
  id: string
  email: string | null
  displayName: string | null
  photoURL?: string | null
}
