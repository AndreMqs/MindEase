import { GetPreferences } from '../domain/usecases/GetPreferences'
import { SetPreferences } from '../domain/usecases/SetPreferences'
import { ListTasks } from '../domain/usecases/ListTasks'
import { CreateTask } from '../domain/usecases/CreateTask'
import { UpdateTask } from '../domain/usecases/UpdateTask'
import { MoveTask } from '../domain/usecases/MoveTask'
import { RemoveTask } from '../domain/usecases/RemoveTask'
import { LibraryUseCases } from '../domain/usecases/library'

import { PreferencesRepositoryLocalStorage } from '../infra/repositories/PreferencesRepositoryLocalStorage'
import { TasksRepositoryLocalStorage } from '../infra/repositories/TasksRepositoryLocalStorage'
import { LocalStorageLibraryRepository } from '../infra/repositories/LocalStorageLibraryRepository'

// "Composition root". Aqui você troca facilmente do mock/localStorage para Firebase.
export const container = (() => {
  const preferencesRepo = new PreferencesRepositoryLocalStorage()
  const tasksRepo = new TasksRepositoryLocalStorage()
  const libraryRepo = new LocalStorageLibraryRepository()

  return {
    repos: {
      preferencesRepo,
      tasksRepo,
      libraryRepo,
    },
    usecases: {
      getPreferences: new GetPreferences(preferencesRepo),
      setPreferences: new SetPreferences(preferencesRepo),

      listTasks: new ListTasks(tasksRepo),
      createTask: new CreateTask(tasksRepo),
      updateTask: new UpdateTask(tasksRepo),
      moveTask: new MoveTask(tasksRepo),
      removeTask: new RemoveTask(tasksRepo),

      library: new LibraryUseCases(libraryRepo),
    },
  }
})()
