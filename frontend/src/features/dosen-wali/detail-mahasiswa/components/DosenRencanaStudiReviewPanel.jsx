import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';

const DECISION_APPROVED = 'APPROVED';
const DECISION_REJECTED = 'REJECTED';

function DosenRencanaStudiReviewPanel({ rencanaStudi, onReview }) {
  // useState: simpan keputusan dan catatan sebelum dosen menekan Simpan.
  // Dipisah dari data API supaya dosen bisa mengetik tanpa langsung mutasi mock.
  const [decision, setDecision] = useState('');
  const [catatan, setCatatan] = useState(rencanaStudi.catatan_dosen ?? '');
  const [saving, setSaving] = useState(false);

  // useEffect: ketika dosen pindah tab periode, form review harus mengikuti FRS aktif.
  // Ini mencegah catatan dari periode lama terbawa ke periode lain.
  useEffect(() => {
    setDecision('');
    setCatatan(rencanaStudi.catatan_dosen ?? '');
  }, [rencanaStudi.id, rencanaStudi.catatan_dosen]);

  const isReviewable = rencanaStudi.status === 'SUBMITTED';
  const revisiButuhCatatan = decision === DECISION_REJECTED && !catatan.trim();
  const saveDisabled = !isReviewable || !decision || revisiButuhCatatan || saving;

  async function handleSave() {
    if (saveDisabled) return;

    setSaving(true);
    try {
      await onReview(decision, catatan);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Paper variant="outlined" sx={{ p: 2.5 }}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="h6" component="h3">
            Keputusan Dosen Wali
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Catatan opsional untuk setuju, wajib untuk revisi.
          </Typography>
        </Box>

        {!isReviewable && (
          <Alert severity="info">
            FRS ini berstatus {rencanaStudi.status}; keputusan hanya aktif untuk status menunggu persetujuan.
          </Alert>
        )}

        <TextField
          label="Catatan"
          value={catatan}
          onChange={(event) => setCatatan(event.target.value)}
          multiline
          minRows={3}
          disabled={!isReviewable}
          error={revisiButuhCatatan}
          helperText={revisiButuhCatatan ? 'Catatan revisi wajib diisi.' : ' '}
        />

        <ToggleButtonGroup
          exclusive
          fullWidth
          value={decision}
          onChange={(_event, nextDecision) => {
            if (nextDecision) setDecision(nextDecision);
          }}
          disabled={!isReviewable}
          aria-label="Keputusan rencana studi"
        >
          <ToggleButton
            value={DECISION_APPROVED}
            sx={(theme) => ({
              '&.Mui-selected': {
                bgcolor: theme.palette.frsStatus.approved.main,
                color: theme.palette.frsStatus.approved.contrastText,
              },
              '&.Mui-selected:hover': {
                bgcolor: theme.palette.frsStatus.approved.main,
              },
            })}
          >
            Setuju
          </ToggleButton>
          <ToggleButton
            value={DECISION_REJECTED}
            sx={(theme) => ({
              '&.Mui-selected': {
                bgcolor: theme.palette.frsStatus.waiting.main,
                color: theme.palette.frsStatus.waiting.contrastText,
              },
              '&.Mui-selected:hover': {
                bgcolor: theme.palette.frsStatus.waiting.main,
              },
            })}
          >
            Revisi
          </ToggleButton>
        </ToggleButtonGroup>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" onClick={handleSave} disabled={saveDisabled}>
            {saving ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
}

export default DosenRencanaStudiReviewPanel;
