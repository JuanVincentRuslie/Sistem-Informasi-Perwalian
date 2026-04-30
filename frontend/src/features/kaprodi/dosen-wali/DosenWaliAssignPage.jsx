import { useEffect, useMemo, useState } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getKaprodiDosenWaliAssignment,
  saveKaprodiDosenWaliAssignment,
} from '../../../api/kaprodiManagement.js';
import useFetch from '../../../hooks/useFetch.js';
import PageContainer from '../../../shared/components/PageContainer.jsx';
import PageHeader from '../../../shared/components/PageHeader.jsx';
import KaprodiAssignmentPanel from './components/KaprodiAssignmentPanel.jsx';

function DosenWaliAssignPage() {
  const { dosenWaliId } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [assignedIds, setAssignedIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const {
    data,
    loading,
    error,
    refetch,
  } = useFetch(() => getKaprodiDosenWaliAssignment(dosenWaliId), [dosenWaliId]);

  // useEffect: setiap data assignment dari server/mock berubah, state lokal
  // editor disamakan lagi supaya klik-save selalu mulai dari snapshot terbaru.
  useEffect(() => {
    if (!data) return;

    setAssignedIds(data.assigned_items.map((item) => item.id));
    setSearchQuery('');
    setSubmitError('');
  }, [data]);

  const allItems = useMemo(() => (
    [...(data?.assigned_items ?? []), ...(data?.available_items ?? [])]
  ), [data?.assigned_items, data?.available_items]);

  // useMemo: Map memudahkan translasi id -> object mahasiswa saat user
  // menambah/melepas item tanpa harus scan array penuh berkali-kali.
  const itemMap = useMemo(() => {
    const map = new Map();
    allItems.forEach((item) => {
      map.set(item.id, item);
    });
    return map;
  }, [allItems]);

  const assignedItems = useMemo(() => (
    assignedIds
      .map((itemId) => itemMap.get(itemId))
      .filter(Boolean)
      .sort((left, right) => left.nama.localeCompare(right.nama, 'id'))
  ), [assignedIds, itemMap]);

  // useMemo: daftar kanan adalah hasil state sementara editor saat ini,
  // jadi mahasiswa yang baru di-unassign langsung muncul kembali tanpa refetch.
  const availableItems = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return allItems
      .filter((item) => !assignedIds.includes(item.id))
      .filter((item) => {
        const searchableText = `${item.nama} ${item.nim}`.toLowerCase();
        return !normalizedSearch || searchableText.includes(normalizedSearch);
      })
      .sort((left, right) => left.nama.localeCompare(right.nama, 'id'));
  }, [allItems, assignedIds, searchQuery]);

  function handleAssign(mahasiswa) {
    setSubmitError('');
    setSubmitSuccess('');
    setAssignedIds((currentIds) => (
      currentIds.includes(mahasiswa.id) ? currentIds : [...currentIds, mahasiswa.id]
    ));
  }

  function handleUnassign(mahasiswa) {
    setSubmitError('');
    setSubmitSuccess('');
    setAssignedIds((currentIds) => currentIds.filter((itemId) => itemId !== mahasiswa.id));
  }

  async function handleSave() {
    setSaving(true);
    setSubmitError('');
    setSubmitSuccess('');

    try {
      const response = await saveKaprodiDosenWaliAssignment(dosenWaliId, {
        mahasiswa_ids: assignedIds,
      });
      setSubmitSuccess(response.message);
      refetch();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Penugasan gagal disimpan.');
    } finally {
      setSaving(false);
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

  const dosenWali = data?.dosen_wali;

  return (
    <PageContainer>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(`/dashboard/dosen-wali/${dosenWaliId}`)}
        sx={{ mb: 2 }}
      >
        Kembali
      </Button>

      <PageHeader
        title="Assign Dosen Wali"
        subtitle={`Atur mahasiswa untuk ${dosenWali.nama}`}
      />

      <Stack spacing={2} sx={{ mb: 3 }}>
        {submitError ? <Alert severity="error">{submitError}</Alert> : null}
        {submitSuccess ? <Alert severity="success">{submitSuccess}</Alert> : null}
      </Stack>

      <KaprodiAssignmentPanel
        dosenWali={dosenWali}
        assignedItems={assignedItems}
        availableItems={availableItems}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAssign={handleAssign}
        onUnassign={handleUnassign}
      />

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </Box>
    </PageContainer>
  );
}

export default DosenWaliAssignPage;
