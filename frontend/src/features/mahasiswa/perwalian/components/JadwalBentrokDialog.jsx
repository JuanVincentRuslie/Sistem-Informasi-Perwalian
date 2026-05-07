import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatSesi(kelas, sesi) {
  return `${kelas.nama_matkul} (Kelas ${kelas.nama_kelas}) — ${capitalize(sesi.hari)} ${sesi.jam_mulai}–${sesi.jam_selesai}`;
}

/**
 * Dialog warning ketika TambahMatkulPage mendeteksi bentrok jadwal saat checkout.
 * @param {boolean} open
 * @param {Function} onClose - tutup dialog (tidak navigate keluar halaman)
 * @param {Array<{a, sesiA, b, sesiB}>} bentrok - list pasangan kelas+sesi yang bentrok
 */
function JadwalBentrokDialog({ open, onClose, bentrok }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Jadwal Bentrok</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Beberapa kelas yang dipilih bentrok jadwalnya:
        </Typography>
        <Box component="ul" sx={{ pl: 3, m: 0 }}>
          {bentrok.map((item, idx) => (
            <Box component="li" key={idx} sx={{ mb: 1.5 }}>
              <Typography variant="body2">{formatSesi(item.a, item.sesiA)}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ pl: 2 }}>
                ↔ {formatSesi(item.b, item.sesiB)}
              </Typography>
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">Kembali</Button>
      </DialogActions>
    </Dialog>
  );
}

export default JadwalBentrokDialog;
