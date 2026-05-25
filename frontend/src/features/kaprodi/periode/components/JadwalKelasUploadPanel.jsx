import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { confirmUploadJadwalKelas, previewUploadJadwalKelas } from '../../../../api/periode.js';
import { formatTanggal } from '../../../../utils/formatDate.js';
import JadwalKelasPreviewTable from './JadwalKelasPreviewTable.jsx';

function SummaryItem({ label, value }) {
  return (
    <Box
      sx={{
        p: 1.5,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        minHeight: 72,
      }}
    >
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="h6" component="p" fontWeight={700}>
        {value}
      </Typography>
    </Box>
  );
}

function isExcelFile(file) {
  return /\.(xlsx|xls)$/i.test(file?.name ?? '');
}

function JadwalKelasUploadPanel({ periods, activePeriode, onUploaded }) {
  const [selectedPeriodeId, setSelectedPeriodeId] = useState(activePeriode?.id ?? '');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [loadingAction, setLoadingAction] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [replaceDialogOpen, setReplaceDialogOpen] = useState(false);
  const [inputKey, setInputKey] = useState(0);

  // useEffect: saat periode aktif berganti dari luar, selector upload ikut
  // diarahkan ke periode aktif terbaru supaya flow kaprodi lebih hemat klik.
  useEffect(() => {
    if (!selectedPeriodeId && activePeriode?.id) {
      setSelectedPeriodeId(activePeriode.id);
    }
  }, [activePeriode?.id, selectedPeriodeId]);

  const selectedPeriode = periods.find((periode) => periode.id === Number(selectedPeriodeId)) ?? null;
  const currentUpload = selectedPeriode?.upload_jadwal ?? null;
  const previewRows = previewData?.preview ?? [];
  const canConfirm = Boolean(previewData) && previewData.summary.invalid_kelas === 0 && loadingAction === null;

  // Hitung warning ujian dari backend supaya kaprodi sadar baris ujian yang dilewati.
  const ujianWarnings = (previewData?.warnings ?? []).filter(
    (w) => w.type === 'missing_jadwal_kelas' || w.type === 'duplicate_ujian',
  );
  const missingJadwalKelasCount = ujianWarnings.filter((w) => w.type === 'missing_jadwal_kelas').length;
  const duplicateUjianCount = ujianWarnings.filter((w) => w.type === 'duplicate_ujian').length;
  const totalUjianSkipped = ujianWarnings.length;

  function handleFileChange(event) {
    const file = event.target.files?.[0] ?? null;

    setErrorMessage('');
    setSuccessMessage('');
    setPreviewData(null);
    setSelectedFile(file);

    if (file && !isExcelFile(file)) {
      setErrorMessage('File jadwal kelas harus berupa Excel (.xlsx atau .xls).');
      setSelectedFile(null);
      setInputKey((currentKey) => currentKey + 1);
    }
  }

  async function handlePreview() {
    if (!selectedPeriodeId || !selectedFile) {
      setErrorMessage('Pilih periode target dan file Excel sebelum membuat preview.');
      return;
    }

    setLoadingAction('preview');
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await previewUploadJadwalKelas({
        periode_id: Number(selectedPeriodeId),
        file: selectedFile,
      });

      setPreviewData(response.data);
    } catch (err) {
      setPreviewData(null);
      setErrorMessage(err instanceof Error ? err.message : 'Preview jadwal kelas gagal dibuat.');
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleConfirmReplace() {
    if (!previewData) return;

    setLoadingAction('confirm');
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await confirmUploadJadwalKelas({
        upload_token: previewData.upload_token,
        mode: 'replace',
      });

      setReplaceDialogOpen(false);
      setSuccessMessage(response.message);
      setPreviewData(null);
      setSelectedFile(null);
      setInputKey((currentKey) => currentKey + 1);

      if (typeof onUploaded === 'function') {
        onUploaded();
      }
    } catch (err) {
      setReplaceDialogOpen(false);
      setErrorMessage(err instanceof Error ? err.message : 'Konfirmasi upload gagal.');
    } finally {
      setLoadingAction(null);
    }
  }

  function handleReset() {
    setSelectedFile(null);
    setPreviewData(null);
    setErrorMessage('');
    setSuccessMessage('');
    setLoadingAction(null);
    setReplaceDialogOpen(false);
    setInputKey((currentKey) => currentKey + 1);
  }

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Stack spacing={2.5}>
        <Box>
          <Typography variant="h6" component="h2" sx={{ mb: 0.5 }}>
            Upload Jadwal Kelas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Upload Excel jadwal kelas per periode, lalu cek preview sebelum data menggantikan jadwal sebelumnya.
          </Typography>
        </Box>

        {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
        {successMessage ? <Alert severity="success">{successMessage}</Alert> : null}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.2fr 1fr auto auto' },
            gap: 1.5,
            alignItems: 'start',
          }}
        >
          <TextField
            select
            label="Periode target"
            value={selectedPeriodeId}
            onChange={(event) => {
              setSelectedPeriodeId(event.target.value);
              setPreviewData(null);
              setErrorMessage('');
              setSuccessMessage('');
            }}
          >
            {periods.map((periode) => (
              <MenuItem key={periode.id} value={periode.id}>
                {periode.nama}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            type="file"
            key={inputKey}
            label="File Excel"
            slotProps={{
              inputLabel: { shrink: true },
              htmlInput: { accept: '.xlsx,.xls' },
            }}
            onChange={handleFileChange}
          />

          <Button variant="contained" onClick={handlePreview} disabled={loadingAction !== null}>
            {loadingAction === 'preview' ? 'Memproses...' : 'Buat Preview'}
          </Button>

          <Button variant="text" onClick={handleReset} disabled={loadingAction !== null}>
            Reset
          </Button>
        </Box>

        {selectedFile ? (
          <Typography variant="body2" color="text.secondary">
            File dipilih: <strong>{selectedFile.name}</strong>
          </Typography>
        ) : null}

        {selectedPeriode ? (
          <Alert severity="info">
            Periode target: {selectedPeriode.nama} ({formatTanggal(selectedPeriode.tanggal_mulai)} - {formatTanggal(selectedPeriode.tanggal_selesai)})
          </Alert>
        ) : null}

        {currentUpload ? (
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Periode ini sudah punya jadwal kelas
            </Typography>
            <Typography variant="body1" fontWeight={700}>
              {currentUpload.total_kelas} kelas tersimpan
            </Typography>
          </Paper>
        ) : null}

        {!previewData ? (
          <Box sx={{ py: 5, border: '1px dashed', borderColor: 'divider', borderRadius: 1, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Belum ada preview jadwal kelas.
            </Typography>
          </Box>
        ) : (
          <>
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <SummaryItem label="Total Baris" value={previewData.summary.total_rows} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <SummaryItem label="Total Kelas" value={previewData.summary.total_kelas} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <SummaryItem label="Valid" value={previewData.summary.valid_kelas} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <SummaryItem label="Tidak Valid" value={previewData.summary.invalid_kelas} />
              </Grid>
            </Grid>

            {previewData.summary.invalid_kelas > 0 ? (
              <Alert severity="warning">
                Preview masih memiliki baris tidak valid. Perbaiki file sumber lalu upload ulang.
              </Alert>
            ) : null}

            {totalUjianSkipped > 0 ? (
              <Alert severity="warning">
                <Typography variant="body2" component="div" sx={{ mb: 0.5 }}>
                  Ada {totalUjianSkipped} baris ujian tidak dibaca: {missingJadwalKelasCount} kode matkul tidak ada di dalam Jadwal Kelas, {duplicateUjianCount} duplikat pada jadwal ujian.
                </Typography>
                <Box component="ul" sx={{ m: 0, pl: 2.5, fontSize: '0.85rem' }}>
                  {ujianWarnings.map((w, i) => (
                    <li key={`${w.sheet}-${w.row}-${i}`}>
                      <strong>{w.sheet} baris {w.row}</strong>
                      {w.kode_matkul ? ` (${w.kode_matkul})` : ''} — {w.message}
                    </li>
                  ))}
                </Box>
              </Alert>
            ) : null}

            <JadwalKelasPreviewTable rows={previewRows} />

            <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
              <Button variant="text" onClick={handleReset} disabled={loadingAction !== null}>
                Batal
              </Button>
              <Button
                variant="contained"
                disabled={!canConfirm}
                onClick={() => setReplaceDialogOpen(true)}
              >
                Simpan Replace
              </Button>
            </Stack>
          </>
        )}
      </Stack>

      <Dialog open={replaceDialogOpen} onClose={loadingAction === 'confirm' ? undefined : () => setReplaceDialogOpen(false)}>
        <DialogTitle>Konfirmasi Replace Jadwal Kelas</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Jadwal kelas untuk periode {selectedPeriode?.nama ?? '-'} akan diganti dengan hasil preview ini.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setReplaceDialogOpen(false)} disabled={loadingAction === 'confirm'}>
            Batal
          </Button>
          <Button variant="contained" onClick={handleConfirmReplace} disabled={loadingAction === 'confirm'}>
            {loadingAction === 'confirm' ? 'Menyimpan...' : 'Ya, Replace'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default JadwalKelasUploadPanel;
