import {
  fetchPublicCollectionPage,
  normalizeCollectionSlug,
  type CollectionCardModel,
} from '@/entities/collection';
import { mapPlaceSummaryToCardModel, type PlaceCardModel } from '@/entities/place';
import { isCollectionPageValid } from './is-collection-page-valid';

/** Заголовочные данные detail-страницы подборки. */
export type CollectionDetailViewModel = Pick<
  CollectionCardModel,
  'id' | 'slug' | 'title' | 'description' | 'coverImageUrl'
>;

/** View model detail-страницы подборки с уже mapped карточками мест. */
export type CollectionPageData =
  | {
      kind: 'ready';
      collection: CollectionDetailViewModel;
      places: PlaceCardModel[];
      page: number;
      pageSize: number;
      total: number;
    }
  | { kind: 'not_found' };

/** Загружает и собирает server-side данные detail-страницы подборки. */
export async function getCollectionPageData(
  rawSlug: string,
  page: number,
): Promise<CollectionPageData> {
  const collectionSlug = normalizeCollectionSlug(rawSlug);
  if (!collectionSlug) return { kind: 'not_found' };

  const result = await fetchPublicCollectionPage(collectionSlug, page);

  if (result.kind === 'not_found') return { kind: 'not_found' };
  if (!isCollectionPageValid(page, result.data.pageSize, result.data.total)) {
    return { kind: 'not_found' };
  }

  return {
    kind: 'ready',
    collection: {
      id: result.data.id,
      slug: result.data.slug,
      title: result.data.title,
      description: result.data.description?.trim() || null,
      coverImageUrl: result.data.coverImageUrl?.trim() || null,
    },
    places: result.data.items.map(mapPlaceSummaryToCardModel),
    page: result.data.page,
    pageSize: result.data.pageSize,
    total: result.data.total,
  };
}
