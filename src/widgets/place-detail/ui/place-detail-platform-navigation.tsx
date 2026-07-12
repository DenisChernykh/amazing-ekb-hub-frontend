'use client';

import { MotionConfig, motion } from 'motion/react';
import type { RefObject } from 'react';
import { usePlaceDetailPlatformScrollspy } from '../lib/use-place-detail-platform-scrollspy';
import type { PlaceDetailPlatformNavigationItem } from '../model/types';

interface PlaceDetailPlatformNavigationProps {
  platforms: PlaceDetailPlatformNavigationItem[];
  scrollContainerRef: RefObject<HTMLDivElement | null>;
}

/**
 * Улучшает SSR-якоря активным маркером на основе IntersectionObserver.
 *
 * @param props - Непустые платформы в архивном порядке.
 */
export function PlaceDetailPlatformNavigation({
  platforms,
  scrollContainerRef,
}: Readonly<PlaceDetailPlatformNavigationProps>) {
  const activePlatform = usePlaceDetailPlatformScrollspy(platforms, scrollContainerRef);

  if (platforms.length === 0) {
    return null;
  }

  return (
    <MotionConfig reducedMotion="user">
      <nav
        aria-label="Платформы"
        className="sticky top-0 z-20 flex overflow-x-auto border-t border-white/10 bg-[#151816] px-4 lg:col-start-1 lg:row-start-1 lg:h-screen lg:flex-col lg:items-stretch lg:justify-end lg:overflow-visible lg:border-t-0 lg:bg-transparent lg:px-3 lg:pb-4"
      >
        {platforms.map((platform) => {
          const isActive = platform.platform === activePlatform;

          return (
            <a
              aria-current={isActive ? 'location' : undefined}
              className="relative flex min-h-12 shrink-0 items-center gap-2 px-3 text-xs font-semibold tracking-[0.08em] text-[#f0ece4] uppercase focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#b99a64] lg:min-h-9 lg:w-full lg:flex-row lg:justify-between lg:px-0 lg:py-2 lg:[writing-mode:horizontal-tb] lg:rotate-0"
              href={`#${platform.anchor}`}
              key={platform.platform}
            >
              {isActive && (
                <motion.span
                  className="absolute right-3 bottom-0 left-3 h-px bg-[#b99a64] lg:top-1 lg:right-auto lg:bottom-1 lg:left-[-0.45rem] lg:h-auto lg:w-px"
                  layoutId="place-detail-active-platform"
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                />
              )}
              <span>{platform.label}</span>
              <span className="text-[#b99a64]">{platform.count}</span>
            </a>
          );
        })}
      </nav>
    </MotionConfig>
  );
}
