import { MaterialPreview, MaterialType, Platform } from '@/entities/place';
import { Button, Card, CardActions, CardContent, Chip, Stack, Typography } from '@mui/material';

/**
 * Параметры pinned-блока detail-страницы.
 */
export interface PlaceDetailPinnedCardProps {
  pinnedMaterial: MaterialPreview | null;
}

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

/**
 * Рендерит блок закрепленного материала.
 *
 * Компонент сам решает локальное состояние `filled | empty`, чтобы не раздувать
 * page-level view model.
 *
 * @param pinnedMaterial - Закрепленный материал места или `null`.
 * @returns MUI-карточку закрепленного материала.
 */
export function PlaceDetailPinnedCard({ pinnedMaterial }: Readonly<PlaceDetailPinnedCardProps>) {
  if (!pinnedMaterial) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={1.5}>
            <Typography variant="h6" component="h2">
              Главный материал пока не назначен
            </Typography>

            <Typography variant="body2">
              Когда у места появится стартовый материал, он отобразится в этом блоке.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  const metaChips = [
    PLATFORM_LABELS[pinnedMaterial.platform],
    MATERIAL_TYPE_LABELS[pinnedMaterial.type],
    formatPublishedAt(pinnedMaterial.publishedAt),
    formatDurationMinutes(pinnedMaterial.durationSec),
  ].filter((value): value is string => value !== undefined);

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Stack spacing={1}>
            <Typography variant="overline">Начни отсюда</Typography>

            <Typography variant="h5" component="h2">
              {pinnedMaterial.title}
            </Typography>
          </Stack>

          {metaChips.length > 0 && (
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {metaChips.map((chip) => (
                <Chip key={chip} label={chip} size="small" variant="outlined" />
              ))}
            </Stack>
          )}
        </Stack>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button href={pinnedMaterial.url} target="_blank" rel="noreferrer" variant="contained">
          Открыть материла
        </Button>
      </CardActions>
    </Card>
  );
}

/**
 * Форматирует дату публикации материала.
 *
 * @param value - ISO-строка даты публикации.
 * @returns Короткую русскую дату для UI.
 */
function formatPublishedAt(value: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}
/**
 * Форматирует длительность материала в минутах.
 *
 * @param durationSec - Длительность в секундах.
 * @returns Строку вида `6 мин` или `undefined`, если длительность отсутствует.
 */
function formatDurationMinutes(durationSec: number | null): string | undefined {
  if (durationSec === null) {
    return undefined;
  }

  const minutes = Math.max(1, Math.ceil(durationSec / 60));

  return `${minutes} мин`;
}
