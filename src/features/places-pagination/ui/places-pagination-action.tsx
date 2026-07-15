import { cn } from '@/shared/lib/utils';
import { PaginationLink } from '@/shared/ui';
import type { MouseEvent, ReactNode } from 'react';
import { buildPlacesPaginationHref } from '../lib/build-places-pagination-href';

interface PlacesPaginationActionProps {
  ariaLabel: string;
  children: ReactNode;
  currentSearchParams: string;
  disabled?: boolean;
  isActive?: boolean;
  onNavigate: (event: MouseEvent<HTMLAnchorElement>, page: number) => void;
  page: number;
}

/**
 * Рендерит один link-like pagination action поверх shared shadcn primitive.
 *
 * @param props - Destination page, accessibility state и navigate callback.
 */
export function PlacesPaginationAction({
  ariaLabel,
  children,
  currentSearchParams,
  disabled = false,
  isActive = false,
  onNavigate,
  page,
}: Readonly<PlacesPaginationActionProps>) {
  const href = disabled ? undefined : buildPlacesPaginationHref({ currentSearchParams, page });

  return (
    <PaginationLink
      aria-disabled={disabled || undefined}
      aria-label={ariaLabel}
      className={cn(
        'rounded-sm',
        isActive &&
          'border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground',
        disabled && 'pointer-events-none opacity-50',
      )}
      data-page={page}
      href={href}
      isActive={isActive}
      onClick={(event) => onNavigate(event, page)}
      size="icon-sm"
      tabIndex={disabled ? -1 : undefined}
    >
      {children}
    </PaginationLink>
  );
}
