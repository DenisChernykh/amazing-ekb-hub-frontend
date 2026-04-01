import { DraftPlaceDetailContent } from '@/app/draft/places/[placeId]/_components/draft-place-detail-content';
import { DraftPlaceDetailPageData } from '@/app/draft/places/[placeId]/_lib';
import { RscInlineFailureModel } from '@/server/std-errors';
import { Box, Container } from '@mui/material';

/**
 * Пропсы route-level экрана draft detail-страницы.
 */
export type DraftPlaceDetailScreenProps =
  | {
      data: DraftPlaceDetailPageData;
      failure?: never;
    }
  | {
      failure: RscInlineFailureModel;
      data?: never;
    };

export function DraftPlaceDetailScreen(props: Readonly<DraftPlaceDetailScreenProps>) {
  return (
    <Box component={'main'} sx={{ py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <DraftPlaceDetailContent {...props} />
      </Container>
    </Box>
  );
}
