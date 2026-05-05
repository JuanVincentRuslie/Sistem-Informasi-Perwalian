import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

/**
 * Card lebar penuh yang menampilkan IPK mahasiswa.
 *
 * @param {number | null} ipk - null kalau mahasiswa belum upload DPS
 */
function IpkCard({ ipk }) {
  return (
    <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', mt: 2 }}>
      <Typography variant="h5" fontWeight="bold">
        IPK : {ipk == null ? '-' : ipk.toFixed(2)}
      </Typography>
    </Paper>
  );
}

export default IpkCard;
