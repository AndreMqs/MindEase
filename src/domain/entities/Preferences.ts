export type ComplexityLevel = 'simple' | 'standard' | 'detailed'

export type ContrastLevel = 'normal' | 'high'

export interface Preferences {
  focusMode: boolean
  complexity: ComplexityLevel
  summaryMode: boolean
  contrast: ContrastLevel
  fontSizePx: number
  spacingPx: number
  animationsEnabled: boolean
  cognitiveAlertsEnabled: boolean
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
}
