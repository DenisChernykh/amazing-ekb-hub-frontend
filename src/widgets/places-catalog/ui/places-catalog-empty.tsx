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
      sx={{
        display: 'grid',
        minHeight: 240,
        p: 3.5,
        color: '#4b5563',
        bgcolor: '#fff',
        border: '1px solid rgba(31, 41, 55, 0.1)',
        borderRadius: 2,
        placeContent: 'center',
        textAlign: 'center',
      }}
    >
      <Typography color="#111827" fontSize="1.4rem" fontWeight={700} mb={1}>
        Места не найдены
      </Typography>
      <Typography>Попробуйте изменить поиск или фильтр категории.</Typography>
    </Paper>
  );
}
