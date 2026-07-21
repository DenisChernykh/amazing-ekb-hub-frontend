import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

function ActionContent() {
  return (
    <>
      <span>Показать все категории</span>
      <ArrowRight aria-hidden="true" className="size-5" />
    </>
  );
}

/** Отображает основную ссылку со страницы домой на полный список категорий. */
export function ShowAllCategoriesLink() {
  return (
    <Link href="/categories" className="catalog-primary-action">
      <span className="catalog-primary-action-content">
        <ActionContent />
      </span>
      <span
        aria-hidden="true"
        className="catalog-primary-action-content catalog-primary-action-inverse"
      >
        <ActionContent />
      </span>
    </Link>
  );
}
