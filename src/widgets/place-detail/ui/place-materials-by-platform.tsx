import {
  buildPlaceMaterialsAnchor,
  formatMaterialsCount,
  getPlatformDisplay,
  PLACE_PLATFORMS,
  type PlaceMaterialsByPlatform,
} from '@/entities/place';
import { Chip, Divider, Paper, Stack, Typography } from '@mui/material';
import { PlatformMaterialList } from './platform-material-list';

interface MaterialsByPlatformProps {
  materialsByPlatform: PlaceMaterialsByPlatform;
}

/**
 * Рендерит секции материалов, сгруппированные по платформам.
 */
export function MaterialsByPlatform({ materialsByPlatform }: Readonly<MaterialsByPlatformProps>) {
  return (
    <Stack component="section" spacing={2}>
      <Typography color="text.primary" component="h2" variant="h2">
        Материалы по платформам
      </Typography>

      {PLACE_PLATFORMS.map((platform) => {
        const platformDisplay = getPlatformDisplay(platform);
        const materials = materialsByPlatform[platform];

        return (
          <Paper
            component="section"
            elevation={0}
            id={buildPlaceMaterialsAnchor(platform)}
            key={platform}
            variant="outlined"
            sx={{
              overflow: 'hidden',
            }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              gap={1}
              sx={{ p: 2 }}
            >
              <Typography color="text.primary" component="h3" variant="h3">
                {platformDisplay.label}
              </Typography>
              <Chip
                label={formatMaterialsCount(materials.length)}
                size="small"
                sx={{
                  bgcolor: platformDisplay.backgroundColor,
                  color: platformDisplay.color,
                  fontWeight: 700,
                }}
              />
            </Stack>

            <Divider />

            {materials.length > 0 ? (
              <PlatformMaterialList materials={materials} />
            ) : (
              <Typography color="text.secondary" sx={{ px: 2, py: 2.25 }}>
                Материалов на этой платформе пока нет.
              </Typography>
            )}
          </Paper>
        );
      })}
    </Stack>
  );
}
