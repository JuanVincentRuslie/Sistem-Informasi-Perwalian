import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

/**
 * Card lebar penuh yang menampilkan IPK mahasiswa.
 *
 * @param {number} ipk
 */
function IpkCard({ ipk }) {
  return (
    <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', mt: 2 }}>
      <Typography variant="h5" fontWeight="bold">
        IPK : {ipk.toFixed(2)}
      </Typography>
    </Paper>
  );
}

export default IpkCard;
