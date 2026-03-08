import { useState } from 'react'
import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import MuiLink from '@mui/material/Link'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { TextField } from '../components/TextField'
import { useAuth } from '../context/AuthContext'

export function ForgotPasswordPage() {
  const { sendPasswordResetEmail, isLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim()) {
      setError('Digite seu e-mail.')
      return
    }
    try {
      await sendPasswordResetEmail(email.trim())
      setSent(true)
    } catch (err) {
      setError((err as Error).message || 'Erro ao enviar.')
    }
  }

  return (
    <Box
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
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
          Esqueci minha senha
        </Typography>
        <Typography className="me-muted" sx={{ mb: 2, fontSize: 14 }}>
          Informe seu e-mail. Se estiver cadastrado, você receberá um link para redefinir a senha.
        </Typography>

        {sent ? (
          <Stack spacing={2}>
            <Typography sx={{ color: 'var(--me-success)' }}>
              Verifique sua caixa de entrada. Enviamos as instruções para <strong>{email}</strong>.
            </Typography>
            <Typography className="me-muted" sx={{ fontSize: 13 }}>
              (Por enquanto não enviamos e-mail — integração com Firebase em breve.)
            </Typography>
            <MuiLink component={Link} to="/login" underline="none" sx={{ display: 'block', mt: 1 }}>
              <Button variant="contained" fullWidth>
                Voltar ao login
              </Button>
            </MuiLink>
          </Stack>
        ) : (
          <form onSubmit={handleSubmit}>
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
              {error && (
                <Typography color="error" sx={{ fontSize: 14 }}>
                  {error}
                </Typography>
              )}
              <Button type="submit" variant="contained" fullWidth disabled={isLoading} sx={{ mt: 1 }}>
                {isLoading ? 'Enviando…' : 'Enviar instruções'}
              </Button>
            </Stack>
          </form>
        )}

        {!sent && (
          <Typography sx={{ mt: 2, textAlign: 'center' }}>
            <MuiLink component={Link} to="/login" underline="hover" sx={{ fontSize: 14, color: 'var(--me-accent)' }}>
              Voltar ao login
            </MuiLink>
          </Typography>
        )}
      </Card>
    </Box>
  )
}
