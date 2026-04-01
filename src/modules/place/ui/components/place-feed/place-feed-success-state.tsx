import { Paper, Stack } from '@mui/material';
import type { PlaceCardViewModel } from '../../view-model';
import { PlaceFeedGrid } from './place-feed-grid';
import { PlaceFeedHeader } from './place-feed-header';

/**
 * Пропсы success-состояния ленты мест.
 */
export interface PlaceFeedSuccessStateProps {
  title: string;
  meta: string;
  items: readonly PlaceCardViewModel[];
}

/**
 * Рендерит success-состояние ленты мест.
 *
 * @param props - Заголовок, мета и список карточек.
 * @returns Success-блок списка мест.
 */
export function PlaceFeedSuccessState({
  title,
  meta,
  items,
}: Readonly<PlaceFeedSuccessStateProps>) {
  return (
    <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 } }}>
      <Stack spacing={3}>
        <PlaceFeedHeader title={title} meta={meta} />
        <PlaceFeedGrid items={items} />
      </Stack>
    </Paper>
  );
}
