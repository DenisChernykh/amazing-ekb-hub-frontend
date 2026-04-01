import { Paper, Stack, Typography } from '@mui/material';

/**
 * Пропсы empty-состояния ленты мест.
 */
export interface PlaceFeedEmptyStateProps {
  title: string;
  description: string;
}

/**
 * Рендерит empty-состояние ленты мест.
 *
 * @param props - Заголовок и описание empty-состояния.
 * @returns Пустое состояние home-ленты.
 */
export function PlaceFeedEmptyState({ title, description }: Readonly<PlaceFeedEmptyStateProps>) {
  return (
    <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 } }}>
      <Stack spacing={1} alignItems="center" textAlign="center">
        <Typography variant="h6" component="h2">
          {title}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Stack>
    </Paper>
  );
}
