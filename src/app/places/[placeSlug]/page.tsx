import { ErrorState } from '@/shared/ui';
import { PlaceDetail } from '@/widgets/place-detail';
import { notFound } from 'next/navigation';
import { getPlacePageData } from './_lib/get-place-page-data';
import { getPlaceStaticParams } from './_lib/get-place-static-params';
import { placeDetailFontVariables } from './_lib/place-detail-fonts';

interface PlacePageProps {
  params: Promise<{
    placeSlug: string;
  }>;
}

/** Делегирует Next.js подготовку известных place slug во время сборки. */
export async function generateStaticParams() {
  return getPlaceStaticParams();
}

/** Серверная детальная страница публичного места. */
export default async function PlacePage({ params }: PlacePageProps) {
  const { placeSlug } = await params;
  const model = await getPlacePageData(placeSlug);

  if (model.kind === 'not_found') {
    notFound();
  }

  if (model.kind === 'unexpected_error') {
    return <ErrorState title="Не удалось загрузить место" description={model.message} />;
  }

  return (
    <div className={placeDetailFontVariables}>
      <PlaceDetail place={model.place} />
    </div>
  );
}
