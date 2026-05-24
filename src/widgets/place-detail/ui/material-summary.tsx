import {
  formatMaterialDuration,
  formatMaterialPublishedDate,
  getMaterialTypeDisplay,
  getPlatformDisplay,
  type PlaceMaterialModel,
} from '@/entities/place';
import { Chip, Stack, Typography } from '@mui/material';

interface MaterialSummaryProps {
  material: PlaceMaterialModel;
  tone?: 'default' | 'inverted';
}

/**
 * Рендерит краткую информацию материала для pinned-блока и списков платформ.
 */
export function MaterialSummary({ material, tone = 'default' }: Readonly<MaterialSummaryProps>) {
  const typeLabel = getMaterialTypeDisplay(material.type);
  const publishedAt = formatMaterialPublishedDate(material.publishedAt);
  const duration = formatMaterialDuration(material.durationSec);
  const platformDisplay = getPlatformDisplay(material.platform);
  const isInverted = tone === 'inverted';
  const outlinedChipSx = isInverted
    ? {
        borderColor: 'rgba(255, 255, 255, 0.28)',
        color: 'rgba(255, 255, 255, 0.82)',
      }
    : undefined;

  return (
    <Stack spacing={1}>
      <Stack direction="row" flexWrap="wrap" gap={0.75}>
        <Chip
          label={typeLabel}
          size="small"
          sx={{
            bgcolor: platformDisplay.backgroundColor,
            color: platformDisplay.color,
            fontWeight: 700,
          }}
        />
        <Chip label={publishedAt} size="small" sx={outlinedChipSx} variant="outlined" />
        {duration && <Chip label={duration} size="small" sx={outlinedChipSx} variant="outlined" />}
      </Stack>

      <Typography color={isInverted ? '#fff' : '#111827'} fontWeight={700} lineHeight={1.2}>
        {material.title}
      </Typography>
    </Stack>
  );
}
