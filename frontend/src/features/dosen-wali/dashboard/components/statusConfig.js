export const STATUS_FILTERS = [
  { value: 'all', label: 'Semua' },
  { value: 'approved', label: 'Sudah Disetujui' },
  { value: 'waiting', label: 'Menunggu Persetujuan' },
  { value: 'empty', label: 'Belum Mengisi' },
];

export function getDosenStatusCategory(status) {
  if (status === 'APPROVED') return 'approved';
  if (status === 'SUBMITTED' || status === 'REJECTED') return 'waiting';
  return 'empty';
}

export function getDosenStatusColor(category, theme) {
  const colorMap = {
    approved: theme.palette.success.main,
    waiting: theme.palette.warning.main,
    empty: theme.palette.error.main,
  };

  return colorMap[category] ?? theme.palette.divider;
}
