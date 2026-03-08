import { useEffect } from 'react'
import { useShellStore } from '../../shared/store/useShellStore'

export const usePreferencesVM = useShellStore

export function useInitPreferences() {
  const init = useShellStore((s) => s.initPreferences)
  useEffect(() => {
    init()
  }, [init])
}
