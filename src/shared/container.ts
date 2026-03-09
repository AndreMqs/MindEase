import { GetPreferences } from '../domain/usecases/GetPreferences'
import { SetPreferences } from '../domain/usecases/SetPreferences'
import { ListTasks } from '../domain/usecases/ListTasks'
import { CreateTask } from '../domain/usecases/CreateTask'
import { UpdateTask } from '../domain/usecases/UpdateTask'
import { MoveTask } from '../domain/usecases/MoveTask'
import { RemoveTask } from '../domain/usecases/RemoveTask'
import { CreateUserProfileUseCase } from '../domain/usecases/CreateUserProfileUseCase'
import { ListNoteFolders } from '../domain/usecases/ListNoteFolders'
import { CreateNoteFolder } from '../domain/usecases/CreateNoteFolder'
import { UpdateNoteFolder } from '../domain/usecases/UpdateNoteFolder'
import { RemoveNoteFolder } from '../domain/usecases/RemoveNoteFolder'
import { ListNoteDocuments } from '../domain/usecases/ListNoteDocuments'
import { CreateNoteDocument } from '../domain/usecases/CreateNoteDocument'
import { UpdateNoteDocument } from '../domain/usecases/UpdateNoteDocument'
import { RemoveNoteDocument } from '../domain/usecases/RemoveNoteDocument'

import { PreferencesRepositoryLocalStorage } from '../infra/repositories/PreferencesRepositoryLocalStorage'
import { TasksRepositoryLocalStorage } from '../infra/repositories/TasksRepositoryLocalStorage'
import { NotesRepositoryLocalStorage } from '../infra/repositories/NotesRepositoryLocalStorage'
import { FakeAuthRepository } from '../infra/auth/FakeAuthRepository'
import { FirebaseAuthRepository } from '../infra/auth/FirebaseAuthRepository'
import { FirebaseFirestoreDataSource } from '../infra/firebase/FirebaseFirestoreDataSource'
import { FirestoreDatabaseRepository } from '../infra/repositories/FirestoreDatabaseRepository'
import { FirestoreTasksRepositoryImpl } from '../infra/repositories/FirestoreTasksRepositoryImpl'
import { FirestorePreferencesRepositoryImpl } from '../infra/repositories/FirestorePreferencesRepositoryImpl'
import { TasksRepositoryFirebase } from '../infra/repositories/TasksRepositoryFirebase'
import { PreferencesRepositoryFirebase } from '../infra/repositories/PreferencesRepositoryFirebase'
import { FirestoreNotesRepositoryImpl } from '../infra/repositories/FirestoreNotesRepositoryImpl'
import { NotesRepositoryFirebase } from '../infra/repositories/NotesRepositoryFirebase'

import type { AuthRepository } from '../domain/ports/AuthRepository'
import type { TasksRepository } from '../domain/ports/TasksRepository'
import type { PreferencesRepository } from '../domain/ports/PreferencesRepository'
import type { NotesRepository } from '../domain/ports/NotesRepository'
import { isFirebaseConfigured } from '../lib/firebase'

type Container = {
  repos: {
    authRepo: AuthRepository
    tasksRepo: TasksRepository
    preferencesRepo: PreferencesRepository
    notesRepo: NotesRepository
  }
  usecases: {
    getPreferences: GetPreferences
    setPreferences: SetPreferences
    listTasks: ListTasks
    createTask: CreateTask
    updateTask: UpdateTask
    moveTask: MoveTask
    removeTask: RemoveTask
    listNoteFolders: ListNoteFolders
    createNoteFolder: CreateNoteFolder
    updateNoteFolder: UpdateNoteFolder
    removeNoteFolder: RemoveNoteFolder
    listNoteDocuments: ListNoteDocuments
    createNoteDocument: CreateNoteDocument
    updateNoteDocument: UpdateNoteDocument
    removeNoteDocument: RemoveNoteDocument
  }
}

function buildContainer(): Container {
  if (!isFirebaseConfigured) {
    const preferencesRepo = new PreferencesRepositoryLocalStorage()
    const tasksRepo = new TasksRepositoryLocalStorage()
    const notesRepo = new NotesRepositoryLocalStorage()
    const authRepo = new FakeAuthRepository()

    return {
      repos: { authRepo, tasksRepo, preferencesRepo, notesRepo },
      usecases: {
        getPreferences: new GetPreferences(preferencesRepo),
        setPreferences: new SetPreferences(preferencesRepo),
        listTasks: new ListTasks(tasksRepo),
        createTask: new CreateTask(tasksRepo),
        updateTask: new UpdateTask(tasksRepo),
        moveTask: new MoveTask(tasksRepo),
        removeTask: new RemoveTask(tasksRepo),
        listNoteFolders: new ListNoteFolders(notesRepo),
        createNoteFolder: new CreateNoteFolder(notesRepo),
        updateNoteFolder: new UpdateNoteFolder(notesRepo),
        removeNoteFolder: new RemoveNoteFolder(notesRepo),
        listNoteDocuments: new ListNoteDocuments(notesRepo),
        createNoteDocument: new CreateNoteDocument(notesRepo),
        updateNoteDocument: new UpdateNoteDocument(notesRepo),
        removeNoteDocument: new RemoveNoteDocument(notesRepo),
      },
    }
  }

  const firestoreDataSource = new FirebaseFirestoreDataSource()
  const databaseRepo = new FirestoreDatabaseRepository(firestoreDataSource)
  const createUserProfileUseCase = new CreateUserProfileUseCase(databaseRepo)
  const authRepo: AuthRepository = new FirebaseAuthRepository(createUserProfileUseCase)
  const getCurrentUserId = (): string | null => authRepo.getCurrentUserSync()?.id ?? null
  const tasksImpl = new FirestoreTasksRepositoryImpl(databaseRepo)
  const preferencesImpl = new FirestorePreferencesRepositoryImpl(databaseRepo)
  const notesImpl = new FirestoreNotesRepositoryImpl(databaseRepo)
  const tasksRepo = new TasksRepositoryFirebase(getCurrentUserId, tasksImpl)
  const preferencesRepo = new PreferencesRepositoryFirebase(getCurrentUserId, preferencesImpl)
  const notesRepo = new NotesRepositoryFirebase(getCurrentUserId, notesImpl)

  return {
    repos: { authRepo, tasksRepo, preferencesRepo, notesRepo },
    usecases: {
      getPreferences: new GetPreferences(preferencesRepo),
      setPreferences: new SetPreferences(preferencesRepo),
      listTasks: new ListTasks(tasksRepo),
      createTask: new CreateTask(tasksRepo),
      updateTask: new UpdateTask(tasksRepo),
      moveTask: new MoveTask(tasksRepo),
      removeTask: new RemoveTask(tasksRepo),
      listNoteFolders: new ListNoteFolders(notesRepo),
      createNoteFolder: new CreateNoteFolder(notesRepo),
      updateNoteFolder: new UpdateNoteFolder(notesRepo),
      removeNoteFolder: new RemoveNoteFolder(notesRepo),
      listNoteDocuments: new ListNoteDocuments(notesRepo),
      createNoteDocument: new CreateNoteDocument(notesRepo),
      updateNoteDocument: new UpdateNoteDocument(notesRepo),
      removeNoteDocument: new RemoveNoteDocument(notesRepo),
    },
  }
}

export const container = buildContainer()
