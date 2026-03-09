import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import MuiLink from '@mui/material/Link'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { TextField } from '../components/TextField'
import { useAuth } from '../context/AuthContext'

export function RegisterPage() {
  const navigate = useNavigate()
  const { register, isLoading } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim()) {
      setError('Digite seu e-mail.')
      return
    }
    if (!password) {
      setError('Digite uma senha.')
      return
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }
    if (!acceptedTerms) {
      setError('É necessário aceitar os Termos de Uso para se cadastrar.')
      return
    }
    try {
      await register(email.trim(), password, name.trim() || undefined)
      navigate('/panel', { replace: true })
    } catch (err) {
      setError((err as Error).message || 'Erro ao cadastrar.')
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
          Criar conta
        </Typography>
        <Typography className="me-muted" sx={{ mb: 2, fontSize: 14 }}>
          Preencha nome, e-mail e senha para se cadastrar.
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Nome"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              disabled={isLoading}
            />
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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              disabled={isLoading}
            />
            <TextField
              label="Confirmar senha"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repita a senha"
              disabled={isLoading}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  disabled={isLoading}
                />
              }
              label={
                <Typography sx={{ fontSize: 14 }}>
                  Li e aceito os{' '}
                  <MuiLink
                    component={Link}
                    to="/termos-de-uso"
                    target="_blank"
                    rel="noopener"
                    underline="hover"
                    sx={{ color: 'var(--me-accent)' }}
                  >
                    Termos de Uso
                  </MuiLink>
                </Typography>
              }
            />
            {error && (
              <Typography color="error" sx={{ fontSize: 14 }}>
                {error}
              </Typography>
            )}
            <Button type="submit" variant="contained" fullWidth disabled={isLoading} sx={{ mt: 1 }}>
              {isLoading ? 'Cadastrando…' : 'Cadastrar'}
            </Button>
          </Stack>
        </form>

        <Typography sx={{ mt: 2, textAlign: 'center' }}>
          <MuiLink
            component={Link}
            to="/login"
            underline="hover"
            sx={{ fontSize: 14, color: 'var(--me-accent)' }}
          >
            Já tenho conta — Entrar
          </MuiLink>
        </Typography>
      </Card>
    </Box>
  )
}
