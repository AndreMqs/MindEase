import { useEffect } from 'react'
import { usePreferencesVM } from '../viewmodels/preferencesVM'

export function PreferencesEffects() {
  const prefs = usePreferencesVM((s) => s.preferences)

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--me-font-size', `${prefs.fontSizePx}px`)
    root.style.setProperty('--me-spacing', `${prefs.spacingPx}px`)

    const animations = prefs.animationsEnabled ? 'on' : 'off'
    root.dataset.meAnimations = animations
    root.style.setProperty('--me-anim-duration', prefs.animationsEnabled ? '180ms' : '0ms')

    root.dataset.meContrast = prefs.contrast // 'normal' | 'high'
    root.dataset.meFocus = prefs.focusMode ? 'on' : 'off'
    root.dataset.meComplexity = prefs.complexity
    root.dataset.meSummary = prefs.summaryMode ? 'on' : 'off'
  }, [prefs])

  return null
}
