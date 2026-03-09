import { useEffect } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import { Select } from '../components/Select'
import { Switch } from '../components/Switch'
import { Card } from '../components/Card'
import { Button } from '../components/Button/Button'
import type { ContrastLevel, NavigationProfile, RoutineType, CognitiveCondition } from '../../domain/entities/Preferences'
import { COGNITIVE_PRESETS, ROUTINE_POMODORO } from '../../domain/entities/Preferences'
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
                ? 'Reduz elementos secundários e destaca a área principal. Em Anotações, mostra apenas o editor.'
                : 'Mostra todos os elementos da interface.'}
            </Typography>
          </Stack>

          <Divider />

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

          <Stack spacing={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>5️⃣ Contraste</Typography>
            <Select<ContrastLevel>
              label="Controle"
              value={preferences.contrast}
              disabled={loading}
              options={[
                { value: 'normal', label: 'Normal — tema atual' },
                { value: 'high', label: 'Alto — fundo mais escuro + texto mais claro' },
                { value: 'veryHigh', label: 'Muito alto — preto puro + branco puro (máxima legibilidade)' },
              ]}
              onChange={(v) => void patch({ contrast: v })}
            />
          </Stack>

          <Divider />

          <Stack spacing={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>6️⃣ Tamanho da fonte</Typography>
            <Select
              label="Controle"
              value={String(preferences.fontSizePx) as '14' | '16' | '18' | '20'}
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

          <Stack spacing={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>7️⃣ Espaçamento</Typography>
            <Select
              label="Controle"
              value={String(preferences.spacingPx) as '6' | '8' | '10' | '12'}
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

          <Stack spacing={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>9️⃣ Perfil de navegação</Typography>
            <Select<NavigationProfile>
              label="Controle"
              value={preferences.navigationProfile}
              disabled={loading}
              options={[
                { value: 'standard', label: 'Padrão — interface equilibrada' },
                { value: 'deepFocus', label: 'Foco profundo — remove distrações' },
                { value: 'assisted', label: 'Assistido — mais explicações e dicas' },
              ]}
              onChange={(v) => void patch({ navigationProfile: v })}
            />
            <Typography color="text.secondary" sx={{ fontSize: 13 }}>
              {preferences.navigationProfile === 'assisted' && 'Exibe tooltips e dicas (ex.: como arrastar tarefas).'}
              {preferences.navigationProfile === 'deepFocus' && 'Menos elementos na tela.'}
              {preferences.navigationProfile === 'standard' && 'Layout normal.'}
            </Typography>
          </Stack>

          <Divider />

          <Stack spacing={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>🔟 Necessidades específicas</Typography>
            <Select<CognitiveCondition>
              label="Controle"
              value={preferences.cognitiveCondition}
              disabled={loading}
              options={[
                { value: 'none', label: 'Nenhuma — ajustes manuais' },
                { value: 'adhd', label: 'TDAH — modo foco + menos animações + espaçamento amplo' },
                { value: 'dyslexia', label: 'Dislexia — fonte maior + espaçamento + contraste alto' },
                { value: 'anxiety', label: 'Ansiedade digital — menos animações + modo resumo' },
                { value: 'overload', label: 'Sobrecarga mental — modo resumo + foco + alertas' },
              ]}
              onChange={(v) => {
                if (v === 'none') void patch({ cognitiveCondition: 'none' })
                else void patch({ ...COGNITIVE_PRESETS[v], cognitiveCondition: v })
              }}
            />
            <Typography color="text.secondary" sx={{ fontSize: 13 }}>
              Ao escolher uma necessidade, as preferências acima são ajustadas automaticamente. Você pode refiná-las depois.
            </Typography>
          </Stack>

          <Divider />

          <Stack spacing={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>1️⃣1️⃣ Rotina (Pomodoro)</Typography>
            <Select<RoutineType>
              label="Controle"
              value={preferences.routine}
              disabled={loading}
              options={[
                { value: 'study', label: `Estudo — ${ROUTINE_POMODORO.study.focusMinutes} min foco + ${ROUTINE_POMODORO.study.breakMinutes} min pausa` },
                { value: 'work', label: `Trabalho — ${ROUTINE_POMODORO.work.focusMinutes} min foco + ${ROUTINE_POMODORO.work.breakMinutes} min pausa` },
                { value: 'focus', label: `Alta concentração — ${ROUTINE_POMODORO.focus.focusMinutes} min foco + ${ROUTINE_POMODORO.focus.breakMinutes} min pausa` },
              ]}
              onChange={(v) => void patch({ routine: v })}
            />
          </Stack>

          <Divider />

          <Stack direction="row" spacing={1} alignItems="center">
            <Paper variant="outlined" sx={{ p: 1.5, display: 'flex', alignItems: 'center' }}>
              <Typography color="text.secondary" sx={{ mr: 1 }}>Restaurar padrões</Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => void reset()}
                disabled={loading}
                aria-label="Resetar preferências"
                sx={{ minWidth: 112, borderRadius: 999, fontWeight: 700 }}
              >
                Restaurar
              </Button>
            </Paper>
          </Stack>
        </Stack>
      </Card>
    </Stack>
  )
}
