/** Размер страницы мест в публичной подборке. */
export const COLLECTION_PAGE_SIZE = 20;

/** Frontend-модель карточки публичной подборки. */
export type CollectionCardModel = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  placeCount: number;
};
