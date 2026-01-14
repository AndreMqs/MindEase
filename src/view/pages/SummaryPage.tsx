import { useEffect, useMemo, useState } from 'react'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'

import { BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { parseISO, startOfDay, addDays, isWithinInterval } from 'date-fns'

import { Card } from '../components/Card'
import { Select } from '../components/Select'
import { TextField } from '../components/TextField'
import { useTasksVM } from '../viewmodels/tasksVM'
import { useShellStore } from '../../shared/store/useShellStore'

type RangePreset = '7d' | '30d' | 'thisMonth' | 'all' | 'custom'

function toDateInputValue(d: Date) {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function SummaryPage() {
  const { init, tasks, error } = useTasksVM()
  const pointsTotal = useShellStore((s) => s.pointsTotalEarned)
  const pointsBalance = useShellStore((s) => s.pointsBalance)

  const [preset, setPreset] = useState<RangePreset>('7d')
  const [start, setStart] = useState(() => toDateInputValue(addDays(new Date(), -6)))
  const [end, setEnd] = useState(() => toDateInputValue(new Date()))

  useEffect(() => {
    void init()
  }, [init])

  const interval = useMemo(() => {
    const now = new Date()
    if (preset === 'all') return null

    if (preset === '7d') {
      const s = startOfDay(addDays(now, -6))
      const e = addDays(startOfDay(now), 1)
      return { start: s, end: e }
    }

    if (preset === '30d') {
      const s = startOfDay(addDays(now, -29))
      const e = addDays(startOfDay(now), 1)
      return { start: s, end: e }
    }

    if (preset === 'thisMonth') {
      const s = new Date(now.getFullYear(), now.getMonth(), 1)
      const e = addDays(startOfDay(now), 1)
      return { start: startOfDay(s), end: e }
    }

    // custom
    const s = startOfDay(new Date(start + 'T00:00:00'))
    const e = addDays(startOfDay(new Date(end + 'T00:00:00')), 1)
    return { start: s, end: e }
  }, [preset, start, end])

  const tasksInRange = useMemo(() => {
    if (!interval) return tasks
    return tasks.filter((t) => {
      const date = t.completedAtISO ? parseISO(t.completedAtISO) : parseISO(t.updatedAtISO)
      return isWithinInterval(date, interval)
    })
  }, [tasks, interval])

  const byStatus = useMemo(() => {
    const todo = tasksInRange.filter((t) => t.status === 'todo').length
    const doing = tasksInRange.filter((t) => t.status === 'doing').length
    const done = tasksInRange.filter((t) => t.status === 'done').length
    return [
      { name: 'A fazer', value: todo },
      { name: 'Fazendo', value: doing },
      { name: 'Feito', value: done },
    ]
  }, [tasksInRange])

  const pointsSeries = useMemo(() => {
    const now = new Date()
    const range = interval ?? { start: startOfDay(addDays(now, -13)), end: addDays(startOfDay(now), 1) }
    const s = range.start
    const e = range.end
    const days: { day: string; points: number }[] = []
    for (let d = s; d < e; d = addDays(d, 1)) {
      days.push({ day: toDateInputValue(d), points: 0 })
    }
    const map = new Map(days.map((x) => [x.day, x]))
    tasks
      .filter((t) => t.status === 'done' && t.completedAtISO)
      .forEach((t) => {
        const day = toDateInputValue(parseISO(t.completedAtISO!))
        const bucket = map.get(day)
        if (bucket) bucket.points += t.points ?? 0
      })
    return days
  }, [tasks, interval])

  const totalRangePoints = useMemo(() => {
    return tasksInRange.filter((t) => t.status === 'done').reduce((acc, t) => acc + (t.points ?? 0), 0)
  }, [tasksInRange])

  return (
    <Stack spacing={2}>
      <Card className="me-card me-anim" sx={{ p: 2 }}>
        <Stack spacing={1.2}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ md: 'center' }} justifyContent="space-between">
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900 }}>
                Resumo
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.4 }}>
                Gráficos conectados às suas tarefas e pontos.
              </Typography>
            </Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} alignItems={{ sm: 'center' }}>
              <Select
                label="Período"
                value={preset}
                onChange={(v) => setPreset(v as RangePreset)}
                sx={{ minWidth: 200 }}
                options={[
                  { value: '7d', label: 'Últimos 7 dias' },
                  { value: '30d', label: 'Últimos 30 dias' },
                  { value: 'thisMonth', label: 'Este mês' },
                  { value: 'all', label: 'Tudo (status atual)' },
                  { value: 'custom', label: 'Personalizado' },
                ]}
              />

              {preset === 'custom' ? (
                <>
                  <TextField label="Início" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
                  <TextField label="Fim" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
                </>
              ) : null}
            </Stack>
          </Stack>

          <Divider />

          {error ? <Alert severity="error">{error}</Alert> : null}
        </Stack>
      </Card>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card className="me-card me-anim" sx={{ p: 2, minHeight: 320 }}>
            <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
              Status das tarefas
            </Typography>
            <Box sx={{ height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={byStatus} dataKey="value" nameKey="name" outerRadius={90}>
                    {byStatus.map((_, idx) => (
                      <Cell key={idx} />
                    ))}
                  </Pie>
                  <RTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card className="me-card me-anim" sx={{ p: 2, minHeight: 320 }}>
            <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
              Tarefas por status
            </Typography>
            <Box sx={{ height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byStatus}>
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <RTooltip />
                  <Bar dataKey="value" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card className="me-card me-anim" sx={{ p: 2, minHeight: 320 }}>
            <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
              Pontos por dia (tarefas concluídas)
            </Typography>
            <Box sx={{ height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pointsSeries}>
                  <XAxis dataKey="day" />
                  <YAxis allowDecimals={false} />
                  <RTooltip />
                  <Line type="monotone" dataKey="points" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card className="me-card me-anim" sx={{ p: 2, minHeight: 320 }}>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              Pontuação
            </Typography>
            <Divider sx={{ my: 1.2 }} />
            <Typography color="text.secondary">Saldo atual</Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, mt: 0.5 }}>
              {pointsBalance} pts
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1.6 }}>
              Total ganho (histórico)
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 900, mt: 0.5 }}>
              {pointsTotal} pts
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1.6 }}>
              Ganho no período
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 900, mt: 0.5 }}>
              {totalRangePoints} pts
            </Typography>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  )
}
