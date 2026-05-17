import { HomePageContent } from '@/app/_components/home-page-content';
import { getHomePageData } from '@/app/_lib/get-home-page-data';

type RawSearchParams = Record<string, string | string[] | undefined>;

interface HomePageProps {
  searchParams?: Promise<RawSearchParams>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const model = await getHomePageData(resolvedSearchParams);

  return <HomePageContent model={model} />;
}
