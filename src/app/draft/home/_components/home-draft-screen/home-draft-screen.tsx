import type { HomeDraftPageData } from '@/app/draft/home/_lib';
import type { RscInlineFailureModel } from '@/server/std-errors';
import { Box, Container, Stack } from '@mui/material';
import { HomeDraftContent } from '../home-draft-content';
import { HomeDraftIntroCard } from '../home-draft-intro-card';

/**
 * Пропсы route-level экрана draft home-страницы.
 */
export type HomeDraftScreenProps =
  | {
      data: HomeDraftPageData;
      failure?: never;
    }
  | {
      failure: RscInlineFailureModel;
      data?: never;
    };

/**
 * Рендерит route-level композицию draft home-страницы.
 *
 * @param props - Успешные данные страницы или inline failure model.
 * @returns Полный экран draft home.
 */
export function HomeDraftScreen(props: Readonly<HomeDraftScreenProps>) {
  return (
    <Box component="main" sx={{ py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <Stack spacing={3}>
          <HomeDraftIntroCard />
          <HomeDraftContent {...props} />
        </Stack>
      </Container>
    </Box>
  );
}
