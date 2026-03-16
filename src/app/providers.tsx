'use client';

import { CssBaseline } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

interface ProvidersProps {
  children: React.ReactNode;
}

const theme = createTheme({
  palette: {
    mode: 'light',
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
export function Providers({ children }: Readonly<ProvidersProps>) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline>{children}</CssBaseline>
    </ThemeProvider>
  );
}
