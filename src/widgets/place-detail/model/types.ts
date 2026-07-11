import type { PlaceCategory } from '@/entities/place';
import type { Platform } from '@/shared/api/generated/model/platform';

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

/** Server-owned модель детальной страницы места. */
export type PlaceDetailViewModel = {
  title: string;
  category: PlaceCategory;
  coverImageUrl: string;
  totalCount: number;
  pinned: PlaceDetailPreview | null;
  initialPreview: PlaceDetailPreview | null;
  previewsById: Record<string, PlaceDetailPreview>;
  platforms: PlaceDetailPlatformSection[];
};
