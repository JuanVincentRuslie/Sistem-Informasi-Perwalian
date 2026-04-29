import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
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
 */
function FrsContentPanel({ frs, periodeNama, periodeAktif, onCatatan, onTambah, onJadwal, onKirim }) {
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

      <MatkulFrsList items={frs.items} />

      <Box sx={{ mt: 2 }}>
        <JadwalFrsList items={frs.items} />
      </Box>

      <Box sx={{ mt: 2 }}>
        <FrsStatusBar status={frs.status} />
      </Box>

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" size="large" onClick={onKirim} disabled={!periodeAktif}>
          Kirim
        </Button>
      </Box>
    </>
  );
}

export default FrsContentPanel;
