import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import MuiLink from '@mui/material/Link'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { TextField } from '../components/TextField'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim()) {
      setError('Digite seu e-mail.')
      return
    }
    if (!password) {
      setError('Digite sua senha.')
      return
    }
    try {
      await login(email.trim(), password)
      navigate('/panel', { replace: true })
    } catch (err) {
      setError((err as Error).message || 'Erro ao entrar.')
    }
  }

  return (
    <Box
      component="main"
      role="main"
      id="main-content"
      aria-label="Página de entrada"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        backgroundColor: 'var(--me-bg)',
      }}
    >
      <Card className="me-card me-anim" sx={{ maxWidth: 400, width: '100%', p: 3 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 800, mb: 1 }}>
          Entrar
        </Typography>
        <Typography className="me-muted" sx={{ mb: 2, fontSize: 14 }}>
          Use seu e-mail e senha para acessar.
        </Typography>

        <form onSubmit={handleSubmit} aria-label="Formulário de login">
          <Stack spacing={2}>
            <TextField
              label="E-mail"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              disabled={isLoading}
            />
            <TextField
              label="Senha"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
            />
            {error && (
              <Typography color="error" sx={{ fontSize: 14 }}>
                {error}
              </Typography>
            )}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isLoading}
              sx={{ mt: 1 }}
              aria-label={isLoading ? 'Entrando na conta' : 'Entrar na conta'}
            >
              {isLoading ? 'Entrando…' : 'Entrar'}
            </Button>
          </Stack>
        </form>

        <Stack
          direction="row"
          justifyContent="space-between"
          sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}
          role="navigation"
          aria-label="Links de acesso"
        >
          <MuiLink
            component={Link}
            to="/esqueci-senha"
            underline="hover"
            sx={{ fontSize: 14, color: 'var(--me-accent)' }}
            aria-label="Recuperar senha"
          >
            Esqueci minha senha
          </MuiLink>
          <MuiLink
            component={Link}
            to="/cadastro"
            underline="hover"
            sx={{ fontSize: 14, color: 'var(--me-accent)' }}
            aria-label="Criar nova conta"
          >
            Criar conta
          </MuiLink>
        </Stack>
      </Card>
    </Box>
  )
}
