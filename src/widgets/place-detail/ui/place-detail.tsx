import type { PlaceDetailModel } from '@/entities/place';
import { buildPlaceDetailViewModel } from '../model/build-place-detail-view-model';
import type { PlaceDetailPlatformSection } from '../model/types';
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
  const navigation = <PlaceDetailNavigation platforms={model.platforms} />;

  return (
    <main className="min-h-screen bg-[#f0ece4] [font-family:var(--font-place-ui)] text-[#101211]">
      <div className="lg:grid lg:grid-cols-[7.5rem_minmax(0,1fr)]">
        <PlaceDetailSpine
          category={model.category}
          coverImageUrl={model.coverImageUrl}
          navigation={navigation}
          title={model.title}
          totalCount={model.totalCount}
        />
        <PlaceDetailMaterialIndex pinned={model.pinned} platforms={model.platforms} />
      </div>
    </main>
  );
}

/** Рендерит SSR-якоря платформ до появления scrollspy enhancement. */
function PlaceDetailNavigation({
  platforms,
}: Readonly<{ platforms: PlaceDetailPlatformSection[] }>) {
  return (
    <nav
      aria-label="Платформы"
      className="sticky top-0 z-20 flex overflow-x-auto border-t border-white/10 bg-[#151816] px-4 lg:absolute lg:right-1/2 lg:bottom-24 lg:top-auto lg:translate-x-1/2 lg:overflow-visible lg:border-t-0 lg:px-0"
    >
      {platforms.map((platform) => (
        <a
          className="flex min-h-12 shrink-0 items-center gap-2 px-3 text-xs font-semibold tracking-[0.08em] text-[#f0ece4] uppercase focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#b99a64] lg:min-h-0 lg:flex-col lg:px-2 lg:py-2 lg:[writing-mode:vertical-rl] lg:rotate-180"
          href={`#${platform.anchor}`}
          key={platform.platform}
        >
          <span>{platform.label}</span>
          <span className="text-[#b99a64]">{platform.count}</span>
        </a>
      ))}
    </nav>
  );
}
