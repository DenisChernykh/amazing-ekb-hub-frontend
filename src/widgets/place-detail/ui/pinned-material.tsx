import type { PlaceMaterialModel } from '@/entities/place';
import { appStyleTokens } from '@/shared/ui/theme';
import { Button, Paper, Stack, Typography } from '@mui/material';
import { MaterialSummary } from './material-summary';

interface PinnedMaterialProps {
  material: PlaceMaterialModel;
}

/**
 * Рендерит блок закрепленного материала на странице места.
 */
export function PinnedMaterial({ material }: Readonly<PinnedMaterialProps>) {
  return (
    <Paper
      aria-label="Закрепленный материал"
      component="section"
      elevation={0}
      sx={{
        height: '100%',
        p: { xs: 2.5, sm: 3 },
        bgcolor: appStyleTokens.palette.invertedSurface,
        color: appStyleTokens.palette.invertedText,
        borderRadius: 2,
      }}
    >
      <Stack height="100%" spacing={2.25} justifyContent="space-between">
        <Stack spacing={1.5}>
          <Typography
            fontWeight={700}
            sx={{ color: appStyleTokens.palette.invertedTextMuted }}
            variant="overline"
          >
            Закрепленный материал
          </Typography>

          <MaterialSummary material={material} tone="inverted" />
        </Stack>

        {material?.url && (
          <Button
            component="a"
            href={material.url}
            rel="noreferrer"
            target="_blank"
            variant="contained"
            sx={{
              alignSelf: 'flex-start',
              bgcolor: 'background.paper',
              color: 'text.primary',
              fontWeight: 800,
              '&:hover': {
                bgcolor: 'grey.100',
              },
            }}
          >
            Открыть материал
          </Button>
        )}
      </Stack>
    </Paper>
  );
}
