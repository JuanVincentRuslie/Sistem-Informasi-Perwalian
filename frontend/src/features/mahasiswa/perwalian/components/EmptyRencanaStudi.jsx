import AddIcon from '@mui/icons-material/Add';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

function EmptyRencanaStudi({
  periode,
  creating,
  onCreate,
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        border: '1px dashed',
        borderColor: 'divider',
        borderRadius: 1,
      }}
    >
      <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
        <Typography variant="h6" component="h2">
          Belum Ada FRS
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {periode?.nama
            ? `Buat FRS baru untuk periode ${periode.nama}.`
            : 'Buat FRS baru untuk periode aktif.'}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon fontSize="small" />}
          disabled={creating}
          onClick={onCreate}
        >
          {creating ? 'Membuat...' : 'Buat FRS Baru'}
        </Button>
      </Stack>
    </Paper>
  );
}

export default EmptyRencanaStudi;
