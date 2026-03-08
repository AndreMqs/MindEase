import { createTheme } from '@mui/material/styles'
import type { Preferences } from '../../domain/entities/Preferences'
import { palette } from './palette'

export function buildMuiTheme(prefs: Preferences) {
  const contrast = prefs.contrast
  const isHigh = contrast === 'high'

  const border = isHigh ? palette.borderHighContrast : palette.border

  return createTheme({
    palette: {
      mode: 'dark',
      primary: { main: palette.accent },
      secondary: { main: palette.accent },
      success: { main: palette.success },
      warning: { main: palette.warning },
      background: {
        default: palette.bgMain,
        paper: palette.surface,
      },
      text: {
        primary: palette.textPrimary,
        secondary: palette.textSecondary,
      },
    },
    shape: { borderRadius: 16 },
    typography: {
      fontFamily: 'Inter, system-ui, Arial, sans-serif',
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: palette.bgMain,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: palette.surface,
            border: `1px solid ${border}`,
            boxShadow: 'none',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: palette.surface,
            border: `1px solid ${border}`,
            boxShadow: 'none',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 800,
            transition: 'transform var(--me-anim-duration) ease, box-shadow var(--me-anim-duration) ease, background var(--me-anim-duration) ease',
          },
          contained: {
            backgroundColor: palette.accent,
            color: palette.textPrimary,
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: palette.accentHover,
              boxShadow: 'none',
            },
          },
          containedSecondary: {
            '&:hover': {
              backgroundColor: palette.accentHover,
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 700,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            '&.Mui-selected': {
              color: palette.accent,
            },
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            backgroundColor: palette.accent,
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundImage: 'none',
            backgroundColor: palette.surface,
            border: `1px solid ${border}`,
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            '&.Mui-selected': {
              backgroundColor: palette.menuSelected,
            },
            '&.Mui-selected:hover': {
              backgroundColor: palette.menuSelectedHover,
            },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          icon: { color: palette.textSecondary },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: palette.surface,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: border,
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: isHigh ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.14)',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: palette.accent,
              boxShadow: `0 0 0 2px ${palette.inputFocusRing}`,
            },
          },
        },
      },
    },
  })
}
