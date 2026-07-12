import type { PlaceDetailModel } from '@/entities/place';
import { buildPlaceDetailViewModel } from '../model/build-place-detail-view-model';
import { PlaceDetailEmptyState } from './place-detail-empty-state';
import { PlaceDetailExperience } from './place-detail-experience';
import { PlaceDetailMaterialIndex } from './place-detail-material-index';
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
  const spine = (
    <PlaceDetailSpine
      category={model.category}
      coverImageUrl={model.coverImageUrl}
      title={model.title}
      totalCount={model.totalCount}
    />
  );
  const index = <PlaceDetailMaterialIndex pinned={model.pinned} platforms={model.platforms} />;

  if (!model.initialPreview) {
    return (
      <main className="min-h-screen bg-[#f0ece4] [font-family:var(--font-place-ui)] text-[#101211]">
        <div className="lg:grid lg:grid-cols-[7.5rem_minmax(0,1fr)]">
          <PlaceDetailSpine
            category={model.category}
            coverImageUrl={model.coverImageUrl}
            title={model.title}
            totalCount={model.totalCount}
          />
          <PlaceDetailEmptyState coverImageUrl={model.coverImageUrl} title={model.title} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f0ece4] [font-family:var(--font-place-ui)] text-[#101211]">
      <PlaceDetailExperience
        coverImageUrl={model.coverImageUrl}
        index={index}
        initialPreview={model.initialPreview}
        platforms={model.platforms.map(({ anchor, count, label, platform }) => ({
          anchor,
          count,
          label,
          platform,
        }))}
        previewsById={model.previewsById}
        spine={spine}
      />
    </main>
  );
}
