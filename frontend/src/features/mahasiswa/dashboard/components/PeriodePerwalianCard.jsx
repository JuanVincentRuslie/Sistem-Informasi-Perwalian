import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { splitJadwalPerwalianLines } from '../../../dosen-wali/jadwal-perwalian/components/jadwalPerwalianUtils.js';
import { formatTanggal } from '../../../../utils/formatDate.js';

/**
 * Satu baris info di dalam PeriodePerwalianCard.
 * Label di kiri, value di kanan (bisa multi-baris).
 */
function InfoRow({ label, children }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', py: 1.5 }}>
      <Typography variant="body2" fontWeight="bold" sx={{ minWidth: 160 }}>
        {label}
      </Typography>
      <Box sx={{ textAlign: 'right' }}>
        {children}
      </Box>
    </Box>
  );
}

/**
 * Card Periode Perwalian: header nama periode + jadwal FRS + jadwal dosen wali.
 * Tampil empty state kalau periodeAktif null.
 *
 * @param {{ id, nama, tanggal_mulai, tanggal_selesai } | null} periodeAktif
 * @param {{ nama, jadwal_perwalian }} dosenWali
 */
function PeriodePerwalianCard({ periodeAktif, dosenWali }) {
  if (!periodeAktif) {
    return (
      <Paper variant="outlined" sx={{ mt: 2, p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">Belum ada periode aktif</Typography>
      </Paper>
    );
  }

  const rentangTanggal = `${formatTanggal(periodeAktif.tanggal_mulai)} - ${formatTanggal(periodeAktif.tanggal_selesai)}`;
  const jadwalLines = splitJadwalPerwalianLines(dosenWali?.jadwal_perwalian);

  return (
    <Paper variant="outlined" sx={{ mt: 2, overflow: 'hidden' }}>
      {/* Header abu-abu */}
      <Box sx={{ bgcolor: 'grey.200', px: 3, py: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          Periode Perwalian
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {rentangTanggal}
        </Typography>
      </Box>

      <Box sx={{ px: 3 }}>
        <InfoRow label="Jadwal FRS">
          <Typography variant="body2">{rentangTanggal}</Typography>
        </InfoRow>

        <Divider />

        <InfoRow label="Jadwal Dosen Wali">
          {jadwalLines.length > 0 ? (
            <Stack spacing={0.5} sx={{ alignItems: 'flex-end' }}>
              {jadwalLines.map((line) => (
                <Typography key={line} variant="body2">
                  {line}
                </Typography>
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Belum ada jadwal perwalian
            </Typography>
          )}
        </InfoRow>
      </Box>
    </Paper>
  );
}

export default PeriodePerwalianCard;
