import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import { alpha } from '@mui/material/styles';
import { formatTanggal } from '../../../../utils/formatDate.js';
import { splitJadwalPerwalianLines } from './jadwalPerwalianUtils.js';

function InfoRow({ label, children }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '180px 1fr' },
        gap: 1.5,
        py: 2,
        alignItems: 'start',
      }}
    >
      <Typography variant="body2" fontWeight={700}>
        {label}
      </Typography>
      <Box>{children}</Box>
    </Box>
  );
}

function JadwalPerwalianOverviewCard({ periodeAktif, jadwalPerwalian, onEdit }) {
  const rentangTanggal = periodeAktif
    ? `${formatTanggal(periodeAktif.tanggal_mulai)} - ${formatTanggal(periodeAktif.tanggal_selesai)}`
    : 'Belum ada periode aktif';
  const jadwalLines = splitJadwalPerwalianLines(jadwalPerwalian);

  return (
    <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
      <Box
        sx={(theme) => ({
          px: 3,
          py: 2.5,
          bgcolor: alpha(theme.palette.primary.main, 0.08),
          borderBottom: '1px solid',
          borderColor: 'divider',
        })}
      >
        <Typography variant="h5" component="h2" sx={{ mb: 0.5 }}>
          Periode Perwalian
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {rentangTanggal}
        </Typography>
      </Box>

      <Box sx={{ px: 3 }}>
        <InfoRow label="Pengisian Rencana Studi">
          <Typography variant="body2">{rentangTanggal}</Typography>
        </InfoRow>

        <Divider />

        <InfoRow label="Jadwal Konseling">
          {jadwalLines.length > 0 ? (
            <Stack spacing={0.5}>
              {jadwalLines.map((line) => (
                <Typography key={line} variant="body2">
                  {line}
                </Typography>
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Belum ada jadwal perwalian yang disimpan.
            </Typography>
          )}
        </InfoRow>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 3, pb: 3 }}>
        <Button variant="contained" startIcon={<EditCalendarIcon />} onClick={onEdit}>
          {jadwalLines.length > 0 ? 'Ubah Jadwal' : 'Tambah Jadwal'}
        </Button>
      </Box>
    </Paper>
  );
}

export default JadwalPerwalianOverviewCard;
