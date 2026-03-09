import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppLayout } from './layout/AppLayout'
import { SplashScreen } from './pages/SplashScreen'
import { useAuth } from './context/AuthContext'

const PanelPage = lazy(() => import('./pages/PanelPage').then((m) => ({ default: m.PanelPage })))
const TasksPage = lazy(() => import('./pages/TasksPage').then((m) => ({ default: m.TasksPage })))
const ProfilePage = lazy(() =>
  import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage }))
)
const NotesPage = lazy(() => import('./pages/NotesPage').then((m) => ({ default: m.NotesPage })))
const StorePage = lazy(() => import('./pages/StorePage').then((m) => ({ default: m.StorePage })))
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })))
const RegisterPage = lazy(() =>
  import('./pages/RegisterPage').then((m) => ({ default: m.RegisterPage }))
)
const ForgotPasswordPage = lazy(() =>
  import('./pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage }))
)
const TermsPage = lazy(() => import('./pages/TermsPage').then((m) => ({ default: m.TermsPage })))

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
    <Suspense fallback={<SplashScreen />}>
      <Routes>
        <Route path="/" element={<Navigate to="/splash" replace />} />
        <Route path="/splash" element={<SplashScreen />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<RegisterPage />} />
        <Route path="/termos-de-uso" element={<TermsPage />} />
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
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/store" element={<StorePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
