import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import { Tabs, Tab } from '../components/Tabs'
import { Button } from '../components/Button'
import { usePreferencesVM } from '../viewmodels/preferencesVM'
import { useShellStore } from '../../shared/store/useShellStore'
import { useAuth } from '../context/AuthContext'
import {
  DashboardIcon,
  TaskAltIcon,
  PersonIcon,
  StarIcon,
  VisibilityOffIcon,
  VisibilityIcon,
  SettingsIcon,
} from '../icons'

function routeToTab(pathname: string) {
  if (pathname.startsWith('/panel')) return '/panel'
  if (pathname.startsWith('/tasks')) return '/tasks'
  return '/panel'
}

export function AppLayout() {
  const prefs = usePreferencesVM((s) => s.preferences)
  const patch = usePreferencesVM((s) => s.patch)
  const points = useShellStore((s) => s.pointsBalance)
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [configAnchor, setConfigAnchor] = useState<null | HTMLElement>(null)

  const handleLogout = () => {
    void logout().then(() => navigate('/login', { replace: true }))
  }

  const tab = routeToTab(location.pathname)
  const isProfilePage = location.pathname.startsWith('/profile')

  const closeConfigMenu = () => setConfigAnchor(null)

  return (
    <Box className="me-container">
      <Paper className={`me-topbar me-anim ${prefs.summaryMode ? 'me-summary-compact' : ''} ${prefs.focusMode ? 'me-focus-outline' : ''}`} elevation={0} sx={{ p: 2.5, backgroundColor: 'var(--me-surface-secondary)' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }} justifyContent="space-between">
          {/* Esquerda: marca + navegação principal */}
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>
              MindEase
            </Typography>
            <Typography className="me-muted me-focus-hide" sx={{ mt: 0.2 }}>
              Painel • Tarefas
            </Typography>
          </Box>

          {/* Direita: Pontos, Complexidade (ocultos em modo foco ou complexidade simples), Modo foco, Configurações, Sair */}
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
            <Chip className="me-focus-hide me-complexity-simple-hide" icon={<StarIcon />} label={`Pontos: ${points}`} color="secondary" variant="outlined" />
            <Chip className="me-focus-hide me-complexity-simple-hide" label={`Complexidade: ${prefs.complexity}`} color="primary" variant="outlined" />

            <Button
              variant={prefs.focusMode ? 'contained' : 'outlined'}
              size="small"
              startIcon={prefs.focusMode ? <VisibilityOffIcon /> : <VisibilityIcon />}
              onClick={() => void patch({ focusMode: !prefs.focusMode })}
              className="me-anim"
            >
              {prefs.focusMode ? 'Sair do foco' : 'Modo foco'}
            </Button>

            <IconButton
              onClick={(e) => setConfigAnchor(e.currentTarget)}
              aria-label="Configurações"
              title="Configurações"
              sx={{ color: 'var(--me-text)' }}
            >
              <SettingsIcon />
            </IconButton>
            <Menu
              anchorEl={configAnchor}
              open={Boolean(configAnchor)}
              onClose={closeConfigMenu}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem
                onClick={() => {
                  closeConfigMenu()
                  navigate('/profile')
                }}
              >
                <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Perfil</ListItemText>
              </MenuItem>
              {user?.email && (
                <MenuItem disabled sx={{ opacity: 0.8 }}>
                  <ListItemText secondary={user.email} />
                </MenuItem>
              )}
            </Menu>

            <Button variant="outlined" size="small" onClick={handleLogout}>
              Sair
            </Button>
          </Stack>
        </Stack>

        {prefs.focusMode && (
          <Paper className="me-anim" elevation={0} sx={{ mt: 2, p: 1.5, borderRadius: 3 }}>
            <Typography sx={{ fontWeight: 800 }}>
              Foco ativado: escondendo navegação extra e reduzindo distrações.
            </Typography>
            <Typography className="me-muted">Você pode desativar no botão “Sair do foco”.</Typography>
          </Paper>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Na página Perfil: esconder abas e mostrar contexto claro (evita confusão cognitiva) */}
        {isProfilePage ? (
          <Paper className={`me-anim ${prefs.summaryMode ? 'me-summary-compact' : ''}`} elevation={0} sx={{ p: 1.2, backgroundColor: 'var(--me-surface-secondary)' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                Você está em <strong>Perfil</strong>
              </Typography>
              <Button
                variant="contained"
                size="small"
                startIcon={<DashboardIcon />}
                onClick={() => navigate('/panel')}
              >
                Voltar ao Painel
              </Button>
            </Stack>
          </Paper>
        ) : (
          /* Navegação principal: Painel e Tarefas */
          <Paper className={`me-anim ${prefs.summaryMode ? 'me-summary-compact' : ''}`} elevation={0} sx={{ p: 1.2, backgroundColor: 'var(--me-surface-secondary)' }}>
            <Tabs
              value={tab}
              onChange={(_, v) => navigate(v)}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="Navegação principal"
            >
              <Tab value="/panel" label="Painel" icon={<DashboardIcon />} iconPosition="start" />
              <Tab value="/tasks" label="Tarefas" icon={<TaskAltIcon />} iconPosition="start" />
            </Tabs>
          </Paper>
        )}
      </Paper>

      <Box sx={{ mt: 2.5 }}>
        <Outlet />
      </Box>
    </Box>
  )
}
