import { useEffect, useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useLocation, useNavigate } from 'react-router-dom';
import PageContainer from '../../../shared/components/PageContainer.jsx';
import useFetch from '../../../hooks/useFetch.js';
import {
  deleteRencanaStudiItem,
  getRencanaStudiSaya,
  getRiwayatRencanaStudiSaya,
  submitRencanaStudi,
} from '../../../api/rencanaStudi.js';
import CatatanDosenModal from './components/CatatanDosenModal.jsx';
import FrsContentPanel from './components/FrsContentPanel.jsx';
import FrsPeriodeTabs from './components/FrsPeriodeTabs.jsx';

function PerwalianPage() {
  // useState: index tab yang aktif. Setelah riwayat loaded, default-nya
  // diarahkan ke periode terbaru yang ada di tab paling kanan.
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  // useState: toggle modal catatan dosen wali
  const [catatanOpen, setCatatanOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // useFetch: ambil riwayat ringkasan FRS (untuk render tab-tab periode).
  // [] sebagai deps = hanya fetch sekali saat mount.
  const { data: riwayat, loading: loadingTabs } = useFetch(getRiwayatRencanaStudiSaya, []);

  // useMemo: tampilkan histori secara kronologis (lama -> baru) supaya tab
  // dibaca natural dari kiri ke kanan, tanpa mengubah data asli dari API/mock.
  const sortedRiwayat = useMemo(() => (
    [...(riwayat ?? [])].sort((a, b) => a.periode.id - b.periode.id)
  ), [riwayat]);

  // Derive info periode yang aktif dari tab index + riwayat yang sudah diload.
  const activePeriodeId = sortedRiwayat?.[activeTabIndex]?.periode?.id ?? null;
  const periodeNama = sortedRiwayat?.[activeTabIndex]?.periode?.nama ?? '';
  const periodeAktif = sortedRiwayat?.[activeTabIndex]?.periode?.is_active ?? false;

  // useFetch: detail FRS (items + catatan) untuk tab yang aktif.
  // activePeriodeId di deps: re-fetch otomatis tiap ganti tab.
  // Guard fetcher: kalau activePeriodeId null (riwayat belum loaded), skip call asli.
  const { data: frs, loading: loadingFrs, error: frsError, refetch } = useFetch(
    () => activePeriodeId
      ? getRencanaStudiSaya({ periode_id: activePeriodeId })
      : Promise.resolve({ data: null }),
    [activePeriodeId]
  );

  // useEffect: refetch detail FRS setelah kembali dari TambahMatkulPage.
  // location.state.refreshed di-set oleh TambahMatkulPage sebelum navigate kembali.
  useEffect(() => {
    if (location.state?.refreshed) {
      refetch();
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state?.refreshed, refetch, navigate, location.pathname]);

  // useEffect: begitu riwayat selesai diload, pilih periode terbaru.
  // Karena urutan tab lama -> baru, periode terbaru ada di index terakhir.
  useEffect(() => {
    if (sortedRiwayat.length > 0) {
      setActiveTabIndex(sortedRiwayat.length - 1);
    }
  }, [sortedRiwayat.length]);

  const handleKirim = async () => {
    if (!frs) return;
    setSubmitting(true);
    try {
      await submitRencanaStudi(frs.id);
      refetch();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = async () => {
    if (!frs || frs.items.length === 0) return;

    const confirmed = window.confirm('Reset FRS akan menghapus semua mata kuliah di rencana studi ini. Lanjutkan?');
    if (!confirmed) return;

    setResetting(true);
    try {
      for (const item of frs.items) {
        await deleteRencanaStudiItem(frs.id, item.id);
      }
      refetch();
    } catch (err) {
      alert(err.message);
    } finally {
      setResetting(false);
    }
  };

  const handleTambah = () => navigate('/dashboard/perwalian/tambah', {
    state: { frsId: frs?.id, periodeId: activePeriodeId, periodeNama },
  });

  const handleJadwal = () => navigate('/dashboard/perwalian/jadwal', { state: { frs } });

  if (loadingTabs) {
    return (
      <PageContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <FrsPeriodeTabs
        riwayat={sortedRiwayat}
        activeTabIndex={activeTabIndex}
        onChange={setActiveTabIndex}
      />

      {loadingFrs && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {frsError && !loadingFrs && (
        <Alert severity="error" sx={{ mt: 2 }}>{frsError.message}</Alert>
      )}

      {!loadingFrs && !frsError && frs && (
        <FrsContentPanel
          frs={frs}
          periodeNama={periodeNama}
          periodeAktif={periodeAktif}
          onCatatan={() => setCatatanOpen(true)}
          onTambah={handleTambah}
          onJadwal={handleJadwal}
          onKirim={handleKirim}
          onReset={handleReset}
          resetting={resetting}
          submitting={submitting}
        />
      )}

      <CatatanDosenModal
        open={catatanOpen}
        catatan={frs?.catatan_dosen}
        onClose={() => setCatatanOpen(false)}
      />
    </PageContainer>
  );
}

export default PerwalianPage;
