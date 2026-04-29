import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import AddIcon from '@mui/icons-material/Add';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CommentIcon from '@mui/icons-material/Comment';

/**
 * Panel 3 tombol aksi FRS: Catatan dosen, Tambah matkul, Lihat jadwal.
 * @param {Function} onCatatan
 * @param {Function} onTambah
 * @param {Function} onJadwal
 * @param {boolean} periodeAktif - Tambah dinonaktifkan kalau periode sudah tutup
 */
function FrsActionButtons({ onCatatan, onTambah, onJadwal, periodeAktif }) {
  return (
    <Stack spacing={1} sx={{ minWidth: 140 }}>
      <Button variant="outlined" onClick={onCatatan} startIcon={<CommentIcon />}>
        Catatan
      </Button>
      <Button variant="outlined" onClick={onTambah} startIcon={<AddIcon />} disabled={!periodeAktif}>
        Tambah
      </Button>
      <Button variant="outlined" onClick={onJadwal} startIcon={<CalendarTodayIcon />}>
        Jadwal
      </Button>
    </Stack>
  );
}

export default FrsActionButtons;
