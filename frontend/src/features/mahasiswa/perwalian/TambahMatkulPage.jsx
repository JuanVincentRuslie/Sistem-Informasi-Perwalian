import { useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useLocation, useNavigate } from 'react-router-dom';
import useFetch from '../../../hooks/useFetch.js';
import {
  addRencanaStudiItem,
  deleteRencanaStudiItem,
  getKelas,
} from '../../../api/rencanaStudi.js';
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
        // Jadwal ujian sama untuk semua kelas dari matkul yang sama → cukup ambil
        // dari kelas pertama yang muncul. Backend sudah jamin konsistensi datanya.
        jadwal_ujian: kelas.jadwal_ujian ?? [],
        kelas_list: [],
      });
    }
    map.get(kelas.kode_matkul).kelas_list.push(kelas);
  }
  return Array.from(map.values());
}

// Cek bentrok sesi kuliah antar kelas (pairwise). Hari sama + waktu overlap = bentrok.
// Format jam_mulai/jam_selesai dijamin "HH:MM" zero-padded oleh backend (TO_CHAR),
// jadi string compare aman tanpa parse tanggal.
function findSesiBentrok(kelasArr) {
  const bentrok = [];
  for (let i = 0; i < kelasArr.length; i++) {
    for (let j = i + 1; j < kelasArr.length; j++) {
      for (const sa of kelasArr[i].sesi ?? []) {
        for (const sb of kelasArr[j].sesi ?? []) {
          if (sa.hari === sb.hari
              && sa.jam_mulai < sb.jam_selesai
              && sb.jam_mulai < sa.jam_selesai) {
            bentrok.push({ type: 'sesi', a: kelasArr[i], sesiA: sa, b: kelasArr[j], sesiB: sb });
          }
        }
      }
    }
  }
  return bentrok;
}

// Cek bentrok jadwal ujian (UTS/UAS) antar matkul terpilih. Tanggal sama + waktu overlap = bentrok.
// Multi-shift di-check per shift; matkul yang sama (kelas A vs kelas B) di-skip karena
// share jadwal ujian yang identik (akan jadi false positive kalau dibandingkan).
function findUjianBentrok(kelasArr) {
  const bentrok = [];
  for (let i = 0; i < kelasArr.length; i++) {
    for (let j = i + 1; j < kelasArr.length; j++) {
      if (kelasArr[i].kode_matkul === kelasArr[j].kode_matkul) continue;

      for (const ua of kelasArr[i].jadwal_ujian ?? []) {
        for (const ub of kelasArr[j].jadwal_ujian ?? []) {
          if (ua.tanggal === ub.tanggal
              && ua.jam_mulai < ub.jam_selesai
              && ub.jam_mulai < ua.jam_selesai) {
            bentrok.push({
              type: 'ujian',
              a: kelasArr[i], ujianA: ua,
              b: kelasArr[j], ujianB: ub,
            });
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

  // useState: Map dari kode_matkul → { kelas_id, item_id, fromFrs }.
  // Pre-seed dari frs.items supaya kelas yang sudah di FRS langsung tampil "terpilih".
  // fromFrs=true berarti kelas itu sudah committed di backend → untuk un-toggle
  // perlu DELETE API call. fromFrs=false = pilihan session ini, akan POST di checkout.
  const [selectedKelas, setSelectedKelas] = useState(() => {
    const map = new Map();
    for (const item of frs?.items ?? []) {
      map.set(item.kelas.kode_matkul, {
        kelas_id: item.kelas.id,
        item_id: item.id,
        fromFrs: true,
      });
    }
    return map;
  });

  // useState [pendingKelasId]: kelas_id yang sedang di-DELETE ke backend.
  // Tombol kelas itu disabled + spinner sampai response selesai (anti double-click).
  const [pendingKelasId, setPendingKelasId] = useState(null);
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

  const handlePilih = async (kodeMatkul, kelasId) => {
    if (pendingKelasId) return; // anti double-click selama DELETE berjalan
    setSubmitError('');

    const current = selectedKelas.get(kodeMatkul);

    // Case 1: klik kelas yang sama = toggle off (batal pilih).
    // Kalau kelas itu sudah di FRS, harus DELETE dulu di backend baru hapus dari Map.
    if (current && current.kelas_id === kelasId) {
      if (current.fromFrs) {
        setPendingKelasId(kelasId);
        try {
          await deleteRencanaStudiItem(frsId, current.item_id);
        } catch (err) {
          setSubmitError(err instanceof Error ? err.message : 'Gagal menghapus kelas dari FRS.');
          setPendingKelasId(null);
          return;
        }
        setPendingKelasId(null);
      }
      setSelectedKelas((prev) => {
        const next = new Map(prev);
        next.delete(kodeMatkul);
        return next;
      });
      return;
    }

    // Case 2: ganti kelas dari matkul yang sama (kode sama, kelas_id beda).
    // Kalau kelas lama dari FRS, hapus dulu di backend. Kelas baru jadi session-pick.
    if (current && current.kelas_id !== kelasId) {
      if (current.fromFrs) {
        setPendingKelasId(current.kelas_id);
        try {
          await deleteRencanaStudiItem(frsId, current.item_id);
        } catch (err) {
          setSubmitError(err instanceof Error ? err.message : 'Gagal mengganti kelas di FRS.');
          setPendingKelasId(null);
          return;
        }
        setPendingKelasId(null);
      }
      setSelectedKelas((prev) => {
        const next = new Map(prev);
        next.set(kodeMatkul, { kelas_id: kelasId, item_id: null, fromFrs: false });
        return next;
      });
      return;
    }

    // Case 3: matkul belum di-select sama sekali → tambah sebagai session-pick.
    setSelectedKelas((prev) => {
      const next = new Map(prev);
      next.set(kodeMatkul, { kelas_id: kelasId, item_id: null, fromFrs: false });
      return next;
    });
  };

  const handleCheckout = async () => {
    if (submitting) return;
    if (!frsId) { navigate('/dashboard/perwalian'); return; }
    setSubmitError('');

    // Resolve semua kelas terpilih → object lengkap (FRS-existing + session) untuk cek bentrok.
    // Sekalian pisahkan session-picks yang perlu di-POST saat checkout.
    const allKelasObjects = [];
    const sessionPicks = [];
    for (const [kode, entry] of selectedKelas) {
      const group = matkulGroups.find((m) => m.kode_matkul === kode);
      const kelas = group?.kelas_list.find((k) => k.id === entry.kelas_id);
      if (!kelas) continue;
      allKelasObjects.push(kelas);
      if (!entry.fromFrs) sessionPicks.push(entry);
    }

    const bentrok = [...findSesiBentrok(allKelasObjects), ...findUjianBentrok(allKelasObjects)];
    if (bentrok.length > 0) {
      setBentrokList(bentrok);
      return; // tidak panggil API, tidak navigate — tunggu user perbaiki pilihan
    }

    setSubmitting(true);
    try {
      for (const pick of sessionPicks) {
        await addRencanaStudiItem(frsId, { kelas_id: pick.kelas_id });
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
            selectedKelasId={selectedKelas.get(matkul.kode_matkul)?.kelas_id ?? null}
            pendingKelasId={pendingKelasId}
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
