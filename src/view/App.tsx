import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { AppRouter } from './AppRouter'
import { PreferencesEffects } from './context/PreferencesEffects'
import { usePreferencesVM } from './viewmodels/preferencesVM'
import { buildMuiTheme } from './theme/muiTheme'
import { useMemo } from 'react'

export function App() {
  const prefs = usePreferencesVM((s) => s.preferences)
  const init = usePreferencesVM((s) => s.init)
  // ensure preferences loaded once
  useMemo(() => {
    void init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const theme = useMemo(() => buildMuiTheme(prefs), [prefs])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <PreferencesEffects />
        <AppRouter />
      </BrowserRouter>
    </ThemeProvider>
  )
}
