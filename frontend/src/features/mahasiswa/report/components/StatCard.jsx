import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

/**
 * Card untuk display 1 metrik akademik (label + value, centered bold).
 * @param {string} label - Nama metrik, e.g. "IPK"
 * @param {string|number} value - Nilai yang ditampilkan, e.g. "3.42"
 */
function StatCard({ label, value }) {
  return (
    <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
      <Typography variant="h5" fontWeight="bold">
        {label} : {value}
      </Typography>
    </Paper>
  );
}

export default StatCard;
