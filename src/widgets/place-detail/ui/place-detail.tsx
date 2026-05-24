import type { PlaceDetailModel } from '@/entities/place';
import { Container, Grid } from '@mui/material';
import { PinnedMaterial } from './pinned-material';
import { PlaceCoverImage } from './place-cover-image';
import { PlaceDetailHero } from './place-detail-hero';
import { MaterialsByPlatform } from './place-materials-by-platform';
import { PlatformCounters } from './platform-counters';

interface PlaceDetailProps {
  place: PlaceDetailModel;
}

/**
 * Рендерит server-first детальную страницу места.
 *
 * @param props - Frontend contract detail-страницы места.
 */
export function PlaceDetail({ place }: Readonly<PlaceDetailProps>) {
  const pinnedMaterial = place.pinnedMaterial;
  const materialsGridSize = pinnedMaterial ? { xs: 12, md: 7 } : { xs: 12 };

  return (
    <Container component="main" maxWidth="lg" sx={{ py: { xs: 3.75, sm: 6 }, pb: 8 }}>
      <Grid container spacing={{ xs: 2.5, md: 3 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <PlaceDetailHero place={place} />
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <PlaceCoverImage place={place} />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <PlatformCounters counters={place.platformCounters} />
        </Grid>

        {pinnedMaterial && (
          <Grid size={{ xs: 12, md: 5 }}>
            <PinnedMaterial material={pinnedMaterial} />
          </Grid>
        )}

        <Grid size={materialsGridSize}>
          <MaterialsByPlatform materialsByPlatform={place.materialsByPlatform} />
        </Grid>
      </Grid>
    </Container>
  );
}
