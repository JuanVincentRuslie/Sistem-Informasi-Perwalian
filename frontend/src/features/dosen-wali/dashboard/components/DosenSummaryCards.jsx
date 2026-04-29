import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

const SUMMARY_ITEMS = [
  {
    key: 'approved',
    label: 'Sudah Disetujui',
    icon: CheckCircleIcon,
    statusColor: 'approved',
  },
  {
    key: 'waiting',
    label: 'Menunggu Persetujuan',
    icon: HourglassTopIcon,
    statusColor: 'waiting',
  },
  {
    key: 'empty',
    label: 'Belum Mengisi',
    icon: AssignmentLateIcon,
    statusColor: 'empty',
  },
];

function DosenSummaryCards({ summary }) {
  const values = {
    approved: summary?.approved ?? 0,
    waiting: (summary?.submitted ?? 0) + (summary?.rejected ?? 0),
    empty: summary?.draft_or_empty ?? 0,
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
        gap: 2,
        mb: 4,
      }}
    >
      {SUMMARY_ITEMS.map(({ key, label, icon: Icon, statusColor }) => (
        <Paper
          key={key}
          elevation={0}
          sx={{
            p: 2.5,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 1,
              bgcolor: (theme) => theme.palette.frsStatus[statusColor].main,
              color: (theme) => theme.palette.frsStatus[statusColor].contrastText,
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            <Icon />
          </Box>
          <Box>
            <Typography variant="body1" fontWeight={600}>
              {label}
            </Typography>
            <Typography variant="h5" component="p">
              {values[key]}
            </Typography>
          </Box>
        </Paper>
      ))}
    </Box>
  );
}

export default DosenSummaryCards;
