import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';

function DpsConfirmActions({
  loadingAction,
  canConfirm,
  resetDisabled,
  onReset,
  onConfirm,
}) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1.5}
      sx={{ justifyContent: 'flex-end', alignItems: { xs: 'stretch', sm: 'center' } }}
    >
      <Button
        variant="outlined"
        color="inherit"
        onClick={onReset}
        startIcon={<RestartAltIcon />}
        disabled={loadingAction !== null || resetDisabled}
      >
        Reset
      </Button>
      <Button
        variant="contained"
        color="success"
        onClick={onConfirm}
        disabled={!canConfirm}
        startIcon={loadingAction === 'confirm' ? <CircularProgress size={16} /> : <CheckCircleIcon />}
      >
        Konfirmasi Simpan
      </Button>
    </Stack>
  );
}

export default DpsConfirmActions;
