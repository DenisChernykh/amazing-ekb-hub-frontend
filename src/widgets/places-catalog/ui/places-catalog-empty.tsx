import { Button, Paper, Stack, Typography } from '@mui/material';

type PlacesCatalogEmptyProps =
  | {
      kind?: 'generic';
      resetHref?: never;
    }
  | {
      kind: 'filtered';
      resetHref: string;
    };

/**
 * Рендерит пустое состояние каталога мест.
 *
 * @param props - Вид пустого состояния и ссылка сброса для filtered-state.
 */
export function PlacesCatalogEmpty(props: Readonly<PlacesCatalogEmptyProps>) {
  const kind = props.kind ?? 'generic';
  const isFiltered = kind === 'filtered';

  return (
    <Paper
      aria-label="Пустой каталог"
      component="section"
      elevation={0}
      variant="outlined"
      sx={{
        display: 'grid',
        minHeight: 240,
        p: 3.5,
        color: 'text.secondary',
        placeContent: 'center',
        textAlign: 'center',
      }}
    >
      <Stack spacing={2} alignItems="center">
        <Stack spacing={1}>
          <Typography color="text.primary" component="h2" variant="h3">
            {isFiltered ? 'Ничего не найдено' : 'Каталог пока пуст'}
          </Typography>
          <Typography>
            {isFiltered
              ? 'Нет мест, которые подходят под текущий поиск или категорию.'
              : 'Мы покажем места, когда они появятся в каталоге.'}
          </Typography>
        </Stack>

        {isFiltered && (
          <Button component="a" href={props.resetHref} variant="outlined">
            Сбросить фильтры
          </Button>
        )}
      </Stack>
    </Paper>
  );
}
