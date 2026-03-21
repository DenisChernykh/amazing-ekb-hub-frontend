import { loadPlaceDetailPageData } from '@/app/di/place-detail';
import {
  buildPlaceDetailPageViewModel,
  PlaceDetailPageContent,
  PlaceDetailPageSearchParams,
  resolvePlaceDetailPlatformPages,
} from '@/features/place-detail-page';
import { isNotFoundFailure } from '@/shared/failures';
import { notFound } from 'next/navigation';

/**
 * Пропсы route-level detail-страницы места.
 */
interface PlaceDetailPageProps {
  params: Promise<{ placeId: string }>;
  searchParams?: Promise<PlaceDetailPageSearchParams>;
}

/**
 * Route-level страница места.
 *
 * Остаётся тонким entrypoint: получает route/search params, делегирует загрузку
 * в `app/di`, а presentation и маппинг состояний — в feature-слой.
 *
 * @param params - Dynamic route params Next App Router.
 * @param searchParams - Query-параметры платформенной пагинации.
 * @returns Server-rendered detail-страницу места.
 */
export default async function PlaceDetailPage({
  params,
  searchParams,
}: Readonly<PlaceDetailPageProps>) {
  const [{ placeId }, platformPages] = await Promise.all([
    params,
    resolvePlaceDetailPlatformPages(searchParams),
  ]);

  const pageData = await loadPlaceDetailPageData({
    placeId,
    platformPages,
  });

  if (!pageData.placeDetailResult.ok && isNotFoundFailure(pageData.placeDetailResult.error)) {
    notFound();
  }

  const viewModel = buildPlaceDetailPageViewModel(pageData);

  return <PlaceDetailPageContent viewModel={viewModel} />;
}
