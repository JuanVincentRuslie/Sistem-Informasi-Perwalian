import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { confirmUploadDps, uploadDps } from '../../../../api/riwayatNilai.js';
import DpsConfirmActions from './DpsConfirmActions.jsx';
import DpsFileControls from './DpsFileControls.jsx';
import DpsPreviewTable from './DpsPreviewTable.jsx';
import DpsSummaryGrid from './DpsSummaryGrid.jsx';

function isPdfFile(file) {
  return file?.type === 'application/pdf' || file?.name?.toLowerCase().endsWith('.pdf');
}

function DpsUploadPanel({ onConfirmed }) {
  // useState [selectedFile]: file disimpan di state supaya UI bisa langsung
  // menampilkan nama file dan enable tombol preview setelah user memilih PDF.
  const [selectedFile, setSelectedFile] = useState(null);

  // useState [previewData]: response preview parser disimpan terpisah dari file.
  // Alasannya, file bisa diganti/reset tanpa mencampur data yang akan dikonfirmasi.
  const [previewData, setPreviewData] = useState(null);

  // useState [loadingAction]: satu state string cukup untuk membedakan
  // proses async yang sedang jalan: upload preview atau confirm simpan.
  const [loadingAction, setLoadingAction] = useState(null);

  // useState [errorMessage/successMessage]: feedback async perlu masuk state
  // karena render berikutnya harus tetap ingat hasil request terakhir.
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // useState [inputKey]: mengubah key memaksa React membuat ulang input file.
  // Ini cara sederhana untuk mengosongkan value input file setelah reset.
  const [inputKey, setInputKey] = useState(0);

  const previewRows = previewData?.preview ?? [];
  const invalidRows = previewRows.filter((row) => !row.valid);
  const canConfirm = Boolean(previewData) && invalidRows.length === 0 && loadingAction === null && !successMessage;
  const resetDisabled = !selectedFile && !previewData && !errorMessage && !successMessage;

  function handleFileChange(event) {
    const file = event.target.files?.[0] ?? null;

    setErrorMessage('');
    setSuccessMessage('');
    setPreviewData(null);
    setSelectedFile(file);

    if (file && !isPdfFile(file)) {
      setErrorMessage('File DPS harus berupa PDF.');
      setSelectedFile(null);
      setInputKey((currentKey) => currentKey + 1);
    }
  }

  async function handleUploadPreview() {
    if (!selectedFile) return;

    setLoadingAction('upload');
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await uploadDps(selectedFile);

      if (!response.success) {
        throw new Error(response.message);
      }

      setPreviewData(response.data);
    } catch (err) {
      setPreviewData(null);
      setErrorMessage(err instanceof Error ? err.message : 'Preview DPS gagal dibuat.');
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleConfirm() {
    if (!previewData || invalidRows.length > 0) return;

    setLoadingAction('confirm');
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await confirmUploadDps({
        upload_token: previewData.upload_token,
        mode: 'replace',
        items: previewData.preview,
      });

      if (!response.success) {
        throw new Error(response.message);
      }

      setSuccessMessage(response.message);
      if (typeof onConfirmed === 'function') {
        onConfirmed(response.data);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Konfirmasi DPS gagal.');
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
    setInputKey((currentKey) => currentKey + 1);
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
      }}
    >
      <Stack spacing={2.5}>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Upload DPS
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Pilih PDF DPS untuk membuat preview nilai sebelum data disimpan.
          </Typography>
        </Box>

        {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
        {successMessage ? <Alert severity="success">{successMessage}</Alert> : null}

        <DpsFileControls
          selectedFile={selectedFile}
          loadingAction={loadingAction}
          inputKey={inputKey}
          resetDisabled={resetDisabled}
          onFileChange={handleFileChange}
          onUploadPreview={handleUploadPreview}
          onReset={handleReset}
        />

        {selectedFile && (
          <Typography variant="body2" color="text.secondary">
            File dipilih: <strong>{selectedFile.name}</strong>
          </Typography>
        )}

        {!previewData && (
          <Box
            sx={{
              py: 5,
              px: 2,
              border: '1px dashed',
              borderColor: 'divider',
              borderRadius: 1,
              textAlign: 'center',
              color: 'text.secondary',
            }}
          >
            <Typography variant="body2">
              Belum ada preview DPS.
            </Typography>
          </Box>
        )}

        {previewData && (
          <>
            <DpsSummaryGrid previewData={previewData} />

            {invalidRows.length > 0 && (
              <Alert severity="warning">
                Ada {invalidRows.length} baris belum valid. Konfirmasi dibuka setelah semua baris valid.
              </Alert>
            )}

            <DpsPreviewTable rows={previewRows} />
          </>
        )}

        <DpsConfirmActions
          loadingAction={loadingAction}
          canConfirm={canConfirm}
          resetDisabled={resetDisabled}
          onReset={handleReset}
          onConfirm={handleConfirm}
        />
      </Stack>
    </Paper>
  );
}

export default DpsUploadPanel;
