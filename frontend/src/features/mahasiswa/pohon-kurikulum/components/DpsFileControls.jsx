import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';

function DpsFileControls({
  selectedFile,
  loadingAction,
  inputKey,
  resetDisabled,
  onFileChange,
  onUploadPreview,
  onReset,
}) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1.5}
      sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}
    >
      <Button component="label" variant="contained" startIcon={<CloudUploadIcon />}>
        Pilih PDF
        <input
          key={inputKey}
          type="file"
          accept="application/pdf,.pdf"
          hidden
          onChange={onFileChange}
        />
      </Button>

      <Button
        variant="outlined"
        onClick={onUploadPreview}
        disabled={!selectedFile || loadingAction === 'upload'}
        startIcon={loadingAction === 'upload' ? <CircularProgress size={16} /> : <CloudUploadIcon />}
      >
        Buat Preview
      </Button>

      <Button
        variant="text"
        color="inherit"
        onClick={onReset}
        startIcon={<RestartAltIcon />}
        disabled={loadingAction !== null || resetDisabled}
      >
        Ganti File
      </Button>
    </Stack>
  );
}

export default DpsFileControls;
