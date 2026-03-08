/**
 * MindEase — paleta única (acessibilidade cognitiva).
 * Fonte da verdade para cores. Usado por muiTheme e injetado em :root para o SCSS.
 */

export const palette = {
  // Fundos
  bgMain: '#0F1115',
  surface: '#171A21',
  surfaceSecondary: '#1D2230',

  // Texto
  textPrimary: '#F5F7FA',
  textSecondary: '#AAB2BF',
  textSecondaryHighContrast: '#D6D7DD',

  // Ação / destaque
  accent: '#4C9AFF',
  accentHover: '#6AAEFF',

  // Semânticas
  success: '#4CAF50',
  warning: '#F59E0B',

  // Bordas
  border: 'rgba(255,255,255,0.08)',
  borderHighContrast: 'rgba(255,255,255,0.18)',
  borderDetailed: 'rgba(255,255,255,0.10)',

  // Focus outline (acessibilidade)
  focusOutline: 'rgba(76, 154, 255, 0.25)',
  inputFocusRing: 'rgba(76, 154, 255, 0.2)',
  menuSelected: 'rgba(76, 154, 255, 0.16)',
  menuSelectedHover: 'rgba(76, 154, 255, 0.22)',
} as const

export type Palette = typeof palette

/** Preferências de contraste/complexidade (apenas o que afeta cores) */
type PrefsForPalette = { contrast: string; complexity: string }

/** Gera valores das variáveis CSS :root a partir da paleta (fonte única). */
export function getCssVars(prefs: PrefsForPalette): Record<string, string> {
  const isHigh = prefs.contrast === 'high'
  const border = isHigh ? palette.borderHighContrast : (prefs.complexity === 'detailed' ? palette.borderDetailed : palette.border)
  const muted = isHigh ? palette.textSecondaryHighContrast : palette.textSecondary

  return {
    '--me-bg': palette.bgMain,
    '--me-surface': palette.surface,
    '--me-surface-secondary': palette.surfaceSecondary,
    '--me-border': border,
    '--me-text': palette.textPrimary,
    '--me-muted': muted,
    '--me-accent': palette.accent,
    '--me-accent-hover': palette.accentHover,
    '--me-success': palette.success,
    '--me-warning': palette.warning,
    '--me-focus-outline': palette.focusOutline,
  }
}
