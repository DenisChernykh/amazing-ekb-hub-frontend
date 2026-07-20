import { Container } from '@/shared/ui';

export default function CategoryLoading() {
  return (
    <Container as="main" className="py-12">
      <div className="flex min-h-48 items-center justify-center" role="status" aria-live="polite">
        Открываем категорию…
      </div>
    </Container>
  );
}
