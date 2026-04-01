'use client';

import { Alert, AlertTitle, Button, Stack, Typography } from '@mui/material';

/**
 * Пропсы route-level fatal error состояния.
 */
export interface RouteFatalErrorStateProps {
  /**
   * Ошибка из Next `error.tsx`.
   */
  error: Error & { digest?: string };

  /**
   * Хендлер повторной попытки рендера сегмента.
   */
  reset: () => void;

  /**
   * Переопределяет стандартный заголовок.
   */
  titleOverride?: string;

  /**
   * Переопределяет стандартное описание.
   */
  descriptionOverride?: string;
}

/**
 * Рендерит generic route-level UI для fatal ошибок.
 *
 * @param props - Ошибка, reset callback и optional copy overrides.
 * @returns Клиентский error-state для `error.tsx`.
 */
export function RouteFatalErrorState({
  error,
  reset,
  titleOverride,
  descriptionOverride,
}: Readonly<RouteFatalErrorStateProps>) {
  return (
    <Alert severity="error" variant="outlined">
      <AlertTitle>{titleOverride ?? 'Не удалось открыть страницу'}</AlertTitle>

      <Stack spacing={1.5}>
        <Typography variant="body2">
          {descriptionOverride ?? 'Произошел непредвиденный сбой. Попробуйте повторить действие.'}
        </Typography>

        {error.digest && (
          <Typography variant="caption" color="text.secondary">
            Digest: {error.digest}
          </Typography>
        )}

        <Button variant="outlined" onClick={reset} sx={{ alignSelf: 'flex-start' }}>
          Попробовать снова
        </Button>
      </Stack>
    </Alert>
  );
}
