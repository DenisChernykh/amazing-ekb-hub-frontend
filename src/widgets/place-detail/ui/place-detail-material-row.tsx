import { ArrowUpRight } from 'lucide-react';
import type { PlaceDetailPreview } from '../model/types';

interface PlaceDetailMaterialRowProps {
  marker: string;
  material: PlaceDetailPreview;
  pinned?: boolean;
}

/** Рендерит общее содержимое доступной и недоступной строки. */
function MaterialRowContent({
  marker,
  material,
  pinned = false,
}: Readonly<PlaceDetailMaterialRowProps>) {
  return (
    <>
      <span
        className="pt-1 text-sm font-semibold tracking-[0.16em] text-[#81786b]"
        aria-hidden="true"
      >
        {marker}
      </span>
      <span className="min-w-0">
        <span className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.68rem] font-semibold tracking-[0.14em] text-[#81786b] uppercase">
          {pinned && <span className="text-[#8e7041]">Закреплено</span>}
          <span>{material.typeLabel}</span>
          <span>{material.publishedAtLabel}</span>
          {material.durationLabel && <span>{material.durationLabel}</span>}
        </span>
        <span className="line-clamp-2 text-[clamp(1rem,0.94rem+0.22vw,1.18rem)] leading-snug font-semibold text-[#101211]">
          {material.title}
        </span>
      </span>
      <span className="flex min-h-11 min-w-11 items-center justify-end text-[#8e7041]">
        {material.redirectUrl ? (
          <ArrowUpRight
            aria-hidden="true"
            className="size-5 transition-transform duration-300 group-hover:translate-x-1 group-focus-visible:translate-x-1"
            strokeWidth={1.6}
          />
        ) : (
          <span className="text-xs font-semibold text-[#81786b]">Недоступно</span>
        )}
      </span>
    </>
  );
}

/**
 * Рендерит единственную интерактивную поверхность материала архива.
 *
 * @param props - Preview материала, архивный номер и признак закрепления.
 */
export function PlaceDetailMaterialRow(props: Readonly<PlaceDetailMaterialRowProps>) {
  const { material } = props;
  const className =
    'group grid min-h-24 grid-cols-[2.4rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-[#101211]/15 px-1 py-4 transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#8e7041] sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:gap-5 sm:px-3 sm:py-5';

  return (
    <li>
      {material.redirectUrl ? (
        <a
          className={`${className} hover:bg-[#e7e0d4]`}
          data-material-id={material.id}
          href={material.redirectUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          <MaterialRowContent {...props} />
        </a>
      ) : (
        <div className={className}>
          <MaterialRowContent {...props} />
        </div>
      )}
    </li>
  );
}
