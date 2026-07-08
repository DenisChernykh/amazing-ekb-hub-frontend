import { ButtonLink, Card } from '@/shared/ui';

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
    <Card
      aria-label="Пустой каталог"
      role="region"
      className="grid min-h-60 place-content-center p-7 text-center text-muted-foreground shadow-none"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl leading-tight font-extrabold text-card-foreground">
            {content.title}
          </h2>
          <p className="text-base leading-relaxed">{content.description}</p>
        </div>

        {kind !== 'generic' && (
          <ButtonLink href={props.resetHref} variant="outline">
            {content.actionLabel}
          </ButtonLink>
        )}
      </div>
    </Card>
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
