import { getPlaceCategoryDisplay, type PlaceCategory } from '@/entities/place';
import { Badge } from '@/shared/ui';

interface CatalogCategoryFiltersProps {
  activeCategorySlug?: string;
  categories: PlaceCategory[];
  onCategoryChange: (categorySlug: string | null) => void;
}

const CATEGORY_BUTTON_CLASS_NAME =
  'h-8 cursor-pointer rounded-full px-3 py-0 text-[0.8125rem] leading-8 font-bold transition-[filter,background-color,color,border-color,box-shadow] hover:brightness-95';

/**
 * Рендерит feature-private список category filter buttons.
 *
 * @param props - Категории, активный slug и callback перехода.
 */
export function CatalogCategoryFilters({
  activeCategorySlug,
  categories,
  onCategoryChange,
}: Readonly<CatalogCategoryFiltersProps>) {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge
        render={
          <button
            aria-pressed={!activeCategorySlug}
            onClick={() => onCategoryChange(null)}
            type="button"
          />
        }
        className={CATEGORY_BUTTON_CLASS_NAME}
        variant={activeCategorySlug ? 'outline' : 'default'}
      >
        Все
      </Badge>

      {categories.map((placeCategory) => {
        const display = getPlaceCategoryDisplay(placeCategory);
        const isActive = activeCategorySlug === placeCategory.slug;

        return (
          <Badge
            render={
              <button
                aria-pressed={isActive}
                onClick={() => onCategoryChange(placeCategory.slug)}
                type="button"
              />
            }
            key={placeCategory.id}
            className={CATEGORY_BUTTON_CLASS_NAME}
            style={
              isActive
                ? {
                    backgroundColor: display.backgroundColor,
                    color: display.color,
                  }
                : undefined
            }
            variant={isActive ? 'default' : 'outline'}
          >
            {display.label}
          </Badge>
        );
      })}
    </div>
  );
}
