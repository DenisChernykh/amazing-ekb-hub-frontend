import { AUTH_PERMISSIONS, hasPermission } from '@/entities/session';
import { getCurrentSession } from '@/entities/session/server';
import { Alert, Button, Container, Paper, Stack, Typography } from '@mui/material';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Admin auth lab | Стрельчук в Екатеринбурге',
};

export default async function AuthLabAdminPage() {
  const session = await getCurrentSession();

  if (session.status === 'anonymous') {
    redirect('/login?redirectTo=/auth-lab/admin');
  }

  const canAccessAdmin = hasPermission(session, AUTH_PERMISSIONS.ADMIN_ACCESS);

  return (
    <Container component="main" maxWidth="md" sx={{ py: { xs: 3, sm: 5 } }}>
      <Paper
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          p: { xs: 2, sm: 3 },
        }}
      >
        <Stack spacing={2}>
          <Typography component="h1" fontWeight={800} letterSpacing={0} variant="h4">
            Admin route
          </Typography>

          {canAccessAdmin ? (
            <Alert severity="success" variant="outlined">
              Admin permission есть. Это пример server-side route gating по permission.
            </Alert>
          ) : (
            <Alert severity="warning" variant="outlined">
              Access denied. Это `403`-сценарий: пользователь известен, поэтому на login не
              редиректим и session не очищаем.
            </Alert>
          )}

          <Typography>
            Current user: <strong>{session.user.email}</strong>
          </Typography>
          <Typography>
            Role: <strong>{session.user.role}</strong>
          </Typography>
          <Button href="/auth-lab" sx={{ alignSelf: 'flex-start' }} variant="outlined">
            Back to auth lab
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}
