import { cn } from '@/shared/lib/utils';
import type * as React from 'react';
import { Input } from './input';
import { Label } from './label';

interface TextFieldProps extends Omit<React.ComponentProps<typeof Input>, 'id'> {
  id: string;
  label: string;
  containerClassName?: string;
  labelClassName?: string;
}

/**
 * Рендерит project-owned outlined field с постоянно видимой floating label.
 *
 * @param props - Нативные input props, label и классы композиции.
 */
function TextField({
  className,
  containerClassName,
  id,
  label,
  labelClassName,
  ...props
}: TextFieldProps) {
  return (
    <div
      data-slot="text-field"
      className={cn('group/text-field relative w-full', containerClassName)}
    >
      <Input id={id} className={cn('h-10 rounded-sm px-3', className)} {...props} />
      <Label
        htmlFor={id}
        className={cn(
          'absolute top-0 left-2 z-10 -translate-y-1/2 cursor-text bg-background px-1 text-xs leading-none text-muted-foreground transition-colors group-focus-within/text-field:text-primary',
          labelClassName,
        )}
      >
        {label}
      </Label>
    </div>
  );
}

export { TextField };
