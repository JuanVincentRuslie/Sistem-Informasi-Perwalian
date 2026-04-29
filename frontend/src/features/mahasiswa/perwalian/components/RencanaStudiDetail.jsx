import SendIcon from '@mui/icons-material/Send';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import RencanaStudiItems from './RencanaStudiItems.jsx';
import StatusChip from './StatusChip.jsx';
import { getStatusConfig } from './statusConfig.js';

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function formatDateTime(value) {
  if (!value) return '-';
  return DATE_TIME_FORMATTER.format(new Date(value));
}

function RencanaStudiDetail({
  rencanaStudi,
  editable,
  mutation,
  onRemoveItem,
  onSubmit,
}) {
  const statusConfig = getStatusConfig(rencanaStudi.status);
  const isSubmitting = mutation.type === 'submit';

  return (
    <Stack spacing={2}>
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
        }}
      >
        <Stack spacing={2}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}
          >
            <Box>
              <Typography variant="h6" component="h2">
                {rencanaStudi.periode.nama}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total {rencanaStudi.total_sks} SKS
              </Typography>
            </Box>
            <StatusChip status={rencanaStudi.status} />
          </Stack>

          <Divider />

          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            sx={{ justifyContent: 'space-between' }}
          >
            <Box>
              <Typography variant="caption" color="text.secondary">
                Dikirim
              </Typography>
              <Typography variant="body2">
                {formatDateTime(rencanaStudi.submitted_at)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Direview
              </Typography>
              <Typography variant="body2">
                {formatDateTime(rencanaStudi.reviewed_at)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Status
              </Typography>
              <Typography variant="body2">
                {statusConfig.label}
              </Typography>
            </Box>
          </Stack>

          {rencanaStudi.catatan_dosen && (
            <Alert severity={rencanaStudi.status === 'REJECTED' ? 'warning' : 'info'}>
              {rencanaStudi.catatan_dosen}
            </Alert>
          )}

          {!editable && (
            <Alert severity={rencanaStudi.status === 'APPROVED' ? 'success' : 'info'}>
              {statusConfig.helper}
            </Alert>
          )}

          {editable && (
            <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<SendIcon fontSize="small" />}
                disabled={rencanaStudi.items.length === 0 || isSubmitting}
                onClick={onSubmit}
              >
                {isSubmitting ? 'Mengirim...' : 'Kirim ke Dosen Wali'}
              </Button>
            </Stack>
          )}
        </Stack>
      </Paper>

      <RencanaStudiItems
        items={rencanaStudi.items}
        editable={editable}
        removingItemId={mutation.type === 'remove' ? mutation.targetId : null}
        onRemoveItem={onRemoveItem}
      />
    </Stack>
  );
}

export default RencanaStudiDetail;
