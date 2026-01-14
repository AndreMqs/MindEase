import { useEffect } from 'react'
import { useShellStore } from '../../shared/store/useShellStore'

/**
 * Preferences ViewModel (MVVM)
 * Delegates storage + cross-module sharing to the Shell Store (zustand).
 */
export const usePreferencesVM = useShellStore

// optional helper: auto-init once per mount
export function useInitPreferences() {
  const init = useShellStore((s) => s.initPreferences)
  useEffect(() => {
    init()
  }, [init])
}
