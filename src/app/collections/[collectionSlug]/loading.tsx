import { Container } from '@/shared/ui';

/** Показывает стабильное состояние ожидания detail-страницы подборки. */
export default function CollectionLoading() {
  return (
    <Container as="main" className="py-12">
      <div className="flex min-h-48 items-center justify-center" role="status" aria-live="polite">
        Открываем подборку…
      </div>
    </Container>
  );
}
