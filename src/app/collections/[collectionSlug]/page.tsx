import { ErrorState } from '@/shared/ui/error-state';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CollectionPageContent } from './_components/collection-page-content';
import { getCollectionMetadata } from './_lib/get-collection-metadata';
import { getCollectionPageData } from './_lib/get-collection-page-data';
import { getCollectionStaticParams } from './_lib/get-collection-static-params';
import { parseCollectionPage } from './_lib/parse-collection-page';

/** Делегирует Next.js подготовку известных collection slug во время сборки. */
export async function generateStaticParams() {
  return getCollectionStaticParams();
}

/** Формирует metadata подборки для текущего номера серверной страницы. */
export async function generateMetadata({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ collectionSlug: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
}>): Promise<Metadata> {
  const [{ collectionSlug }, rawSearchParams] = await Promise.all([params, searchParams]);
  return getCollectionMetadata(collectionSlug, parseCollectionPage(rawSearchParams));
}

/** Серверная detail-страница публичной подборки с обычной URL-пагинацией. */
export default async function CollectionPage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ collectionSlug: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
}>) {
  const [{ collectionSlug }, rawSearchParams] = await Promise.all([params, searchParams]);
  const page = parseCollectionPage(rawSearchParams);
  const model = await getCollectionPageData(collectionSlug, page);

  if (model.kind === 'not_found') notFound();

  if (model.kind === 'unexpected_error') {
    return <ErrorState title="Не удалось загрузить подборку" description={model.message} />;
  }

  return <CollectionPageContent {...model} />;
}
