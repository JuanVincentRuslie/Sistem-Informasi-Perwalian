import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import { getKaprodiDosenWaliList } from '../../../api/kaprodiManagement.js';
import useFetch from '../../../hooks/useFetch.js';
import PageContainer from '../../../shared/components/PageContainer.jsx';
import PageErrorState from '../../../shared/components/PageErrorState.jsx';
import PageHeader from '../../../shared/components/PageHeader.jsx';
import KaprodiDosenWaliDirectoryList from './components/KaprodiDosenWaliDirectoryList.jsx';
import KaprodiDosenWaliSummaryCards from './components/KaprodiDosenWaliSummaryCards.jsx';

function DosenWaliPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  // useFetch: daftar dosen wali diambil dari service layer kaprodi
  // agar nanti sumber datanya bisa diganti ke backend tanpa ubah UI.
  const { data, loading, error, refetch } = useFetch(getKaprodiDosenWaliList, []);

  // useMemo: pencarian dipisah dari render biasa supaya filtering hanya
  // dihitung ulang saat query atau data dosen benar-benar berubah.
  const filteredItems = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    const items = data?.items ?? [];

    if (!normalizedSearch) return items;

    return items.filter((item) => (
      `${item.nama} ${item.nip}`.toLowerCase().includes(normalizedSearch)
    ));
  }, [data?.items, searchQuery]);

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
        <PageErrorState message={error.message} onRetry={refetch} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Dosen Wali"
        subtitle="Lihat seluruh dosen wali yang terdaftar dan buka mahasiswa bimbingannya"
      />

      <KaprodiDosenWaliSummaryCards summary={data?.summary} />

      <TextField
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        size="small"
        placeholder="Cari nama atau NIP dosen wali"
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
        sx={{ mb: 3, width: { xs: '100%', md: 360 } }}
      />

      <KaprodiDosenWaliDirectoryList
        items={filteredItems}
        onSelect={(item) => navigate(`/dashboard/dosen-wali/${item.id}`)}
      />
    </PageContainer>
  );
}

export default DosenWaliPage;
