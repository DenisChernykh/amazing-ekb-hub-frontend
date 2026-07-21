import { fetchPublicCategory, normalizeCategorySlug } from '@/entities/category';
import { fetchPublicCategoryPlacePage } from '@/entities/place';
import { normalizePageParam } from './_lib/normalize-page-param';

/** Возвращает следующую страницу мест для клиентской догрузки ленты категории. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ categorySlug: string }> },
) {
  const { categorySlug: rawSlug } = await params;
  const categorySlug = normalizeCategorySlug(rawSlug);
  const page = normalizePageParam(new URL(request.url).searchParams.get('page'));

  if (!categorySlug || page === null) {
    return Response.json({ message: 'Некорректные параметры.' }, { status: 400 });
  }

  const category = await fetchPublicCategory(categorySlug);
  if (!category) {
    return Response.json({ message: 'Категория не найдена.' }, { status: 404 });
  }

  const result = await fetchPublicCategoryPlacePage({
    categoryId: category.id,
    categorySlug,
    page,
  });

  return Response.json(result);
}
