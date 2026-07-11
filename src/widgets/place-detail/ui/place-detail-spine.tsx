import { PlaceCategoryBadge, formatMaterialsCount } from '@/entities/place';
import Image from 'next/image';
import type { ReactNode } from 'react';

interface PlaceDetailSpineProps {
  category: Parameters<typeof PlaceCategoryBadge>[0]['category'];
  coverImageUrl: string;
  navigation: ReactNode;
  title: string;
  totalCount: number;
}

/**
 * Рендерит семантический mobile-header и декоративный desktop-корешок архива.
 *
 * @param props - Контекст места и серверная навигация по платформам.
 */
export function PlaceDetailSpine({
  category,
  coverImageUrl,
  navigation,
  title,
  totalCount,
}: Readonly<PlaceDetailSpineProps>) {
  return (
    <header className="relative overflow-hidden bg-[#151816] text-[#f0ece4] lg:min-h-screen">
      <div className="grid gap-6 px-5 pt-6 pb-7 sm:grid-cols-[minmax(0,1fr)_12rem] sm:px-8 lg:contents">
        <div className="flex min-w-0 flex-col justify-between gap-8 lg:contents">
          <PlaceCategoryBadge
            category={category}
            className="h-6 px-2.5 lg:absolute lg:top-8 lg:left-1/2 lg:max-w-[6.5rem] lg:-translate-x-1/2"
          />
          <div className="lg:contents">
            <h1 className="[font-family:var(--font-place-display)] text-[clamp(2.35rem,9vw,4.5rem)] leading-[0.98] font-medium text-balance lg:sr-only">
              {title}
            </h1>
            <p className="mt-4 text-xs font-semibold tracking-[0.16em] text-[#b99a64] uppercase lg:hidden">
              {formatMaterialsCount(totalCount)}
            </p>
          </div>
        </div>
        <div className="relative aspect-[16/9] min-h-52 overflow-hidden sm:aspect-auto lg:hidden">
          <Image
            alt={`Фото места ${title}`}
            className="object-cover grayscale-[15%]"
            fill
            priority
            sizes="(max-width: 639px) calc(100vw - 2.5rem), 12rem"
            src={coverImageUrl}
            unoptimized
          />
        </div>
      </div>
      {navigation}
      <p
        aria-hidden="true"
        className="[font-family:var(--font-place-display)] absolute top-1/2 left-1/2 hidden max-h-[55vh] -translate-x-1/2 -translate-y-1/2 overflow-hidden text-3xl leading-none font-medium tracking-[-0.02em] whitespace-nowrap [writing-mode:vertical-rl] rotate-180 lg:block"
      >
        {title}
      </p>
      <p className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 text-center text-[0.62rem] font-semibold tracking-[0.16em] text-[#b99a64] uppercase [writing-mode:vertical-rl] rotate-180 lg:block">
        {formatMaterialsCount(totalCount)}
      </p>
    </header>
  );
}
