import { Stack, Typography } from '@mui/material';

interface PlaceDetailPlatformSectionHeaderProps {
  title: string;
  countLabel: string;
}

/**
 * Рендерит header платформенной секции.
 *
 * @param props - Заголовок секции и count label.
 * @returns Header секции.
 */
export function PlaceDetailPlatformSectionHeader({
  title,
  countLabel,
}: Readonly<PlaceDetailPlatformSectionHeaderProps>) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-start', sm: 'center' }}
    >
      <Typography variant="h6" component="h2">
        {title}
      </Typography>

      <Typography variant="body2" color="text.secondary">
        {countLabel}
      </Typography>
    </Stack>
  );
}
