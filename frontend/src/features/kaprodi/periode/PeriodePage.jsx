import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import PageContainer from '../../../shared/components/PageContainer.jsx';
import PageErrorState from '../../../shared/components/PageErrorState.jsx';
import PageHeader from '../../../shared/components/PageHeader.jsx';
import {
  activatePeriode,
  createPeriode,
  deletePeriode,
  getPeriodeManagement,
  updatePeriode,
} from '../../../api/periode.js';
import useFetch from '../../../hooks/useFetch.js';
import JadwalKelasUploadPanel from './components/JadwalKelasUploadPanel.jsx';
import PeriodeCreateDialog from './components/PeriodeCreateDialog.jsx';
import PeriodeManagementPanel from './components/PeriodeManagementPanel.jsx';

function PeriodePage() {
  const [activeTab, setActiveTab] = useState('periode');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  // Periode yang sedang di-edit (null = tidak edit). Pakai 1 dialog yang sama
  // (PeriodeCreateDialog) dengan prop initialPeriode untuk membedakan mode.
  const [editingPeriode, setEditingPeriode] = useState(null);
  const [savingPeriode, setSavingPeriode] = useState(false);
  const [activatingId, setActivatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [pageSuccessMessage, setPageSuccessMessage] = useState('');
  const { data, loading, error, refetch } = useFetch(() => getPeriodeManagement(), []);

  // useEffect: pesan sukses mutation hanya feedback sementara.
  // Auto-dismiss mencegah alert lama menumpuk setelah kaprodi lanjut bekerja.
  useEffect(() => {
    if (!pageSuccessMessage) return undefined;

    const timeoutId = window.setTimeout(() => {
      setPageSuccessMessage('');
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [pageSuccessMessage]);

  async function handleCreatePeriode(payload) {
    try {
      setSavingPeriode(true);
      setSubmitError('');
      const response = await createPeriode(payload);

      setPageSuccessMessage(response.message);
      setCreateDialogOpen(false);
      refetch();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Periode baru gagal dibuat.');
    } finally {
      setSavingPeriode(false);
    }
  }

  async function handleUpdatePeriode(payload) {
    if (!editingPeriode) return;
    try {
      setSavingPeriode(true);
      setSubmitError('');
      const response = await updatePeriode(editingPeriode.id, payload);

      setPageSuccessMessage(response.message ?? 'Periode berhasil diupdate.');
      setEditingPeriode(null);
      refetch();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Periode gagal diupdate.');
    } finally {
      setSavingPeriode(false);
    }
  }

  async function handleActivatePeriode(periodeId) {
    try {
      setActivatingId(periodeId);
      setSubmitError('');
      const response = await activatePeriode(periodeId);

      setPageSuccessMessage(response.message);
      refetch();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Aktivasi periode gagal.');
    } finally {
      setActivatingId(null);
    }
  }

  async function handleDeletePeriode(periodeId) {
    const confirmed = window.confirm('Periode ini akan dihapus dari histori. Lanjutkan?');
    if (!confirmed) return;

    try {
      setDeletingId(periodeId);
      setSubmitError('');
      const response = await deletePeriode(periodeId);

      setPageSuccessMessage(response.message);
      refetch();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Periode gagal dihapus.');
    } finally {
      setDeletingId(null);
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
        <PageErrorState message={error.message} onRetry={refetch} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Manajemen Periode Perwalian"
        subtitle="Kelola periode perwalian aktif dan upload jadwal kelas per periode"
      />

      <Tabs
        value={activeTab}
        onChange={(_, value) => {
          setActiveTab(value);
          setSubmitError('');
        }}
        sx={{ mb: 3 }}
      >
        <Tab value="periode" label="Periode Perwalian" />
        <Tab value="upload-jadwal" label="Upload Jadwal Kelas" />
      </Tabs>

      {error && data ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error.message}
        </Alert>
      ) : null}

      {activeTab === 'periode' ? (
        <PeriodeManagementPanel
          data={data}
          activatingId={activatingId}
          deletingId={deletingId}
          successMessage={pageSuccessMessage}
          errorMessage={submitError}
          onAdd={() => {
            setSubmitError('');
            setCreateDialogOpen(true);
          }}
          onActivate={handleActivatePeriode}
          onDelete={handleDeletePeriode}
          onEdit={(periode) => {
            setSubmitError('');
            setEditingPeriode(periode);
          }}
        />
      ) : (
        <JadwalKelasUploadPanel
          periods={data?.histori ?? []}
          activePeriode={data?.periode_aktif ?? null}
          onUploaded={() => {
            setPageSuccessMessage('Upload jadwal kelas selesai dan histori periode telah diperbarui.');
            refetch();
          }}
        />
      )}

      <PeriodeCreateDialog
        open={createDialogOpen}
        saving={savingPeriode}
        submitError={submitError}
        onClose={() => {
          if (savingPeriode) return;
          setSubmitError('');
          setCreateDialogOpen(false);
        }}
        onSubmit={handleCreatePeriode}
      />

      <PeriodeCreateDialog
        open={Boolean(editingPeriode)}
        saving={savingPeriode}
        submitError={submitError}
        initialPeriode={editingPeriode}
        onClose={() => {
          if (savingPeriode) return;
          setSubmitError('');
          setEditingPeriode(null);
        }}
        onSubmit={handleUpdatePeriode}
      />
    </PageContainer>
  );
}

export default PeriodePage;
