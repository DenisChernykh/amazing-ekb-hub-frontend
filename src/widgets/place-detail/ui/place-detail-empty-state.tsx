import Image from 'next/image';
import { PlaceMapsLink } from './place-maps-link';

interface PlaceDetailEmptyStateProps {
  coverImageUrl: string;
  mapsUrl: string | null;
  title: string;
}

/**
 * Рендерит единственное page-level состояние архива без публикаций.
 *
 * @param props - Обложка и название места для контекста.
 */
export function PlaceDetailEmptyState({
  coverImageUrl,
  mapsUrl,
  title,
}: Readonly<PlaceDetailEmptyStateProps>) {
  return (
    <section className="min-h-[34rem] bg-[#f0ece4] lg:grid lg:min-h-screen lg:grid-cols-[minmax(22rem,0.9fr)_minmax(25rem,1.1fr)]">
      <div className="flex min-h-[26rem] flex-col justify-end px-5 py-12 sm:px-8 lg:min-h-screen lg:px-12 lg:py-16">
        <p className="mb-5 text-xs font-semibold tracking-[0.18em] text-[#8e7041] uppercase">
          Личный архив
        </p>
        <h2 className="max-w-xl [font-family:var(--font-place-display)] text-[clamp(2.5rem,5vw,5.4rem)] leading-[1.02] font-medium text-[#101211]">
          Публикаций пока нет
        </h2>
        <p className="mt-6 max-w-md text-sm leading-6 text-[#81786b]">
          Когда в архиве появится материал об этом месте, ссылка будет доступна здесь.
        </p>
        <PlaceMapsLink mapsUrl={mapsUrl} />
      </div>
      <div className="relative hidden min-h-screen overflow-hidden bg-[#101211] lg:block">
        <Image
          alt={`Фото места ${title}`}
          className="object-cover opacity-80 grayscale-[20%]"
          fill
          priority
          sizes="(min-width: 1024px) 44vw, 1px"
          src={coverImageUrl}
          unoptimized
        />
        <div className="absolute inset-0 bg-linear-to-t from-[#101211]/55 to-transparent" />
      </div>
    </section>
  );
}
