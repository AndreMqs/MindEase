import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Divider from '@mui/material/Divider'
import { Tabs, Tab } from '../components/Tabs'
import { Button } from '../components/Button'
import { usePreferencesVM } from '../viewmodels/preferencesVM'
import { useShellStore } from '../../shared/store/useShellStore'
import {
  DashboardIcon,
  TaskAltIcon,
  LibraryBooksIcon,
  PersonIcon,
  ShoppingCartIcon,
  BarChartIcon,
  StarIcon,
  VisibilityOffIcon,
  VisibilityIcon,
} from '../icons'

function routeToTab(pathname: string) {
  if (pathname.startsWith('/panel')) return '/panel'
  if (pathname.startsWith('/tasks')) return '/tasks'
  if (pathname.startsWith('/library')) return '/library'
  if (pathname.startsWith('/summary')) return '/summary'
  if (pathname.startsWith('/purchases')) return '/purchases'
  if (pathname.startsWith('/profile')) return '/profile'
  return '/panel'
}

export function AppLayout() {
  const prefs = usePreferencesVM((s) => s.preferences)
  const patch = usePreferencesVM((s) => s.patch)
  const points = useShellStore((s) => s.pointsBalance)
  const location = useLocation()
  const navigate = useNavigate()

  const tab = routeToTab(location.pathname)

  // Focus mode: show only current tab + Panel, and a very visible banner
  const showAllTabs = !prefs.focusMode

  return (
    <Box className="me-container">
      <Paper className={`me-topbar me-anim ${prefs.summaryMode ? 'me-summary-compact' : ''} ${prefs.focusMode ? 'me-focus-outline' : ''}`} elevation={0} sx={{ p: 2.5 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }} justifyContent="space-between">
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>
              MindEase
            </Typography>

            <Typography className="me-muted me-focus-hide" sx={{ mt: 0.2 }}>
              Painel cognitivo • Tarefas • Biblioteca • Resumo • Compras • Perfil
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
            <Chip icon={<StarIcon />} label={`Pontos: ${points}`} color="secondary" variant="outlined" />
            <Chip label={`Complexidade: ${prefs.complexity}`} color="primary" variant="outlined" />

            {prefs.focusMode && <Chip label="Modo foco ATIVO" color="secondary" />}
            {prefs.summaryMode && <Chip label="Modo resumo ATIVO" color="secondary" />}
            {!prefs.animationsEnabled && <Chip label="Animações OFF" variant="outlined" />}

            <Button
              variant={prefs.focusMode ? 'contained' : 'outlined'}
              startIcon={prefs.focusMode ? <VisibilityOffIcon /> : <VisibilityIcon />}
              onClick={() => void patch({ focusMode: !prefs.focusMode })}
              className="me-anim"
            >
              {prefs.focusMode ? 'Sair do foco' : 'Modo foco'}
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

        <Paper className={`me-anim ${prefs.summaryMode ? 'me-summary-compact' : ''}`} elevation={0} sx={{ p: 1.2 }}>
          <Tabs
            value={tab}
            onChange={(_, v) => navigate(v)}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="Navegação principal"
          >
            <Tab value="/panel" label="Painel" icon={<DashboardIcon />} iconPosition="start" />
            {(showAllTabs || tab === '/tasks') && <Tab value="/tasks" label="Tarefas" icon={<TaskAltIcon />} iconPosition="start" />}
            {(showAllTabs || tab === '/library') && <Tab value="/library" label="Biblioteca" icon={<LibraryBooksIcon />} iconPosition="start" />}
            {(showAllTabs || tab === '/summary') && <Tab value="/summary" label="Resumo" icon={<BarChartIcon />} iconPosition="start" />}
            {(showAllTabs || tab === '/purchases') && <Tab value="/purchases" label="Compras" icon={<ShoppingCartIcon />} iconPosition="start" />}
            {(showAllTabs || tab === '/profile') && <Tab value="/profile" label="Perfil" icon={<PersonIcon />} iconPosition="start" />}
          </Tabs>
        </Paper>
      </Paper>

      <Box sx={{ mt: 2.5 }}>
        <Outlet />
      </Box>
    </Box>
  )
}
