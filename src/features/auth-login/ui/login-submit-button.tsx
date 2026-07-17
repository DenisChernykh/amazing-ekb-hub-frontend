'use client';

import { Button } from '@/shared/ui';
import { LoaderCircleIcon } from 'lucide-react';
import { useFormStatus } from 'react-dom';

interface LoginSubmitButtonViewProps {
  pending: boolean;
}

/**
 * Рендерит тестируемое визуальное состояние login submit.
 */
export function LoginSubmitButtonView({ pending }: Readonly<LoginSubmitButtonViewProps>) {
  return (
    <Button className="h-12 w-full" disabled={pending} size="lg" type="submit">
      {pending && (
        <LoaderCircleIcon
          aria-hidden="true"
          className="motion-safe:animate-spin"
          data-slot="login-submit-spinner"
        />
      )}
      <span>Войти</span>
    </Button>
  );
}

/**
 * Связывает login submit с pending-состоянием родительской формы.
 */
export function LoginSubmitButton() {
  const { pending } = useFormStatus();

  return <LoginSubmitButtonView pending={pending} />;
}
