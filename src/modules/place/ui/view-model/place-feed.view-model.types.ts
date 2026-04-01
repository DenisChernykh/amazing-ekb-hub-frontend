import type { PlaceCategory } from '@/modules/place/model';

/**
 * View model одной карточки места.
 */
export type PlaceCardViewModel = {
  id: string;
  title: string;
  summary: string;
  tags: readonly string[];
  category: PlaceCategory;
  categoryLabel: string;
  href: string;
};

/**
 * View model списка мест для home-экрана.
 */
export type PlaceFeedViewModel =
  | {
      kind: 'empty';
      title: string;
      description: string;
    }
  | {
      kind: 'success';
      title: string;
      meta: string;
      items: readonly PlaceCardViewModel[];
    };
