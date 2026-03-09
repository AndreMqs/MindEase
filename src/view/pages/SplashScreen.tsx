import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import { useAuth } from '../context/AuthContext'

const SPLASH_DURATION_MS = 1800

export function SplashScreen() {
  const navigate = useNavigate()
  const { user, isInitialized } = useAuth()

  useEffect(() => {
    if (!isInitialized) return
    const timer = setTimeout(() => {
      if (user) {
        navigate('/panel', { replace: true })
      } else {
        navigate('/login', { replace: true })
      }
    }, SPLASH_DURATION_MS)
    return () => clearTimeout(timer)
  }, [isInitialized, user, navigate])

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        backgroundColor: 'var(--me-bg)',
      }}
      className="me-anim"
    >
      <Typography
        variant="h3"
        sx={{ fontWeight: 900, letterSpacing: -0.5, color: 'var(--me-text)' }}
      >
        MindEase
      </Typography>
      <Typography className="me-muted" sx={{ fontSize: 15 }}>
        Suporte cognitivo no dia a dia
      </Typography>
      <CircularProgress size={32} sx={{ color: 'var(--me-accent)', mt: 2 }} />
    </Box>
  )
}
