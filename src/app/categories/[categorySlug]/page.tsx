import { notFound } from 'next/navigation';
import { CategoryPageContent } from './_components/category-page-content';
import { getCategoryPageData } from './_lib/get-category-page-data';
import { getCategoryStaticParams } from './_lib/get-category-static-params';

/** Делегирует Next.js подготовку известных category slug во время сборки. */
export async function generateStaticParams() {
  return getCategoryStaticParams();
}

/** Серверная страница категории с первым фрагментом ленты мест. */
export default async function CategoryPage({
  params,
}: Readonly<{ params: Promise<{ categorySlug: string }> }>) {
  const { categorySlug } = await params;
  const model = await getCategoryPageData(categorySlug);

  if (model.kind === 'not_found') notFound();

  return <CategoryPageContent category={model.category} places={model.places} />;
}
