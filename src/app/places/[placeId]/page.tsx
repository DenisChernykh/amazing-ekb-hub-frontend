import { ErrorState } from '@/shared/ui/error-state';
import { PlaceDetail } from '@/widgets/place-detail';
import { notFound } from 'next/navigation';
import { getPlacePageData } from './_lib/get-place-page-data';
import { placeDetailFontVariables } from './_lib/place-detail-fonts';

interface PlacePageProps {
  params: Promise<{
    placeId: string;
  }>;
}

export default async function PlacePage({ params }: PlacePageProps) {
  const { placeId } = await params;
  const model = await getPlacePageData(placeId);

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
