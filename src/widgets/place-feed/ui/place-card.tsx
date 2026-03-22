import AppLink from '@/shared/ui/app-link';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import { PLACE_FEED_CATEGORY_BACKGROUND, PLACE_FEED_CATEGORY_CHIP_COLOR } from '../lib';
import type { PlaceCardViewModel } from '../model/place-feed.view-model.types';

/**
 * Параметры презентационной карточки места.
 */
export interface PlaceCardProps {
  place: PlaceCardViewModel;
}

/**
 * Рендерит одну карточку места в home-ленте.
 *
 * @param place - Готовая view model карточки.
 * @returns Презентационную карточку с тегами и ссылкой на detail route.
 */
export function PlaceCard({ place }: Readonly<PlaceCardProps>) {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <Box
        sx={{
          minHeight: 168,
          px: 2.5,
          py: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 2,
          background: PLACE_FEED_CATEGORY_BACKGROUND[place.category],
        }}
      >
        <Typography variant="overline">Стрельчук в Екатеринбурге</Typography>

        <Stack spacing={1}>
          <Chip
            label={place.categoryLabel}
            size="small"
            color={PLACE_FEED_CATEGORY_CHIP_COLOR[place.category]}
            sx={{ alignSelf: 'flex-start' }}
          />

          {place.tags.length > 0 ? (
            <Typography variant="body2">{place.tags.slice(0, 2).join(' · ')}</Typography>
          ) : null}
        </Stack>
      </Box>

      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h5" component="h3">
            {place.title}
          </Typography>

          <Typography variant="body2">{place.summary}</Typography>

          {place.tags.length > 0 ? (
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {place.tags.map((tag) => (
                <Chip key={tag} label={tag} size="small" variant="outlined" />
              ))}
            </Stack>
          ) : null}
        </Stack>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
        <Button component={AppLink} href={place.href} variant="contained">
          Открыть место
        </Button>
      </CardActions>
    </Card>
  );
}
