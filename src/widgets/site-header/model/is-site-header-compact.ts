const SITE_HEADER_COMPACT_SCROLL_Y = 16;

/** Определяет компактное состояние header по вертикальному scroll offset. */
export function isSiteHeaderCompact(scrollY: number): boolean {
  return scrollY > SITE_HEADER_COMPACT_SCROLL_Y;
}
