import { Container } from '@/shared/ui';
import { CollectionGrid } from '@/widgets/collection-grid';
import { getCollectionsPageData } from './_lib/get-collections-page-data';

/** Серверная страница полного упорядоченного списка публичных подборок. */
export default async function CollectionsPage() {
  const model = await getCollectionsPageData();

  return (
    <Container as="main" className="py-10 sm:py-14 lg:py-16">
      <h1 className="mb-8 text-3xl font-medium text-black sm:text-4xl">Подборки</h1>
      <CollectionGrid collections={model.collections} ariaLabel="Подборки мест" />
    </Container>
  );
}
