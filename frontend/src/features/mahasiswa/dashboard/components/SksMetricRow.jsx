import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

/**
 * Satu card metrik: ikon placeholder + label + angka besar.
 * Dipakai 3x di dalam SksMetricRow.
 */
function MetricCard({ label, value }) {
  return (
    <Paper
      variant="outlined"
      sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}
    >
      {/* Placeholder ikon — nanti bisa ganti dengan ikon MUI */}
      <Box sx={{ width: 36, height: 36, bgcolor: 'grey.300', borderRadius: 1, flexShrink: 0 }} />
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
      <MetricCard label="Total SKS Lulus" value={totalLulus} />
      <MetricCard label="Total SKS Wajib" value={totalWajib} />
      <MetricCard label="Total SKS Pilihan" value={totalPilihan} />
    </Box>
  );
}

export default SksMetricRow;
