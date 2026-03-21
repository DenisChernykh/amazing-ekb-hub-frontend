import { PlaceDetailMaterialViewModel } from '@/features/place-detail-page/model/place-detail-page.view-model.types';
import { Chip, Divider, List, ListItem, ListItemButton, Stack, Typography } from '@mui/material';
import { Fragment } from 'react/jsx-runtime';

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
    <List>
      {items.map((item, index) => (
        <Fragment key={item.id}>
          {index > 0 && <Divider component="li" />}

          <ListItem>
            <ListItemButton component="a" href={item.href} target="_blank" rel="noreferrer">
              <Stack>
                <Typography variant="subtitle1">{item.title}</Typography>

                {item.metaChips.length > 0 && (
                  <Stack>
                    {item.metaChips.map((chip) => (
                      <Chip key={chip} label={chip} variant="outlined" />
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
