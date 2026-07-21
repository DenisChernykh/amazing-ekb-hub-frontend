/** Frontend-модель изображения категории. */
export type CategoryCardImageModel = {
  kind: 'placeholder' | 'photo';
  src: string;
  alt: string;
};

/** Frontend-модель карточки категории. */
export type CategoryCardModel = {
  id: string;
  slug: string;
  title: string;
  image: CategoryCardImageModel;
};
