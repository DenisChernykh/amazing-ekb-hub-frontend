import type { PlaceMaterialModel } from '@/entities/place';
import { appStyleTokens } from '@/shared/ui/theme';
import {
  Box,
  Button,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import { MaterialSummary } from './material-summary';

interface PlatformMaterialListProps {
  materials: PlaceMaterialModel[];
}

interface PlatformMaterialListItemProps {
  material: PlaceMaterialModel;
  showDivider: boolean;
}

/**
 * Рендерит список материалов внутри секции платформы.
 */
export function PlatformMaterialList({ materials }: Readonly<PlatformMaterialListProps>) {
  return (
    <List disablePadding>
      {materials.map((material, index) => (
        <PlatformMaterialListItem key={material.id} material={material} showDivider={index > 0} />
      ))}
    </List>
  );
}

/**
 * Рендерит строку материала в списке платформы.
 */
function PlatformMaterialListItem({
  material,
  showDivider,
}: Readonly<PlatformMaterialListItemProps>) {
  return (
    <Box>
      {showDivider && <Divider component="li" />}
      <ListItem disablePadding sx={{ display: 'block' }}>
        {material.url ? (
          <ListItemButton
            component="a"
            href={material.url}
            rel="noreferrer"
            target="_blank"
            sx={{
              px: 2,
              py: 1.75,
              alignItems: 'stretch',
              '&:hover': {
                bgcolor: appStyleTokens.palette.accentSoft,
              },
              '&:focus-visible': {
                outline: `3px solid ${appStyleTokens.palette.focusRing}`,
                outlineOffset: -3,
              },
            }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              gap={1.5}
              width="100%"
            >
              <ListItemText
                primary={<MaterialSummary material={material} />}
                primaryTypographyProps={{ component: 'div' }}
                sx={{ my: 0 }}
              />
              <Typography color="primary" component="span" fontWeight={800} sx={{ flexShrink: 0 }}>
                Открыть
              </Typography>
            </Stack>
          </ListItemButton>
        ) : (
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            gap={1.5}
            width="100%"
            sx={{ px: 2, py: 1.75 }}
          >
            <ListItemText
              primary={<MaterialSummary material={material} />}
              primaryTypographyProps={{ component: 'div' }}
              sx={{ my: 0 }}
            />
            <Button disabled variant="text" sx={{ flexShrink: 0 }}>
              Недоступно
            </Button>
          </Stack>
        )}
      </ListItem>
    </Box>
  );
}
