import { createTheme } from '@mui/material/styles'
import type { Preferences } from '../../domain/entities/Preferences'
import { palette } from './palette'

export function buildMuiTheme(prefs: Preferences) {
  const contrast = prefs.contrast
  const isVeryHigh = contrast === 'veryHigh'
  const isHigh = contrast === 'high' || isVeryHigh

  const bg = isVeryHigh ? '#000000' : palette.bgMain
  const paper = isVeryHigh ? '#1a1a1a' : palette.surface
  const textPrimary = isVeryHigh ? '#FFFFFF' : palette.textPrimary
  const textSecondary = isVeryHigh ? '#FFFFFF' : palette.textSecondary
  const border = isVeryHigh
    ? 'rgba(255,255,255,0.25)'
    : isHigh
      ? palette.borderHighContrast
      : palette.border

  return createTheme({
    spacing: prefs.spacingPx,
    palette: {
      mode: 'dark',
      primary: { main: palette.accent },
      secondary: { main: palette.accent },
      success: { main: palette.success },
      warning: { main: palette.warning },
      background: {
        default: bg,
        paper,
      },
      text: {
        primary: textPrimary,
        secondary: textSecondary,
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
            backgroundColor: bg,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: paper,
            border: `1px solid ${border}`,
            boxShadow: 'none',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: paper,
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
            transition:
              'transform var(--me-anim-duration) ease, box-shadow var(--me-anim-duration) ease, background var(--me-anim-duration) ease',
          },
          contained: {
            backgroundColor: palette.accent,
            color: textPrimary,
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
            backgroundColor: paper,
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
          icon: { color: textSecondary },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: paper,
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
