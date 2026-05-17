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
 * Создаёт stable key для session boundary.
 *
 * @param session - Текущая server-side session model.
 * @returns Ключ, меняющийся при смене пользователя или anonymous/authenticated статуса.
 */
function getSessionBoundaryKey(session: SessionState): string {
  if (session.status === 'anonymous') {
    return 'anonymous';
  }

  return `${session.user.id}:${session.user.role}`;
}

/**
 * Подключает корневые runtime providers приложения.
 *
 * @remarks
 * Session provider остаётся persistent boundary. После login/logout server
 * actions инвалидируют layout, а key пересоздаёт session boundary с новой
 * server-side session model.
 */
export function Providers({ children, initialSession }: Readonly<ProvidersProps>) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline>
        <SessionProvider
          key={getSessionBoundaryKey(initialSession)}
          initialSession={initialSession}
        >
          {children}
        </SessionProvider>
      </CssBaseline>
    </ThemeProvider>
  );
}
