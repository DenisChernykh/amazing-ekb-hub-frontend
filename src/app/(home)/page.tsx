import { HomeCategorySection } from './_components/home-category-section';
import { getHomePageData } from './_lib/get-home-page-data';

export default async function HomePage() {
  const categories = await getHomePageData();
  return <HomeCategorySection categories={categories} />;
}
