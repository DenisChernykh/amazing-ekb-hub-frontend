import { Button, Paper, Stack, Typography } from '@mui/material';

type PlacesCatalogEmptyProps =
  | {
      kind?: 'generic';
      resetHref?: never;
    }
  | {
      kind: 'filtered';
      resetHref: string;
    }
  | {
      kind: 'page';
      resetHref: string;
    };

/**
 * Рендерит пустое состояние каталога мест.
 *
 * @param props - Вид пустого состояния и ссылка сброса для filtered-state.
 */
export function PlacesCatalogEmpty(props: Readonly<PlacesCatalogEmptyProps>) {
  const kind = props.kind ?? 'generic';
  const content = getEmptyStateContent(kind);

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
            {content.title}
          </Typography>
          <Typography>{content.description}</Typography>
        </Stack>

        {kind !== 'generic' && (
          <Button component="a" href={props.resetHref} variant="outlined">
            {content.actionLabel}
          </Button>
        )}
      </Stack>
    </Paper>
  );
}

/**
 * Это хелпер. Возвращает текст пустого состояния каталога по его виду.
 *
 * @param kind - Вид пустого состояния.
 * @returns Заголовок, описание и подпись действия.
 */
function getEmptyStateContent(kind: NonNullable<PlacesCatalogEmptyProps['kind']>) {
  switch (kind) {
    case 'filtered':
      return {
        title: 'Ничего не найдено',
        description: 'Нет мест, которые подходят под текущий поиск или категорию.',
        actionLabel: 'Сбросить фильтры',
      };

    case 'page':
      return {
        title: 'На этой странице нет мест',
        description: 'В каталоге есть места, но не на текущей странице.',
        actionLabel: 'Перейти на первую страницу',
      };

    case 'generic':
      return {
        title: 'Каталог пока пуст',
        description: 'Мы покажем места, когда они появятся в каталоге.',
        actionLabel: '',
      };
  }
}
