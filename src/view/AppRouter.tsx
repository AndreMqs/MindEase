import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppLayout } from './layout/AppLayout'
import { PanelPage } from './pages/PanelPage'
import { TasksPage } from './pages/TasksPage'
import { ProfilePage } from './pages/ProfilePage'
import { SplashScreen } from './pages/SplashScreen'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { useAuth } from './context/AuthContext'

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

/** Redireciona para /login se não estiver autenticado. */
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isInitialized } = useAuth()
  const location = useLocation()

  if (!isInitialized) return null
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }
  return <>{children}</>
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/splash" replace />} />
      <Route path="/splash" element={<SplashScreen />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<RegisterPage />} />
      <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />

      <Route
        element={
          <AuthGuard>
            <AppLayout />
          </AuthGuard>
        }
      >
        <Route path="/panel" element={<PanelPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
