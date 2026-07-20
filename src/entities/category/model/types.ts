export type CategoryCardImageModel = {
  kind: 'placeholder' | 'photo';
  src: string;
  alt: string;
};

export type CategoryCardModel = {
  id: string;
  slug: string;
  title: string;
  image: CategoryCardImageModel;
};
