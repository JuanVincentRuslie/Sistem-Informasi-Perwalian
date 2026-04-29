export const STATUS_FILTERS = [
  { value: 'all', label: 'Semua' },
  { value: 'approved', label: 'Sudah Disetujui' },
  { value: 'waiting', label: 'Menunggu Persetujuan' },
  { value: 'empty', label: 'Belum Mengisi' },
];

const STATUS_FILTER_VALUES = new Set(STATUS_FILTERS.map((filter) => filter.value));

export function normalizeDosenStatusFilter(value) {
  return STATUS_FILTER_VALUES.has(value) ? value : 'all';
}

export function getDosenStatusCategory(status) {
  if (status === 'APPROVED') return 'approved';
  if (status === 'SUBMITTED' || status === 'REJECTED') return 'waiting';
  return 'empty';
}

export function getDosenStatusColor(category, theme) {
  const colorMap = {
    approved: theme.palette.frsStatus.approved.main,
    waiting: theme.palette.frsStatus.waiting.main,
    empty: theme.palette.frsStatus.empty.main,
  };

  return colorMap[category] ?? theme.palette.divider;
}
