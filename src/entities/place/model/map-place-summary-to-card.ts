import type { PublicPlaceSummary } from '@/shared/api/generated/model/publicPlaceSummary';
import { normalizeCoverImageUrl } from './normalize-cover-image-url';
import type { PlaceCardModel } from './types';

/**
 * Это хелпер. Преобразует API summary в frontend contract карточки места.
 *
 * @param place - Краткая карточка места из текущего или будущего API.
 * @returns Данные, с которыми работает UI карточки.
 */
export function mapPlaceSummaryToCardModel(place: PublicPlaceSummary): PlaceCardModel {
  return {
    id: place.id,
    slug: place.slug,
    title: place.title,
    coverImageUrl: normalizeCoverImageUrl(place.coverImageUrl),
  };
}
