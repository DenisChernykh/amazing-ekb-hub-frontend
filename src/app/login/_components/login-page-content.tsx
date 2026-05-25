import { LoginForm } from '@/features/auth-login';
import { appStyleTokens } from '@/shared/ui/theme';
import { Container, Paper, Stack, Typography } from '@mui/material';

interface LoginPageContentProps {
  redirectTo: string;
}

/**
 * Рендерит route-private экран логина.
 *
 * @param props - Нормализованный redirect после успешного входа.
 */
export function LoginPageContent({ redirectTo }: Readonly<LoginPageContentProps>) {
  return (
    <Container
      component="main"
      maxWidth="sm"
      sx={{
        display: 'flex',
        minHeight: '100dvh',
        alignItems: 'center',
        py: { xs: 3, sm: 6 },
      }}
    >
      <Paper
        elevation={0}
        variant="outlined"
        sx={{
          width: '100%',
          boxShadow: appStyleTokens.shadows.floatingSurface,
          p: { xs: 2.5, sm: 4 },
        }}
      >
        <Stack spacing={3}>
          <Stack spacing={1}>
            <Typography
              color="text.primary"
              component="h1"
              fontSize={{ xs: '2rem', sm: '2.45rem' }}
              fontWeight={700}
              letterSpacing={0}
              lineHeight={1.08}
            >
              Вход
            </Typography>
            <Typography color="text.secondary" fontSize="1rem" lineHeight={1.55}>
              Доступ к личным функциям и управлению местами.
            </Typography>
          </Stack>

          <LoginForm redirectTo={redirectTo} />
        </Stack>
      </Paper>
    </Container>
  );
}
