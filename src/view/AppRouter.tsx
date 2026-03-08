import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './layout/AppLayout'
import { PanelPage } from './pages/PanelPage'
import { TasksPage } from './pages/TasksPage'
import { ProfilePage } from './pages/ProfilePage'

function NotFound() {
  return (
    <section className="me-card me-anim">
      <h2 style={{ marginTop: 0 }}>Página não encontrada</h2>
      <p className="me-muted" style={{ marginTop: 0 }}>
        Use o menu para navegar.
      </p>
    </section>
  )
}

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/panel" replace />} />
        <Route path="/panel" element={<PanelPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
