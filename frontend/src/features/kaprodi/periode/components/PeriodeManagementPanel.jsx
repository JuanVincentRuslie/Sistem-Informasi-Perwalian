import AddIcon from '@mui/icons-material/Add';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import HistoryIcon from '@mui/icons-material/History';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { formatTanggal } from '../../../../utils/formatDate.js';
import PeriodeHistoryTable from './PeriodeHistoryTable.jsx';

function SummaryCard({ icon: Icon, label, value, color }) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, minHeight: 122 }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1.5 }}>
        <Box
          sx={(theme) => ({
            width: 42,
            height: 42,
            borderRadius: 1,
            display: 'grid',
            placeItems: 'center',
            color,
            bgcolor: alpha(theme.palette[color.split('.')[0]].main, 0.12),
            flexShrink: 0,
          })}
        >
          <Icon fontSize="small" />
        </Box>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Stack>
      <Typography variant="h5" component="p" fontWeight={700}>
        {value}
      </Typography>
    </Paper>
  );
}

function PeriodeManagementPanel({
  data,
  activatingId,
  deletingId,
  successMessage,
  errorMessage,
  onAdd,
  onActivate,
  onDelete,
}) {
  const periodeAktif = data?.periode_aktif ?? null;
  const histori = data?.histori ?? [];
  const summary = data?.summary ?? {};
  const rentangTanggal = periodeAktif
    ? `${formatTanggal(periodeAktif.tanggal_mulai)} - ${formatTanggal(periodeAktif.tanggal_selesai)}`
    : 'Belum ada periode aktif';

  return (
    <Stack spacing={3}>
      {successMessage ? <Alert severity="success">{successMessage}</Alert> : null}
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1.2fr repeat(2, minmax(0, 1fr))' },
          gap: 2,
        }}
      >
        <Paper
          variant="outlined"
          sx={(theme) => ({
            p: 3,
            background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${theme.palette.background.paper} 100%)`,
          })}
        >
          <Typography variant="body2" color="primary.dark" fontWeight={700} sx={{ mb: 0.75 }}>
            Periode Aktif
          </Typography>
          <Typography variant="h5" component="p" sx={{ mb: 0.5 }}>
            {periodeAktif?.nama ?? 'Belum ada periode aktif'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {rentangTanggal}
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={onAdd}>
            Tambah Periode
          </Button>
        </Paper>

        <SummaryCard
          icon={CalendarMonthIcon}
          label="Total Periode"
          value={summary.total_periode ?? 0}
          color="primary.main"
        />
        <SummaryCard
          icon={HistoryIcon}
          label="Periode Berakhir"
          value={summary.total_periode_berakhir ?? 0}
          color="warning.main"
        />
      </Box>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
          Histori Periode
        </Typography>
        <PeriodeHistoryTable
          periods={histori}
          activatingId={activatingId}
          deletingId={deletingId}
          onActivate={onActivate}
          onDelete={onDelete}
        />
      </Paper>
    </Stack>
  );
}

export default PeriodeManagementPanel;
