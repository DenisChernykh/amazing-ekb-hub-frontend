'use client';

import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import Image from 'next/image';
import type { PlaceDetailPreview } from '../model/types';

interface PlaceDetailFocusStageProps {
  coverImageUrl: string;
  preview: PlaceDetailPreview | null;
}

/**
 * Рендерит декоративный desktop-preview без ссылок и новых tab stops.
 *
 * @param props - Постоянная обложка места и активная preview-запись.
 */
export function PlaceDetailFocusStage({
  coverImageUrl,
  preview,
}: Readonly<PlaceDetailFocusStageProps>) {
  return (
    <aside
      aria-hidden="true"
      className="relative hidden h-screen overflow-hidden bg-[#101211] text-[#f0ece4] lg:sticky lg:top-0 lg:block"
      data-focus-stage="true"
    >
      <Image
        alt=""
        className="object-cover opacity-75 grayscale-[22%]"
        fill
        priority
        sizes="(min-width: 1024px) 42vw, 1px"
        src={coverImageUrl}
        unoptimized
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,18,17,0.16)_0%,rgba(16,18,17,0.42)_42%,rgba(16,18,17,0.94)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 p-10 xl:p-14">
        <MotionConfig reducedMotion="user">
          <AnimatePresence initial={false} mode="wait">
            {preview && (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl"
                exit={{ opacity: 0, y: -10 }}
                initial={{ opacity: 0, y: 14 }}
                key={preview.id}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="mb-5 flex flex-wrap gap-x-3 gap-y-1 text-[0.68rem] font-semibold tracking-[0.16em] text-[#d9c8aa] uppercase">
                  <span>{preview.platformLabel}</span>
                  <span>{preview.typeLabel}</span>
                  <span>{preview.publishedAtLabel}</span>
                  {preview.durationLabel && <span>{preview.durationLabel}</span>}
                </p>
                <p className="line-clamp-4 [font-family:var(--font-place-display)] text-[clamp(2.25rem,3.5vw,4.8rem)] leading-[1.02] font-medium text-balance">
                  {preview.title}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </MotionConfig>
      </div>
    </aside>
  );
}
