import { CircularProgress, Container, Stack, Typography } from '@mui/material';

export default function Loading() {
  return (
    <Container component="main" maxWidth="lg" sx={{ py: { xs: 4, sm: 6 } }}>
      <Stack alignItems="center" minHeight={240} justifyContent="center" spacing={2}>
        <CircularProgress aria-label="Загрузка" size={32} />
        <Typography color="text.secondary">Загрузка...</Typography>
      </Stack>
    </Container>
  );
}
