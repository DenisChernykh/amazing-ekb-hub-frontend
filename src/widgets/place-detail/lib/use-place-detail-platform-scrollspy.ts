'use client';

import type { Platform } from '@/shared/api/generated/model/platform';
import type { RefObject } from 'react';
import { useEffect, useState } from 'react';
import type { PlaceDetailPlatformNavigationItem } from '../model/types';

const DESKTOP_MEDIA_QUERY = '(min-width: 1024px)';

/**
 * Управляет активной платформой для document-scroll на mobile и index-scroll на desktop.
 *
 * @param platforms - Платформы в архивном порядке.
 * @param scrollContainerRef - Desktop-контейнер индекса материалов.
 * @returns Активная платформа для marker и aria-current.
 */
export function usePlaceDetailPlatformScrollspy(
  platforms: PlaceDetailPlatformNavigationItem[],
  scrollContainerRef: RefObject<HTMLDivElement | null>,
) {
  const [activePlatform, setActivePlatform] = useState<Platform | null>(
    platforms[0]?.platform ?? null,
  );

  useEffect(() => {
    const desktopMediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);
    let teardownScrollspy = () => {};

    const setupScrollspy = () => {
      teardownScrollspy();
      setActivePlatform(platforms[0]?.platform ?? null);

      const platformByAnchor = new Map(platforms.map((item) => [item.anchor, item.platform]));
      const sections = platforms.flatMap((item) => {
        const section = document.getElementById(item.anchor);
        return section ? [section] : [];
      });

      if (sections.length === 0) {
        teardownScrollspy = () => {};
        return;
      }

      const scrollContainer = desktopMediaQuery.matches ? scrollContainerRef.current : null;
      const visibilityByPlatform = new Map<Platform, number>();
      const isAtBottom = () =>
        scrollContainer
          ? scrollContainer.scrollTop + scrollContainer.clientHeight >=
            scrollContainer.scrollHeight - 1
          : window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 1;
      const updateActivePlatform = () => {
        const nextActivePlatform = isAtBottom()
          ? (platforms.at(-1)?.platform ?? null)
          : platforms.reduce<Platform | null>((active, item) => {
              if (!active) {
                return visibilityByPlatform.get(item.platform) ? item.platform : null;
              }

              const activeVisibility = visibilityByPlatform.get(active) ?? 0;
              const itemVisibility = visibilityByPlatform.get(item.platform) ?? 0;
              return itemVisibility > activeVisibility ? item.platform : active;
            }, null);

        if (nextActivePlatform) {
          setActivePlatform(nextActivePlatform);
        }
      };
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const platform = platformByAnchor.get(entry.target.id);

            if (platform) {
              visibilityByPlatform.set(
                platform,
                entry.isIntersecting ? entry.intersectionRatio : 0,
              );
            }
          });

          updateActivePlatform();
        },
        {
          root: scrollContainer,
          rootMargin: '-15% 0px -15% 0px',
          threshold: [0, 0.2, 0.45, 0.7],
        },
      );

      sections.forEach((section) => observer.observe(section));

      const scrollTarget = scrollContainer ?? window;
      scrollTarget.addEventListener('scroll', updateActivePlatform, { passive: true });
      teardownScrollspy = () => {
        observer.disconnect();
        scrollTarget.removeEventListener('scroll', updateActivePlatform);
      };
    };

    setupScrollspy();
    desktopMediaQuery.addEventListener('change', setupScrollspy);

    return () => {
      desktopMediaQuery.removeEventListener('change', setupScrollspy);
      teardownScrollspy();
    };
  }, [platforms, scrollContainerRef]);

  return activePlatform;
}
