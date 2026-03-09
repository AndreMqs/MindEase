/**
 * Firebase via SDK JavaScript (Web).
 * Mesma config e estrutura do MindEase Mobile para dados compartilhados (auth, Firestore, storage).
 */
import { getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import type { FirebaseApp } from 'firebase/app'
import { firebaseConfigFromEnv } from '../infra/config/firebase'

const envConfig = firebaseConfigFromEnv()
const firebaseConfig = envConfig ?? {
  apiKey: 'AIzaSyDMpGiN8QAvn6D2axKDITOiZGil2D9poIk',
  authDomain: 'mindease-19c82.firebaseapp.com',
  projectId: 'mindease-19c82',
  storageBucket: 'mindease-19c82.firebasestorage.app',
  messagingSenderId: '54485747949',
  appId: '1:54485747949:web:889640769b0dad54ee64e4',
  measurementId: 'G-CK7J44PC9M',
}

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId
)

const app: FirebaseApp = getApps().length
  ? (getApps()[0] as FirebaseApp)
  : initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export { app }
