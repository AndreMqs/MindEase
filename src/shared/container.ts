import { GetPreferences } from '../domain/usecases/GetPreferences'
import { SetPreferences } from '../domain/usecases/SetPreferences'
import { ListTasks } from '../domain/usecases/ListTasks'
import { CreateTask } from '../domain/usecases/CreateTask'
import { UpdateTask } from '../domain/usecases/UpdateTask'
import { MoveTask } from '../domain/usecases/MoveTask'
import { RemoveTask } from '../domain/usecases/RemoveTask'
import { CreateUserProfileUseCase } from '../domain/usecases/CreateUserProfileUseCase'

import { PreferencesRepositoryLocalStorage } from '../infra/repositories/PreferencesRepositoryLocalStorage'
import { TasksRepositoryLocalStorage } from '../infra/repositories/TasksRepositoryLocalStorage'
import { FakeAuthRepository } from '../infra/auth/FakeAuthRepository'
import { FirebaseAuthRepository } from '../infra/auth/FirebaseAuthRepository'
import { FirebaseFirestoreDataSource } from '../infra/firebase/FirebaseFirestoreDataSource'
import { FirestoreDatabaseRepository } from '../infra/repositories/FirestoreDatabaseRepository'
import { FirestoreTasksRepositoryImpl } from '../infra/repositories/FirestoreTasksRepositoryImpl'
import { FirestorePreferencesRepositoryImpl } from '../infra/repositories/FirestorePreferencesRepositoryImpl'
import { TasksRepositoryFirebase } from '../infra/repositories/TasksRepositoryFirebase'
import { PreferencesRepositoryFirebase } from '../infra/repositories/PreferencesRepositoryFirebase'

import type { AuthRepository } from '../domain/ports/AuthRepository'
import type { TasksRepository } from '../domain/ports/TasksRepository'
import type { PreferencesRepository } from '../domain/ports/PreferencesRepository'
import { isFirebaseConfigured } from '../lib/firebase'

type Container = {
  repos: {
    authRepo: AuthRepository
    tasksRepo: TasksRepository
    preferencesRepo: PreferencesRepository
  }
  usecases: {
    getPreferences: GetPreferences
    setPreferences: SetPreferences
    listTasks: ListTasks
    createTask: CreateTask
    updateTask: UpdateTask
    moveTask: MoveTask
    removeTask: RemoveTask
  }
}

function buildContainer(): Container {
  if (!isFirebaseConfigured) {
    const preferencesRepo = new PreferencesRepositoryLocalStorage()
    const tasksRepo = new TasksRepositoryLocalStorage()
    const authRepo = new FakeAuthRepository()
    return {
      repos: { authRepo, tasksRepo, preferencesRepo },
      usecases: {
        getPreferences: new GetPreferences(preferencesRepo),
        setPreferences: new SetPreferences(preferencesRepo),
        listTasks: new ListTasks(tasksRepo),
        createTask: new CreateTask(tasksRepo),
        updateTask: new UpdateTask(tasksRepo),
        moveTask: new MoveTask(tasksRepo),
        removeTask: new RemoveTask(tasksRepo),
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
  const tasksRepo = new TasksRepositoryFirebase(getCurrentUserId, tasksImpl)
  const preferencesRepo = new PreferencesRepositoryFirebase(getCurrentUserId, preferencesImpl)

  return {
    repos: { authRepo, tasksRepo, preferencesRepo },
    usecases: {
      getPreferences: new GetPreferences(preferencesRepo),
      setPreferences: new SetPreferences(preferencesRepo),
      listTasks: new ListTasks(tasksRepo),
      createTask: new CreateTask(tasksRepo),
      updateTask: new UpdateTask(tasksRepo),
      moveTask: new MoveTask(tasksRepo),
      removeTask: new RemoveTask(tasksRepo),
    },
  }
}

export const container = buildContainer()
