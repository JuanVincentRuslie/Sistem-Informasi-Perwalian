import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

/**
 * Strip abu-abu full-width yang menampilkan total SKS lulus.
 * @param {number} totalSksLulus
 */
function StudiSummaryBar({ totalSksLulus }) {
  return (
    <Box sx={{ bgcolor: 'grey.200', px: 3, py: 1.5, textAlign: 'center' }}>
      <Typography variant="body1" fontWeight="bold">
        TOTAL SKS LULUS : {totalSksLulus} SKS
      </Typography>
    </Box>
  );
}

export default StudiSummaryBar;
