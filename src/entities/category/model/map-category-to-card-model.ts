import type { PlaceCategory } from '@/shared/api/generated/model/placeCategory';
import type { CategoryCardModel } from './types';

const CATEGORY_PLACEHOLDER_SRC = '/images/categories/category-placeholder.svg';

/** Преобразует API-категорию во frontend-модель карточки. */
export function mapCategoryToCardModel(category: PlaceCategory): CategoryCardModel {
  return {
    id: category.id,
    slug: category.slug,
    title: category.title,
    image: {
      kind: 'placeholder',
      src: CATEGORY_PLACEHOLDER_SRC,
      alt: '',
    },
  };
}
