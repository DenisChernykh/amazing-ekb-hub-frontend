import Image from 'next/image';
import type { CategoryCardModel } from '../model/types';

/** Отображает изображение или детерминированный placeholder категории. */
export function CategoryCardImage({ image }: Readonly<Pick<CategoryCardModel, 'image'>>) {
  return (
    <div className="category-card-media relative overflow-hidden bg-muted">
      <Image
        fill
        unoptimized
        src={image.src}
        alt={image.alt}
        sizes="(min-width: 1024px) 25vw, 50vw"
        className="object-contain"
      />
    </div>
  );
}
