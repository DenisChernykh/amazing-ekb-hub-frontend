import { notFound } from 'next/navigation';
import { CategoryPageContent } from './_components/category-page-content';
import { getCategoryPageData } from './_lib/get-category-page-data';

export default async function CategoryPage({
  params,
}: Readonly<{ params: Promise<{ categorySlug: string }> }>) {
  const { categorySlug } = await params;
  const model = await getCategoryPageData(categorySlug);

  if (model.kind === 'not_found') notFound();

  return <CategoryPageContent category={model.category} places={model.places} />;
}
