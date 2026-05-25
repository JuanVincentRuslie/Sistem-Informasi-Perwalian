import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import { formatTanggal } from '../../../../utils/formatDate.js';

const JENIS_LABEL = { UTS: 'UTS', UAS: 'UAS' };

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatSesi(kelas, sesi) {
  return `${kelas.nama_matkul} (Kelas ${kelas.nama_kelas}) — ${capitalize(sesi.hari)} ${sesi.jam_mulai}–${sesi.jam_selesai}`;
}

// Hitung jumlah shift per (matkul, jenis) supaya label "Shift N" cuma muncul
// kalau matkul itu emang punya >1 shift untuk jenis tersebut. Sebanyak ini
// jaga konsistensi dengan JadwalUjianSection di accordion.
function shiftCount(kelas, jenis) {
  return (kelas.jadwal_ujian ?? []).filter((u) => u.jenis === jenis).length;
}

function formatUjian(kelas, ujian) {
  const label = JENIS_LABEL[ujian.jenis] ?? ujian.jenis;
  const shiftSuffix = shiftCount(kelas, ujian.jenis) > 1 ? ` Shift ${ujian.shift}` : '';
  const tanggal = formatTanggal(ujian.tanggal);
  return `${kelas.nama_matkul} (Kelas ${kelas.nama_kelas}) — ${label}${shiftSuffix}, ${tanggal} ${ujian.jam_mulai}–${ujian.jam_selesai}`;
}

function BentrokSection({ title, items, renderLeft, renderRight }) {
  if (items.length === 0) return null;
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Box component="ul" sx={{ pl: 3, m: 0 }}>
        {items.map((item, idx) => (
          <Box component="li" key={idx} sx={{ mb: 1.5 }}>
            <Typography variant="body2">{renderLeft(item)}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ pl: 2 }}>
              ↔ {renderRight(item)}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

/**
 * Dialog warning ketika TambahMatkulPage mendeteksi bentrok jadwal saat checkout.
 * Mendukung 2 jenis bentrok: 'sesi' (kuliah) dan 'ujian' (UTS/UAS), di-render
 * dalam section terpisah supaya gampang dibaca user.
 *
 * @param {boolean} open
 * @param {Function} onClose
 * @param {Array<{ type, a, b, sesiA?, sesiB?, ujianA?, ujianB? }>} bentrok
 */
function JadwalBentrokDialog({ open, onClose, bentrok }) {
  const sesiBentrok = bentrok.filter((b) => b.type === 'sesi');
  const ujianBentrok = bentrok.filter((b) => b.type === 'ujian');

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Jadwal Bentrok</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Beberapa kelas yang dipilih bentrok jadwalnya:
        </Typography>

        <BentrokSection
          title="Bentrok Jadwal Kuliah"
          items={sesiBentrok}
          renderLeft={(item) => formatSesi(item.a, item.sesiA)}
          renderRight={(item) => formatSesi(item.b, item.sesiB)}
        />

        <BentrokSection
          title="Bentrok Jadwal Ujian"
          items={ujianBentrok}
          renderLeft={(item) => formatUjian(item.a, item.ujianA)}
          renderRight={(item) => formatUjian(item.b, item.ujianB)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">Kembali</Button>
      </DialogActions>
    </Dialog>
  );
}

export default JadwalBentrokDialog;
