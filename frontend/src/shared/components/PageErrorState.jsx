import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

function PageErrorState({ message, onRetry }) {
  return (
    <Stack spacing={1.5} sx={{ alignItems: 'flex-start' }}>
      <Alert severity="error" sx={{ width: '100%' }}>
        {message}
      </Alert>
      {onRetry ? (
        <Button variant="outlined" onClick={onRetry}>
          Coba Lagi
        </Button>
      ) : null}
    </Stack>
  );
}

export default PageErrorState;
