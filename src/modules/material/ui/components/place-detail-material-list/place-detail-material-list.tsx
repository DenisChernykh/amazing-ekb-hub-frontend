import { Chip, Divider, List, ListItem, ListItemButton, Stack, Typography } from '@mui/material';
import { Fragment } from 'react';
import type { PlaceDetailMaterialViewModel } from '../../view-model';

/**
 * Параметры списка материалов платформы.
 */
export interface PlaceDetailMaterialListProps {
  items: readonly PlaceDetailMaterialViewModel[];
}

/**
 * Рендерит список материалов платформенной секции.
 *
 * @param items - Готовые элементы списка материалов.
 * @returns MUI-список материалов с внешними ссылками.
 */
export function PlaceDetailMaterialList({ items }: Readonly<PlaceDetailMaterialListProps>) {
  return (
    <List disablePadding>
      {items.map((item, index) => (
        <Fragment key={item.id}>
          {index > 0 && <Divider component="li" />}

          <ListItem disablePadding>
            <ListItemButton component="a" href={item.href} target="_blank" rel="noreferrer">
              <Stack spacing={1} sx={{ width: '100%' }}>
                <Typography variant="subtitle1">{item.title}</Typography>

                {item.metaChips.length > 0 && (
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    {item.metaChips.map((chip) => (
                      <Chip key={chip} label={chip} size="small" variant="outlined" />
                    ))}
                  </Stack>
                )}
              </Stack>
            </ListItemButton>
          </ListItem>
        </Fragment>
      ))}
    </List>
  );
}
