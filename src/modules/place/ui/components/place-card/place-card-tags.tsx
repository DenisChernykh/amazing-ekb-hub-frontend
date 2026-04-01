import { Chip, Stack } from '@mui/material';

/**
 * Пропсы списка тегов карточки места.
 */
export interface PlaceCardTagsProps {
  tags: readonly string[];
}

/**
 * Рендерит список тегов карточки места.
 *
 * @param props - Список тегов места.
 * @returns Список тегов или `null`, если тегов нет.
 */
export function PlaceCardTags({ tags }: Readonly<PlaceCardTagsProps>) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
      {tags.map((tag) => (
        <Chip key={tag} label={tag} size="small" variant="outlined" />
      ))}
    </Stack>
  );
}
