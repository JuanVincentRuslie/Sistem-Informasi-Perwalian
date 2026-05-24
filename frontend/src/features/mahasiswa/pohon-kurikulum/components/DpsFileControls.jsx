import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';

function DpsFileControls({ loadingAction, inputKey, onFileChange }) {
  const isUploading = loadingAction === 'upload';

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1.5}
      sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}
    >
      <Button
        component="label"
        variant="contained"
        startIcon={isUploading ? <CircularProgress size={16} color="inherit" /> : <CloudUploadIcon />}
        disabled={isUploading}
      >
        Pilih PDF
        <input
          key={inputKey}
          type="file"
          accept="application/pdf,.pdf"
          hidden
          onChange={onFileChange}
        />
      </Button>
    </Stack>
  );
}

export default DpsFileControls;
