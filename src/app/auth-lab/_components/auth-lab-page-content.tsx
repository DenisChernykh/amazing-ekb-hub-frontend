import { AuthLabClientPanel } from '@/app/auth-lab/_components/auth-lab-client-panel';
import { logoutAuthLabAction } from '@/app/auth-lab/_lib/logout-auth-lab-action';
import type { SessionState } from '@/entities/session';
import { Box, Button, Chip, Container, Divider, Paper, Stack, Typography } from '@mui/material';

interface AuthLabPageContentProps {
  session: SessionState;
}

/**
 * Рендерит тестовый стенд авторизации.
 *
 * @param props - Текущая server-side session model.
 */
export function AuthLabPageContent({ session }: Readonly<AuthLabPageContentProps>) {
  const user = session.user;

  return (
    <Container component="main" maxWidth="md" sx={{ py: { xs: 3, sm: 5 } }}>
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography component="h1" fontWeight={800} letterSpacing={0} variant="h3">
            Auth lab
          </Typography>
          <Typography color="text.secondary" fontSize="1.05rem">
            Тестовый стенд для проверки login, session, role/permission helpers и будущего поведения
            `401/403`.
          </Typography>
        </Stack>

        <Paper
          elevation={0}
          variant="outlined"
          sx={{
            p: { xs: 2, sm: 3 },
          }}
        >
          <Stack spacing={2}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              spacing={2}
            >
              <Box>
                <Typography component="h2" fontWeight={700} variant="h6">
                  Server session snapshot
                </Typography>
                <Typography color="text.secondary">
                  Этот блок отрендерен на сервере через `getCurrentSession()`.
                </Typography>
              </Box>
              <Chip
                color={session.status === 'authenticated' ? 'success' : 'default'}
                label={session.status}
                sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
              />
            </Stack>

            {user ? (
              <Stack spacing={1}>
                <Typography>
                  <strong>ID:</strong> {user.id}
                </Typography>
                <Typography>
                  <strong>Email:</strong> {user.email}
                </Typography>
                <Typography>
                  <strong>Role:</strong> {user.role}
                </Typography>
              </Stack>
            ) : (
              <Typography color="text.secondary">
                Сейчас пользователь анонимный. Нажми “Login as test user/admin” и войди тестовыми
                учетками.
              </Typography>
            )}

            <Divider />

            <Stack direction="row" flexWrap="wrap" gap={1}>
              <Button href="/login?redirectTo=/auth-lab" variant="contained">
                Login with redirect
              </Button>
              <Button href="/auth-lab/protected" variant="outlined">
                Protected route
              </Button>
              <Button href="/auth-lab/admin" variant="outlined">
                Admin route
              </Button>
              {user && (
                <Box component="form" action={logoutAuthLabAction}>
                  <Button color="inherit" type="submit" variant="outlined">
                    Logout
                  </Button>
                </Box>
              )}
            </Stack>
          </Stack>
        </Paper>

        <AuthLabClientPanel />

        <Paper
          elevation={0}
          variant="outlined"
          sx={{
            p: { xs: 2, sm: 3 },
          }}
        >
          <Stack spacing={1}>
            <Typography component="h2" fontWeight={700} variant="h6">
              Manual checks
            </Typography>
            <Typography color="text.secondary">
              Проверь login redirect, protected route, admin route, logout и controlled `401` на
              неверных credentials.
            </Typography>
            <Typography color="text.secondary">
              `403`-сценарий не должен редиректить на login и не должен очищать session.
            </Typography>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
