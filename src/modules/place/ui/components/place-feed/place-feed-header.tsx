import { Box, Stack, Typography } from '@mui/material';

/**
 * Пропсы заголовка success-состояния ленты мест.
 */
export interface PlaceFeedHeaderProps {
  title: string;
  meta: string;
}

/**
 * Рендерит заголовок success-состояния ленты мест.
 *
 * @param props - Заголовок и мета-информация списка.
 * @returns Header-блок списка мест.
 */
export function PlaceFeedHeader({ title, meta }: Readonly<PlaceFeedHeaderProps>) {
  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
      >
        <Typography variant="h5" component="h2">
          {title}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {meta}
        </Typography>
      </Stack>
    </Box>
  );
}
