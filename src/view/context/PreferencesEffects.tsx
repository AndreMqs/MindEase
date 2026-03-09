import { useEffect } from 'react'
import { usePreferencesVM } from '../viewmodels/preferencesVM'
import { useShellStore } from '../../shared/store/useShellStore'
import { getCssVars } from '../theme/palette'

function getPrefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function PreferencesEffects() {
  const prefs = usePreferencesVM((s) => s.preferences)

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--me-font-size', `${prefs.fontSizePx}px`)
    root.style.setProperty('--me-spacing', `${prefs.spacingPx}px`)
    root.style.setProperty('--me-spacing-scale', String(prefs.spacingPx / 8))

    const prefersReduced = getPrefersReducedMotion()
    const animationsEffective = prefs.animationsEnabled && !prefersReduced
    const animations = animationsEffective ? 'on' : 'off'
    root.dataset.meAnimations = animations
    root.dataset.mePrefersReducedMotion = prefersReduced ? 'reduce' : 'no-preference'
    root.style.setProperty('--me-anim-duration', animationsEffective ? '180ms' : '0ms')

    root.dataset.meContrast = prefs.contrast
    root.dataset.meFocus = prefs.focusMode ? 'on' : 'off'
    root.dataset.meComplexity = prefs.complexity
    root.dataset.meSummary = prefs.summaryMode ? 'on' : 'off'
    root.dataset.meNavProfile = prefs.navigationProfile

    const cssVars = getCssVars({ contrast: prefs.contrast, complexity: prefs.complexity })
    Object.entries(cssVars).forEach(([key, value]) => root.style.setProperty(key, value))
  }, [prefs])

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => {
      const root = document.documentElement
      const prefersReduced = media.matches
      const prefs = useShellStore.getState().preferences
      const animationsEffective = prefs.animationsEnabled && !prefersReduced
      root.dataset.meAnimations = animationsEffective ? 'on' : 'off'
      root.dataset.mePrefersReducedMotion = prefersReduced ? 'reduce' : 'no-preference'
      root.style.setProperty('--me-anim-duration', animationsEffective ? '180ms' : '0ms')
    }
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [])

  return null
}
