import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { getMaxSks } from '../../../../utils/sksRules.js';
import FrsActionButtons from './FrsActionButtons.jsx';
import FrsStatusBar from './FrsStatusBar.jsx';
import JadwalFrsList from './JadwalFrsList.jsx';
import MatkulFrsList from './MatkulFrsList.jsx';
import TotalSksCard from './TotalSksCard.jsx';

/**
 * Panel konten utama FRS: SKS card + tombol aksi + daftar matkul +
 * jadwal + status bar + tombol Kirim. Dirender saat data FRS sudah tersedia.
 *
 * @param {object} frs - Data detail FRS dari API
 * @param {string} periodeNama
 * @param {boolean} periodeAktif - Untuk disable tombol Tambah & Kirim
 * @param {Function} onCatatan
 * @param {Function} onTambah
 * @param {Function} onJadwal
 * @param {Function} onKirim
 * @param {Function} onReset
 */
function FrsContentPanel({
  frs,
  periodeNama,
  periodeAktif,
  ipsTerakhir = null,
  onCatatan,
  onTambah,
  onJadwal,
  onKirim,
  onReset,
  resetting = false,
  submitting = false,
}) {
  const items = frs.items ?? [];
  const canSubmit = periodeAktif && items.length > 0 && frs.status !== 'APPROVED' && !resetting && !submitting;
  const canReset = periodeAktif && items.length > 0 && !resetting && !submitting;
  const submitLabel = frs.status === 'SUBMITTED' ? 'Kirim Ulang' : 'Kirim';

  // Soft warning kalau total SKS melebihi jatah berdasarkan IPS terakhir.
  // Tidak block submit — dosen wali yang verifikasi.
  const maxSks = getMaxSks(ipsTerakhir);
  const overLimit = frs.total_sks > maxSks;
  const ipsSuffix = ipsTerakhir != null
    ? ` berdasarkan IPS terakhir ${Number(ipsTerakhir).toFixed(2)}`
    : ' — IPS terakhir belum tersedia';

  return (
    <>
      <Typography variant="h6" fontWeight="bold" sx={{ mt: 2, mb: 2 }}>
        Rencana FRS Semester {periodeNama}
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <TotalSksCard totalSks={frs.total_sks} />
        <FrsActionButtons
          onCatatan={onCatatan}
          onTambah={onTambah}
          onJadwal={onJadwal}
          periodeAktif={periodeAktif}
        />
      </Box>

      {overLimit ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Total SKS FRS ({frs.total_sks}) melebihi jatah maksimal ({maxSks} SKS{ipsSuffix}).
        </Alert>
      ) : null}

      <MatkulFrsList items={items} />

      <Box sx={{ mt: 2 }}>
        <JadwalFrsList items={items} />
      </Box>

      <Box sx={{ mt: 2 }}>
        <FrsStatusBar status={frs.status} />
      </Box>

      <Box
        sx={{
          mt: 2,
          display: 'flex',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Button
          variant="outlined"
          color="error"
          size="large"
          startIcon={<RestartAltIcon />}
          onClick={onReset}
          disabled={!canReset}
        >
          {resetting ? 'Mereset...' : 'Reset'}
        </Button>
        <Button variant="contained" size="large" onClick={onKirim} disabled={!canSubmit}>
          {submitting ? 'Mengirim...' : submitLabel}
        </Button>
      </Box>
    </>
  );
}

export default FrsContentPanel;
