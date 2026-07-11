'use client';

import type { Platform } from '@/shared/api/generated/model/platform';
import { MotionConfig, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import type { PlaceDetailPlatformSection } from '../model/types';

type PlatformNavigationItem = Pick<
  PlaceDetailPlatformSection,
  'anchor' | 'count' | 'label' | 'platform'
>;

interface PlaceDetailPlatformNavigationProps {
  platforms: PlatformNavigationItem[];
}

/**
 * Улучшает SSR-якоря активным маркером на основе IntersectionObserver.
 *
 * @param props - Непустые платформы в архивном порядке.
 */
export function PlaceDetailPlatformNavigation({
  platforms,
}: Readonly<PlaceDetailPlatformNavigationProps>) {
  const [activePlatform, setActivePlatform] = useState<Platform | null>(
    platforms[0]?.platform ?? null,
  );
  const visibilityByPlatform = useRef(new Map<Platform, number>());

  useEffect(() => {
    const platformByAnchor = new Map(platforms.map((item) => [item.anchor, item.platform]));
    const sections = platforms.flatMap((item) => {
      const section = document.getElementById(item.anchor);
      return section ? [section] : [];
    });

    if (sections.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const platform = platformByAnchor.get(entry.target.id);

          if (platform) {
            visibilityByPlatform.current.set(
              platform,
              entry.isIntersecting ? entry.intersectionRatio : 0,
            );
          }
        });

        const nextActivePlatform = platforms.reduce<Platform | null>((active, item) => {
          if (!active) {
            return visibilityByPlatform.current.get(item.platform) ? item.platform : null;
          }

          const activeVisibility = visibilityByPlatform.current.get(active) ?? 0;
          const itemVisibility = visibilityByPlatform.current.get(item.platform) ?? 0;
          return itemVisibility > activeVisibility ? item.platform : active;
        }, null);

        if (nextActivePlatform) {
          setActivePlatform(nextActivePlatform);
        }
      },
      { rootMargin: '-15% 0px -55% 0px', threshold: [0, 0.2, 0.45, 0.7] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [platforms]);

  if (platforms.length === 0) {
    return null;
  }

  return (
    <MotionConfig reducedMotion="user">
      <nav
        aria-label="Платформы"
        className="sticky top-0 z-20 flex overflow-x-auto border-t border-white/10 bg-[#151816] px-4 lg:absolute lg:right-1/2 lg:bottom-24 lg:top-auto lg:translate-x-1/2 lg:overflow-visible lg:border-t-0 lg:px-0"
      >
        {platforms.map((platform) => {
          const isActive = platform.platform === activePlatform;

          return (
            <a
              aria-current={isActive ? 'location' : undefined}
              className="relative flex min-h-12 shrink-0 items-center gap-2 px-3 text-xs font-semibold tracking-[0.08em] text-[#f0ece4] uppercase focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#b99a64] lg:min-h-0 lg:flex-col lg:px-2 lg:py-2 lg:[writing-mode:vertical-rl] lg:rotate-180"
              href={`#${platform.anchor}`}
              key={platform.platform}
            >
              {isActive && (
                <motion.span
                  className="absolute right-3 bottom-0 left-3 h-px bg-[#b99a64] lg:top-1 lg:right-auto lg:bottom-1 lg:left-0 lg:h-auto lg:w-px"
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
