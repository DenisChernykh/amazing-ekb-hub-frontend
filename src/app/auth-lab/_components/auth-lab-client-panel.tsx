'use client';

import { AUTH_PERMISSIONS, useSession, type AuthPermission } from '@/entities/session';
import { Alert, Button, Chip, Divider, Paper, Stack, Typography } from '@mui/material';

const DEMO_PERMISSIONS: AuthPermission[] = [
  AUTH_PERMISSIONS.ADMIN_ACCESS,
  AUTH_PERMISSIONS.PLACES_MANAGE,
  AUTH_PERMISSIONS.MATERIALS_MANAGE,
  AUTH_PERMISSIONS.FAVORITES_READ,
  AUTH_PERMISSIONS.FAVORITES_WRITE,
];

/**
 * Показывает, что именно доступно клиентскому UI через `SessionProvider`.
 */
export function AuthLabClientPanel() {
  const {
    session,
    user,
    isAuthenticated,
    hasPermission: checkPermission,
    hasRole: checkRole,
  } = useSession();

  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{
        p: { xs: 2, sm: 3 },
      }}
    >
      <Stack spacing={2}>
        <Stack spacing={0.75}>
          <Typography component="h2" fontWeight={700} variant="h6">
            Client session probe
          </Typography>
          <Typography color="text.secondary">
            Этот блок читает `useSession()` на клиенте. Токенов здесь нет, только безопасная модель
            пользователя.
          </Typography>
        </Stack>

        <Alert
          severity={session.status === 'authenticated' ? 'success' : 'info'}
          variant="outlined"
        >
          Client status: {session.status}
        </Alert>

        {user && (
          <Stack spacing={1.25}>
            <Typography>
              <strong>Email:</strong> {user.email}
            </Typography>
            <Typography>
              <strong>Role:</strong> {user.role}
            </Typography>
          </Stack>
        )}

        <Divider />

        <Stack spacing={1}>
          <Typography fontWeight={700}>Session permissions</Typography>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {user?.permissions.map((permission) => (
              <Chip key={permission} label={permission} size="small" />
            )) ?? <Chip label="Нет permissions, потому что пользователь anonymous" size="small" />}
          </Stack>
        </Stack>

        <Stack spacing={1}>
          <Typography fontWeight={700}>Helper checks</Typography>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            <Chip
              color={checkRole('admin') ? 'success' : 'default'}
              label={`hasRole(admin): ${String(checkRole('admin'))}`}
              size="small"
            />
            <Chip
              color={checkRole('user') ? 'success' : 'default'}
              label={`hasRole(user): ${String(checkRole('user'))}`}
              size="small"
            />
            {DEMO_PERMISSIONS.map((permission) => (
              <Chip
                key={permission}
                color={checkPermission(permission) ? 'success' : 'default'}
                label={`${permission}: ${String(checkPermission(permission))}`}
                size="small"
              />
            ))}
          </Stack>
        </Stack>

        <Stack spacing={1}>
          <Typography fontWeight={700}>UI gating examples</Typography>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {isAuthenticated && (
              <Button size="small" variant="contained">
                Видно всем авторизованным
              </Button>
            )}

            {checkRole('admin') && (
              <Button color="success" size="small" variant="contained">
                Видно только admin
              </Button>
            )}

            {checkRole('user') && (
              <Button color="secondary" size="small" variant="contained">
                Видно только user
              </Button>
            )}

            {!isAuthenticated && (
              <Button size="small" variant="outlined">
                Видно только anonymous
              </Button>
            )}
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
}
