import { getCurrentSession } from '@/entities/session/server';
import { Alert, Button, Container, Paper, Stack, Typography } from '@mui/material';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Protected auth lab | Стрельчук в Екатеринбурге',
};

export default async function AuthLabProtectedPage() {
  const session = await getCurrentSession();

  if (session.status === 'anonymous') {
    redirect('/login?redirectTo=/auth-lab/protected');
  }

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
            Protected route
          </Typography>
          <Alert severity="success" variant="outlined">
            Ты авторизован. Anonymous user сюда не попадает: route делает redirect на login с
            `redirectTo=/auth-lab/protected`.
          </Alert>
          <Typography>
            Current user: <strong>{session.user.email}</strong>
          </Typography>
          <Button href="/auth-lab" sx={{ alignSelf: 'flex-start' }} variant="outlined">
            Back to auth lab
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}
