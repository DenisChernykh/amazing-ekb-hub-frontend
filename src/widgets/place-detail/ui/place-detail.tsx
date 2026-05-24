import {
  formatMaterialDuration,
  formatMaterialPublishedDate,
  formatMaterialsCount,
  getMaterialTypeDisplay,
  getPlatformDisplay,
  PLACE_PLATFORMS,
  PlaceCategoryBadge,
  type PlaceDetailModel,
  type PlaceMaterialModel,
} from '@/entities/place';
import {
  Avatar,
  Box,
  Button,
  CardMedia,
  Chip,
  Container,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

const PLACE_PLACEHOLDER_IMAGE_SRC = '/images/places/place-placeholder.webp';

interface PlaceDetailProps {
  place: PlaceDetailModel;
}

interface MaterialSummaryProps {
  material: PlaceMaterialModel;
  tone?: 'default' | 'inverted';
}

/**
 * Рендерит краткую информацию материала для pinned-блока и списков платформ.
 *
 * @param props - Материал и цветовой режим отображения.
 */
function MaterialSummary({ material, tone = 'default' }: Readonly<MaterialSummaryProps>) {
  const typeLabel = getMaterialTypeDisplay(material.type);
  const publishedAt = formatMaterialPublishedDate(material.publishedAt);
  const duration = formatMaterialDuration(material.durationSec);
  const platformDisplay = getPlatformDisplay(material.platform);
  const isInverted = tone === 'inverted';
  const outlinedChipSx = isInverted
    ? {
        borderColor: 'rgba(255, 255, 255, 0.28)',
        color: 'rgba(255, 255, 255, 0.82)',
      }
    : undefined;

  return (
    <Stack spacing={1}>
      <Stack direction="row" flexWrap="wrap" gap={0.75}>
        <Chip
          label={typeLabel}
          size="small"
          sx={{
            bgcolor: platformDisplay.backgroundColor,
            color: platformDisplay.color,
            fontWeight: 700,
          }}
        />
        <Chip label={publishedAt} size="small" sx={outlinedChipSx} variant="outlined" />
        {duration ? (
          <Chip label={duration} size="small" sx={outlinedChipSx} variant="outlined" />
        ) : null}
      </Stack>

      <Typography color={isInverted ? '#fff' : '#111827'} fontWeight={700} lineHeight={1.2}>
        {material.title}
      </Typography>
    </Stack>
  );
}

/**
 * Рендерит server-first детальную страницу места.
 *
 * @param props - Frontend contract detail-страницы места.
 */
export function PlaceDetail({ place }: Readonly<PlaceDetailProps>) {
  const imageSrc = place.coverImageUrl ?? PLACE_PLACEHOLDER_IMAGE_SRC;

  return (
    <Container component="main" maxWidth="lg" sx={{ py: { xs: 3.75, sm: 6 }, pb: 8 }}>
      <Grid container spacing={{ xs: 2.5, md: 3 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper
            component="header"
            elevation={0}
            sx={{
              height: '100%',
              p: { xs: 2.5, sm: 3.5 },
              bgcolor: '#fffaf4',
              border: '1px solid rgba(31, 41, 55, 0.1)',
              borderRadius: 2,
            }}
          >
            <Stack spacing={2.25}>
              <PlaceCategoryBadge category={place.category} />

              <Stack spacing={1.25}>
                <Typography
                  color="#111827"
                  component="h1"
                  fontSize="clamp(2.2rem, 1.55rem + 2.6vw, 4.4rem)"
                  fontWeight={700}
                  letterSpacing={0}
                  lineHeight={1.02}
                >
                  {place.title}
                </Typography>
                <Typography color="#4b5563" fontSize="1.08rem" lineHeight={1.65}>
                  {place.summary}
                </Typography>
              </Stack>

              {place.tags.length > 0 ? (
                <Stack aria-label="Теги места" direction="row" flexWrap="wrap" gap={0.75}>
                  {place.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      variant="outlined"
                      sx={{ bgcolor: '#fff', fontWeight: 600 }}
                    />
                  ))}
                </Stack>
              ) : null}
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Paper
            elevation={0}
            sx={{
              overflow: 'hidden',
              height: '100%',
              minHeight: { xs: 260, md: 360 },
              bgcolor: '#edf2f0',
              border: '1px solid rgba(31, 41, 55, 0.1)',
              borderRadius: 2,
            }}
          >
            <CardMedia
              alt={`Фото места ${place.title}`}
              component="img"
              src={imageSrc}
              sx={{
                width: '100%',
                height: '100%',
                minHeight: { xs: 260, md: 360 },
                objectFit: 'cover',
              }}
            />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Paper
            aria-label="Счетчики материалов по платформам"
            component="section"
            elevation={0}
            sx={{
              p: { xs: 2, sm: 2.5 },
              bgcolor: '#fff',
              border: '1px solid rgba(31, 41, 55, 0.1)',
              borderRadius: 2,
            }}
          >
            <Grid container spacing={1.5}>
              {PLACE_PLATFORMS.map((platform) => {
                const platformDisplay = getPlatformDisplay(platform);
                const count = place.platformCounters[platform];

                return (
                  <Grid key={platform} size={{ xs: 12, sm: 4 }}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1.25}
                      sx={{
                        p: 1.5,
                        minHeight: 72,
                        bgcolor: platformDisplay.backgroundColor,
                        borderRadius: 2,
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: 'rgba(255, 255, 255, 0.72)',
                          color: platformDisplay.color,
                          fontWeight: 800,
                        }}
                      >
                        {count}
                      </Avatar>
                      <Box>
                        <Typography color={platformDisplay.color} fontWeight={800}>
                          {platformDisplay.label}
                        </Typography>
                        <Typography color={platformDisplay.color} variant="body2">
                          {formatMaterialsCount(count)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Paper
            aria-label="Закрепленный материал"
            component="section"
            elevation={0}
            sx={{
              height: '100%',
              p: { xs: 2.5, sm: 3 },
              bgcolor: '#111827',
              color: '#fff',
              borderRadius: 2,
            }}
          >
            <Stack height="100%" spacing={2.25} justifyContent="space-between">
              <Stack spacing={1.5}>
                <Typography color="rgba(255, 255, 255, 0.68)" fontWeight={700} variant="overline">
                  Закрепленный материал
                </Typography>

                {place.pinnedMaterial ? (
                  <MaterialSummary material={place.pinnedMaterial} tone="inverted" />
                ) : (
                  <Typography color="rgba(255, 255, 255, 0.72)">
                    Закрепленный материал пока не назначен.
                  </Typography>
                )}
              </Stack>

              {place.pinnedMaterial?.url ? (
                <Button
                  component="a"
                  href={place.pinnedMaterial.url}
                  rel="noreferrer"
                  target="_blank"
                  variant="contained"
                  sx={{
                    alignSelf: 'flex-start',
                    bgcolor: '#fff',
                    color: '#111827',
                    fontWeight: 800,
                    '&:hover': {
                      bgcolor: '#f3f4f6',
                    },
                  }}
                >
                  Открыть материал
                </Button>
              ) : null}
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Stack component="section" spacing={2}>
            <Typography color="#111827" component="h2" fontSize="1.65rem" fontWeight={800}>
              Материалы по платформам
            </Typography>

            {PLACE_PLATFORMS.map((platform) => {
              const platformDisplay = getPlatformDisplay(platform);
              const materials = place.materialsByPlatform[platform];

              return (
                <Paper
                  component="section"
                  elevation={0}
                  key={platform}
                  sx={{
                    overflow: 'hidden',
                    bgcolor: '#fff',
                    border: '1px solid rgba(31, 41, 55, 0.1)',
                    borderRadius: 2,
                  }}
                >
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    gap={1}
                    sx={{ p: 2 }}
                  >
                    <Typography color="#111827" component="h3" fontSize="1.2rem" fontWeight={800}>
                      {platformDisplay.label}
                    </Typography>
                    <Chip
                      label={formatMaterialsCount(materials.length)}
                      size="small"
                      sx={{
                        bgcolor: platformDisplay.backgroundColor,
                        color: platformDisplay.color,
                        fontWeight: 700,
                      }}
                    />
                  </Stack>

                  <Divider />

                  {materials.length > 0 ? (
                    <List disablePadding>
                      {materials.map((material, index) => (
                        <Box key={material.id}>
                          {index > 0 ? <Divider component="li" /> : null}
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
                                    bgcolor: 'rgba(35, 122, 118, 0.06)',
                                  },
                                  '&:focus-visible': {
                                    outline: '3px solid rgba(35, 122, 118, 0.22)',
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
                                  <Typography
                                    color="primary"
                                    component="span"
                                    fontWeight={800}
                                    sx={{ flexShrink: 0 }}
                                  >
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
                      ))}
                    </List>
                  ) : (
                    <Typography color="#6b7280" sx={{ px: 2, py: 2.25 }}>
                      Материалов на этой платформе пока нет.
                    </Typography>
                  )}
                </Paper>
              );
            })}
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}
