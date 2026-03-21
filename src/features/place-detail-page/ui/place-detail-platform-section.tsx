import type { Material } from '@/entities/material';
import type { MaterialType, Platform } from '@/entities/place';
import type { PlaceDetailSectionData } from '@/features/place-detail-page/model/place-detail-page.view-model.types';
import { getRemoteFailureMessage } from '@/shared/failures';
import AppLink from '@/shared/ui/app-link';
import {
  Alert,
  Card,
  CardContent,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemButton,
  Pagination,
  PaginationItem,
  Stack,
  Typography,
} from '@mui/material';
import { Fragment } from 'react';

/**
 * Параметры платформенной секции detail-страницы.
 */
export interface PlaceDetailPlatformSectionProps {
  section: PlaceDetailSectionData;
}

const PLATFORM_ORDER: readonly Platform[] = ['dzen', 'telegram', 'instagram'];

const PLATFORM_LABELS: Record<Platform, string> = {
  dzen: 'Dzen',
  telegram: 'Telegram',
  instagram: 'Instagram',
};

const MATERIAL_TYPE_LABELS: Record<MaterialType, string> = {
  post: 'Пост',
  reel: 'Reel',
  video: 'Видео',
};

const PLATFORM_PAGE_QUERY_KEYS: Record<Platform, string> = {
  dzen: 'dzenPage',
  telegram: 'telegramPage',
  instagram: 'instagramPage',
};

/**
 * Рендерит одну платформенную секцию detail-экрана.
 *
 * Компонент сам решает локальные состояния `error | empty | success`, чтобы
 * page-level view model оставался тонким.
 *
 * @param section - Данные платформенной секции.
 * @returns MUI-карточку платформенной секции.
 */
export function PlaceDetailPlatformSection({ section }: Readonly<PlaceDetailPlatformSectionProps>) {
  const title = PLATFORM_LABELS[section.platform];

  if (section.counter === 0) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <SectionHeader title={title} countLabel={buildMaterialCountLabel(0)} />

            <Typography variant="body2" color="text.secondary">
              Пока по этой платформе материалов для места нет.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  if (!section.materialResult || !section.materialResult.ok) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <SectionHeader title={title} countLabel={buildMaterialCountLabel(section.counter)} />

            <Alert severity="error">
              {section.materialResult
                ? getRemoteFailureMessage(section.materialResult.error)
                : 'Не удалось загрузить материалы платформы.'}
            </Alert>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  const { items, total, page, pageSize } = section.materialResult.data;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <SectionHeader title={title} countLabel={buildMaterialCountLabel(total)} />

          {items.length > 0 ? (
            <List disablePadding>
              {items.map((item, index) => (
                <Fragment key={item.id}>
                  {index > 0 ? <Divider component="li" /> : null}

                  <ListItem disablePadding>
                    <ListItemButton component="a" href={item.url} target="_blank" rel="noreferrer">
                      <Stack spacing={1} sx={{ width: '100%' }}>
                        <Typography variant="subtitle1">{item.title}</Typography>

                        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                          {buildMaterialMeta(item).map((meta) => (
                            <Chip key={meta} label={meta} size="small" variant="outlined" />
                          ))}
                        </Stack>
                      </Stack>
                    </ListItemButton>
                  </ListItem>
                </Fragment>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary">
              На этой странице материалов пока нет.
            </Typography>
          )}

          {totalPages > 1 ? (
            <Pagination
              page={page}
              count={totalPages}
              color="primary"
              renderItem={(item) => {
                const targetPage = item.page ?? page;

                return (
                  <PaginationItem
                    {...item}
                    component={AppLink}
                    href={buildPlatformPageHref({
                      placeId: section.placeId,
                      platform: section.platform,
                      platformPages: section.platformPages,
                      targetPage,
                    })}
                  />
                );
              }}
            />
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}

interface SectionHeaderProps {
  title: string;
  countLabel: string;
}

function SectionHeader({ title, countLabel }: Readonly<SectionHeaderProps>) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-start', sm: 'center' }}
    >
      <Typography variant="h6" component="h2">
        {title}
      </Typography>

      <Typography variant="body2" color="text.secondary">
        {countLabel}
      </Typography>
    </Stack>
  );
}

function buildMaterialMeta(material: Material): string[] {
  const meta = [MATERIAL_TYPE_LABELS[material.type], formatPublishedAt(material.publishedAt)];

  const durationLabel = formatDurationMinutes(material.durationSec);

  if (durationLabel) {
    meta.push(durationLabel);
  }

  return meta;
}

function buildPlatformPageHref(args: {
  placeId: string;
  platform: Platform;
  platformPages: Record<Platform, number>;
  targetPage: number;
}): string {
  const { placeId, platform, platformPages, targetPage } = args;
  const searchParams = new URLSearchParams();

  for (const currentPlatform of PLATFORM_ORDER) {
    const page = currentPlatform === platform ? targetPage : platformPages[currentPlatform];

    if (page > 1) {
      searchParams.set(PLATFORM_PAGE_QUERY_KEYS[currentPlatform], String(page));
    }
  }

  const queryString = searchParams.toString();

  return queryString.length > 0 ? `/places/${placeId}?${queryString}` : `/places/${placeId}`;
}

function formatPublishedAt(value: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function formatDurationMinutes(durationSec: number | null): string | undefined {
  if (durationSec === null) {
    return undefined;
  }

  const minutes = Math.max(1, Math.ceil(durationSec / 60));

  return `${minutes} мин`;
}

function buildMaterialCountLabel(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return `${count} материал`;
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${count} материала`;
  }

  return `${count} материалов`;
}
