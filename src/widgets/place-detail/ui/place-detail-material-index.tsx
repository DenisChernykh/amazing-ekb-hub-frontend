import { formatMaterialsCount } from '@/entities/place';
import type { PlaceDetailPlatformSection, PlaceDetailPreview } from '../model/types';
import { PlaceDetailMaterialRow } from './place-detail-material-row';
import { PlaceMapsLink } from './place-maps-link';

interface PlaceDetailMaterialIndexProps {
  mapsUrl: string | null;
  pinned: PlaceDetailPreview | null;
  platforms: PlaceDetailPlatformSection[];
}

/**
 * Рендерит полный server-first индекс публикаций по платформам.
 *
 * @param props - Закреплённая запись и непустые секции платформ.
 */
export function PlaceDetailMaterialIndex({
  mapsUrl,
  pinned,
  platforms,
}: Readonly<PlaceDetailMaterialIndexProps>) {
  return (
    <div className="bg-[#f0ece4] px-5 py-8 sm:px-8 sm:py-12 lg:min-h-screen lg:px-10 lg:py-16">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-5 border-b border-[#101211]/30 pb-5">
        <p className="text-xs font-semibold tracking-[0.18em] text-[#81786b] uppercase">
          Публикации о месте
        </p>
        <PlaceMapsLink mapsUrl={mapsUrl} />
      </header>

      {pinned && (
        <section className="mb-12" aria-labelledby="pinned-material-heading">
          <h2
            className="mb-3 text-sm font-semibold tracking-[0.12em] text-[#8e7041] uppercase"
            id="pinned-material-heading"
          >
            Закрепленный материал
          </h2>
          <ol>
            <PlaceDetailMaterialRow marker="00" material={pinned} pinned />
          </ol>
        </section>
      )}

      <div className="space-y-14">
        {platforms.map((section) => (
          <section id={section.anchor} key={section.platform} className="scroll-mt-24">
            <div className="mb-3 flex items-end justify-between gap-4 border-b border-[#101211]/30 pb-4">
              <h2 className="[font-family:var(--font-place-display)] text-2xl font-medium text-[#101211] sm:text-3xl">
                {section.label}
              </h2>
              <span className="pb-1 text-xs font-semibold tracking-[0.12em] text-[#81786b] uppercase">
                {formatMaterialsCount(section.count)}
              </span>
            </div>
            <ol>
              {section.materials.map((material, index) => (
                <PlaceDetailMaterialRow
                  key={material.id}
                  marker={String(index + 1).padStart(2, '0')}
                  material={material}
                />
              ))}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}
