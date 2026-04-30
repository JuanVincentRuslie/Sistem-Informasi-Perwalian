import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { formatTanggal } from '../../../../utils/formatDate.js';

function KaprodiPeriodeCard({ periodeAktif, overview }) {
  if (!periodeAktif) {
    return (
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Status Periode
        </Typography>
        <Typography color="text.secondary">
          Belum ada periode aktif. Kaprodi perlu mengaktifkan periode sebelum proses perwalian berjalan.
        </Typography>
      </Paper>
    );
  }

  const rentangTanggal = `${formatTanggal(periodeAktif.tanggal_mulai)} - ${formatTanggal(periodeAktif.tanggal_selesai)}`;

  return (
    <Paper
      variant="outlined"
      sx={(theme) => ({
        p: 3,
        height: '100%',
        background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${theme.palette.background.paper} 100%)`,
      })}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2">
          Status Periode
        </Typography>
        <Chip
          size="small"
          color={periodeAktif.is_active ? 'success' : 'default'}
          label={periodeAktif.is_active ? 'Aktif' : 'Tidak aktif'}
        />
      </Stack>

      <Typography variant="h5" component="p" sx={{ mb: 0.5 }}>
        {periodeAktif.nama}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {rentangTanggal}
      </Typography>
      <Typography variant="body2" sx={{ mb: 1 }}>
        {overview?.status_label}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        {overview?.status_deskripsi}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Total periode tersimpan: {overview?.total_periode ?? 0}
      </Typography>
    </Paper>
  );
}

export default KaprodiPeriodeCard;
