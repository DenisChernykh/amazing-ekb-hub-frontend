import Image from 'next/image';

import { Container } from '@/shared/ui';
import { ShowAllCategoriesLink } from './show-all-categories-link';

/** Отображает первый экран публичного каталога с панорамой Екатеринбурга. */
export function HomeHero() {
  return (
    <section
      className="home-hero relative isolate flex overflow-hidden bg-black text-white"
      aria-labelledby="home-hero-title"
    >
      <Image
        src="/images/home/yekaterinburg-panorama.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="home-hero-image"
      />
      <div aria-hidden="true" className="home-hero-scrim absolute inset-0" />
      <Container className="relative z-10 flex w-full items-end py-16 sm:py-20 lg:items-center lg:py-24">
        <div className="home-hero-content max-w-3xl">
          <h1 id="home-hero-title" className="home-hero-title max-w-4xl font-medium text-balance">
            Ваш гид по Екатеринбургу
          </h1>
          <p className="mt-7 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
            Честные обзоры проверенных мест для любого настроения
          </p>
          <div className="mt-10">
            <ShowAllCategoriesLink />
          </div>
        </div>
      </Container>
    </section>
  );
}
