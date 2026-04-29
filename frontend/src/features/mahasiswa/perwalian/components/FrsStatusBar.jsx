import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

const STATUS_LABEL = {
  DRAFT: 'Draft',
  SUBMITTED: 'Menunggu Persetujuan',
  APPROVED: 'Disetujui',
  REJECTED: 'Perlu Revisi',
};

const STATUS_COLOR_KEY = {
  DRAFT: 'neutral',
  SUBMITTED: 'neutral',
  APPROVED: 'approved',
  REJECTED: 'waiting',
};

/**
 * Bar status FRS di bagian bawah halaman Perwalian.
 * @param {'DRAFT'|'SUBMITTED'|'APPROVED'|'REJECTED'} status
 */
function FrsStatusBar({ status }) {
  const colorKey = STATUS_COLOR_KEY[status] ?? 'neutral';

  return (
    <Paper
      variant="outlined"
      sx={(theme) => {
        const statusColor = theme.palette.frsStatus[colorKey];
        const borderColor = colorKey === 'neutral' ? theme.palette.divider : statusColor.main;

        return {
          p: 2,
          bgcolor: statusColor.main,
          color: statusColor.contrastText,
          borderColor,
        };
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography fontWeight="bold">STATUS :</Typography>
        <Typography>{STATUS_LABEL[status] ?? '-'}</Typography>
      </Box>
    </Paper>
  );
}

export default FrsStatusBar;
