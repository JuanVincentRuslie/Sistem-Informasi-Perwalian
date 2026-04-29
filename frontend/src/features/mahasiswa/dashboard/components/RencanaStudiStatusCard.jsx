import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';

const STATUS_CONFIG = {
  DRAFT: { label: 'Draft', color: 'default' },
  SUBMITTED: { label: 'Menunggu Review', color: 'warning' },
  APPROVED: { label: 'Disetujui', color: 'success' },
  REJECTED: { label: 'Perlu Revisi', color: 'warning' },
};

function RencanaStudiStatusCard({ status }) {
  // useNavigate: ambil fungsi navigasi dari router.
  // Dipakai agar tombol bisa pindah ke halaman Perwalian tanpa reload browser.
  const navigate = useNavigate();
  const statusConfig = STATUS_CONFIG[status] ?? STATUS_CONFIG.DRAFT;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
      }}
    >
      <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
        <Typography variant="h6" component="h2">
          Status Rencana Studi
        </Typography>
        <Chip
          label={statusConfig.label}
          color={statusConfig.color}
          variant={status === 'DRAFT' ? 'outlined' : 'filled'}
        />
        <Button
          variant="contained"
          endIcon={<ArrowForwardIcon fontSize="small" />}
          onClick={() => navigate('/dashboard/perwalian')}
        >
          Lihat Detail
        </Button>
      </Stack>
    </Paper>
  );
}

export default RencanaStudiStatusCard;
