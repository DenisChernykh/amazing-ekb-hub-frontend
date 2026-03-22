import { listHomePlaces } from '@/app/di/place';
import {
  PlaceFeedScreen,
  resolvePlaceFeedSearchParams,
  type PlaceFeedScreenSearchParams,
} from '@/widgets/place-feed';

interface HomePageProps {
  searchParams?: Promise<PlaceFeedScreenSearchParams>;
}

export default async function HomePage({ searchParams }: Readonly<HomePageProps>) {
  const params = await resolvePlaceFeedSearchParams(searchParams);
  const result = await listHomePlaces(params);

  return <PlaceFeedScreen result={result} />;
}
