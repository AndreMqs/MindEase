export type ComplexityLevel = 'simple' | 'standard' | 'detailed'

export type ContrastLevel = 'normal' | 'high' | 'veryHigh'

/** Perfil de navegação: como o usuário prefere interagir (UI equilibrada / foco / com dicas). */
export type NavigationProfile = 'standard' | 'deepFocus' | 'assisted'

/** Rotina: afeta duração do Pomodoro (estudo 20+5, trabalho 45+10, foco 25+5). */
export type RoutineType = 'study' | 'work' | 'focus'

/** Necessidades cognitivas: aplica preset automático de preferências. */
export type CognitiveCondition = 'none' | 'adhd' | 'dyslexia' | 'anxiety' | 'overload'

export interface Preferences {
  focusMode: boolean
  complexity: ComplexityLevel
  summaryMode: boolean
  contrast: ContrastLevel
  fontSizePx: number
  spacingPx: number
  animationsEnabled: boolean
  cognitiveAlertsEnabled: boolean
  navigationProfile: NavigationProfile
  routine: RoutineType
  cognitiveCondition: CognitiveCondition
}

export const defaultPreferences: Preferences = {
  focusMode: false,
  complexity: 'standard',
  summaryMode: false,
  contrast: 'normal',
  fontSizePx: 16,
  spacingPx: 8,
  animationsEnabled: true,
  cognitiveAlertsEnabled: true,
  navigationProfile: 'standard',
  routine: 'focus',
  cognitiveCondition: 'none',
}

/** Presets aplicados ao selecionar uma necessidade cognitiva. */
export const COGNITIVE_PRESETS: Record<
  Exclude<CognitiveCondition, 'none'>,
  Partial<Preferences>
> = {
  adhd: {
    focusMode: true,
    animationsEnabled: false,
    spacingPx: 12,
    cognitiveCondition: 'adhd',
  },
  dyslexia: {
    fontSizePx: 18,
    spacingPx: 12,
    contrast: 'high',
    cognitiveCondition: 'dyslexia',
  },
  anxiety: {
    animationsEnabled: false,
    summaryMode: true,
    cognitiveCondition: 'anxiety',
  },
  overload: {
    summaryMode: true,
    focusMode: true,
    cognitiveAlertsEnabled: true,
    cognitiveCondition: 'overload',
  },
}

/** Duração do foco e da pausa por rotina (minutos). */
export const ROUTINE_POMODORO: Record<RoutineType, { focusMinutes: number; breakMinutes: number }> =
  {
    study: { focusMinutes: 20, breakMinutes: 5 },
    work: { focusMinutes: 45, breakMinutes: 10 },
    focus: { focusMinutes: 25, breakMinutes: 5 },
  }
