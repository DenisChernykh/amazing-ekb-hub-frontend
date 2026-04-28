import type { HomePageModel } from '@/app/_lib/get-home-page-data';
import { ErrorState } from '@/shared/ui/error-state';
import { PlacesCatalog } from '@/widgets/places-catalog';

interface HomePageContentProps {
  model: HomePageModel;
}

/**
 * Рендерит состояние главной страницы каталога.
 *
 * @param props - Модель главной страницы.
 */
export function HomePageContent({ model }: Readonly<HomePageContentProps>) {
  if (model.kind === 'bad_request') {
    return (
      <ErrorState
        title={model.title}
        description="Параметры запроса не прошли валидацию на стороне API."
        issues={model.issues}
        requestId={model.requestId}
      />
    );
  }

  if (model.kind === 'unexpected_error') {
    return <ErrorState title="Не удалось загрузить данные" description={model.message} />;
  }

  return <PlacesCatalog model={model.catalog} />;
}
