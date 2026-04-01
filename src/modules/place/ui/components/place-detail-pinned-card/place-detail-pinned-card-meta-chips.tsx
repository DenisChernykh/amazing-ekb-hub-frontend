import { Chip, Stack } from '@mui/material';

interface PlaceDetailPinnedCardMetaChipsProps {
  chips: readonly string[];
}

/**
 * Рендерит meta-чипы закрепленного материала.
 *
 * @param chips - Набор meta labels pinned-материала.
 * @returns Список чипов или `null`, если список пуст.
 */
export function PlaceDetailPinnedCardMetaChips({
  chips,
}: Readonly<PlaceDetailPinnedCardMetaChipsProps>) {
  if (chips.length === 0) {
    return null;
  }

  return (
    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
      {chips.map((chip) => (
        <Chip key={chip} label={chip} size="small" variant="outlined" />
      ))}
    </Stack>
  );
}
