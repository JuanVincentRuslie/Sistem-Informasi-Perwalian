import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

/**
 * Card kecil yang menampilkan total SKS yang diambil di FRS ini.
 * @param {number} totalSks
 */
function TotalSksCard({ totalSks }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box sx={{ width: 36, height: 36, bgcolor: 'grey.300', borderRadius: 1, flexShrink: 0 }} />
      <Box>
        <Typography variant="caption" color="text.secondary">Total SKS FRS</Typography>
        <Typography variant="h5" fontWeight="bold">{totalSks}</Typography>
      </Box>
    </Paper>
  );
}

export default TotalSksCard;
