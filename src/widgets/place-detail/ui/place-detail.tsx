import type { PlaceDetailModel } from '@/entities/place';
import { buildPlaceDetailViewModel } from '../model/build-place-detail-view-model';
import { PlaceDetailExperience } from './place-detail-experience';
import { PlaceDetailMaterialIndex } from './place-detail-material-index';
import { PlaceDetailPlatformNavigation } from './place-detail-platform-navigation';
import { PlaceDetailSpine } from './place-detail-spine';

interface PlaceDetailProps {
  place: PlaceDetailModel;
}

/**
 * Рендерит server-first детальную страницу места.
 *
 * @param props - Frontend contract detail-страницы места.
 */
export function PlaceDetail({ place }: Readonly<PlaceDetailProps>) {
  const model = buildPlaceDetailViewModel(place);
  const navigation = <PlaceDetailPlatformNavigation platforms={model.platforms} />;
  const spine = (
    <PlaceDetailSpine
      category={model.category}
      coverImageUrl={model.coverImageUrl}
      navigation={navigation}
      title={model.title}
      totalCount={model.totalCount}
    />
  );
  const index = <PlaceDetailMaterialIndex pinned={model.pinned} platforms={model.platforms} />;

  return (
    <main className="min-h-screen bg-[#f0ece4] [font-family:var(--font-place-ui)] text-[#101211]">
      <PlaceDetailExperience
        coverImageUrl={model.coverImageUrl}
        index={index}
        initialPreview={model.initialPreview}
        previewsById={model.previewsById}
        spine={spine}
      />
    </main>
  );
}
