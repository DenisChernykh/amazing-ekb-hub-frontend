import { PlaceCategoryBadge, type PlaceDetailModel } from '@/entities/place';
import { appStyleTokens } from '@/shared/ui/theme';
import { Chip, Paper, Stack, Typography } from '@mui/material';

interface PlaceDetailHeroProps {
  place: Pick<PlaceDetailModel, 'category' | 'summary' | 'tags' | 'title'>;
}

/**
 * Рендерит заголовочный блок детальной страницы места.
 */
export function PlaceDetailHero({ place }: Readonly<PlaceDetailHeroProps>) {
  return (
    <Paper
      component="header"
      elevation={0}
      variant="outlined"
      sx={{
        height: '100%',
        p: { xs: 2.5, sm: 3.5 },
        bgcolor: appStyleTokens.palette.warmSurface,
      }}
    >
      <Stack spacing={2.25}>
        <PlaceCategoryBadge category={place.category} />

        <Stack spacing={1.25}>
          <Typography
            color="text.primary"
            component="h1"
            sx={appStyleTokens.typography.detailTitle}
          >
            {place.title}
          </Typography>
          <Typography color="text.secondary" fontSize="1.08rem" lineHeight={1.65}>
            {place.summary}
          </Typography>
        </Stack>

        {place.tags.length > 0 && (
          <Stack aria-label="Теги места" direction="row" flexWrap="wrap" gap={0.75}>
            {place.tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                variant="outlined"
                sx={{ bgcolor: 'background.paper', fontWeight: 600 }}
              />
            ))}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}
