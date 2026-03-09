import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
  updateEmail as firebaseUpdateEmail,
  updatePassword as firebaseUpdatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  type User as FirebaseUser,
} from 'firebase/auth'
import { auth } from '../../lib/firebase'
import type { AuthRepository } from '../../domain/ports/AuthRepository'
import type { User } from '../../domain/entities/User'
import { CreateUserProfileUseCase } from '../../domain/usecases/CreateUserProfileUseCase'

function mapFirebaseUserToUser(fbUser: FirebaseUser): User {
  return {
    id: fbUser.uid,
    email: fbUser.email ?? null,
    displayName: fbUser.displayName ?? null,
    photoURL: fbUser.photoURL ?? null,
  }
}

/**
 * Implementação do AuthRepository com Firebase Auth.
 * Mesmo fluxo e contratos do mobile; cria users/{uid} no cadastro.
 */
export class FirebaseAuthRepository implements AuthRepository {
  private readonly createUserProfile: CreateUserProfileUseCase
  constructor(createUserProfile: CreateUserProfileUseCase) {
    this.createUserProfile = createUserProfile
  }

  getCurrentUserSync(): User | null {
    const fbUser = auth.currentUser
    if (!fbUser) return null
    return mapFirebaseUserToUser(fbUser)
  }

  async getCurrentUser(): Promise<User | null> {
    return Promise.resolve(this.getCurrentUserSync())
  }

  subscribeAuthState(listener: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, (fbUser) => {
      listener(fbUser ? mapFirebaseUserToUser(fbUser) : null)
    })
  }

  async login(email: string, password: string): Promise<User> {
    const { user } = await signInWithEmailAndPassword(auth, email.trim(), password)
    return mapFirebaseUserToUser(user)
  }

  async register(email: string, password: string, displayName?: string): Promise<User> {
    const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password)
    const name = (displayName ?? email.trim()).trim() || email.trim()
    await firebaseUpdateProfile(user, { displayName: name })
    await this.createUserProfile.execute(user.uid, {
      name,
      email: user.email ?? email.trim(),
      acceptedTerms: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    return mapFirebaseUserToUser({ ...user, displayName: name } as FirebaseUser)
  }

  async logout(): Promise<void> {
    await firebaseSignOut(auth)
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    await firebaseSendPasswordResetEmail(auth, email.trim())
  }

  async updateProfile(data: { displayName?: string; email?: string }): Promise<void> {
    const user = auth.currentUser
    if (!user) throw new Error('Usuário não autenticado.')
    if (data.displayName != null) {
      await firebaseUpdateProfile(user, { displayName: data.displayName })
    }
    if (data.email != null) {
      await firebaseUpdateEmail(user, data.email.trim())
    }
  }

  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    const user = auth.currentUser
    if (!user?.email) throw new Error('Usuário não autenticado.')
    const cred = EmailAuthProvider.credential(user.email, currentPassword)
    await reauthenticateWithCredential(user, cred)
    await firebaseUpdatePassword(user, newPassword)
  }
}
