import { useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useLocation, useNavigate } from 'react-router-dom';
import useFetch from '../../../hooks/useFetch.js';
import { addRencanaStudiItem, getKelas } from '../../../api/rencanaStudi.js';
import MatkulAccordionItem from './components/MatkulAccordionItem.jsx';
import TambahBottomBar from './components/TambahBottomBar.jsx';

// Kelompokkan flat list kelas → per matkul berdasarkan kode_matkul.
// Satu kode_matkul bisa punya beberapa kelas (A, B, C, dst).
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

function TambahMatkulPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { frsId, periodeId, periodeNama } = state ?? {};

  // useState: Map dari kode_matkul → kelas_id yang dipilih.
  // Map memastikan per matkul hanya bisa pilih 1 kelas (seperti FRS nyata).
  const [selectedKelas, setSelectedKelas] = useState(new Map());

  // useFetch: ambil list kelas tersedia untuk periode ini.
  // [periodeId] di deps: refetch kalau user navigasi ulang dengan periodeId berbeda.
  const { data: kelasList, loading, error } = useFetch(
    () => getKelas({ periode_id: periodeId }),
    [periodeId]
  );

  // useMemo: group flat kelas list → per matkul untuk accordion.
  // Hanya recompute saat kelasList berubah, tidak setiap render.
  const matkulGroups = useMemo(
    () => (kelasList ? groupByMatkul(kelasList) : []),
    [kelasList]
  );

  // useMemo: hitung total matkul terpilih + total SKS untuk bottom bar.
  const { totalCount, totalSks } = useMemo(() => {
    let sks = 0;
    for (const [kode] of selectedKelas) {
      const group = matkulGroups.find((m) => m.kode_matkul === kode);
      if (group) sks += group.sks;
    }
    return { totalCount: selectedKelas.size, totalSks: sks };
  }, [selectedKelas, matkulGroups]);

  const handlePilih = (kodeMatkul, kelasId) => {
    // Toggle: klik "Pilih" di kelas yang sama = batal pilih
    setSelectedKelas((prev) => {
      const next = new Map(prev);
      if (next.get(kodeMatkul) === kelasId) next.delete(kodeMatkul);
      else next.set(kodeMatkul, kelasId);
      return next;
    });
  };

  const handleCheckout = async () => {
    if (!frsId) { navigate('/dashboard/perwalian'); return; }
    try {
      for (const kelasId of selectedKelas.values()) {
        await addRencanaStudiItem(frsId, { kelas_id: kelasId });
      }
      // state.refreshed memberitahu PerwalianPage untuk refetch data FRS
      navigate('/dashboard/perwalian', { state: { refreshed: true } });
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ m: 3 }}>{error.message}</Alert>;

  return (
    <Box sx={{ pb: 10 }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
        Mata Kuliah Semester {periodeNama}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {matkulGroups.map((matkul) => (
          <MatkulAccordionItem
            key={matkul.kode_matkul}
            matkul={matkul}
            selectedKelasId={selectedKelas.get(matkul.kode_matkul) ?? null}
            onPilih={(kelasId) => handlePilih(matkul.kode_matkul, kelasId)}
          />
        ))}
      </Box>
      <TambahBottomBar
        count={totalCount}
        totalSks={totalSks}
        onCheckout={handleCheckout}
        disabled={selectedKelas.size === 0}
      />
    </Box>
  );
}

export default TambahMatkulPage;
