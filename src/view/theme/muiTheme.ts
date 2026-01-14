import { createTheme } from '@mui/material/styles'
import type { Preferences } from '../../domain/entities/Preferences'

const FIAP_RED = '#E4002B'
const FIAP_PINK = '#FF1E4B'
const FIAP_DARK = '#0A0A0A'
const FIAP_SURFACE = '#111217'

export function buildMuiTheme(prefs: Preferences) {
  const contrast = prefs.contrast // 'normal' | 'high'
  const isDetailed = prefs.complexity === 'detailed'
  const isHigh = contrast === 'high'

  // More FIAP-like on normal; ultra legible on high.
  const bg = isHigh ? '#000000' : FIAP_DARK
  const paper = isHigh ? '#0A0A0A' : FIAP_SURFACE

  // Detailed mode is intentionally more "loud"
  const primaryMain = isHigh ? '#FFFFFF' : isDetailed ? FIAP_PINK : FIAP_RED
  const secondaryMain = isHigh ? '#FFFFFF' : FIAP_RED

  const border = isHigh ? 'rgba(255,255,255,0.18)' : isDetailed ? 'rgba(255,30,75,0.55)' : 'rgba(228,0,43,0.40)'
  const glow = isHigh ? 'none' : isDetailed ? `0 0 0 1px rgba(255,30,75,0.28), 0 0 22px rgba(255,30,75,0.18)` : `0 0 0 1px rgba(228,0,43,0.20)`

  return createTheme({
    palette: {
      mode: 'dark',
      primary: { main: primaryMain },
      secondary: { main: secondaryMain },
      background: { default: bg, paper },
      text: {
        primary: isHigh ? '#FFFFFF' : '#F6F7FB',
        secondary: isHigh ? '#D6D7DD' : 'rgba(255,255,255,0.72)',
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
            border: `1px solid ${border}`,
            boxShadow: glow,
            backdropFilter: isHigh ? 'none' : 'saturate(110%) blur(6px)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            border: `1px solid ${border}`,
            boxShadow: glow,
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
            boxShadow: isHigh ? 'none' : `0 10px 30px rgba(228,0,43,0.22)`,
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
      // Fix white dropdown/pickers
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
              backgroundColor: isHigh ? 'rgba(255,255,255,0.12)' : 'rgba(228,0,43,0.22)',
            },
            '&.Mui-selected:hover': {
              backgroundColor: isHigh ? 'rgba(255,255,255,0.16)' : 'rgba(228,0,43,0.28)',
            },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          icon: { color: isHigh ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.70)' },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: border,
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: isHigh ? 'rgba(255,255,255,0.40)' : 'rgba(255,30,75,0.65)',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: isHigh ? '#FFFFFF' : FIAP_PINK,
              boxShadow: isHigh ? 'none' : '0 0 0 4px rgba(255,30,75,0.15)',
            },
          },
        },
      },
    },
  })
}
