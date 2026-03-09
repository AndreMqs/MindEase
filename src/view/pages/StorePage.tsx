import { useMemo, useState } from 'react'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { TextField } from '../components/TextField'
import { Select } from '../components/Select'
import { usePreferencesVM } from '../viewmodels/preferencesVM'
import { useRewardsVM } from '../viewmodels/rewardsVM'
import { AddIcon, DeleteIcon, RedeemIcon, StarIcon } from '../icons'
import type { RewardRedemption } from '../../shared/store/useShellStore'

type RewardSortKey = 'cost-desc' | 'cost-asc' | 'title'

type RewardCardProps = {
  id: string
  title: string
  cost: number
  pointsBalance: number
  onRedeem: (id: string) => void
  onRemove: (id: string) => void
}

function formatRedeemedAt(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function RewardCard({ id, title, cost, pointsBalance, onRedeem, onRemove }: RewardCardProps) {
  const canRedeem = pointsBalance >= cost

  return (
    <Card
      className="me-card me-anim"
      sx={{
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        border: '1px solid',
        borderColor: canRedeem ? 'divider' : 'rgba(255,255,255,0.08)',
        backgroundColor: 'rgba(0,0,0,0.12)',
      }}
    >
      <Stack spacing={1.5} sx={{ height: '100%' }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
          <Stack spacing={0.75} sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 800, lineHeight: 1.2 }}>{title}</Typography>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Chip size="small" icon={<StarIcon sx={{ fontSize: 14 }} />} label={`${cost} pts`} variant="outlined" color={canRedeem ? 'secondary' : 'default'} />
              {!canRedeem ? <Chip size="small" label="Pontos insuficientes" color="warning" variant="outlined" /> : null}
            </Stack>
          </Stack>

          <Tooltip title="Remover prêmio">
            <IconButton onClick={() => onRemove(id)} size="small">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>

        <Box sx={{ flex: 1 }} />

        <Button
          variant={canRedeem ? 'contained' : 'outlined'}
          startIcon={<RedeemIcon />}
          onClick={() => onRedeem(id)}
          disabled={!canRedeem}
          fullWidth
        >
          Resgatar prêmio
        </Button>
      </Stack>
    </Card>
  )
}

function RedemptionHistoryCard({ item }: { item: RewardRedemption }) {
  return (
    <Card
      className="me-card me-anim"
      sx={{
        p: 1.5,
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'rgba(0,0,0,0.10)',
      }}
    >
      <Stack spacing={0.75}>
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" flexWrap="wrap">
          <Typography sx={{ fontWeight: 700 }}>{item.rewardTitle}</Typography>
          <Chip size="small" icon={<StarIcon sx={{ fontSize: 14 }} />} label={`-${item.cost} pts`} color="secondary" variant="outlined" />
        </Stack>
        <Typography color="text.secondary" sx={{ fontSize: 13 }}>
          Resgatado em {formatRedeemedAt(item.redeemedAtISO)}
        </Typography>
      </Stack>
    </Card>
  )
}

function sortRewards<T extends { title: string; cost: number }>(items: T[], key: RewardSortKey): T[] {
  const copy = items.slice()
  switch (key) {
    case 'cost-asc':
      return copy.sort((a, b) => a.cost - b.cost)
    case 'title':
      return copy.sort((a, b) => a.title.localeCompare(b.title))
    case 'cost-desc':
    default:
      return copy.sort((a, b) => b.cost - a.cost)
  }
}

