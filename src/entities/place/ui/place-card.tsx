'use client';

import { appStyleTokens } from '@/shared/ui/theme';
import { Card, CardActionArea, CardContent, Link as MuiLink, Typography } from '@mui/material';
import Link from 'next/link';
import { buildPlaceHref } from '../lib/build-place-href';
import type { PlaceCardModel } from '../model/types';
import { PlaceCardBadges } from './place-card-badges';
import { PlaceCardImage } from './place-card-image';

interface PlaceCardProps {
  place: PlaceCardModel;
}

/**
 * Рендерит кликабельную карточку места.
 *
 * @param props - Данные карточки места.
 */
export function PlaceCard({ place }: Readonly<PlaceCardProps>) {
  return (
    <Card
      sx={{
        display: 'flex',
        height: '100%',
        flexDirection: 'column',
        '&:hover .place-card-image, &:focus-within .place-card-image': {
          transform: 'scale(1.035)',
        },
        '@media (prefers-reduced-motion: reduce)': {
          transition: 'none',
          '& .place-card-image': {
            transition: 'none',
          },
        },
      }}
    >
      <CardActionArea
        component={Link}
        href={buildPlaceHref(place.id)}
        sx={{
          display: 'block',
        }}
      >
        <PlaceCardImage category={place.category} src={place.coverImageUrl} title={place.title} />
      </CardActionArea>

      <CardContent
        sx={{
          display: 'flex',
          width: '100%',
          minHeight: 112,
          p: 1.75,
          gap: 1.25,
          flexDirection: 'column',
          '&:last-child': {
            pb: 1.75,
          },
        }}
      >
        <Typography
          color="text.primary"
          sx={{
            display: '-webkit-box',
            overflow: 'hidden',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 2,
            ...appStyleTokens.typography.cardTitle,
          }}
        >
          <MuiLink
            component={Link}
            href={buildPlaceHref(place.id)}
            underline="none"
            sx={{
              color: 'inherit',
              '&:focus-visible': {
                borderRadius: 0.5,
                outline: `3px solid ${appStyleTokens.palette.focusRing}`,
                outlineOffset: 2,
              },
            }}
          >
            {place.title}
          </MuiLink>
        </Typography>
        <PlaceCardBadges place={place} />
      </CardContent>
    </Card>
  );
}
