import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
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
  RedeemIcon,
  NoteIcon,
  VisibilityOffIcon,
  VisibilityIcon,
  SettingsIcon,
} from '../icons'

function routeToTab(pathname: string) {
  if (pathname.startsWith('/panel')) return '/panel'
  if (pathname.startsWith('/tasks')) return '/tasks'
  if (pathname.startsWith('/notes')) return '/notes'
  if (pathname.startsWith('/store')) return '/store'
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
  const isFocusMode = prefs.focusMode

  const closeConfigMenu = () => setConfigAnchor(null)

  return (
    <Box className="me-container" component="div">
      <Link href="#main-content" className="me-skip-link">
        Pular para o conteúdo principal
      </Link>
      <Paper
        component="header"
        role="banner"
        className={`me-topbar me-anim ${prefs.summaryMode ? 'me-summary-compact' : ''} ${prefs.focusMode ? 'me-focus-outline' : ''}`}
        elevation={0}
        sx={{ p: isFocusMode ? 2 : 2.5, backgroundColor: 'var(--me-surface-secondary)' }}
        aria-label="Cabeçalho da aplicação"
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ md: 'center' }}
          justifyContent="space-between"
        >
          {/* Esquerda: marca + navegação principal */}
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>
              MindEase
            </Typography>
          </Box>

          {/* Direita: Pontos, Complexidade (ocultos em modo foco ou complexidade simples), Modo foco, Configurações, Sair */}
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
            justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
          >
            <Chip
              className="me-focus-hide me-complexity-simple-hide"
              icon={<StarIcon />}
              label={`Pontos: ${points}`}
              color="secondary"
              variant="outlined"
            />
            <Chip
              className="me-focus-hide me-complexity-simple-hide"
              label={`Complexidade: ${prefs.complexity}`}
              color="primary"
              variant="outlined"
            />

            <Button
              variant={prefs.focusMode ? 'contained' : 'outlined'}
              size="small"
              startIcon={prefs.focusMode ? <VisibilityOffIcon /> : <VisibilityIcon />}
              onClick={() => void patch({ focusMode: !prefs.focusMode })}
              className="me-anim"
              aria-pressed={prefs.focusMode}
              aria-label={
                prefs.focusMode ? 'Sair do modo foco' : 'Ativar modo foco para reduzir distrações'
              }
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
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Perfil</ListItemText>
              </MenuItem>
              {user?.email && (
                <MenuItem disabled sx={{ opacity: 0.8 }}>
                  <ListItemText secondary={user.email ?? ''} />
                </MenuItem>
              )}
            </Menu>

            <Button
              variant="outlined"
              size="small"
              onClick={handleLogout}
              aria-label="Sair da conta"
            >
              Sair
            </Button>
          </Stack>
        </Stack>

        {prefs.focusMode && !isFocusMode && (
          <Paper className="me-anim" elevation={0} sx={{ mt: 2, p: 1.5, borderRadius: 3 }}>
            <Typography sx={{ fontWeight: 800 }}>
              Foco ativado: escondendo navegação extra e reduzindo distrações.
            </Typography>
            <Typography className="me-muted">
              Você pode desativar no botão “Sair do foco”.
            </Typography>
          </Paper>
        )}

        {!isFocusMode ? <Divider sx={{ my: 2 }} /> : null}

        {/* Na página Perfil: esconder abas e mostrar contexto claro (evita confusão cognitiva) */}
        {isProfilePage ? (
          <Paper
            className={`me-anim ${prefs.summaryMode ? 'me-summary-compact' : ''}`}
            elevation={0}
            sx={{ p: 1.2, backgroundColor: 'var(--me-surface-secondary)' }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              flexWrap="wrap"
              gap={1}
            >
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
        ) : isFocusMode ? null : (
          /* Navegação principal: Painel e Tarefas */
          <Paper
            component="nav"
            role="navigation"
            aria-label="Navegação principal"
            className={`me-anim ${prefs.summaryMode ? 'me-summary-compact' : ''}`}
            elevation={0}
            sx={{ p: 1.2, backgroundColor: 'var(--me-surface-secondary)' }}
          >
            <Tabs
              value={tab}
              onChange={(_, v) => navigate(v)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab value="/panel" label="Painel" icon={<DashboardIcon />} iconPosition="start" />
              <Tab value="/tasks" label="Tarefas" icon={<TaskAltIcon />} iconPosition="start" />
              <Tab value="/notes" label="Anotações" icon={<NoteIcon />} iconPosition="start" />
              <Tab value="/store" label="Loja" icon={<RedeemIcon />} iconPosition="start" />
            </Tabs>
          </Paper>
        )}
      </Paper>

      <Box
        component="main"
        id="main-content"
        role="main"
        sx={{ mt: isFocusMode ? 1.5 : 2.5 }}
        tabIndex={-1}
      >
        <Outlet />
      </Box>
    </Box>
  )
}
