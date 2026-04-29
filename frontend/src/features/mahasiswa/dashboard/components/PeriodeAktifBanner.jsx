import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

const DATE_FORMATTER = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

function formatDateRange(startDate, endDate) {
  return `${DATE_FORMATTER.format(new Date(startDate))} - ${DATE_FORMATTER.format(new Date(endDate))}`;
}

function PeriodeAktifBanner({ periode }) {
  if (!periode) {
    return (
      <Paper
        elevation={0}
        sx={{ p: 2.5, border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}
      >
        <Typography color="text.secondary">Belum ada periode aktif</Typography>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={(theme) => ({
        p: 2.5,
        borderRadius: 1,
        bgcolor: alpha(theme.palette.primary.main, 0.08),
        border: '1px solid',
        borderColor: alpha(theme.palette.primary.main, 0.24),
      })}
    >
      <Box>
        <Typography variant="body2" color="primary.dark" fontWeight={700}>
          Periode Aktif
        </Typography>
        <Typography variant="h6" component="p" fontWeight={700}>
          {periode.nama}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {formatDateRange(periode.tanggal_mulai, periode.tanggal_selesai)}
        </Typography>
      </Box>
    </Paper>
  );
}

export default PeriodeAktifBanner;
