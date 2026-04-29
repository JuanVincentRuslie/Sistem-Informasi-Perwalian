import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

const STATUS_LABEL = {
  DRAFT: 'Draft',
  SUBMITTED: 'Menunggu Persetujuan',
  APPROVED: 'Disetujui',
  REJECTED: 'Perlu Revisi',
};

/**
 * Bar status FRS di bagian bawah halaman Perwalian.
 * @param {'DRAFT'|'SUBMITTED'|'APPROVED'|'REJECTED'} status
 */
function FrsStatusBar({ status }) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography fontWeight="bold">STATUS :</Typography>
        <Typography>{STATUS_LABEL[status] ?? '-'}</Typography>
      </Box>
    </Paper>
  );
}

export default FrsStatusBar;
