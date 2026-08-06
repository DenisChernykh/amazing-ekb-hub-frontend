import {
  buildCollectionHref,
  fetchPublicCollectionPage,
  normalizeCollectionSlug,
} from '@/entities/collection';
import type { Metadata } from 'next';
import { isCollectionPageValid } from './is-collection-page-valid';

const FALLBACK_METADATA: Metadata = {
  title: 'Стрельчук в Екатеринбурге',
  description: 'Удобный навигатор по моим обзорам',
};

function buildCollectionDescription(title: string, description: string | null): string {
  return description || `Подборка мест «${title}» в Екатеринбурге.`;
}

/**
 * Собирает безопасные metadata публичной подборки из того же cached fetcher, что и страница.
 *
 * @param rawSlug - Значение динамического URL-сегмента.
 * @param page - Уже нормализованный положительный номер страницы.
 * @returns Metadata подборки или базовые metadata для недоступных данных.
 */
export async function getCollectionMetadata(rawSlug: string, page: number): Promise<Metadata> {
  const collectionSlug = normalizeCollectionSlug(rawSlug);
  if (!collectionSlug) return FALLBACK_METADATA;

  const result = await fetchPublicCollectionPage(collectionSlug, page);
  if (result.kind === 'not_found') return FALLBACK_METADATA;

  if (!isCollectionPageValid(page, result.data.pageSize, result.data.total)) {
    return FALLBACK_METADATA;
  }

  const title = `${result.data.title} — Стрельчук в Екатеринбурге`;
  const metadataTitle = page > 1 ? `${title} — Страница ${page}` : title;
  const description = buildCollectionDescription(
    result.data.title,
    result.data.description?.trim() || null,
  );
  const canonical =
    page === 1
      ? buildCollectionHref(collectionSlug)
      : `${buildCollectionHref(collectionSlug)}?page=${page}`;
  const coverImageUrl = result.data.coverImageUrl?.trim() || null;

  return {
    title: metadataTitle,
    description,
    alternates: { canonical },
    openGraph: {
      title: metadataTitle,
      description,
      url: canonical,
      ...(coverImageUrl ? { images: [{ url: coverImageUrl }] } : {}),
    },
  };
}