export function StorePage() {
  const prefs = usePreferencesVM((s) => s.preferences)
  const { pointsBalance, rewards, addReward, removeReward, redeemReward, redemptionHistory } = useRewardsVM()

  const [title, setTitle] = useState('')
  const [cost, setCost] = useState('50')
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<RewardSortKey>('cost-desc')
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [rewardToConfirm, setRewardToConfirm] = useState<{ id: string; title: string; cost: number } | null>(null)

  const canAdd = title.trim().length >= 2 && Number(cost) > 0

  const visibleRewards = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const filtered = normalizedQuery
      ? rewards.filter((reward) => reward.title.toLowerCase().includes(normalizedQuery))
      : rewards

    return sortRewards(filtered, sortKey)
  }, [query, rewards, sortKey])

  const handleAddReward = () => {
    if (!canAdd) return
    addReward(title, Number(cost))
    setTitle('')
    setCost('50')
    setFeedback({ type: 'success', message: 'Prêmio criado com sucesso.' })
  }

  const handleRedeemReward = (rewardId: string) => {
    const reward = rewards.find((item) => item.id === rewardId)
    if (!reward) {
      setFeedback({ type: 'error', message: 'Prêmio não encontrado.' })
      return
    }
    if (pointsBalance < reward.cost) {
      setFeedback({ type: 'error', message: 'Você não tem pontos suficientes para resgatar esse prêmio.' })
      return
    }
    setRewardToConfirm({ id: reward.id, title: reward.title, cost: reward.cost })
  }

  const handleConfirmRedeem = () => {
    if (!rewardToConfirm) return
    const result = redeemReward(rewardToConfirm.id)
    if (!result.ok) {
      setFeedback({
        type: 'error',
        message: result.reason === 'INSUFFICIENT_POINTS' ? 'Você não tem pontos suficientes para resgatar esse prêmio.' : 'Prêmio não encontrado.',
      })
      setRewardToConfirm(null)
      return
    }
    setFeedback({ type: 'success', message: 'Prêmio resgatado. Os pontos foram descontados.' })
    setRewardToConfirm(null)
  }

  const handleRemoveReward = (rewardId: string) => {
    removeReward(rewardId)
    setFeedback({ type: 'success', message: 'Prêmio removido da loja.' })
  }

  return (
    <Stack spacing={2}>
      <Card className="me-card me-anim" sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ md: 'center' }} justifyContent="space-between">
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900 }}>
                Loja de prêmios
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.4 }}>
                Troque seus pontos por recompensas personalizadas.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Chip icon={<StarIcon />} label={`Saldo atual: ${pointsBalance} pts`} color="secondary" variant="outlined" />
              <Chip label={`${rewards.length} prêmio(s)`} variant="outlined" />
              <Chip label={`${redemptionHistory.length} resgate(s)`} variant="outlined" />
            </Stack>
          </Stack>

          {prefs.navigationProfile === 'assisted' ? (
            <Alert severity="info" icon={false}>
              <Typography component="span" sx={{ fontWeight: 600 }}>💡 Dica</Typography>
              <Typography component="span" sx={{ ml: 0.5 }}>Crie recompensas simples e objetivas, como pausas, episódios ou tempo de lazer.</Typography>
            </Alert>
          ) : null}

          <Divider />

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Prêmio"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Assistir 1 episódio de série"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Custo em pontos"
                value={cost}
                onChange={(e) => setCost(e.target.value.replace(/[^0-9]/g, ''))}
                inputMode="numeric"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddReward} disabled={!canAdd} fullWidth>
                Criar prêmio
              </Button>
            </Grid>
          </Grid>
        </Stack>
      </Card>

      <Card className="me-card me-anim" sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ md: 'center' }} justifyContent="space-between">
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              Recompensas disponíveis
            </Typography>

            <Stack className="me-focus-hide" direction={{ xs: 'column', sm: 'row' }} spacing={1.2} alignItems={{ sm: 'center' }}>
              <TextField
                label="Buscar"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nome do prêmio..."
                sx={{ minWidth: 240 }}
              />
              <Select
                label="Ordenar"
                value={sortKey}
                onChange={(value) => setSortKey(value as RewardSortKey)}
                sx={{ minWidth: 220 }}
                options={[
                  { value: 'cost-desc', label: 'Maior custo' },
                  { value: 'cost-asc', label: 'Menor custo' },
                  { value: 'title', label: 'Nome' },
                ]}
              />
            </Stack>
          </Stack>

          <Divider />

          {visibleRewards.length === 0 ? (
            <Typography color="text.secondary">Nenhum prêmio encontrado. Crie o primeiro para começar sua loja.</Typography>
          ) : (
            <Grid container spacing={2}>
              {visibleRewards.map((reward) => (
                <Grid item xs={12} md={6} lg={4} key={reward.id}>
                  <RewardCard
                    id={reward.id}
                    title={reward.title}
                    cost={reward.cost}
                    pointsBalance={pointsBalance}
                    onRedeem={handleRedeemReward}
                    onRemove={handleRemoveReward}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Stack>
      </Card>

      <Card className="me-card me-anim" sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }} justifyContent="space-between">
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                Histórico de resgates
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.4 }}>
                Acompanhe quando seus pontos foram usados na loja.
              </Typography>
            </Box>
            <Chip label={`${redemptionHistory.length} registro(s)`} variant="outlined" />
          </Stack>

          <Divider />

          {redemptionHistory.length === 0 ? (
            <Typography color="text.secondary">Nenhum prêmio foi resgatado ainda.</Typography>
          ) : (
            <Stack spacing={1.2}>
              {redemptionHistory.map((item) => (
                <RedemptionHistoryCard key={item.id} item={item} />
              ))}
            </Stack>
          )}
        </Stack>
      </Card>

      <Dialog open={!!rewardToConfirm} onClose={() => setRewardToConfirm(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Confirmar resgate</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ pt: 0.5 }}>
            <Typography>
              Você quer resgatar <strong>{rewardToConfirm?.title}</strong> por <strong>{rewardToConfirm?.cost ?? 0} pontos</strong>?
            </Typography>
            <Alert severity="warning" variant="outlined">
              Seu saldo após o resgate ficará em <strong>{Math.max(0, pointsBalance - (rewardToConfirm?.cost ?? 0))} pts</strong>.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setRewardToConfirm(null)}>
            Cancelar
          </Button>
          <Button variant="contained" startIcon={<RedeemIcon />} onClick={handleConfirmRedeem}>
            Confirmar resgate
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!feedback}
        autoHideDuration={4000}
        onClose={() => setFeedback(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {feedback ? (
          <Alert onClose={() => setFeedback(null)} severity={feedback.type} variant="filled" sx={{ width: '100%' }}>
            {feedback.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Stack>
  )
}
