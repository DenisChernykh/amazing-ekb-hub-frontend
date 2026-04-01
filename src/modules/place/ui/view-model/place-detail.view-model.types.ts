import type { Platform } from '@/modules/material';

/**
 * View model основного блока информации о месте.
 */
export type PlaceDetailSummaryViewModel = {
  title: string;
  summary: string;
  tags: readonly string[];
  categoryLabel: string;
};

/**
 * View model закрепленного материала detail-экрана.
 */
export type PlaceDetailPinnedCardViewModel =
  | {
      kind: 'empty';
      title: string;
      description: string;
    }
  | {
      kind: 'success';
      eyebrow: string;
      title: string;
      href: string;
      actionLabel: string;
      metaChips: readonly string[];
    };

/**
 * View model счетчиков материалов по платформам.
 */
export type PlaceDetailCountersViewModel = Record<Platform, number>;
