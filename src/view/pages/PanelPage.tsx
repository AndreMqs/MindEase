import { useEffect, useMemo } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import Collapse from '@mui/material/Collapse'
import Paper from '@mui/material/Paper'
import { Select } from '../components/Select'
import { Switch } from '../components/Switch'
import { Card } from '../components/Card'
import { usePreferencesVM } from '../viewmodels/preferencesVM'
import { useShellStore } from '../../shared/store/useShellStore'

export function PanelPage() {
  const { loading, error, preferences, init, patch, reset } = usePreferencesVM()
  const emit = useShellStore((s) => s.emit)

  useEffect(() => {
    void init()
  }, [init])

  const transitionMs = preferences.animationsEnabled ? 240 : 0

  const complexityHint = useMemo(() => {
    if (preferences.complexity === 'simple') return 'Mostra só o essencial, com menos distrações.'
    if (preferences.complexity === 'detailed') return 'Mostra explicações e controles avançados.'
    return 'Equilíbrio entre simplicidade e controle.'
  }, [preferences.complexity])

  return (
    <Stack spacing={2}>
      <Card
        title="Painel Cognitivo"
        subtitle="Ajuste a experiência para reduzir carga cognitiva: contraste, foco, resumo, complexidade e animações."
        contentSx={{ '&:last-child': { pb: 2.5 } }}
      >
        {error ? <Alert severity="error">{error}</Alert> : null}

        <Stack spacing={2} sx={{ mt: 1 }}>
          <Select
            label="Complexidade"
            value={preferences.complexity}
            disabled={loading}
            options={[
              { value: 'simple', label: 'Simples' },
              { value: 'standard', label: 'Padrão' },
              { value: 'detailed', label: 'Detalhado' },
            ]}
            onChange={(v) => void patch({ complexity: v })}
          />

          <Collapse in={preferences.complexity === 'detailed'}>
            <Card className="me-card me-anim" sx={{ p: 2, border: '1px solid', borderColor: 'primary.main', background: 'rgba(228,0,43,0.12)' }}>
              <Typography sx={{ fontWeight: 900, mb: 0.5 }}>Modo Detalhado ativado</Typography>
              <Typography color="text.secondary" sx={{ fontSize: 13 }}>
                Visual mais chamativo, mais contexto (datas e dicas) e telas com mais informações para acompanhar seu progresso.
              </Typography>
            </Card>
          </Collapse>

          <Collapse in={preferences.complexity === 'simple'}>
            <Card className="me-card me-anim" sx={{ p: 2 }}>
              <Typography sx={{ fontWeight: 900, mb: 0.5 }}>Modo Simples</Typography>
              <Typography color="text.secondary" sx={{ fontSize: 13 }}>
                Interface enxuta, com menos textos e detalhes — ideal para foco e baixa distração.
              </Typography>
            </Card>
          </Collapse>
          <Typography color="text.secondary">{complexityHint}</Typography>

          <Divider />

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Switch
              label="Modo foco"
              checked={preferences.focusMode}
              disabled={loading}
              onChange={(e) => void patch({ focusMode: e.target.checked })}
            />
            <Switch
              label="Modo resumo"
              checked={preferences.summaryMode}
              disabled={loading}
              onChange={(e) => void patch({ summaryMode: e.target.checked })}
            />
            <Switch
              label="Animações"
              checked={preferences.animationsEnabled}
              disabled={loading}
              onChange={(e) => {
                void patch({ animationsEnabled: e.target.checked })
                emit('preferences:animations', { enabled: e.target.checked })
              }}
            />
          </Stack>

          <Collapse in={preferences.complexity !== 'simple'} timeout={transitionMs}>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={2}>
              <Select
                label="Contraste"
                value={preferences.contrast}
                disabled={loading}
                options={[
                  { value: 'normal', label: 'Normal (FIAP)' },
                  { value: 'high', label: 'Alto (máxima legibilidade)' },
                ]}
                onChange={(v) => void patch({ contrast: v as any })}
              />

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <Select
                  label="Tamanho de fonte"
                  value={String(preferences.fontSizePx) as any}
                  disabled={loading}
                  options={[
                    { value: '14', label: '14' },
                    { value: '16', label: '16' },
                    { value: '18', label: '18' },
                  ]}
                  onChange={(v) => void patch({ fontSizePx: Number(v) })}
                />
                <Select
                  label="Espaçamento"
                  value={String(preferences.spacingPx) as any}
                  disabled={loading}
                  options={[
                    { value: '6', label: 'Compacto' },
                    { value: '8', label: 'Padrão' },
                    { value: '10', label: 'Confortável' },
                  ]}
                  onChange={(v) => void patch({ spacingPx: Number(v) })}
                />
              </Stack>
            </Stack>
          </Collapse>

          <Collapse in={preferences.complexity === 'detailed'} timeout={transitionMs}>
            <Divider sx={{ my: 2 }} />
            <Alert severity="info" variant="outlined">
              No modo <strong>Detalhado</strong>, você verá mais explicações, contadores e feedbacks visuais nos módulos.
            </Alert>
          </Collapse>

          <Stack direction="row" spacing={1}>
            <Paper
              className={`me-anim ${preferences.animationsEnabled ? 'me-pulse' : ''}`}
              variant="outlined"
              sx={{ p: 2, flex: 1 }}
            >
              <Typography sx={{ fontWeight: 700 }}>Prévia</Typography>
              <Typography color="text.secondary">
                Desative “Animações” para notar transições instantâneas e remoção de efeitos.
              </Typography>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
              <Typography color="text.secondary" sx={{ mr: 1 }}>
                Reset
              </Typography>
              <button
                className="me-link"
                onClick={() => void reset()}
                disabled={loading}
                aria-label="Resetar preferências"
              >
                Restaurar
              </button>
            </Paper>
          </Stack>
        </Stack>
      </Card>
    </Stack>
  )
}
