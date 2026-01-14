import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './layout/AppLayout'
import { PanelPage } from './pages/PanelPage'
import { TasksPage } from './pages/TasksPage'
import { ProfilePage } from './pages/ProfilePage'
import { LibraryPage } from './pages/LibraryPage'
import { PurchasesPage } from './pages/PurchasesPage'
import { SummaryPage } from './pages/SummaryPage'

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
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/summary" element={<SummaryPage />} />
        <Route path="/purchases" element={<PurchasesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
