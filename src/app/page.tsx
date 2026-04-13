import { getHomePageData } from '@/views/home/server/get-home-page-data';
import { HomePageView } from '@/views/home/ui/home-page-view';

type RawSearchParams = Record<string, string | string[] | undefined>;

interface HomePageProps {
  searchParams?: Promise<RawSearchParams>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const model = await getHomePageData(resolvedSearchParams);

  return <HomePageView model={model} />;
}
