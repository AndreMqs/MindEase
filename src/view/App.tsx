import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { AppRouter } from './AppRouter'
import { AuthProvider } from './context/AuthContext'
import { PreferencesEffects } from './context/PreferencesEffects'
import { usePreferencesVM } from './viewmodels/preferencesVM'
import { buildMuiTheme } from './theme/muiTheme'
import { useEffect, useMemo } from 'react'

export function App() {
  const prefs = usePreferencesVM((s) => s.preferences)
  const init = usePreferencesVM((s) => s.init)
  useEffect(() => {
    void init()
  }, [init])

  const theme = useMemo(() => buildMuiTheme(prefs), [prefs])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <PreferencesEffects />
          <AppRouter />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}
