import { listHomePlaces } from '@/app/di/place';
import { HomePageContent, HomePageSearchParams, resolveHomePageParams } from '@/features/home-page';

interface HomePageProps {
  searchParams?: Promise<HomePageSearchParams>;
}

export default async function HomePage({ searchParams }: Readonly<HomePageProps>) {
  const params = await resolveHomePageParams(searchParams);
  const result = await listHomePlaces(params);

  return <HomePageContent result={result} />;
}
