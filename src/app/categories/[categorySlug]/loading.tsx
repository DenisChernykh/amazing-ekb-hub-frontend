import { Container } from '@/shared/ui';

/** Показывает состояние ожидания при переходе к ещё не подготовленной категории. */
export default function CategoryLoading() {
  return (
    <Container as="main" className="py-12">
      <div className="flex min-h-48 items-center justify-center" role="status" aria-live="polite">
        Открываем категорию…
      </div>
    </Container>
  );
}
