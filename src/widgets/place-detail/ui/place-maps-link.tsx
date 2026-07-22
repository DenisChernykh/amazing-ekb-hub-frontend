import { ArrowUpRight } from 'lucide-react';

interface PlaceMapsLinkProps {
  mapsUrl: string | null;
}

/**
 * Рендерит безопасное внешнее действие для открытия места в картах.
 *
 * @param props - Нормализованный nullable URL карточки места.
 */
export function PlaceMapsLink({ mapsUrl }: Readonly<PlaceMapsLinkProps>) {
  const href = mapsUrl?.trim();

  if (!href) {
    return null;
  }

  return (
    <a
      className="group mt-8 inline-flex min-h-11 w-fit items-center gap-3 border-b border-[#8e7041] py-2 text-sm font-semibold text-[#101211] transition-colors hover:border-[#101211] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8e7041]"
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      Открыть в картах
      <ArrowUpRight
        aria-hidden="true"
        className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        strokeWidth={1.8}
      />
    </a>
  );
}
