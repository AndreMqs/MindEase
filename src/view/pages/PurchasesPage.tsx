import { useMemo, useState } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { TextField } from '../components/TextField'
import { useShellStore } from '../../shared/store/useShellStore'
import { DeleteIcon, RedeemIcon, AddIcon } from '../icons'
import { usePreferencesVM } from '../viewmodels/preferencesVM'

export function PurchasesPage() {
  const prefs = usePreferencesVM((s) => s.preferences)
  const complexity = prefs.complexity

  const points = useShellStore((s) => s.pointsBalance)
  const rewards = useShellStore((s) => s.rewards)
  const addReward = useShellStore((s) => s.addReward)
  const removeReward = useShellStore((s) => s.removeReward)
  const redeemReward = useShellStore((s) => s.redeemReward)

  const [title, setTitle] = useState('')
  const [cost, setCost] = useState('30')
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const canSubmit = useMemo(() => title.trim().length >= 2 && Number(cost) > 0, [title, cost])

  return (
    <Stack spacing={2}>
      <Card
        title="Compras (Recompensas)"
        subtitle={
          complexity === 'simple'
            ? 'Cadastre recompensas e use seus pontos para resgatar.'
            : 'Cadastre “produtos” (recompensas) com um preço em pontos. Assim, você só se premia depois de concluir tarefas.'
        }
        contentSx={{ '&:last-child': { pb: 2.5 } }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={7}>
            <TextField label="Recompensa" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Assistir 1 episódio" />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              label="Preço (pontos)"
              value={cost}
              onChange={(e) => setCost(e.target.value.replace(/[^0-9]/g, ''))}
              inputMode="numeric"
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              disabled={!canSubmit}
              onClick={() => {
                addReward(title, Number(cost))
                setTitle('')
                setMsg({ type: 'success', text: 'Recompensa cadastrada.' })
              }}
            >
              Adicionar
            </Button>
          </Grid>
        </Grid>

        <Typography sx={{ mt: 2 }} color="text.secondary">
          Pontos disponíveis: <strong>{points}</strong>
        </Typography>

        {msg ? (
          <Alert sx={{ mt: 2 }} severity={msg.type} onClose={() => setMsg(null)}>
            {msg.text}
          </Alert>
        ) : null}
      </Card>

      <Grid container spacing={2}>
        {rewards.map((r) => {
          const disabled = points < r.cost
          return (
            <Grid item xs={12} md={6} key={r.id}>
              <Card
                title={r.title}
                subtitle={`Custa ${r.cost} pontos`}
                contentSx={{ '&:last-child': { pb: 2 } }}
              >
                <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
                  <Button
                    variant="contained"
                    startIcon={<RedeemIcon />}
                    disabled={disabled}
                    onClick={() => {
                      const res = redeemReward(r.id)
                      if (res.ok) setMsg({ type: 'success', text: `Resgatado: ${r.title}` })
                      else setMsg({ type: 'error', text: 'Pontos insuficientes para resgatar.' })
                    }}
                  >
                    Resgatar
                  </Button>

                  <Tooltip title="Remover recompensa">
                    <IconButton onClick={() => removeReward(r.id)} aria-label="Remover recompensa">
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
                {disabled ? (
                  <Typography sx={{ mt: 1 }} color="text.secondary">
                    Faltam <strong>{r.cost - points}</strong> pontos para resgatar.
                  </Typography>
                ) : null}
              </Card>
            </Grid>
          )
        })}
      </Grid>
    </Stack>
  )
}
