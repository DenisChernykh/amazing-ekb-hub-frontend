import type { ComponentPropsWithoutRef } from 'react';

import { cn } from '@/shared/lib/utils';

type ContainerElement = 'div' | 'main' | 'section';

type ContainerProps<T extends ContainerElement = 'div'> = {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, 'as'>;

/**
 * Рендерит общий page-width контейнер на стандартной responsive-сетке Tailwind.
 */
function Container<T extends ContainerElement = 'div'>({
  as,
  className,
  ...props
}: Readonly<ContainerProps<T>>) {
  const Component = as ?? 'div';

  return (
    <Component
      data-slot="container"
      className={cn('container mx-auto px-4 sm:px-6 lg:px-8', className)}
      {...props}
    />
  );
}

export { Container };
