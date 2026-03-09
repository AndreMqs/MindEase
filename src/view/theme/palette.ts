export const palette = {
  bgMain: '#0F1115',
  surface: '#171A21',
  surfaceSecondary: '#1D2230',

  textPrimary: '#F5F7FA',
  textSecondary: '#AAB2BF',
  textSecondaryHighContrast: '#D6D7DD',

  accent: '#4C9AFF',
  accentHover: '#6AAEFF',

  success: '#4CAF50',
  warning: '#F59E0B',

  border: 'rgba(255,255,255,0.08)',
  borderHighContrast: 'rgba(255,255,255,0.18)',
  borderDetailed: 'rgba(255,255,255,0.10)',

  focusOutline: 'rgba(76, 154, 255, 0.25)',
  inputFocusRing: 'rgba(76, 154, 255, 0.2)',
  menuSelected: 'rgba(76, 154, 255, 0.16)',
  menuSelectedHover: 'rgba(76, 154, 255, 0.22)',
} as const

export type Palette = typeof palette

type PrefsForPalette = { contrast: string; complexity: string }

export function getCssVars(prefs: PrefsForPalette): Record<string, string> {
  const isVeryHigh = prefs.contrast === 'veryHigh'
  const isHigh = prefs.contrast === 'high' || isVeryHigh
  const border = isVeryHigh
    ? 'rgba(255,255,255,0.25)'
    : isHigh
      ? palette.borderHighContrast
      : prefs.complexity === 'detailed'
        ? palette.borderDetailed
        : palette.border
  const muted = isVeryHigh
    ? '#FFFFFF'
    : isHigh
      ? palette.textSecondaryHighContrast
      : palette.textSecondary

  return {
    '--me-bg': isVeryHigh ? '#000000' : palette.bgMain,
    '--me-surface': isVeryHigh ? '#1a1a1a' : palette.surface,
    '--me-surface-secondary': isVeryHigh ? '#1f1f1f' : palette.surfaceSecondary,
    '--me-border': border,
    '--me-text': isVeryHigh ? '#FFFFFF' : palette.textPrimary,
    '--me-muted': muted,
    '--me-accent': palette.accent,
    '--me-accent-hover': palette.accentHover,
    '--me-success': palette.success,
    '--me-warning': palette.warning,
    '--me-focus-outline': palette.focusOutline,
  }
}
