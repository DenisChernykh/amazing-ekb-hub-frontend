import { PlaceCategoryBadge, type PlaceDetailModel } from '@/entities/place';
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
      sx={{
        height: '100%',
        p: { xs: 2.5, sm: 3.5 },
        bgcolor: '#fffaf4',
        border: '1px solid rgba(31, 41, 55, 0.1)',
        borderRadius: 2,
      }}
    >
      <Stack spacing={2.25}>
        <PlaceCategoryBadge category={place.category} />

        <Stack spacing={1.25}>
          <Typography
            color="#111827"
            component="h1"
            fontSize="clamp(2.2rem, 1.55rem + 2.6vw, 4.4rem)"
            fontWeight={700}
            letterSpacing={0}
            lineHeight={1.02}
          >
            {place.title}
          </Typography>
          <Typography color="#4b5563" fontSize="1.08rem" lineHeight={1.65}>
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
                sx={{ bgcolor: '#fff', fontWeight: 600 }}
              />
            ))}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}
