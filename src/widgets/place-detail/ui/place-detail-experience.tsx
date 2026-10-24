'use client';

import type { FocusEvent, PointerEvent, ReactNode } from 'react';
import { useRef, useState } from 'react';
import { getPreviewIdFromTarget } from '../lib/get-preview-id-from-target';
import type { PlaceDetailPlatformNavigationItem, PlaceDetailPreview } from '../model/types';
import { PlaceDetailFocusStage } from './place-detail-focus-stage';
import { PlaceDetailPlatformNavigation } from './place-detail-platform-navigation';

interface PlaceDetailExperienceProps {
  coverImageUrl: string;
  index: ReactNode;
  initialPreview: PlaceDetailPreview | null;
  platforms: PlaceDetailPlatformNavigationItem[];
  previewsById: Record<string, PlaceDetailPreview>;
  spine: ReactNode;
}

/**
 * Добавляет preview-взаимодействие вокруг готовых server-rendered слотов.
 *
 * @param props - SSR-слоты и сериализуемые preview-записи.
 */
export function PlaceDetailExperience({
  coverImageUrl,
  index,
  initialPreview,
  platforms,
  previewsById,
  spine,
}: Readonly<PlaceDetailExperienceProps>) {
  const initialPreviewId = initialPreview?.id ?? null;
  const [activePreviewId, setActivePreviewId] = useState(initialPreviewId);
  const materialIndexScrollContainerRef = useRef<HTMLDivElement>(null);
  const activePreview = activePreviewId ? (previewsById[activePreviewId] ?? initialPreview) : null;

  const selectPreviewFromTarget = (target: EventTarget | null) => {
    const previewId = getPreviewIdFromTarget(target);

    if (previewId && previewsById[previewId]) {
      setActivePreviewId(previewId);
    }
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setActivePreviewId(initialPreviewId);
    }
  };

  const handlePointerOver = (event: PointerEvent<HTMLDivElement>) => {
    selectPreviewFromTarget(event.target);
  };

  return (
    <div className="lg:grid lg:h-screen lg:grid-cols-[7.5rem_minmax(22rem,0.9fr)_minmax(25rem,1.1fr)] lg:overflow-hidden">
      {spine}
      <PlaceDetailPlatformNavigation
        platforms={platforms}
        scrollContainerRef={materialIndexScrollContainerRef}
      />
      <div
        className="lg:col-start-2 lg:row-start-1 lg:h-screen lg:overflow-y-auto"
        data-material-index-scroll-container="true"
        onBlurCapture={handleBlur}
        onFocusCapture={(event) => selectPreviewFromTarget(event.target)}
        onPointerLeave={() => setActivePreviewId(initialPreviewId)}
        onPointerOver={handlePointerOver}
        ref={materialIndexScrollContainerRef}
      >
        {index}
      </div>
      <PlaceDetailFocusStage coverImageUrl={coverImageUrl} preview={activePreview} />
    </div>
  );
}
