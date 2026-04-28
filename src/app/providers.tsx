'use client';

import { SessionProvider, type SessionState } from '@/entities/session';
import { CssBaseline } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

interface ProvidersProps {
  initialSession: SessionState;
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
 * Сейчас здесь инициализируется Material UI theme runtime.
 * По мере роста приложения сюда могут добавляться и другие
 * app-level провайдеры, например query/auth/i18n.
 */
export function Providers({ children, initialSession }: Readonly<ProvidersProps>) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline>
        <SessionProvider initialSession={initialSession}>{children}</SessionProvider>
      </CssBaseline>
    </ThemeProvider>
  );
}
