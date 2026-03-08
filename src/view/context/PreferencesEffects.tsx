import { useEffect } from 'react'
import { usePreferencesVM } from '../viewmodels/preferencesVM'
import { getCssVars } from '../theme/palette'

export function PreferencesEffects() {
  const prefs = usePreferencesVM((s) => s.preferences)

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--me-font-size', `${prefs.fontSizePx}px`)
    root.style.setProperty('--me-spacing', `${prefs.spacingPx}px`)
    root.style.setProperty('--me-spacing-scale', String(prefs.spacingPx / 8))

    const animations = prefs.animationsEnabled ? 'on' : 'off'
    root.dataset.meAnimations = animations
    root.style.setProperty('--me-anim-duration', prefs.animationsEnabled ? '180ms' : '0ms')

    root.dataset.meContrast = prefs.contrast
    root.dataset.meFocus = prefs.focusMode ? 'on' : 'off'
    root.dataset.meComplexity = prefs.complexity
    root.dataset.meSummary = prefs.summaryMode ? 'on' : 'off'
    root.dataset.meNavProfile = prefs.navigationProfile

    const cssVars = getCssVars({ contrast: prefs.contrast, complexity: prefs.complexity })
    Object.entries(cssVars).forEach(([key, value]) => root.style.setProperty(key, value))
  }, [prefs])

  return null
}
