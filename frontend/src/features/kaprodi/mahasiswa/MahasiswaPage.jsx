import { useMemo, useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { useNavigate } from 'react-router-dom';
import { getKaprodiMahasiswaList } from '../../../api/kaprodiManagement.js';
import useFetch from '../../../hooks/useFetch.js';
import PageContainer from '../../../shared/components/PageContainer.jsx';
import PageErrorState from '../../../shared/components/PageErrorState.jsx';
import PageHeader from '../../../shared/components/PageHeader.jsx';
import KaprodiMahasiswaSummaryCards from './components/KaprodiMahasiswaSummaryCards.jsx';
import KaprodiMahasiswaTable from './components/KaprodiMahasiswaTable.jsx';

function MahasiswaPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [assignmentFilter, setAssignmentFilter] = useState('all');
  // useFetch: halaman mahasiswa membaca sumber kaprodi yang sama
  // dengan halaman dosen wali agar status assign tetap konsisten.
  const { data, loading, error, refetch } = useFetch(getKaprodiMahasiswaList, []);

  // useMemo: pencarian + filter assignment dihitung lokal supaya tabel terasa
  // responsif tanpa perlu request baru tiap kali user mengetik.
  const filteredItems = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    const items = data?.items ?? [];

    return items.filter((item) => {
      const searchableText = `${item.nama} ${item.nim}`.toLowerCase();
      const matchesSearch = !normalizedSearch || searchableText.includes(normalizedSearch);
      const hasDosenWali = Boolean(item.dosen_wali);
      const matchesFilter = assignmentFilter === 'all'
        || (assignmentFilter === 'assigned' && hasDosenWali)
        || (assignmentFilter === 'unassigned' && !hasDosenWali);

      return matchesSearch && matchesFilter;
    });
  }, [assignmentFilter, data?.items, searchQuery]);

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
        title="Mahasiswa Wali"
        subtitle="Lihat seluruh mahasiswa terdaftar dan status dosen walinya"
      />

      <KaprodiMahasiswaSummaryCards summary={data?.summary} />

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          gap: 2,
          mb: 2,
        }}
      >
        <TextField
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          size="small"
          placeholder="Cari nama atau NPM"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ width: { xs: '100%', md: 320 } }}
        />

        <ToggleButtonGroup
          exclusive
          size="small"
          value={assignmentFilter}
          onChange={(_event, nextValue) => {
            if (nextValue) setAssignmentFilter(nextValue);
          }}
        >
          <ToggleButton value="all">Semua</ToggleButton>
          <ToggleButton value="assigned">Sudah Ada Dosen</ToggleButton>
          <ToggleButton value="unassigned">Belum Ada Dosen</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <KaprodiMahasiswaTable
        items={filteredItems}
        onSelect={(item) => navigate(`/dashboard/mahasiswa/${item.id}`, {
          state: { backTo: '/dashboard/mahasiswa' },
        })}
      />
    </PageContainer>
  );
}

export default MahasiswaPage;
