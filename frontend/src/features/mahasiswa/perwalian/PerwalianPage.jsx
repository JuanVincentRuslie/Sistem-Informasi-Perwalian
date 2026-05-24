import { useEffect, useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useLocation, useNavigate } from 'react-router-dom';
import PageContainer from '../../../shared/components/PageContainer.jsx';
import useFetch from '../../../hooks/useFetch.js';
import {
  createRencanaStudi,
  deleteRencanaStudiItem,
  getRencanaStudiSaya,
  getRiwayatRencanaStudiSaya,
  submitRencanaStudi,
} from '../../../api/rencanaStudi.js';
import { getPeriodeAktif } from '../../../api/periode.js';
import CatatanDosenModal from './components/CatatanDosenModal.jsx';
import EmptyRencanaStudi from './components/EmptyRencanaStudi.jsx';
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
  // useState: simpan error aksi submit/reset supaya feedback muncul di layout MUI,
  // bukan alert browser yang lepas dari desain aplikasi.
  const [actionError, setActionError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // useState: track create-FRS in-flight supaya tombol disable + tampilkan
  // pesan error kalau gagal (mis. tidak ada periode aktif).
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // useFetch: ambil riwayat ringkasan FRS (untuk render tab-tab periode).
  // [] sebagai deps = hanya fetch sekali saat mount.
  const { data: riwayat, loading: loadingTabs, refetch: refetchRiwayat } = useFetch(getRiwayatRencanaStudiSaya, []);

  // useFetch: periode aktif (kalau ada) — dipakai untuk empty state kalau
  // mahasiswa belum punya FRS sama sekali, supaya bisa langsung "Buat FRS Baru".
  // Diberi nama beda dari variable `periodeAktif` di bawah (yang isinya boolean
  // is_active untuk tab terpilih) supaya tidak collision.
  const { data: periodeAktifInfo } = useFetch(getPeriodeAktif, []);

  // useMemo: gabungkan riwayat FRS dengan periode aktif. Kalau mahasiswa belum
  // punya FRS di periode aktif, tab periode tetap muncul agar bisa klik "Buat FRS Baru".
  const sortedRiwayat = useMemo(() => (
    [
      ...(riwayat ?? []),
      ...(
        periodeAktifInfo && !(riwayat ?? []).some((item) => String(item.periode.id) === String(periodeAktifInfo.id))
          ? [{
              id: `periode-${periodeAktifInfo.id}`,
              periode: { ...periodeAktifInfo, is_active: true },
              status: 'DRAFT',
              total_sks: 0,
              submitted_at: null,
              reviewed_at: null,
              catatan_dosen: null,
            }]
          : []
      ),
    ].sort((a, b) => Number(a.periode.id) - Number(b.periode.id))
  ), [periodeAktifInfo, riwayat]);

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
    setActionError('');
    try {
      await submitRencanaStudi(frs.id);
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'FRS gagal dikirim.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = async () => {
    const items = frs?.items ?? [];
    if (!frs || items.length === 0) return;

    const confirmed = window.confirm('Reset FRS akan menghapus semua mata kuliah di rencana studi ini. Lanjutkan?');
    if (!confirmed) return;

    setResetting(true);
    setActionError('');
    try {
      for (const item of items) {
        await deleteRencanaStudiItem(frs.id, item.id);
      }
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'FRS gagal direset.');
    } finally {
      setResetting(false);
    }
  };

  // Pass `frs` ke TambahMatkulPage juga, supaya halaman itu bisa cek bentrok
  // jadwal antara kelas baru yg dipilih + kelas yg sudah ada di FRS — tanpa
  // perlu fetch ulang. Fallback ke pure-new check kalau state hilang (F5/direct URL).
  const handleTambah = () => navigate('/dashboard/perwalian/tambah', {
    state: { frsId: frs?.id, periodeId: activePeriodeId, periodeNama, frs },
  });

  // Tombol "Jadwal" → halaman read-only daftar SEMUA kelas yang kaprodi upload
  // di periode terkait (bukan jadwal FRS milik user). Pass periode info via state.
  const handleJadwal = () => navigate('/dashboard/perwalian/jadwal', {
    state: { periodeId: activePeriodeId, periodeNama },
  });

  // Mahasiswa belum pernah bikin FRS untuk periode aktif. Trigger create lalu
  // refetch riwayat supaya tab langsung muncul tanpa user perlu reload.
  async function handleCreateFrs() {
    const targetPeriodeId = activePeriodeId ?? periodeAktifInfo?.id;
    if (!targetPeriodeId) return;
    setCreating(true);
    setCreateError('');
    try {
      await createRencanaStudi({ periode_id: targetPeriodeId });
      refetchRiwayat();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Gagal membuat FRS baru');
    } finally {
      setCreating(false);
    }
  }

  if (loadingTabs) {
    return (
      <PageContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  // Empty state: belum ada riwayat FRS sama sekali. Tampilkan CTA "Buat FRS Baru"
  // kalau ada periode aktif, atau pesan informatif kalau periode aktif kosong.
  if (sortedRiwayat.length === 0) {
    return (
      <PageContainer>
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', mt: 4 }}>
          {periodeAktifInfo ? (
            <>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Belum ada Rencana Studi
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Periode aktif saat ini: <strong>{periodeAktifInfo.nama}</strong>. Buat rencana studi baru untuk mulai memilih kelas.
              </Typography>
              {createError ? <Alert severity="error" sx={{ mb: 2 }}>{createError}</Alert> : null}
              <Button variant="contained" onClick={handleCreateFrs} disabled={creating}>
                {creating ? 'Membuat...' : 'Buat FRS Baru'}
              </Button>
            </>
          ) : (
            <>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Belum ada periode aktif
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hubungi kaprodi untuk membuka periode perwalian baru.
              </Typography>
            </>
          )}
        </Paper>
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

      {actionError ? (
        <Alert severity="error" sx={{ mt: 2 }}>{actionError}</Alert>
      ) : null}

      {frsError?.status === 404 && !loadingFrs && (
        periodeAktif ? (
          <Box sx={{ mt: 2 }}>
            <EmptyRencanaStudi
              periode={sortedRiwayat?.[activeTabIndex]?.periode ?? periodeAktifInfo}
              creating={creating}
              onCreate={handleCreateFrs}
            />
            {createError ? <Alert severity="error" sx={{ mt: 2 }}>{createError}</Alert> : null}
          </Box>
        ) : (
          <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              FRS belum dibuat untuk periode ini
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Periode {periodeNama} tidak aktif, jadi data ini hanya ditampilkan sebagai riwayat.
            </Typography>
          </Paper>
        )
      )}

      {frsError && frsError.status !== 404 && !loadingFrs && (
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
