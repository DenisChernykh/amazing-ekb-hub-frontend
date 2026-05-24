import {
  Alert,
  AlertTitle,
  Container,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';

interface ErrorStateProps {
  title: string;
  description?: string;
  issues?: Array<{ path?: string; message: string }>;
  requestId?: string;
}
/**
 * Рендерит базовое inline-состояние ошибки для route-level и page-level сценариев.
 */
export function ErrorState({
  title,
  description,
  issues = [],
  requestId,
}: Readonly<ErrorStateProps>) {
  return (
    <Container component="main" maxWidth="md" sx={{ py: { xs: 4, sm: 6 } }}>
      <Alert severity="error" variant="outlined">
        <AlertTitle>{title}</AlertTitle>

        {description && <Typography>{description}</Typography>}

        {issues.length > 0 && (
          <List dense disablePadding sx={{ mt: 1 }}>
            {issues.map((issue, index) => (
              <ListItem disableGutters key={`${issue.path ?? 'root'}-${index}`}>
                <ListItemText
                  primary={issue.path ? `${issue.path}: ${issue.message}` : issue.message}
                />
              </ListItem>
            ))}
          </List>
        )}

        {requestId && (
          <Typography color="text.secondary" mt={1.5} variant="caption">
            Request ID: {requestId}
          </Typography>
        )}
      </Alert>
    </Container>
  );
}
