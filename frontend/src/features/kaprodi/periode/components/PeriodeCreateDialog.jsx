import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

const JENIS_OPTIONS = [
  { value: 'ganjil', label: 'Ganjil' },
  { value: 'genap', label: 'Genap' },
  { value: 'pendek', label: 'Semester Pendek' },
];

function getJenisLabel(jenis) {
  return JENIS_OPTIONS.find((option) => option.value === jenis)?.label ?? 'Ganjil';
}

function buildPreviewName(tahunMulai, jenis) {
  if (!tahunMulai || !jenis) return '-';
  const tahunAkhir = Number(tahunMulai) + 1;
  const jenisLabel = getJenisLabel(jenis);
  return `${jenisLabel} ${tahunMulai}/${tahunAkhir}`;
}

function PeriodeCreateDialog({ open, saving, submitError, onClose, onSubmit, initialPeriode = null }) {
  // Mode edit kalau initialPeriode dipassing — title, default form, dan button text
  // ikut menyesuaikan supaya satu komponen bisa dipakai untuk create & edit.
  const isEdit = Boolean(initialPeriode);

  // useState: form periode disimpan lokal di dialog supaya user bisa isi
  // bertahap tanpa mengubah data histori sebelum tombol simpan ditekan.
  const [form, setForm] = useState({
    tahun_mulai: '',
    jenis: 'ganjil',
    tanggal_mulai: '',
    tanggal_selesai: '',
  });

  // useState: validasi lokal dipisah dari error async agar feedback
  // bisa muncul lebih cepat sebelum request dibuat.
  const [localError, setLocalError] = useState('');

  // useEffect: setiap dialog dibuka ulang, form dikembalikan ke state awal
  // (atau prefill dari initialPeriode kalau edit mode).
  useEffect(() => {
    if (!open) return;

    if (initialPeriode) {
      setForm({
        tahun_mulai: String(initialPeriode.tahun_mulai ?? ''),
        jenis: initialPeriode.jenis ?? 'ganjil',
        tanggal_mulai: initialPeriode.tanggal_mulai ?? '',
        tanggal_selesai: initialPeriode.tanggal_selesai ?? '',
      });
    } else {
      setForm({
        tahun_mulai: '',
        jenis: 'ganjil',
        tanggal_mulai: '',
        tanggal_selesai: '',
      });
    }
    setLocalError('');
  }, [open, initialPeriode]);

  function handleChange(field, value) {
    setLocalError('');
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  function handleSubmit() {
    if (!form.tahun_mulai || !form.jenis || !form.tanggal_mulai || !form.tanggal_selesai) {
      setLocalError('Lengkapi semua field periode sebelum menyimpan.');
      return;
    }

    if (form.tanggal_selesai < form.tanggal_mulai) {
      setLocalError('Tanggal selesai tidak boleh lebih awal dari tanggal mulai.');
      return;
    }

    setLocalError('');
    onSubmit({
      tahun_mulai: Number(form.tahun_mulai),
      jenis: form.jenis,
      tanggal_mulai: form.tanggal_mulai,
      tanggal_selesai: form.tanggal_selesai,
    });
  }

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Edit Periode' : 'Tambah Periode Perwalian Baru'}</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            label="Tahun mulai"
            type="number"
            value={form.tahun_mulai}
            onChange={(event) => handleChange('tahun_mulai', event.target.value)}
            slotProps={{ htmlInput: { min: 2020 } }}
          />

          <TextField
            select
            label="Jenis semester"
            value={form.jenis}
            onChange={(event) => handleChange('jenis', event.target.value)}
          >
            {JENIS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Tanggal mulai"
            type="date"
            value={form.tanggal_mulai}
            onChange={(event) => handleChange('tanggal_mulai', event.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField
            label="Tanggal selesai"
            type="date"
            value={form.tanggal_selesai}
            onChange={(event) => handleChange('tanggal_selesai', event.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <Typography variant="body2" color="text.secondary">
            Nama periode akan dibuat otomatis: <strong>{buildPreviewName(form.tahun_mulai, form.jenis)}</strong>
          </Typography>

          {isEdit ? null : (
            <Typography variant="body2" color="text.secondary">
              Periode yang disimpan akan langsung aktif. Jika sebelumnya ada periode aktif lain, statusnya akan berpindah menjadi tidak aktif.
            </Typography>
          )}

          {(localError || submitError) ? (
            <Alert severity="error">{localError || submitError}</Alert>
          ) : null}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={saving}>Batal</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={saving}>
          {saving ? 'Menyimpan...' : (isEdit ? 'Update' : 'Simpan')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default PeriodeCreateDialog;
