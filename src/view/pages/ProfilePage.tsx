import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import { Card } from '../components/Card'
import { useShellStore } from '../../shared/store/useShellStore'
import { usePreferencesVM } from '../viewmodels/preferencesVM'
import { StarIcon } from '../icons'

export function ProfilePage() {
  const prefs = usePreferencesVM((s) => s.preferences)
  const points = useShellStore((s) => s.pointsBalance)
  const earned = useShellStore((s) => s.pointsTotalEarned)

  return (
    <Stack spacing={2}>
      <Card
        title="Perfil"
        subtitle="Resumo das suas preferências e progresso."
        contentSx={{ '&:last-child': { pb: 2.5 } }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>Preferências</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip label={`Complexidade: ${prefs.complexity}`} variant="outlined" />
              <Chip label={`Contraste: ${prefs.contrast}`} variant="outlined" />
              <Chip label={`Foco: ${prefs.focusMode ? 'on' : 'off'}`} variant="outlined" />
              <Chip label={`Resumo: ${prefs.summaryMode ? 'on' : 'off'}`} variant="outlined" />
              <Chip label={`Animações: ${prefs.animationsEnabled ? 'on' : 'off'}`} variant="outlined" />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>Gamificação</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip icon={<StarIcon />} label={`Pontos: ${points}`} color="secondary" variant="outlined" />
              <Chip label={`Total ganho: ${earned}`} variant="outlined" />
            </Stack>
          </Grid>
        </Grid>

        <Alert sx={{ mt: 2 }} severity="info" variant="outlined">
          Infra está preparada para Firebase. Quando você ligar o Firebase, o passo seguinte é trocar os repositórios LocalStorage pelos Firebase.
        </Alert>
      </Card>
    </Stack>
  )
}
