import { Paper, Stack, Typography } from '@mui/material';

/**
 * Рендерит intro-блок draft home-страницы.
 *
 * @returns Intro-карточку с пояснением новой архитектуры.
 */
export function HomeDraftIntroCard() {
  return (
    <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 } }}>
      <Stack spacing={2}>
        <Typography variant="overline" component="p" sx={{ color: 'text.secondary' }}>
          Draft home
        </Typography>

        <Typography variant="body1" color="text.secondary">
          Это тестовая страница новой архитектуры: server-first route, throw-based module API и
          `std-errors` для expected/fatal flow.
        </Typography>
      </Stack>
    </Paper>
  );
}
