import type { PlaceMaterialModel } from '@/entities/place';
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
        bgcolor: '#111827',
        color: '#fff',
        borderRadius: 2,
      }}
    >
      <Stack height="100%" spacing={2.25} justifyContent="space-between">
        <Stack spacing={1.5}>
          <Typography color="rgba(255, 255, 255, 0.68)" fontWeight={700} variant="overline">
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
              bgcolor: '#fff',
              color: '#111827',
              fontWeight: 800,
              '&:hover': {
                bgcolor: '#f3f4f6',
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
