import type { RscInlineFailureModel } from '@/server/std-errors';
import { getStdErrorCatalogEntry } from '@/shared/errors/catalog';
import { Alert, AlertTitle, Box, Stack, Typography } from '@mui/material';

/**
 * Пропсы inline-состояния expected failure.
 */
export interface StdInlineFailureStateProps {
  /**
   * Serializable expected failure model из `std-errors` RSC-слоя.
   */
  failure: RscInlineFailureModel;

  /**
   * Переопределяет заголовок каталога, если экрану нужен более конкретный copy.
   */
  titleOverride?: string;

  /**
   * Переопределяет описание каталога, если экрану нужен более конкретный copy.
   */
  descriptionOverride?: string;
}

/**
 * Рендерит стандартное inline-состояние expected failure для route-level UI.
 *
 * @param props - Модель ошибки и optional copy overrides.
 * @returns Alert-блок с пользовательским сообщением, issues и request id.
 */
export function StdInlineFailureState({
  failure,
  titleOverride,
  descriptionOverride,
}: Readonly<StdInlineFailureStateProps>) {
  const catalogEntry = getStdErrorCatalogEntry(failure.catalogKey);
  const title = titleOverride ?? catalogEntry.title;
  const description = descriptionOverride ?? catalogEntry.description;

  return (
    <Alert severity="warning" variant="outlined">
      <AlertTitle>{title}</AlertTitle>

      <Stack spacing={1.5}>
        <Typography variant="body2">{description}</Typography>

        {failure.globalIssues.length > 0 && (
          <Box component="ul" sx={{ pl: 2.5, m: 0 }}>
            {failure.globalIssues.map((issue, index) => (
              <Typography key={`${issue.code}-${issue.path ?? 'global'}-${index}`} component="li">
                {issue.message}
              </Typography>
            ))}
          </Box>
        )}

        {failure.requestId && (
          <Typography variant="caption" color="text.secondary">
            Request ID: {failure.requestId}
          </Typography>
        )}
      </Stack>
    </Alert>
  );
}
