import { useMemo } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getKaprodiDosenWaliDetail } from '../../../api/kaprodiManagement.js';
import useFetch from '../../../hooks/useFetch.js';
import PageContainer from '../../../shared/components/PageContainer.jsx';
import PageHeader from '../../../shared/components/PageHeader.jsx';
import DosenSummaryCards from '../../dosen-wali/dashboard/components/DosenSummaryCards.jsx';
import MahasiswaBimbinganFilters from '../../dosen-wali/dashboard/components/MahasiswaBimbinganFilters.jsx';
import MahasiswaBimbinganList from '../../dosen-wali/dashboard/components/MahasiswaBimbinganList.jsx';
import {
  getDosenStatusCategory,
  normalizeDosenStatusFilter,
} from '../../dosen-wali/dashboard/components/statusConfig.js';

function DosenWaliDetailPage() {
  const { dosenWaliId } = useParams();
  const navigate = useNavigate();
  // useSearchParams: query URL dipakai sebagai state filter supaya tampilan
  // dosen terpilih bisa dibookmark dalam kondisi search/filter yang sama.
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') ?? '';
  const statusFilter = normalizeDosenStatusFilter(searchParams.get('status'));
  // useFetch: kaprodi ambil ringkasan dosen terpilih dari service sendiri,
  // terpisah dari dashboard dosen wali asli.
  const { data, loading, error } = useFetch(
    () => getKaprodiDosenWaliDetail(dosenWaliId),
    [dosenWaliId],
  );

  function handleSearchChange(nextQuery) {
    const nextParams = new URLSearchParams(searchParams);

    if (nextQuery.trim()) nextParams.set('q', nextQuery);
    else nextParams.delete('q');

    setSearchParams(nextParams, { replace: true });
  }

  function handleStatusFilterChange(nextStatus) {
    const nextParams = new URLSearchParams(searchParams);
    const normalizedStatus = normalizeDosenStatusFilter(nextStatus);

    if (normalizedStatus === 'all') nextParams.delete('status');
    else nextParams.set('status', normalizedStatus);

    setSearchParams(nextParams, { replace: true });
  }

  const filteredItems = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    const items = data?.items ?? [];

    return items.filter((item) => {
      const searchableText = `${item.mahasiswa.nama} ${item.mahasiswa.nim}`.toLowerCase();
      const category = getDosenStatusCategory(item.status);
      const matchesSearch = !normalizedSearch || searchableText.includes(normalizedSearch);
      const matchesStatus = statusFilter === 'all' || category === statusFilter;

      return matchesSearch && matchesStatus;
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

  const dosenWali = data?.dosen_wali;

  return (
    <PageContainer>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/dashboard/dosen-wali')} sx={{ mb: 2 }}>
        Kembali
      </Button>

      <PageHeader
        title={dosenWali.nama}
        subtitle={`${dosenWali.nip} | ${dosenWali.email}`}
        actions={(
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/dashboard/dosen-wali/${dosenWali.id}/assign`)}
          >
            Edit Penugasan
          </Button>
        )}
      />

      <DosenSummaryCards summary={data?.summary} />

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Stack spacing={1}>
          <Typography variant="h6" component="h2">
            Mahasiswa di bawah dosen wali ini
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tampilan ini mengikuti pola dashboard dosen wali, tetapi kaprodi hanya melihat dan menavigasi ke detail mahasiswa.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Periode aktif: {data?.periode_aktif?.nama ?? 'Belum ada periode aktif'}
          </Typography>
        </Stack>
      </Paper>

      <MahasiswaBimbinganFilters
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        onSearchChange={handleSearchChange}
        onStatusFilterChange={handleStatusFilterChange}
      />

      <MahasiswaBimbinganList
        items={filteredItems}
        getNavigationTarget={(item) => ({
          pathname: `/dashboard/mahasiswa/${item.mahasiswa.id}`,
          options: {
            state: { backTo: `/dashboard/dosen-wali/${dosenWali.id}` },
          },
        })}
      />
    </PageContainer>
  );
}

export default DosenWaliDetailPage;
