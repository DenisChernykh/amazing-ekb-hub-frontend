import type { PlaceCategory, Platform } from '@/entities/place';

/** Данные одной публикации для строки и декоративного preview. */
export type PlaceDetailPreview = {
  id: string;
  platform: Platform;
  platformLabel: string;
  typeLabel: string;
  title: string;
  publishedAtLabel: string;
  durationLabel: string | null;
  redirectUrl: string | null;
};

/** Непустая платформенная секция архивного индекса. */
export type PlaceDetailPlatformSection = {
  platform: Platform;
  anchor: string;
  label: string;
  count: number;
  materials: PlaceDetailPreview[];
};

/** Сериализуемые данные одной ссылки платформенной навигации. */
export type PlaceDetailPlatformNavigationItem = Pick<
  PlaceDetailPlatformSection,
  'anchor' | 'count' | 'label' | 'platform'
>;

/** Server-owned модель детальной страницы места. */
export type PlaceDetailViewModel = {
  title: string;
  category: PlaceCategory;
  coverImageUrl: string;
  mapsUrl: string | null;
  totalCount: number;
  pinned: PlaceDetailPreview | null;
  initialPreview: PlaceDetailPreview | null;
  previewsById: Record<string, PlaceDetailPreview>;
  platforms: PlaceDetailPlatformSection[];
};
