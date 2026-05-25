import { alpha, createTheme, type Theme, type TypographyStyle } from '@mui/material/styles';

interface AppThemeTokens {
  palette: {
    accentSoft: string;
    focusRing: string;
    imagePlaceholder: string;
    invertedDivider: string;
    invertedSurface: string;
    invertedText: string;
    invertedTextMuted: string;
    warmSurface: string;
    whiteOverlay: string;
  };
  shadows: {
    card: string;
    cardFocus: string;
    cardHover: string;
    floatingSurface: string;
    overlayBadge: string;
  };
  typography: {
    cardTitle: TypographyStyle;
    detailTitle: TypographyStyle;
    pageTitle: TypographyStyle;
    sectionTitle: TypographyStyle;
  };
}

declare module '@mui/material/styles' {
  interface Theme {
    app: AppThemeTokens;
  }

  interface ThemeOptions {
    app?: AppThemeTokens;
  }
}

const colors = {
  accent: '#237a76',
  background: '#f6f1ea',
  imagePlaceholder: '#edf2f0',
  invertedSurface: '#111827',
  paper: '#ffffff',
  textPrimary: '#111827',
  textSecondary: '#5f6b7a',
  warmSurface: '#fffaf4',
};

/**
 * App-level визуальные токены для theme overrides и server-safe `sx` объектов.
 */
export const appStyleTokens: AppThemeTokens = {
  palette: {
    accentSoft: alpha(colors.accent, 0.06),
    focusRing: alpha(colors.accent, 0.22),
    imagePlaceholder: colors.imagePlaceholder,
    invertedDivider: alpha(colors.paper, 0.28),
    invertedSurface: colors.invertedSurface,
    invertedText: colors.paper,
    invertedTextMuted: alpha(colors.paper, 0.68),
    warmSurface: colors.warmSurface,
    whiteOverlay: alpha(colors.paper, 0.72),
  },
  shadows: {
    card: `0 14px 34px ${alpha('#141d2d', 0.08)}`,
    cardFocus: `0 0 0 3px ${alpha(colors.accent, 0.2)}, 0 20px 44px ${alpha('#141d2d', 0.13)}`,
    cardHover: `0 20px 44px ${alpha('#141d2d', 0.13)}`,
    floatingSurface: `0 18px 48px ${alpha('#141d2d', 0.12)}`,
    overlayBadge: `0 8px 20px ${alpha('#0f172a', 0.14)}`,
  },
  typography: {
    cardTitle: {
      fontSize: 'clamp(1.05rem, 0.9rem + 0.45vw, 1.28rem)',
      fontWeight: 700,
      lineHeight: 1.18,
    },
    detailTitle: {
      fontSize: 'clamp(2.2rem, 1.55rem + 2.6vw, 4.4rem)',
      fontWeight: 700,
      letterSpacing: 0,
      lineHeight: 1.02,
    },
    pageTitle: {
      fontSize: 'clamp(2rem, 1.4rem + 2vw, 3.4rem)',
      fontWeight: 700,
      letterSpacing: 0,
      lineHeight: 1.04,
    },
    sectionTitle: {
      fontSize: '1.65rem',
      fontWeight: 800,
      lineHeight: 1.2,
    },
  },
};

/**
 * Это хелпер. Возвращает радиус app-level surface поверх базового MUI radius.
 */
function getSurfaceRadius(theme: Theme): number | string {
  return typeof theme.shape.borderRadius === 'number'
    ? theme.shape.borderRadius * 2
    : theme.shape.borderRadius;
}

/**
 * Общая MUI-тема приложения с app-level визуальными токенами.
 */
export const appTheme = createTheme({
  app: appStyleTokens,
  palette: {
    mode: 'light',
    primary: {
      main: colors.accent,
    },
    background: {
      default: colors.background,
      paper: colors.paper,
    },
    common: {
      white: colors.paper,
    },
    divider: alpha('#1f2937', 0.1),
    text: {
      primary: colors.textPrimary,
      secondary: colors.textSecondary,
    },
    action: {
      hover: appStyleTokens.palette.accentSoft,
      focus: appStyleTokens.palette.focusRing,
    },
  },
  shape: {
    borderRadius: 4,
  },
  typography: {
    fontFamily: 'var(--font-roboto)',
    h1: appStyleTokens.typography.pageTitle,
    h2: appStyleTokens.typography.sectionTitle,
    h3: {
      fontSize: '1.2rem',
      fontWeight: 800,
      lineHeight: 1.25,
    },
    body1: {
      lineHeight: 1.55,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.shape.borderRadius,
          fontWeight: 700,
        }),
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: ({ theme }) => ({
          overflow: 'hidden',
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: getSurfaceRadius(theme),
          boxShadow: theme.app.shadows.card,
          color: 'inherit',
          textDecoration: 'none',
          transition: 'transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease',
          '&:hover, &:focus-within': {
            borderColor: alpha(theme.palette.primary.main, 0.35),
            boxShadow: theme.app.shadows.cardHover,
            transform: 'translateY(-4px)',
          },
          '&:focus-within': {
            boxShadow: theme.app.shadows.cardFocus,
          },
          '@media (prefers-reduced-motion: reduce)': {
            transition: 'none',
          },
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 700,
        },
        avatar: {
          fontWeight: 800,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        outlined: ({ theme }) => ({
          borderColor: theme.palette.divider,
          borderRadius: getSurfaceRadius(theme),
        }),
      },
    },
  },
});
