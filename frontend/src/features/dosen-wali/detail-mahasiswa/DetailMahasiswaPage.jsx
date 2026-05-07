import { useState } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getMahasiswaBimbinganProfile } from '../../../api/rencanaStudi.js';
import useFetch from '../../../hooks/useFetch.js';
import PageContainer from '../../../shared/components/PageContainer.jsx';
import PageErrorState from '../../../shared/components/PageErrorState.jsx';
import PageHeader from '../../../shared/components/PageHeader.jsx';
import DetailMahasiswaDashboardTab from './components/DetailMahasiswaDashboardTab.jsx';
import DetailMahasiswaPohonTab from './components/DetailMahasiswaPohonTab.jsx';
import DetailMahasiswaRencanaStudiTab from './components/DetailMahasiswaRencanaStudiTab.jsx';
import DetailMahasiswaTabs from './components/DetailMahasiswaTabs.jsx';

function DetailMahasiswaPage({
  readOnly = false,
  defaultBackTo = '/dashboard',
  subtitle = 'Detail mahasiswa bimbingan',
}) {
  const { mahasiswaId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // useState: simpan tab utama yang sedang dibuka dosen.
  // Satu halaman menampung tiga konteks agar dosen tidak bolak-balik route.
  const [activeTab, setActiveTab] = useState(0);

  // useFetch: ambil profil akademik mahasiswa bimbingan sekali per mahasiswaId.
  // Profil ini dipakai sebagai header dan sumber data tab Dashboard.
  const { data: profile, loading, error, refetch } = useFetch(
    () => getMahasiswaBimbinganProfile(mahasiswaId),
    [mahasiswaId],
  );

  function handleBack() {
    const backTo = location.state?.backTo ?? defaultBackTo;

    if (backTo) {
      navigate(backTo);
      return;
    }

    if (window.history.length > 1) navigate(-1);
    else navigate('/dashboard');
  }

  if (loading && !profile) {
    return (
      <PageContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (error && !profile) {
    return (
      <PageContainer>
        <PageErrorState message={error.message} onRetry={refetch} />
      </PageContainer>
    );
  }

  const { mahasiswa } = profile;

  return (
    <PageContainer>
      <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mb: 2 }}>
        Kembali
      </Button>

      <PageHeader
        title={`${mahasiswa.nama} - ${mahasiswa.nim}`}
        subtitle={subtitle}
      />

      <DetailMahasiswaTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 0 && <DetailMahasiswaDashboardTab profile={profile} />}
      {activeTab === 1 && <DetailMahasiswaPohonTab mahasiswa={mahasiswa} />}
      {activeTab === 2 && (
        <DetailMahasiswaRencanaStudiTab mahasiswa={mahasiswa} reviewEnabled={!readOnly} />
      )}
    </PageContainer>
  );
}

export default DetailMahasiswaPage;
