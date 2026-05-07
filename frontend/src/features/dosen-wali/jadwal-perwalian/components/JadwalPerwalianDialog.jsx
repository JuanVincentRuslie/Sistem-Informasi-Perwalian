import { useEffect, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { formatTanggal } from '../../../../utils/formatDate.js';
import {
  createEmptyJadwalSlot,
  getHariFromTanggal,
  HOUR_OPTIONS,
  MINUTE_OPTIONS,
  parseJadwalPerwalian,
  serializeJadwalPerwalian,
  validateJadwalSlots,
} from './jadwalPerwalianUtils.js';

function TimeSelectField({ label, value, options, onChange }) {
  return (
    <TextField
      select
      label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      <MenuItem value="">-</MenuItem>
      {options.map((option) => (
        <MenuItem key={option} value={option}>
          {option}
        </MenuItem>
      ))}
    </TextField>
  );
}

function findFirstTanggalForHari(hari, periodeAktif) {
  if (!hari || !periodeAktif?.tanggal_mulai || !periodeAktif?.tanggal_selesai) return '';

  const [startYear, startMonth, startDay] = periodeAktif.tanggal_mulai.split('-').map(Number);
  const [endYear, endMonth, endDay] = periodeAktif.tanggal_selesai.split('-').map(Number);
  const currentDate = new Date(startYear, startMonth - 1, startDay);
  const endDate = new Date(endYear, endMonth - 1, endDay);

  while (currentDate <= endDate) {
    const tanggal = [
      currentDate.getFullYear(),
      String(currentDate.getMonth() + 1).padStart(2, '0'),
      String(currentDate.getDate()).padStart(2, '0'),
    ].join('-');

    if (getHariFromTanggal(tanggal) === hari) {
      return tanggal;
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return '';
}

function normalizeParsedSlots(parsedSlots, periodeAktif) {
  return parsedSlots.map((slot) => ({
    ...slot,
    tanggal: slot.tanggal || findFirstTanggalForHari(slot.hari, periodeAktif),
  }));
}

function JadwalPerwalianDialog({
  open,
  periodeAktif,
  initialJadwal,
  isSaving,
  submitError,
  onClose,
  onSubmit,
}) {
  // useState: slot form disimpan lokal di dialog supaya user bisa edit bebas
  // tanpa langsung mengubah data utama halaman sebelum tombol simpan ditekan.
  const [slots, setSlots] = useState([createEmptyJadwalSlot()]);

  // useState: validasi lokal dipisah dari error submit API.
  // Dengan begini user bisa dibantu lebih cepat sebelum request dijalankan.
  const [localError, setLocalError] = useState('');

  // useEffect: setiap dialog dibuka atau data awal berubah, form di-reset
  // ke jadwal terakhir yang tersimpan agar mode edit selalu sinkron.
  useEffect(() => {
    if (!open) return;

    const parsedSlots = parseJadwalPerwalian(initialJadwal);
    setSlots(
      parsedSlots.length > 0
        ? normalizeParsedSlots(parsedSlots, periodeAktif)
        : [createEmptyJadwalSlot()]
    );
    setLocalError('');
  }, [open, initialJadwal, periodeAktif]);

  function handleSlotChange(slotId, field, value) {
    setLocalError('');
    setSlots((currentSlots) =>
      currentSlots.map((slot) => (
        slot.id === slotId
          ? { ...slot, [field]: value }
          : slot
      ))
    );
  }

  function handleAddSlot() {
    setLocalError('');
    setSlots((currentSlots) => [...currentSlots, createEmptyJadwalSlot()]);
  }

  function handleRemoveSlot(slotId) {
    setLocalError('');
    setSlots((currentSlots) => {
      const filteredSlots = currentSlots.filter((slot) => slot.id !== slotId);
      return filteredSlots.length > 0 ? filteredSlots : [createEmptyJadwalSlot()];
    });
  }

  function handleSubmit() {
    const validationMessage = validateJadwalSlots(slots);

    if (validationMessage) {
      setLocalError(validationMessage);
      return;
    }

    setLocalError('');
    onSubmit(serializeJadwalPerwalian(slots));
  }

  const rentangTanggal = periodeAktif
    ? `${formatTanggal(periodeAktif.tanggal_mulai)} - ${formatTanggal(periodeAktif.tanggal_selesai)}`
    : 'Belum ada periode aktif';

  return (
    <Dialog open={open} onClose={isSaving ? undefined : onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ pb: 1 }}>
        Atur Jadwal Perwalian
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Periode aktif: {rentangTanggal}
        </Typography>

        <Stack spacing={2}>
          {slots.map((slot, index) => (
            <Box
              key={slot.id}
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  md: '1.6fr repeat(4, minmax(96px, 1fr)) auto',
                },
                gap: 1.5,
                alignItems: 'stretch',
              }}
            >
              <TextField
                label={`Tanggal ${index + 1}`}
                type="date"
                value={slot.tanggal}
                onChange={(event) => handleSlotChange(slot.id, 'tanggal', event.target.value)}
                helperText={slot.tanggal ? getHariFromTanggal(slot.tanggal) : 'Pilih tanggal'}
                slotProps={{
                  inputLabel: { shrink: true },
                  htmlInput: {
                    min: periodeAktif?.tanggal_mulai,
                    max: periodeAktif?.tanggal_selesai,
                  },
                }}
              />

              <TimeSelectField
                label="Jam mulai"
                value={slot.jamMulaiJam}
                options={HOUR_OPTIONS}
                onChange={(value) => handleSlotChange(slot.id, 'jamMulaiJam', value)}
              />

              <TimeSelectField
                label="Menit mulai"
                value={slot.jamMulaiMenit}
                options={MINUTE_OPTIONS}
                onChange={(value) => handleSlotChange(slot.id, 'jamMulaiMenit', value)}
              />

              <TimeSelectField
                label="Jam selesai"
                value={slot.jamSelesaiJam}
                options={HOUR_OPTIONS}
                onChange={(value) => handleSlotChange(slot.id, 'jamSelesaiJam', value)}
              />

              <TimeSelectField
                label="Menit selesai"
                value={slot.jamSelesaiMenit}
                options={MINUTE_OPTIONS}
                onChange={(value) => handleSlotChange(slot.id, 'jamSelesaiMenit', value)}
              />

              <IconButton
                aria-label={`Hapus slot ${index + 1}`}
                onClick={() => handleRemoveSlot(slot.id)}
                sx={{ justifySelf: { xs: 'start', md: 'center' } }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          ))}

          <Box>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddSlot}>
              Tambah Slot
            </Button>
          </Box>

          {(localError || submitError) && (
            <Alert severity="error">{localError || submitError}</Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={isSaving}>
          Batal
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={isSaving}>
          {isSaving ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default JadwalPerwalianDialog;
