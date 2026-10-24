import type { PublicCollectionSummaryResponseDto } from '@/shared/api/generated/model/publicCollectionSummaryResponseDto';
import type { CollectionCardModel } from './types';

/** Преобразует transport-модель подборки в стабильную модель карточки. */
export function mapCollectionToCardModel(
  collection: PublicCollectionSummaryResponseDto,
): CollectionCardModel {
  const description = collection.description?.trim() || null;
  const coverImageUrl = collection.coverImageUrl?.trim() || null;

  return {
    id: collection.id,
    slug: collection.slug,
    title: collection.title,
    description,
    coverImageUrl,
    placeCount: collection.placeCount,
  };
}
