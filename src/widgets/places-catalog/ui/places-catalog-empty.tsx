import { Paper, Typography } from '@mui/material';

/**
 * Рендерит пустое состояние каталога мест.
 */
export function PlacesCatalogEmpty() {
  return (
    <Paper
      aria-label="Пустой каталог"
      component="section"
      elevation={0}
      variant="outlined"
      sx={{
        display: 'grid',
        minHeight: 240,
        p: 3.5,
        color: 'text.secondary',
        placeContent: 'center',
        textAlign: 'center',
      }}
    >
      <Typography color="text.primary" component="h2" variant="h3" mb={1}>
        Места не найдены
      </Typography>
      <Typography>Попробуйте изменить поиск или фильтр категории.</Typography>
    </Paper>
  );
}
