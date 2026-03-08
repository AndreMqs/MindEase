import { useEffect } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
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

  return (
    <Stack spacing={2}>
      <Card
        title="🧠 Painel Cognitivo"
        subtitle="Comportamento funcional: ajuste a experiência para reduzir carga cognitiva (TDAH, TEA, dislexia, burnout, ansiedade)."
        contentSx={{ '&:last-child': { pb: 2.5 } }}
      >
        {error ? <Alert severity="error">{error}</Alert> : null}

        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {/* 1️⃣ Complexidade da interface */}
          <Stack spacing={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>1️⃣ Complexidade da interface</Typography>
            <Select
              label="Controle"
              value={preferences.complexity}
              disabled={loading}
              options={[
                { value: 'simple', label: 'Simples — remove elementos secundários' },
                { value: 'standard', label: 'Padrão — interface normal' },
                { value: 'detailed', label: 'Detalhado — mostra mais contexto' },
              ]}
              onChange={(v) => void patch({ complexity: v })}
            />
            <Typography color="text.secondary" sx={{ fontSize: 13 }}>
              {preferences.complexity === 'simple' && 'Oculta pontos, chips, contadores, ícones decorativos. Interface mais limpa.'}
              {preferences.complexity === 'standard' && 'Nada ocultado. Interface atual.'}
              {preferences.complexity === 'detailed' && 'Exibe contadores, tooltips, metadados das tarefas.'}
            </Typography>
          </Stack>

          <Divider />

          {/* 2️⃣ Modo Foco */}
          <Stack spacing={0.5}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>2️⃣ Modo Foco</Typography>
            <Switch
              label={preferences.focusMode ? 'ON — Remove distrações' : 'OFF — Interface completa'}
              checked={preferences.focusMode}
              disabled={loading}
              onChange={(e) => void patch({ focusMode: e.target.checked })}
            />
            <Typography color="text.secondary" sx={{ fontSize: 13 }}>
              {preferences.focusMode
                ? 'Esconde: pontos, gamificação, filtros, ordenação, contadores. Ficam apenas Tarefas e Kanban.'
                : 'Mostra todos os elementos.'}
            </Typography>
          </Stack>

          <Divider />

          {/* 3️⃣ Modo Resumo / Detalhado */}
          <Stack spacing={0.5}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>3️⃣ Modo Resumo</Typography>
            <Switch
              label={preferences.summaryMode ? 'Resumo — só título da tarefa' : 'Detalhado — título + descrição'}
              checked={preferences.summaryMode}
              disabled={loading}
              onChange={(e) => void patch({ summaryMode: e.target.checked })}
            />
            <Typography color="text.secondary" sx={{ fontSize: 13 }}>
              {preferences.summaryMode ? 'Descrição das tarefas desaparece.' : 'Mostra título e descrição.'}
            </Typography>
          </Stack>

          <Divider />

          {/* 4️⃣ Animações */}
          <Stack spacing={0.5}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>4️⃣ Animações</Typography>
            <Switch
              label={preferences.animationsEnabled ? 'ON — Transições suaves' : 'OFF — Sem animações'}
              checked={preferences.animationsEnabled}
              disabled={loading}
              onChange={(e) => {
                void patch({ animationsEnabled: e.target.checked })
                emit('preferences:animations', { enabled: e.target.checked })
              }}
            />
            <Typography color="text.secondary" sx={{ fontSize: 13 }}>
              {preferences.animationsEnabled ? 'Drag & drop com animação.' : 'Movimentação instantânea (transition: none). Pessoas com sensibilidade vestibular ou ansiedade podem preferir OFF.'}
            </Typography>
          </Stack>

          <Divider />

          {/* 5️⃣ Contraste */}
          <Stack spacing={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>5️⃣ Contraste</Typography>
            <Select
              label="Controle"
              value={preferences.contrast}
              disabled={loading}
              options={[
                { value: 'normal', label: 'Normal — tema atual' },
                { value: 'high', label: 'Alto — fundo mais escuro + texto mais claro' },
                { value: 'veryHigh', label: 'Muito alto — preto puro + branco puro (máxima legibilidade)' },
              ]}
              onChange={(v) => void patch({ contrast: v as any })}
            />
          </Stack>

          <Divider />

          {/* 6️⃣ Tamanho da fonte */}
          <Stack spacing={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>6️⃣ Tamanho da fonte</Typography>
            <Select
              label="Controle"
              value={String(preferences.fontSizePx) as any}
              disabled={loading}
              options={[
                { value: '14', label: '14px — texto compacto' },
                { value: '16', label: '16px — padrão' },
                { value: '18', label: '18px — acessível' },
                { value: '20', label: '20px — baixa visão / UI expandida' },
              ]}
              onChange={(v) => void patch({ fontSizePx: Number(v) })}
            />
            <Typography color="text.secondary" sx={{ fontSize: 13 }}>
              Usa variável CSS global (--me-font-size).
            </Typography>
          </Stack>

          <Divider />

          {/* 7️⃣ Espaçamento */}
          <Stack spacing={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>7️⃣ Espaçamento</Typography>
            <Select
              label="Controle"
              value={String(preferences.spacingPx) as any}
              disabled={loading}
              options={[
                { value: '6', label: 'Compacto — gap menor' },
                { value: '8', label: 'Padrão — atual' },
                { value: '10', label: 'Confortável' },
                { value: '12', label: 'Amplo — mais respiro (recomendado para dislexia e TDAH)' },
              ]}
              onChange={(v) => void patch({ spacingPx: Number(v) })}
            />
          </Stack>

          <Divider />

          {/* 8️⃣ Alertas cognitivos */}
          <Stack spacing={0.5}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>8️⃣ Alertas cognitivos</Typography>
            <Switch
              label={preferences.cognitiveAlertsEnabled ? 'Ativados' : 'Desativados'}
              checked={preferences.cognitiveAlertsEnabled}
              disabled={loading}
              onChange={(e) => void patch({ cognitiveAlertsEnabled: e.target.checked })}
            />
            <Typography color="text.secondary" sx={{ fontSize: 13 }}>
              15 min na mesma tarefa → toast leve. 30 min → sugestão de pausa. 45 min → alerta (modal).
            </Typography>
          </Stack>

          <Divider />

          <Stack direction="row" spacing={1} alignItems="center">
            <Paper variant="outlined" sx={{ p: 1.5, display: 'flex', alignItems: 'center' }}>
              <Typography color="text.secondary" sx={{ mr: 1 }}>Restaurar padrões</Typography>
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
