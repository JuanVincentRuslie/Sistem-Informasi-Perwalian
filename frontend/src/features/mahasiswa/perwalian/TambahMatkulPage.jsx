import { useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useLocation, useNavigate } from 'react-router-dom';
import useFetch from '../../../hooks/useFetch.js';
import { addRencanaStudiItem, getKelas } from '../../../api/rencanaStudi.js';
import JadwalBentrokDialog from './components/JadwalBentrokDialog.jsx';
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

// Cek bentrok jadwal antar kelas (pairwise). Hari sama + waktu overlap = bentrok.
// Format jam_mulai/jam_selesai dijamin "HH:MM" zero-padded oleh backend (TO_CHAR),
// jadi string compare aman tanpa parse tanggal.
function findJadwalBentrok(kelasArr) {
  const bentrok = [];
  for (let i = 0; i < kelasArr.length; i++) {
    for (let j = i + 1; j < kelasArr.length; j++) {
      for (const sa of kelasArr[i].sesi ?? []) {
        for (const sb of kelasArr[j].sesi ?? []) {
          if (sa.hari === sb.hari
              && sa.jam_mulai < sb.jam_selesai
              && sb.jam_mulai < sa.jam_selesai) {
            bentrok.push({ a: kelasArr[i], sesiA: sa, b: kelasArr[j], sesiB: sb });
          }
        }
      }
    }
  }
  return bentrok;
}

function TambahMatkulPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { frsId, periodeId, periodeNama, frs } = state ?? {};

  // useState: Map dari kode_matkul → kelas_id yang dipilih.
  // Map memastikan per matkul hanya bisa pilih 1 kelas (seperti FRS nyata).
  const [selectedKelas, setSelectedKelas] = useState(new Map());
  // useState: error checkout disimpan supaya user bisa baca dan koreksi,
  // tanpa terganggu popup alert native browser.
  const [submitError, setSubmitError] = useState('');
  // useState: kunci tombol checkout selama item FRS dikirim satu per satu,
  // supaya double-click tidak membuat request duplikat.
  const [submitting, setSubmitting] = useState(false);
  // useState: hasil cek bentrok jadwal saat checkout. Non-empty array = buka dialog
  // warning. User klik "Kembali" → kosongkan array → dialog tertutup.
  const [bentrokList, setBentrokList] = useState([]);

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
    if (submitting) return;
    if (!frsId) { navigate('/dashboard/perwalian'); return; }
    setSubmitError('');

    // Resolve kelas_id terpilih → object kelas lengkap (dengan sesi) dari kelasList.
    const selectedKelasObjects = [];
    for (const [kode, kelasId] of selectedKelas) {
      const group = matkulGroups.find((m) => m.kode_matkul === kode);
      const kelas = group?.kelas_list.find((k) => k.id === kelasId);
      if (kelas) selectedKelasObjects.push(kelas);
    }

    // Gabung dengan kelas yang sudah di FRS (dari router state). Dedup by kelas_id
    // supaya kelas yang sama tidak compare dengan dirinya sendiri (false positive).
    const existingKelas = (frs?.items ?? []).map((item) => item.kelas);
    const seen = new Set();
    const checkInput = [...existingKelas, ...selectedKelasObjects].filter((k) => {
      if (seen.has(k.id)) return false;
      seen.add(k.id);
      return true;
    });

    const bentrok = findJadwalBentrok(checkInput);
    if (bentrok.length > 0) {
      setBentrokList(bentrok);
      return; // tidak panggil API, tidak navigate — tunggu user perbaiki pilihan
    }

    setSubmitting(true);
    try {
      for (const kelasId of selectedKelas.values()) {
        await addRencanaStudiItem(frsId, { kelas_id: kelasId });
      }
      // state.refreshed memberitahu PerwalianPage untuk refetch data FRS
      navigate('/dashboard/perwalian', { state: { refreshed: true } });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Mata kuliah gagal ditambahkan ke FRS.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ m: 3 }}>{error.message}</Alert>;

  return (
    <Box sx={{ pb: 10 }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
        Mata Kuliah Semester {periodeNama}
      </Typography>
      {submitError ? <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert> : null}
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
        disabled={selectedKelas.size === 0 || submitting}
        loading={submitting}
      />

      <JadwalBentrokDialog
        open={bentrokList.length > 0}
        onClose={() => setBentrokList([])}
        bentrok={bentrokList}
      />
    </Box>
  );
}

export default TambahMatkulPage;
