import Image from 'next/image';
import type { CollectionCardModel } from '../model/types';

/** Отображает обложку подборки или нейтральный fallback с первой буквой заголовка. */
export function CollectionCardImage({
  coverImageUrl,
  title,
  loading,
}: Readonly<Pick<CollectionCardModel, 'coverImageUrl' | 'title'> & { loading: 'eager' | 'lazy' }>) {
  if (!coverImageUrl) {
    return (
      <div
        aria-hidden="true"
        className="flex aspect-[4/3] items-center justify-center bg-muted text-5xl font-medium text-muted-foreground"
      >
        {title.trim().charAt(0) || 'П'}
      </div>
    );
  }

  return (
    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
      <Image
        fill
        unoptimized
        src={coverImageUrl}
        alt=""
        loading={loading}
        sizes="(min-width: 1024px) 25vw, 50vw"
        className="object-cover"
      />
    </div>
  );
}
