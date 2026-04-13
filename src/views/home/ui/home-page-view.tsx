import { ErrorState } from '@/shared/ui/error-state';
import type { HomePageModel } from '../server/get-home-page-data';

interface HomePageViewProps {
  model: HomePageModel;
}
/**
 * Рендерит домашнюю страницу каталога мест по уже подготовленной server-side модели.
 *
 * @param model - Готовая модель страницы с success- или error-state.
 */
export function HomePageView({ model }: HomePageViewProps) {
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

  if (model.kind === 'contract_error') {
    return <ErrorState title="Проблема контракта API" description={model.message} />;
  }

  if (model.kind === 'unexpected_error') {
    return <ErrorState title="Не удалось загрузить данные" description={model.message} />;
  }

  return (
    <main>
      <h1>Места</h1>
      <p>Найдено: {model.pagination.total}</p>
      <p>
        Страница {model.pagination.page} из {model.pagination.pageCount}
      </p>

      <ul>
        {model.items.map((item) => (
          <li key={item.id}>
            <h2>{item.title}</h2>
            <p>{item.summary}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
