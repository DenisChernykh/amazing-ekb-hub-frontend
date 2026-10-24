'use client';

import { cn } from '@/shared/lib/utils';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { isSiteHeaderCompact } from '../model/is-site-header-compact';

/** Отображает sticky header публичного каталога. */
export function SiteHeader() {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    let frame: number | null = null;

    const sync = () => {
      frame = null;
      setCompact(isSiteHeaderCompact(window.scrollY));
    };

    const handleScroll = () => {
      if (frame === null) frame = window.requestAnimationFrame(sync);
    };

    sync();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b border-border bg-white transition duration-site-header ease-catalog motion-reduce:transition-none',
        compact ? 'site-header-compact' : 'site-header-expanded',
      )}
    >
      <nav
        aria-label="Основная навигация"
        className="container mx-auto flex h-full items-center justify-between gap-4 px-4 sm:gap-6 sm:px-6 lg:px-8"
      >
        <Link
          href="/"
          className={cn(
            'min-w-0 truncate font-medium text-black transition duration-site-header ease-catalog focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black motion-reduce:transition-none',
            compact ? 'scale-95 text-sm' : 'scale-100 text-base',
          )}
        >
          Стрельчук в Екатеринбурге
        </Link>
        <div className="flex shrink-0 items-center gap-3 sm:gap-6">
          <Link
            href="/categories"
            className="text-xs font-medium text-black transition-colors hover:text-card-title-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black sm:text-sm"
          >
            Категории
          </Link>
          <Link
            href="/collections"
            className="text-xs font-medium text-black transition-colors hover:text-card-title-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black sm:text-sm"
          >
            Подборки
          </Link>
        </div>
      </nav>
    </header>
  );
}
