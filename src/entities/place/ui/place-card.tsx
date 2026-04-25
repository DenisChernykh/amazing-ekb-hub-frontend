'use client';

import { Card, CardActionArea, CardContent, Typography } from '@mui/material';
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
        overflow: 'hidden',
        color: 'inherit',
        textDecoration: 'none',
        border: '1px solid rgba(26, 32, 44, 0.1)',
        borderRadius: 2,
        boxShadow: '0 14px 34px rgba(20, 29, 45, 0.08)',
        flexDirection: 'column',
        transition: 'transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease',
        '&:hover, &:focus-visible': {
          borderColor: 'rgba(35, 122, 118, 0.35)',
          boxShadow: '0 20px 44px rgba(20, 29, 45, 0.13)',
          outline: 'none',
          transform: 'translateY(-4px)',
        },
        '&:focus-visible': {
          boxShadow: '0 0 0 3px rgba(35, 122, 118, 0.2), 0 20px 44px rgba(20, 29, 45, 0.13)',
        },
        '&:hover .place-card-image, &:focus-visible .place-card-image': {
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
          display: 'flex',
          height: '100%',
          alignItems: 'stretch',
          flexDirection: 'column',
        }}
      >
        <PlaceCardImage category={place.category} src={place.coverImageUrl} title={place.title} />

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
            color="#121826"
            fontSize="clamp(1.05rem, 0.9rem + 0.45vw, 1.28rem)"
            fontWeight={700}
            lineHeight={1.18}
            sx={{
              display: '-webkit-box',
              overflow: 'hidden',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 2,
            }}
          >
            {place.title}
          </Typography>
          <PlaceCardBadges place={place} />
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
