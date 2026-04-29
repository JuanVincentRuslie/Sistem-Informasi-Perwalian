import { useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import PageContainer from '../../../shared/components/PageContainer.jsx';
import PageHeader from '../../../shared/components/PageHeader.jsx';
import { getRencanaStudiDosenBimbingan } from '../../../api/rencanaStudi.js';
import { useAuth } from '../../../contexts/AuthContext.jsx';
import useFetch from '../../../hooks/useFetch.js';
import DosenSummaryCards from './components/DosenSummaryCards.jsx';
import MahasiswaBimbinganFilters from './components/MahasiswaBimbinganFilters.jsx';
import MahasiswaBimbinganList from './components/MahasiswaBimbinganList.jsx';
import { getDosenStatusCategory } from './components/statusConfig.js';

function DosenDashboardPage() {
  // useAuth: ambil nama dosen untuk greeting personal di header dashboard.
  // Context menjaga halaman otomatis update kalau user berubah.
  const { user } = useAuth();

  // useState [searchQuery/statusFilter]: simpan kontrol filter lokal.
  // Filtering cukup di client karena dashboard mock masih kecil dan frontend-first.
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // useFetch: ambil list FRS mahasiswa bimbingan dari service layer.
  // Component tidak fetch langsung supaya nanti mudah diganti backend asli.
  const { data, loading, error } = useFetch(getRencanaStudiDosenBimbingan, []);

  // useMemo: filter list hanya dihitung ulang saat data/search/filter berubah,
  // bukan setiap render biasa seperti buka menu avatar.
  const filteredItems = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    const items = data?.items ?? [];

    return items.filter((item) => {
      const category = getDosenStatusCategory(item.status);
      const searchableText = `${item.mahasiswa.nama} ${item.mahasiswa.nim}`.toLowerCase();
      const matchesStatus = statusFilter === 'all' || category === statusFilter;
      const matchesSearch = !normalizedSearch || searchableText.includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [data?.items, searchQuery, statusFilter]);

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
      <PageHeader title="Dashboard Dosen Wali" subtitle={`Halo, ${user?.nama}`} />

      <DosenSummaryCards summary={data?.summary} />

      <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
        Mahasiswa
      </Typography>

      <MahasiswaBimbinganFilters
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        onSearchChange={setSearchQuery}
        onStatusFilterChange={setStatusFilter}
      />

      <MahasiswaBimbinganList items={filteredItems} />
    </PageContainer>
  );
}

export default DosenDashboardPage;
