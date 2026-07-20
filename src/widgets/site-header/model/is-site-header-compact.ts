const SITE_HEADER_COMPACT_SCROLL_Y = 16;

export function isSiteHeaderCompact(scrollY: number): boolean {
  return scrollY > SITE_HEADER_COMPACT_SCROLL_Y;
}
