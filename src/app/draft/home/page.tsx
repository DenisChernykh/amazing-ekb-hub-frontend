import { HomeDraftScreen } from '@/app/draft/home/_components/home-draft-screen';
import {
  loadHomeDraftPageData,
  resolveDraftHomeSearchParams,
  type DraftHomeSearchParams,
} from '@/app/draft/home/_lib';
import { createAppRscErrorPolicy, executeAppRscRequest } from '@/server/std-errors';

/**
 * Пропсы route-level страницы draft home.
 */
interface HomeDraftPageProps {
  searchParams?: Promise<DraftHomeSearchParams>;
}

/**
 * Route-level страница новой home-архитектуры.
 *
 * @param searchParams - Query-параметры из Next App Router.
 * @returns Draft home-страницу с новой modular/server-first архитектурой.
 */
export default async function HomeDraftPage({ searchParams }: Readonly<HomeDraftPageProps>) {
  const params = await resolveDraftHomeSearchParams(searchParams);

  const result = await executeAppRscRequest({
    request: () => loadHomeDraftPageData(params),
    policy: createAppRscErrorPolicy({
      validation: {
        catalogKey: 'home.feed.loadFailed',
      },
      domain: {
        catalogKey: 'home.feed.loadFailed',
      },
    }),
  });

  if (!result.ok) {
    return <HomeDraftScreen failure={result.failure} />;
  }

  return <HomeDraftScreen data={result.data} />;
}
