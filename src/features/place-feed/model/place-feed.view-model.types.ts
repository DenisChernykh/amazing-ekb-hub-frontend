import { PlaceCategory } from '@/entities/place';

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
 * View model списка мест для главной страницы.
 */
export type PlaceFeedViewModel =
  | {
      kind: 'error';
      title: string;
      description: string;
    }
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
