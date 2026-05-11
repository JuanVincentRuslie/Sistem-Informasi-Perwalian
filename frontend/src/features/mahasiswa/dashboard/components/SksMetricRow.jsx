import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SchoolIcon from '@mui/icons-material/School';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

/**
 * Satu card metrik: ikon akademik + label + angka besar.
 * Dipakai 3x di dalam SksMetricRow.
 */
function MetricCard({ label, value, Icon, color = 'primary' }) {
  return (
    <Paper
      variant="outlined"
      sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}
    >
      <Box
        sx={(theme) => {
          const accentColor = theme.palette[color]?.main ?? theme.palette.primary.main;

          return {
            width: 44,
            height: 44,
            borderRadius: 1,
            flexShrink: 0,
            display: 'grid',
            placeItems: 'center',
            color: accentColor,
            bgcolor: alpha(accentColor, 0.12),
          };
        }}
      >
        <Icon fontSize="small" />
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h5" fontWeight="bold">
          {value}
        </Typography>
      </Box>
    </Paper>
  );
}

/**
 * Row 3 kartu metrik SKS sejajar.
 *
 * @param {number} totalLulus
 * @param {number} totalWajib
 * @param {number} totalPilihan
 */
function SksMetricRow({ totalLulus, totalWajib, totalPilihan }) {
  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <MetricCard label="Total SKS Lulus" value={totalLulus} Icon={SchoolIcon} color="success" />
      <MetricCard label="Total SKS Wajib" value={totalWajib} Icon={MenuBookIcon} color="primary" />
      <MetricCard label="Total SKS Pilihan" value={totalPilihan} Icon={AutoStoriesIcon} color="warning" />
    </Box>
  );
}

export default SksMetricRow;
