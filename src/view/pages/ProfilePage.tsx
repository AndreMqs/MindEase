import { useState, useEffect } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { TextField } from '../components/TextField'
import { useShellStore } from '../../shared/store/useShellStore'
import { usePreferencesVM } from '../viewmodels/preferencesVM'
import { useAuth } from '../context/AuthContext'
import { StarIcon } from '../icons'

type TabValue = 'resumo' | 'conta'

export function ProfilePage() {
  const [tab, setTab] = useState<TabValue>('resumo')

  const prefs = usePreferencesVM((s) => s.preferences)
  const points = useShellStore((s) => s.pointsBalance)
  const earned = useShellStore((s) => s.pointsTotalEarned)
  const { user, isLoading, updateProfile, updatePassword } = useAuth()

  const [displayName, setDisplayName] = useState(user?.displayName ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState(false)

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName ?? '')
      setEmail(user.email ?? '')
    }
  }, [user])

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileError('')
    setProfileSuccess(false)
    if (!email.trim()) {
      setProfileError('E-mail é obrigatório.')
      return
    }
    try {
      await updateProfile({ displayName: displayName.trim() || undefined, email: email.trim() })
      setProfileSuccess(true)
    } catch (err) {
      setProfileError((err as Error).message || 'Erro ao salvar.')
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess(false)
    if (!currentPassword.trim()) {
      setPasswordError('Informe a senha atual.')
      return
    }
    if (newPassword.length < 6) {
      setPasswordError('A nova senha deve ter pelo menos 6 caracteres.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('As senhas não coincidem.')
      return
    }
    try {
      await updatePassword(currentPassword, newPassword)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordSuccess(true)
    } catch (err) {
      setPasswordError((err as Error).message || 'Erro ao alterar senha.')
    }
  }

  return (
    <Stack spacing={2} component="section" role="region" aria-label="Perfil do usuário">
      <Card
        title="Perfil"
        subtitle="Resumo das suas preferências e progresso. Edite seus dados e senha na aba Dados e conta."
        contentSx={{ '&:last-child': { pb: 2.5 } }}
      >
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v as TabValue)}
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
          aria-label="Abas do perfil"
        >
          <Tab
            label="Resumo"
            value="resumo"
            id="profile-tab-resumo"
            aria-controls="profile-panel-resumo"
          />
          <Tab
            label="Dados e conta"
            value="conta"
            id="profile-tab-conta"
            aria-controls="profile-panel-conta"
          />
        </Tabs>

        {tab === 'resumo' && (
          <Box id="profile-panel-resumo" role="tabpanel" aria-labelledby="profile-tab-resumo">
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography sx={{ fontWeight: 700, mb: 1 }}>Preferências</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip label={`Complexidade: ${prefs.complexity}`} variant="outlined" />
                  <Chip label={`Contraste: ${prefs.contrast}`} variant="outlined" />
                  <Chip label={`Foco: ${prefs.focusMode ? 'on' : 'off'}`} variant="outlined" />
                  <Chip label={`Resumo: ${prefs.summaryMode ? 'on' : 'off'}`} variant="outlined" />
                  <Chip
                    label={`Animações: ${prefs.animationsEnabled ? 'on' : 'off'}`}
                    variant="outlined"
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography sx={{ fontWeight: 700, mb: 1 }}>Gamificação</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip
                    icon={<StarIcon />}
                    label={`Pontos: ${points}`}
                    color="secondary"
                    variant="outlined"
                  />
                  <Chip label={`Total ganho: ${earned}`} variant="outlined" />
                </Stack>
              </Grid>
            </Grid>
          </Box>
        )}

        {tab === 'conta' && (
          <Box id="profile-panel-conta" role="tabpanel" aria-labelledby="profile-tab-conta">
            <Stack spacing={3}>
              <Box component="form" onSubmit={handleSaveProfile}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
                  Nome e e-mail
                </Typography>
                <Stack spacing={2} sx={{ maxWidth: 400 }}>
                  <TextField
                    label="Nome"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Seu nome"
                    disabled={isLoading}
                    autoComplete="name"
                  />
                  <TextField
                    label="E-mail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    disabled={isLoading}
                    autoComplete="email"
                  />
                  {profileError && (
                    <Typography color="error" sx={{ fontSize: 14 }}>
                      {profileError}
                    </Typography>
                  )}
                  {profileSuccess && (
                    <Typography color="success.main" sx={{ fontSize: 14 }}>
                      Dados salvos.
                    </Typography>
                  )}
                  <Button type="submit" variant="contained" disabled={isLoading}>
                    {isLoading ? 'Salvando…' : 'Salvar'}
                  </Button>
                </Stack>
              </Box>

              <Divider />

              <Box component="form" onSubmit={handleChangePassword}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
                  Alterar senha
                </Typography>
                <Stack spacing={2} sx={{ maxWidth: 400 }}>
                  <TextField
                    label="Senha atual"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Para confirmar sua identidade"
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  <TextField
                    label="Nova senha"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                  <TextField
                    label="Confirmar nova senha"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a nova senha"
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                  {passwordError && (
                    <Typography color="error" sx={{ fontSize: 14 }}>
                      {passwordError}
                    </Typography>
                  )}
                  {passwordSuccess && (
                    <Typography color="success.main" sx={{ fontSize: 14 }}>
                      Senha alterada.
                    </Typography>
                  )}
                  <Button type="submit" variant="outlined" disabled={isLoading}>
                    {isLoading ? 'Alterando…' : 'Alterar senha'}
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </Box>
        )}
      </Card>
    </Stack>
  )
}
