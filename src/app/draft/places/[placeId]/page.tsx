import { DraftPlaceDetailScreen } from '@/app/draft/places/[placeId]/_components/draft-place-detail-screen';
import {
  loadDraftPlaceDetailPageData,
  resolveDraftPlaceDetailPlatformPages,
  type DraftPlaceDetailSearchParams,
} from '@/app/draft/places/[placeId]/_lib';
import { createAppRscErrorPolicy, executeAppRscRequest } from '@/server/std-errors';

/**
 * Пропсы route-level страницы draft detail.
 */
interface DraftPlaceDetailPageProps {
  params: Promise<{ placeId: string }>;
  searchParams?: Promise<DraftPlaceDetailSearchParams>;
}

/**
 * Route-level страница новой detail-архитектуры.
 *
 * @param params - Dynamic route params Next App Router.
 * @param searchParams - Query-параметры платформенной пагинации.
 * @returns Draft detail-страницу места на новой архитектуре.
 */
export default async function DraftPlaceDetailPage({
  params,
  searchParams,
}: Readonly<DraftPlaceDetailPageProps>) {
  const [{ placeId }, platformPages] = await Promise.all([
    params,
    resolveDraftPlaceDetailPlatformPages(searchParams),
  ]);

  const result = await executeAppRscRequest({
    request: () =>
      loadDraftPlaceDetailPageData({
        placeId,
        platformPages,
      }),
    policy: createAppRscErrorPolicy({
      notFound: {
        mode: 'interrupt',
      },
    }),
  });

  if (!result.ok) {
    return <DraftPlaceDetailScreen failure={result.failure} />;
  }

  return <DraftPlaceDetailScreen data={result.data} />;
}
