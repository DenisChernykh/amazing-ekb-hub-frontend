'use client';

import { CssBaseline } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

interface ProvidersProps {
  children: React.ReactNode;
}

const theme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#f6f1ea',
    },
  },
  typography: {
    fontFamily: 'var(--font-roboto)',
  },
});
/**
 * Подключает корневые runtime providers приложения.
 *
 * @remarks
 * Сейчас здесь инициализируется Material UI theme runtime. Session provider
 * живёт в `app/template.tsx`, чтобы обновляться после auth-навигаций.
 */
export function Providers({ children }: Readonly<ProvidersProps>) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline>{children}</CssBaseline>
    </ThemeProvider>
  );
}
