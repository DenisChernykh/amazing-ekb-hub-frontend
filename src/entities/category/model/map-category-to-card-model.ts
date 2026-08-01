import type { PlaceCategoryPublicResponseDto } from '@/shared/api/generated/model/placeCategoryPublicResponseDto';
import type { CategoryCardModel } from './types';

const CATEGORY_PLACEHOLDER_SRC = '/images/categories/category-placeholder.svg';

/** Преобразует API-категорию во frontend-модель карточки. */
export function mapCategoryToCardModel(
  category: PlaceCategoryPublicResponseDto,
): CategoryCardModel {
  const coverImageUrl = category.coverImageUrl?.trim();

  return {
    id: category.id,
    slug: category.slug,
    title: category.title,
    image: {
      kind: coverImageUrl ? 'photo' : 'placeholder',
      src: coverImageUrl || CATEGORY_PLACEHOLDER_SRC,
      alt: '',
    },
  };
}
