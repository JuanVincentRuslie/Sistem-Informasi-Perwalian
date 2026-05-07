import { useMemo } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useLocation, useNavigate } from 'react-router-dom';
import PageContainer from '../../../shared/components/PageContainer.jsx';
import useFetch from '../../../hooks/useFetch.js';
import { getKelas } from '../../../api/rencanaStudi.js';
import MatkulAccordionItem from './components/MatkulAccordionItem.jsx';

// Kelompokkan flat list kelas → per matkul berdasarkan kode_matkul.
// Disalin dari TambahMatkulPage; nanti boleh ekstrak ke utils kalau dipakai 3+ tempat.
function groupByMatkul(kelasList) {
  const map = new Map();
  for (const kelas of kelasList) {
    if (!map.has(kelas.kode_matkul)) {
      map.set(kelas.kode_matkul, {
        kode_matkul: kelas.kode_matkul,
        nama_matkul: kelas.nama_matkul,
        sks: kelas.sks,
        kelas_list: [],
      });
    }
    map.get(kelas.kode_matkul).kelas_list.push(kelas);
  }
  return Array.from(map.values());
}

function JadwalPage() {
  // useLocation: ambil periodeId/periodeNama dari router state (di-passed dari PerwalianPage).
  // Halaman ini menampilkan SEMUA kelas yang kaprodi upload di periode aktif —
  // bukan jadwal FRS milik mahasiswa. Mahasiswa tinggal lihat, tidak bisa pilih.
  const { state } = useLocation();
  const navigate = useNavigate();
  const { periodeId, periodeNama } = state ?? {};

  // useFetch: ambil seluruh kelas di periode terkait. Skip fetch kalau periodeId
  // tidak ada (mis. user direct URL). [periodeId] = re-fetch kalau periode beda.
  const { data: kelasList, loading, error } = useFetch(
    () => periodeId
      ? getKelas({ periode_id: periodeId })
      : Promise.resolve({ data: [] }),
    [periodeId]
  );

  // useMemo: group flat kelas list → per matkul untuk accordion. Hanya recompute
  // saat kelasList berubah, tidak setiap render.
  const matkulGroups = useMemo(
    () => (kelasList ? groupByMatkul(kelasList) : []),
    [kelasList]
  );

  if (!periodeId) {
    return (
      <PageContainer>
        <Alert severity="error">Data jadwal tidak tersedia. Kembali ke halaman Perwalian.</Alert>
        <Box sx={{ mt: 2 }}>
          <Button onClick={() => navigate('/dashboard/perwalian')}>Kembali</Button>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
        Jadwal Kelas {periodeNama ? `Semester ${periodeNama}` : ''}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Daftar seluruh kelas yang dibuka kaprodi pada periode ini.
      </Typography>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && !loading && (
        <Alert severity="error">{error.message}</Alert>
      )}

      {!loading && !error && matkulGroups.length === 0 && (
        <Alert severity="info">
          Belum ada jadwal kelas yang di-upload kaprodi untuk periode ini.
        </Alert>
      )}

      {!loading && !error && matkulGroups.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {matkulGroups.map((matkul) => (
            <MatkulAccordionItem
              key={matkul.kode_matkul}
              matkul={matkul}
              selectedKelasId={null}
              readonly
            />
          ))}
        </Box>
      )}

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={() => navigate('/dashboard/perwalian')}>
          Kembali
        </Button>
      </Box>
    </PageContainer>
  );
}

export default JadwalPage;
