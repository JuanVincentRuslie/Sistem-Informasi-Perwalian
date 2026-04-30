import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import PageContainer from '../../../shared/components/PageContainer.jsx';
import PageHeader from '../../../shared/components/PageHeader.jsx';
import { getJadwalPerwalianSaya, updateJadwalPerwalianSaya } from '../../../api/dosenWali.js';
import useFetch from '../../../hooks/useFetch.js';
import JadwalPerwalianDialog from './components/JadwalPerwalianDialog.jsx';
import JadwalPerwalianOverviewCard from './components/JadwalPerwalianOverviewCard.jsx';

function JadwalPerwalianPage() {
  // useState: dialog edit dibuka-tutup dari halaman induk supaya overview
  // dan form tetap sinkron memakai sumber data yang sama.
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // useState: status submit dipisah dari loading fetch awal.
  // Ini bikin halaman tetap stabil saat simpan tanpa menutup seluruh konten.
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // useFetch: ambil periode aktif dan jadwal dosen dari service layer.
  // Halaman ini jadi tetap taat aturan "no fetch in component".
  const { data, loading, error, refetch } = useFetch(() => getJadwalPerwalianSaya(), []);

  async function handleSubmit(jadwalPerwalian) {
    try {
      setIsSaving(true);
      setSubmitError('');

      const response = await updateJadwalPerwalianSaya({
        jadwal_perwalian: jadwalPerwalian,
      });

      setSuccessMessage(response.message);
      setIsDialogOpen(false);
      refetch();
    } catch (submitErr) {
      setSubmitError(
        submitErr instanceof Error
          ? submitErr.message
          : 'Jadwal perwalian gagal disimpan.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (loading && !data) {
    return (
      <PageContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (error && !data) {
    return (
      <PageContainer>
        <Alert severity="error">{error.message}</Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Jadwal Perwalian"
        subtitle="Atur jadwal perwalian pribadi yang akan ditampilkan ke mahasiswa bimbingan"
      />

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      <JadwalPerwalianOverviewCard
        periodeAktif={data?.periode_aktif ?? null}
        jadwalPerwalian={data?.dosen_wali?.jadwal_perwalian ?? null}
        onEdit={() => {
          setSubmitError('');
          setIsDialogOpen(true);
        }}
      />

      <JadwalPerwalianDialog
        open={isDialogOpen}
        periodeAktif={data?.periode_aktif ?? null}
        initialJadwal={data?.dosen_wali?.jadwal_perwalian ?? null}
        isSaving={isSaving}
        submitError={submitError}
        onClose={() => {
          if (isSaving) return;
          setSubmitError('');
          setIsDialogOpen(false);
        }}
        onSubmit={handleSubmit}
      />
    </PageContainer>
  );
}

export default JadwalPerwalianPage;
